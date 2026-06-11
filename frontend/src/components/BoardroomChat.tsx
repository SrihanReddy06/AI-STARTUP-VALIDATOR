import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import type { ChatMessage, StartupReport } from '../types';

interface BoardroomChatProps {
  report: StartupReport;
  providers: Record<string, string>;
}

export const BoardroomChat: React.FC<BoardroomChatProps> = ({ report, providers }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'strategist',
      content: "Hello! We've generated your complete startup strategy. I am the Product Strategist, and I'm joined by our CFO and CMO. Ask us anything about features, marketing pipelines, or financial numbers!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, currentStatus]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setCurrentStatus('Board is gathering to review...');

    try {
      // Connect to the streaming chat SSE endpoint
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: report,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          providers: providers
        })
      });

      if (!response.body) {
        throw new Error("No response body received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          
          const rawJson = trimmed.slice(6);
          try {
            const data = JSON.parse(rawJson);
            
            if (data.type === 'status') {
              setCurrentStatus(data.message);
            } else if (data.type === 'message') {
              // Map speaker name to role enum
              const roleMap: Record<string, 'cfo' | 'strategist' | 'marketer'> = {
                'CFO': 'cfo',
                'Product Strategist': 'strategist',
                'Marketing Director': 'marketer'
              };
              
              const role = roleMap[data.speaker] || 'strategist';
              
              setMessages(prev => [
                ...prev,
                {
                  role: role,
                  content: data.content,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            } else if (data.type === 'done') {
              setIsTyping(false);
              setCurrentStatus('');
            }
          } catch (err) {
            console.error("Error parsing chat SSE chunk:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error calling chat endpoint:", error);
      setMessages(prev => [
        ...prev,
        {
          role: 'strategist',
          content: "Sorry, we had a connection error assembling the advisory board. Please check if the backend is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
      setCurrentStatus('');
    }
  };

  const getSpeakerStyles = (role: string) => {
    switch (role) {
      case 'user':
        return {
          name: 'You (Founder)',
          color: '#cbd5e1',
          bg: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255,255,255,0.1)',
          avatar: '👤',
          align: 'flex-end',
        };
      case 'cfo':
        return {
          name: 'CFO Advisor',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.05)',
          borderColor: 'rgba(16, 185, 129, 0.15)',
          avatar: '💼',
          align: 'flex-start',
        };
      case 'strategist':
        return {
          name: 'Product Strategist',
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.05)',
          borderColor: 'rgba(59, 130, 246, 0.15)',
          avatar: '🤖',
          align: 'flex-start',
        };
      case 'marketer':
        return {
          name: 'CMO (Marketing)',
          color: '#9333ea',
          bg: 'rgba(147, 51, 234, 0.05)',
          borderColor: 'rgba(147, 51, 234, 0.15)',
          avatar: '📣',
          align: 'flex-start',
        };
      default:
        return {
          name: 'Advisor',
          color: '#cbd5e1',
          bg: 'rgba(255,255,255,0.02)',
          borderColor: 'rgba(255,255,255,0.05)',
          avatar: '🤖',
          align: 'flex-start',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>Boardroom Advisory Chat</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Interact dynamically with your executive board. Each question sparks a discussion among your Product, Finance, and Marketing chiefs (powered by {providers.chat.toUpperCase()}).
        </p>
      </div>

      {/* Messages Window */}
      <div 
        className="glass-panel" 
        style={{ 
          flex: 1, 
          padding: '24px', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px', 
          backgroundColor: '#070a14',
          marginBottom: '20px'
        }}
      >
        {messages.map((msg, idx) => {
          const styles = getSpeakerStyles(msg.role);
          return (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignSelf: styles.align, 
                maxWidth: '70%',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {/* Name & Avatar Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                {msg.role !== 'user' && <span>{styles.avatar}</span>}
                <span style={{ color: styles.color }}>{styles.name}</span>
                {msg.role === 'user' && <span>{styles.avatar}</span>}
                <span style={{ color: 'var(--text-dark)', fontWeight: 400 }}>{msg.timestamp}</span>
              </div>
              
              {/* Bubble text */}
              <div 
                style={{ 
                  padding: '14px 18px', 
                  borderRadius: '14px', 
                  backgroundColor: styles.bg, 
                  border: `1px solid ${styles.borderColor}`,
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  color: 'white'
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {/* Typing and Status indicators */}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'flex-start', margin: '8px 0' }}>
            <Loader style={{ animation: 'spin 1.5s linear infinite', width: '16px', height: '16px', color: '#c084fc' }} />
            <span style={{ fontSize: '0.85rem', color: '#c084fc', fontStyle: 'italic', fontWeight: 500 }}>
              {currentStatus}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input controls form */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. How can we cut our Year 1 marketing expenses? or What features should we add for Persona 2?"
          disabled={isTyping}
          style={{
            flex: 1,
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--panel-border)',
            color: 'white',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            transition: 'var(--transition-smooth)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--panel-border)'}
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          className="btn btn-primary"
          style={{ padding: '0 24px', borderRadius: '12px' }}
        >
          <Send style={{ width: '18px', height: '18px' }} />
        </button>
      </form>
    </div>
  );
};
