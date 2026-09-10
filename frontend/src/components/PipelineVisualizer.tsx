import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Megaphone, 
  Presentation, 
  Users, 
  CheckCircle2, 
  Loader2, 
  Cpu, 
  Activity
} from 'lucide-react';

export interface PipelineStep {
  id: string;
  number: number;
  name: string;
  roleTitle: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  defaultProviderKey?: string;
  description: string;
  inputs: string[];
  outputs: string[];
  activeTaskText: string;
}

export const PIPELINE_NODES: PipelineStep[] = [
  {
    id: 'input',
    number: 1,
    name: 'Context Ingestion',
    roleTitle: 'Context Engine',
    icon: Lightbulb,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    description: 'Ingests raw founder pitch, sector domain, regional boundaries, and initial capital constraint.',
    inputs: ['Startup Idea', 'Industry Sector', 'Target Region', 'Budget Level'],
    outputs: ['Normalized Context Vector', 'Domain Scope', 'Constraint Profile'],
    activeTaskText: 'Parsing problem space and normalizing seed constraints...',
  },
  {
    id: 'product',
    number: 2,
    name: 'Product Strategist',
    roleTitle: 'Chief Product Officer Agent',
    icon: Brain,
    color: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.4)',
    defaultProviderKey: 'product',
    description: 'Distills the value proposition, architects 3 detailed user personas, and defines the prioritized MVP feature roadmap.',
    inputs: ['Normalized Context Vector', 'Sector Dynamics'],
    outputs: ['Refined UVP', '3 Target Personas', 'Prioritized MVP Features', 'User Flow Journey'],
    activeTaskText: 'Architecting MVP core specification & customer journey flows...',
  },
  {
    id: 'market',
    number: 3,
    name: 'Market Researcher',
    roleTitle: 'VP Market Intelligence Agent',
    icon: TrendingUp,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    defaultProviderKey: 'market',
    description: 'Calculates TAM/SAM/SOM sizing via industry ratios, benchmarks top competitors, and delivers a strategic SWOT matrix.',
    inputs: ['UVP & Features', 'Target Region', 'Industry Sector'],
    outputs: ['TAM/SAM/SOM Dollar Sizing', 'Competitor Landscape Matrix', 'Strategic SWOT Analysis'],
    activeTaskText: 'Running bottom-up TAM/SAM/SOM calculations & SWOT analysis...',
  },
  {
    id: 'finance',
    number: 4,
    name: 'Financial Architect',
    roleTitle: 'Fractional CFO Agent',
    icon: DollarSign,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    defaultProviderKey: 'finance',
    description: 'Models monetization strategy, categorizes startup capital expenditures (CapEx), and projects 3-year revenue, expenses, and profits.',
    inputs: ['MVP Scope', 'Market Size (SOM)', 'Funding Constraint'],
    outputs: ['Revenue & Pricing Strategy', 'Categorized Startup CapEx', '3-Year Annual P&L Projections'],
    activeTaskText: 'Formulating unit economics, burn runway & 3-year P&L forecasts...',
  },
  {
    id: 'marketing',
    number: 5,
    name: 'Growth & GTM',
    roleTitle: 'Chief Marketing Officer Agent',
    icon: Megaphone,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    defaultProviderKey: 'marketing',
    description: 'Brainstorms brand identities, analyzes acquisition channels with cost tiers, builds launch timeline, and establishes 12M KPIs.',
    inputs: ['Target Personas', 'UVP', 'Pricing Strategy'],
    outputs: ['Brand Name & Tagline Concepts', 'Acquisition Channel Mix', 'Launch Timeline Phases', 'Key 12M Performance KPIs'],
    activeTaskText: 'Devising go-to-market loops, channel mix & 12-month KPI milestones...',
  },
  {
    id: 'pitch',
    number: 6,
    name: 'Pitch Architect',
    roleTitle: 'Venture Pitch Designer Agent',
    icon: Presentation,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    defaultProviderKey: 'pitch',
    description: 'Translates all analytical outputs into a narrative 10-slide institutional investor pitch deck with slide design instructions.',
    inputs: ['Full Multi-Agent Strategy Synthesis'],
    outputs: ['10-Slide Presentation Deck', 'Bullet Narratives', 'Slide Visual Design Directives'],
    activeTaskText: 'Crafting narrative 10-slide VC pitch deck with design directives...',
  },
  {
    id: 'boardroom',
    number: 7,
    name: 'Executive Boardroom',
    roleTitle: 'Advisory Synthesis & Interactive Chat',
    icon: Users,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    defaultProviderKey: 'chat',
    description: 'Synthesizes all plans into an executive dashboard and powers live multi-persona advisory board conversations.',
    inputs: ['Complete Unified Proposal Record'],
    outputs: ['Interactive Lean Canvas', 'Boardroom Chat with Persona Agents', 'Operational Playbook'],
    activeTaskText: 'Synthesizing advisory deliverables into interactive executive dashboard...',
  },
];

interface PipelineVisualizerProps {
  mode: 'preview' | 'active';
  providers?: Record<string, string>;
  activeStepIndex?: number;
  onSelectNode?: (nodeId: string) => void;
  selectedNodeId?: string;
  elapsedSeconds?: number;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  mode,
  providers = {
    product: 'gemini',
    market: 'gemini',
    finance: 'gemini',
    marketing: 'gemini',
    pitch: 'gemini',
    chat: 'groq',
  },
  activeStepIndex: propActiveStepIndex,
  onSelectNode,
  selectedNodeId: propSelectedNodeId,
  elapsedSeconds: propElapsedSeconds,
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string>('product');
  const [simulatedActiveIndex, setSimulatedActiveIndex] = useState<number>(1);
  const [internalSeconds, setInternalSeconds] = useState<number>(0);

  const selectedId = propSelectedNodeId || internalSelectedId;
  const activeStep = propActiveStepIndex !== undefined ? propActiveStepIndex : simulatedActiveIndex;
  const elapsed = propElapsedSeconds !== undefined ? propElapsedSeconds : internalSeconds;

  // Auto-advance simulated step in active mode if not externally controlled
  useEffect(() => {
    if (mode !== 'active') return;

    const timer = setInterval(() => {
      setInternalSeconds((s) => s + 1);
    }, 1000);

    // Realistic progressive steps over ~25-35 seconds
    const stepTimer = setInterval(() => {
      setSimulatedActiveIndex((curr) => {
        if (curr < PIPELINE_NODES.length - 1) {
          return curr + 1;
        }
        return curr;
      });
    }, 4200);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, [mode]);

  const selectedNode = PIPELINE_NODES.find((n) => n.id === selectedId) || PIPELINE_NODES[1];
  const currentNodeActive = PIPELINE_NODES[activeStep] || PIPELINE_NODES[1];
  const progressPercent = Math.min(100, Math.round(((activeStep + 0.5) / PIPELINE_NODES.length) * 100));

  const handleNodeClick = (nodeId: string) => {
    setInternalSelectedId(nodeId);
    if (onSelectNode) {
      onSelectNode(nodeId);
    }
  };

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '24px', 
        borderRadius: '16px',
        border: '1px solid rgba(129, 140, 248, 0.2)',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(79, 70, 229, 0.12) 0%, rgba(13, 20, 35, 0.95) 75%)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Background Decorative Grid */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
          opacity: 0.7
        }}
      />

      {/* Header Info Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '24px', 
              height: '24px', 
              borderRadius: '6px', 
              background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
              boxShadow: '0 0 10px rgba(147, 51, 234, 0.4)'
            }}>
              <Activity style={{ width: '14px', height: '14px', color: 'white' }} />
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>
              {mode === 'active' ? 'Autonomous Advisory Pipeline In Flight' : 'Spawned Multi-Agent Advisory Topology'}
            </h3>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              padding: '2px 8px', 
              borderRadius: '20px', 
              backgroundColor: mode === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(129, 140, 248, 0.15)',
              color: mode === 'active' ? '#4ade80' : '#818cf8',
              border: `1px solid ${mode === 'active' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(129, 140, 248, 0.3)'}`
            }}>
              {mode === 'active' ? 'LIVE EXECUTION' : 'ARCHITECTURAL TOPOLOGY'}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {mode === 'active' 
              ? 'Multi-agent network executing structured planning DAG with real-time feedback.' 
              : 'Click any node to inspect data flow, model routing, and specialized capabilities.'}
          </p>
        </div>

        {mode === 'active' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Elapsed</div>
              <div style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}s
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Synthesis</div>
              <div style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4ade80' }}>
                {progressPercent}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar (Active Mode) */}
      {mode === 'active' && (
        <div style={{ marginBottom: '24px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px', color: '#cbd5e1' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Loader2 style={{ width: '12px', height: '12px', color: currentNodeActive.color, animation: 'spin 1.5s linear infinite' }} />
              <strong style={{ color: currentNodeActive.color }}>{currentNodeActive.name}:</strong> {currentNodeActive.activeTaskText}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Step {activeStep + 1} of {PIPELINE_NODES.length}
            </span>
          </div>
          <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${progressPercent}%`, 
                background: 'linear-gradient(90deg, #4f46e5, #06b6d4, #10b981)', 
                borderRadius: '3px',
                transition: 'width 0.5s ease-out',
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
              }} 
            />
          </div>
        </div>
      )}

      {/* Pictorial Node Pipeline Diagram */}
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 2, 
          padding: '16px 8px',
          overflowX: 'auto',
          margin: '0 -8px'
        }}
        className="custom-scrollbar"
      >
        <div style={{ display: 'flex', alignItems: 'center', minWidth: '760px', justifyContent: 'space-between', position: 'relative' }}>
          
          {/* Animated Connecting SVG Data Conduit Wire */}
          <div style={{ position: 'absolute', top: '28px', left: '35px', right: '35px', height: '4px', zIndex: 0, pointerEvents: 'none' }}>
            <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="pipelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="25%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="75%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <line 
                x1="0" 
                y1="2" 
                x2="100%" 
                y2="2" 
                stroke="rgba(255,255,255,0.08)" 
                strokeWidth="3" 
              />
              <line 
                x1="0" 
                y1="2" 
                x2="100%" 
                y2="2" 
                stroke="url(#pipelineGrad)" 
                strokeWidth="3" 
                strokeDasharray="6 6"
                style={{ animation: 'flowDash 1.2s linear infinite' }}
              />
            </svg>
          </div>

          {/* Render Each Node */}
          {PIPELINE_NODES.map((node, index) => {
            const Icon = node.icon;
            const isSelected = selectedId === node.id;
            const isCompleted = mode === 'active' && index < activeStep;
            const isCurrent = mode === 'active' && index === activeStep;
            const isPending = mode === 'active' && index > activeStep;

            const provider = node.defaultProviderKey ? providers[node.defaultProviderKey] || 'groq' : null;

            return (
              <div 
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                  cursor: 'pointer',
                  width: '98px',
                  textAlign: 'center',
                  position: 'relative',
                  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                  opacity: isPending ? 0.45 : 1
                }}
              >
                {/* Node Outer Halo / Container */}
                <div 
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: isSelected 
                      ? 'rgba(15, 23, 42, 0.95)' 
                      : isCurrent 
                      ? 'rgba(15, 23, 42, 0.9)' 
                      : 'rgba(15, 23, 42, 0.8)',
                    border: `2px solid ${
                      isCompleted 
                        ? '#10b981' 
                        : isCurrent 
                        ? node.color 
                        : isSelected 
                        ? 'white' 
                        : 'rgba(255, 255, 255, 0.12)'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrent 
                      ? `0 0 20px ${node.glowColor}, 0 0 35px ${node.glowColor}` 
                      : isSelected 
                      ? `0 0 16px ${node.glowColor}` 
                      : '0 4px 12px rgba(0, 0, 0, 0.4)',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    animation: isCurrent ? 'nodeGlow 2s infinite' : 'none'
                  }}
                >
                  {/* Status Overlay Icon */}
                  {isCompleted ? (
                    <CheckCircle2 style={{ width: '22px', height: '22px', color: '#10b981' }} />
                  ) : isCurrent ? (
                    <Icon style={{ width: '22px', height: '22px', color: node.color, animation: 'radarPulse 2s infinite' }} />
                  ) : (
                    <Icon style={{ width: '22px', height: '22px', color: isSelected ? 'white' : node.color }} />
                  )}

                  {/* Step Sequence Badge */}
                  <span 
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#10b981' : isCurrent ? node.color : '#1e293b',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid #080b11',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                    }}
                  >
                    {isCompleted ? '✓' : node.number}
                  </span>
                </div>

                {/* Node Label */}
                <span 
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? 'white' : '#cbd5e1',
                    marginTop: '8px',
                    lineHeight: 1.2,
                    display: 'block'
                  }}
                >
                  {node.name}
                </span>

                {/* Provider Badge (if applicable) */}
                {provider && (
                  <span 
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      marginTop: '4px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      backgroundColor: provider === 'groq' ? 'rgba(147, 51, 234, 0.15)' : 'rgba(79, 70, 229, 0.15)',
                      color: provider === 'groq' ? '#c084fc' : '#818cf8',
                      border: `1px solid ${provider === 'groq' ? 'rgba(147, 51, 234, 0.3)' : 'rgba(79, 70, 229, 0.3)'}`
                    }}
                  >
                    {provider}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Spec Inspector Drawer */}
      <div 
        style={{ 
          marginTop: '20px', 
          padding: '16px 20px', 
          borderRadius: '12px', 
          backgroundColor: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: selectedNode.color,
              boxShadow: `0 0 8px ${selectedNode.color}` 
            }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>
              Node {selectedNode.number}: {selectedNode.name} — <span style={{ color: selectedNode.color, fontWeight: 600 }}>{selectedNode.roleTitle}</span>
            </h4>
          </div>

          {selectedNode.defaultProviderKey && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Cpu style={{ width: '13px', height: '13px', color: '#a855f7' }} />
              <span>Assigned Engine:</span>
              <strong style={{ color: '#c084fc', textTransform: 'uppercase' }}>
                {providers[selectedNode.defaultProviderKey] || 'Groq'}
              </strong>
            </div>
          )}
        </div>

        <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '12px' }}>
          {selectedNode.description}
        </p>

        {/* Input/Output Data Bus Specification */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', fontSize: '0.75rem' }}>
          <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              📥 Ingested Inputs
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedNode.inputs.map((inp, i) => (
                <span key={i} style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                  {inp}
                </span>
              ))}
            </div>
          </div>

          <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              📤 Produced Artifacts
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedNode.outputs.map((out, i) => (
                <span key={i} style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  {out}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
