import React, { useEffect, useRef } from 'react';
import { Terminal, Bot, CheckCircle2, Loader, AlertCircle } from 'lucide-react';
import type { AgentLog } from '../types';

interface TerminalLogsProps {
  logs: AgentLog[];
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new logs stream in
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  // Group logs by agent to show current status summaries
  const agentList = [
    { name: 'Product Strategist', key: 'Product Strategist' },
    { name: 'Market Researcher', key: 'Market Researcher' },
    { name: 'Financial Officer', key: 'Financial Officer' },
    { name: 'Marketing & GTM', key: 'Marketing & GTM' },
    { name: 'Pitch Designer', key: 'Pitch Designer' },
  ];

  const getAgentStatus = (agentKey: string) => {
    const agentLogs = logs.filter((l) => l.agent === agentKey);
    if (agentLogs.length === 0) return { status: 'idle', detail: 'Waiting to start...' };
    
    const lastLog = agentLogs[agentLogs.length - 1];
    return {
      status: lastLog.status,
      detail: lastLog.detail,
    };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', margin: '40px auto', maxWidth: '1200px' }}>
      {/* Advisor Board Status Card */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
          <Bot style={{ color: '#818cf8', width: '18px', height: '18px' }} /> Advisory Pipeline Status
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {agentList.map((agent) => {
            const { status, detail } = getAgentStatus(agent.key);
            
            return (
              <div
                key={agent.key}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  opacity: status === 'idle' ? 0.5 : 1,
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{agent.name}</span>
                  <span className={`badge badge-${status}`}>
                    {status === 'active' && <Loader style={{ width: '10px', height: '10px', animation: 'spin 1.5s linear infinite' }} />}
                    {status === 'completed' && <CheckCircle2 style={{ width: '10px', height: '10px' }} />}
                    {status === 'failed' && <AlertCircle style={{ width: '10px', height: '10px' }} />}
                    {status}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {detail}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal View */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#05070c',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          height: '450px',
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#0c0f1d',
            borderBottom: '1px solid #1e293b',
            borderTopLeftRadius: '11px',
            borderTopRightRadius: '11px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#eab308' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginLeft: '12px', fontFamily: 'var(--font-mono)' }}>
              advisor_stream.log
            </span>
          </div>
          <Terminal style={{ color: 'var(--text-muted)', width: '14px', height: '14px' }} />
        </div>

        {/* Terminal Logs Content */}
        <div
          ref={containerRef}
          style={{
            padding: '16px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            lineHeight: 1.5,
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-dark)', fontStyle: 'italic', display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
              $ pipeline initialized. waiting for startup inputs...
            </div>
          ) : (
            logs.map((log, index) => {
              const color = 
                log.agent === 'Orchestrator' ? '#a855f7' :
                log.agent === 'Product Strategist' ? '#3b82f6' :
                log.agent === 'Market Researcher' ? '#06b6d4' :
                log.agent === 'Financial Officer' ? '#10b981' :
                log.agent === 'Marketing & GTM' ? '#f59e0b' : '#ec4899';

              return (
                <div key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.01)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>[{log.timestamp}]</span>
                  <span style={{ color: color, fontWeight: 700 }}>[{log.agent}]</span>{' '}
                  <span style={{ color: log.status === 'failed' ? '#ef4444' : '#e2e8f0' }}>{log.detail}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
