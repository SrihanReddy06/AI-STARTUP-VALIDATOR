import { useState, useEffect, useRef } from 'react';
import './styles/theme.css';
import { IdeaForm } from './components/IdeaForm';
import { Dashboard } from './components/Dashboard';
import type { StartupReport } from './types';
import { RefreshCw, Bot, History, Trash2, X } from 'lucide-react';

interface HistoryItem {
  id: number;
  idea: string;
  brand_name: string;
  status?: string;
  error_message?: string;
  created_at: string;
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<StartupReport | null>(null);
  const [providers, setProviders] = useState<Record<string, string>>({
    product: 'gemini',
    market: 'gemini',
    finance: 'gemini',
    marketing: 'gemini',
    pitch: 'gemini',
    chat: 'groq'
  });
  
  // History states
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const res = await fetch('http://localhost:8000/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 0);
    return () => {
      clearTimeout(timer);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleLoadHistory = async (id: number) => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8000/api/history/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'completed') {
          setReport(data.report);
          setIsHistoryOpen(false);
          setIsLoading(false);
        } else if (data.status === 'processing') {
          // It's still processing! Hook into its polling!
          setReport(null);
          setIsHistoryOpen(false);
          pollRef.current = setInterval(async () => {
            try {
              const pollRes = await fetch(`http://localhost:8000/api/history/${id}`);
              if (pollRes.ok) {
                const planDetail = await pollRes.json();
                if (planDetail.status === 'completed') {
                  clearInterval(pollRef.current);
                  pollRef.current = null;
                  setReport(planDetail.report);
                  setIsLoading(false);
                  fetchHistory();
                } else if (planDetail.status === 'failed') {
                  clearInterval(pollRef.current);
                  pollRef.current = null;
                  setIsLoading(false);
                  alert(`Generation failed: ${planDetail.error_message || 'Unknown error'}`);
                  fetchHistory();
                }
              }
            } catch (err) {
              console.error('Polling error:', err);
            }
          }, 3000);
        } else if (data.status === 'failed') {
          setIsLoading(false);
          alert(`This generation failed: ${data.error_message || 'Unknown error'}`);
        }
      } else {
        alert('Failed to load startup report.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error loading history item:', err);
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this startup from history?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/history/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistoryList((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleGenerate = async (idea: string, chosenProviders: Record<string, string>) => {
    setIsLoading(true);
    setReport(null);
    setProviders(chosenProviders);

    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    try {
      const response = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea,
          providers: chosenProviders
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start background generation task.');
      }

      const initResult = await response.json();
      const planId = initResult.plan_id;
      
      // Refresh history list so the new plan shows up immediately
      fetchHistory();

      // Poll database for completion status
      pollRef.current = setInterval(async () => {
        try {
          const pollResponse = await fetch(`http://localhost:8000/api/history/${planId}`);
          if (pollResponse.ok) {
            const planDetail = await pollResponse.json();
            if (planDetail.status === 'completed') {
              clearInterval(pollRef.current);
              pollRef.current = null;
              setReport(planDetail.report);
              setIsLoading(false);
              fetchHistory();
            } else if (planDetail.status === 'failed') {
              clearInterval(pollRef.current);
              pollRef.current = null;
              setIsLoading(false);
              alert(`Generation failed: ${planDetail.error_message || 'Unknown error'}`);
              fetchHistory();
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);

    } catch (error) {
      const err = error as Error;
      console.error('Error starting agent generation:', err);
      alert(`Failed to start advisory board pipeline: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setReport(null);
    setIsLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Banner */}
      <header 
        style={{ 
          padding: '16px 40px', 
          borderBottom: '1px solid var(--panel-border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'rgba(8, 11, 17, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', padding: '8px', background: 'linear-gradient(135deg, #4f46e5, #9333ea)', borderRadius: '10px' }}>
            <Bot style={{ color: 'white', width: '22px', height: '22px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              AGENCY<span style={{ color: '#818cf8' }}>BUILD</span>
            </h1>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Multi-Agent Advisory Board
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <History style={{ width: '14px', height: '14px' }} />
            History ({historyList.length})
          </button>

          {report && (
            <button 
              onClick={handleReset} 
              className="btn btn-secondary" 
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              New Startup Proposal
            </button>
          )}
        </div>
      </header>

      {/* Main Panel Router */}
      <main style={{ flex: 1 }}>
        {!report && !isLoading && (
          <IdeaForm onSubmit={handleGenerate} isLoading={isLoading} />
        )}

        {isLoading && (
          <div style={{ padding: '80px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <div className="glass-panel" style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <div className="badge-active" style={{ display: 'flex', padding: '16px', background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(147,51,234,0.2))', borderRadius: '50%', border: '1px solid rgba(129,140,248,0.3)', animation: 'pulse 2s infinite' }}>
                <Bot style={{ color: '#818cf8', width: '48px', height: '48px', animation: 'spin-slow 8s linear infinite' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px', color: 'white' }}>Advisory Board Active</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Our autonomous agents are analyzing market data, modeling financials, and designing slides in the background. 
                </p>
                <p style={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, marginTop: '8px' }}>
                  You can close this view or browse other saved startups in your History while this completes!
                </p>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ 
                  height: '100%', 
                  width: '50%', 
                  background: 'linear-gradient(90deg, #4f46e5, #9333ea)', 
                  borderRadius: '2px',
                  position: 'absolute',
                  animation: 'loading-bar 1.5s infinite ease-in-out'
                }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', textAlign: 'left', marginTop: '12px' }}>
                {[
                  "Product Strategist Agent: Architecting MVP specification...",
                  "Market Researcher Agent: Running live competitors web searches...",
                  "Financial Officer Agent: Formulating unit economics & expenses...",
                  "Marketing & GTM Agent: Designing PLG loops & SDK taglines...",
                  "Pitch Designer Agent: Structuring 10-slide investor deck..."
                ].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#818cf8', opacity: 0.5, animation: 'pulse 1s infinite' }} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {report && !isLoading && (
          <Dashboard report={report} providers={providers} />
        )}
      </main>

      {/* History Sidebar Drawer */}
      {isHistoryOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s ease'
          }}
          onClick={() => setIsHistoryOpen(false)}
        >
          <div 
            style={{
              width: '450px',
              maxWidth: '100%',
              height: '100%',
              backgroundColor: 'rgba(11, 15, 25, 0.95)',
              borderLeft: '1px solid var(--panel-border)',
              backdropFilter: 'blur(20px)',
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History style={{ color: '#818cf8', width: '20px', height: '20px' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>Proposal History</h3>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '4px',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }} className="custom-scrollbar">
              {isHistoryLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', color: 'var(--text-muted)' }}>
                  Loading history...
                </div>
              ) : historyList.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  No saved proposals found. Once you generate a startup plan, it will be saved here automatically.
                </div>
              ) : (
                historyList.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleLoadHistory(item.id)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                    }}
                  >
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', margin: 0 }}>{item.brand_name}</h4>
                        {item.status === 'processing' && (
                          <span className="badge badge-active" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>Processing</span>
                        )}
                        {item.status === 'failed' && (
                          <span className="badge badge-failed" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>Failed</span>
                        )}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--text-muted)', 
                        lineHeight: '1.4',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.idea.replace(/Industry:.*?\nLocation:.*?\nBudget:.*?\n\nStartup Idea:\n/, '')}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteHistory(e, item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 style={{ width: '15px', height: '15px' }} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
