import React, { useState } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Megaphone, 
  Presentation, 
  MessageSquare,
  Percent,
  ClipboardList,
  Calendar,
  Sparkles,
  ShieldCheck,
  Target,
  Zap,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import type { StartupReport } from '../types';
import { BoardroomChat } from './BoardroomChat';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie, 
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  Line,
  ComposedChart
} from 'recharts';

interface DashboardProps {
  report: StartupReport;
  providers: Record<string, string>;
}

export const Dashboard: React.FC<DashboardProps> = ({ report, providers }) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'market' | 'finance' | 'marketing' | 'pitch' | 'chat' | 'roadmap'>('canvas');
  const [activeSlide, setActiveSlide] = useState(0);
  const [roadmapSubTab, setRoadmapSubTab] = useState<'journey' | 'playbook'>('journey');
  const [selectedRoadmapStep, setSelectedRoadmapStep] = useState(0);

  const { product, market, finance, gtm, pitch_deck, roadmap = [], weekly_playbook = [] } = report;

  // --- RECHARTS DATA PREPARATIONS ---

  // 1. Financial projections
  const projectionData = finance.yearly_projections.map(proj => ({
    name: `Year ${proj.year}`,
    Revenue: proj.revenue_usd,
    Expenses: proj.expenses_usd,
    Profit: proj.profit_usd,
    MarginPct: proj.revenue_usd > 0 ? Math.round((proj.profit_usd / proj.revenue_usd) * 100) : 0
  }));

  // 2. Startup costs and CapEx metrics
  const costColors = ['#4f46e5', '#9333ea', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
  const costData = finance.startup_costs.map(item => ({
    name: item.category,
    value: item.cost_usd
  }));
  const totalCapEx = finance.startup_costs.reduce((sum, item) => sum + item.cost_usd, 0);
  const estimatedMonthlyBurn = Math.round(totalCapEx / 12) || 4500;

  // 3. TAM/SAM/SOM Market Sizing
  const marketSizeData = [
    { name: 'TAM', USD: market.tam_usd, desc: 'Total Addressable Market' },
    { name: 'SAM', USD: market.sam_usd, desc: 'Serviceable Addressable Market' },
    { name: 'SOM', USD: market.som_usd, desc: 'Serviceable Obtainable Market' }
  ];

  // 4. Lean Canvas: Startup Viability Radar Assessment
  const somRatio = market.sam_usd > 0 ? (market.som_usd / market.sam_usd) : 0.05;
  const viabilityRadarData = [
    { dimension: 'Product-Market Fit', score: 88, fullMark: 100 },
    { dimension: 'Market Opportunity', score: Math.min(96, Math.max(70, Math.round(somRatio * 300) + 72)), fullMark: 100 },
    { dimension: 'Financial Margin', score: finance.yearly_projections[2] && finance.yearly_projections[2].revenue_usd > 0 ? Math.min(94, Math.round((finance.yearly_projections[2].profit_usd / finance.yearly_projections[2].revenue_usd) * 100) + 40) : 82, fullMark: 100 },
    { dimension: 'GTM Velocity', score: 79, fullMark: 100 },
    { dimension: 'Execution Speed', score: 86, fullMark: 100 },
    { dimension: 'Defensibility', score: 83, fullMark: 100 },
  ];

  // 5. Lean Canvas: MVP Priority Distribution
  const mvpHighCount = product.mvp_features.filter(f => f.priority.toLowerCase() === 'high').length;
  const mvpMedCount = product.mvp_features.filter(f => f.priority.toLowerCase() === 'medium').length;
  const mvpLowCount = product.mvp_features.filter(f => f.priority.toLowerCase() === 'low').length;
  const mvpDistributionData = [
    { priority: 'High Priority', count: mvpHighCount || 3, fill: '#f43f5e', targetSprint: 'Sprint 1-2' },
    { priority: 'Medium Priority', count: mvpMedCount || 2, fill: '#f59e0b', targetSprint: 'Sprint 3-4' },
    { priority: 'Low / Post-MVP', count: mvpLowCount || 1, fill: '#10b981', targetSprint: 'Sprint 5+' },
  ];

  // 6. Market Analysis: SWOT Strategic Balance Chart
  const swotBalanceData = [
    { category: 'Strengths', count: market.swot_analysis.strengths.length || 3, fill: '#10b981', polarity: 'Advantage' },
    { category: 'Opportunities', count: market.swot_analysis.opportunities.length || 3, fill: '#06b6d4', polarity: 'Growth Driver' },
    { category: 'Weaknesses', count: market.swot_analysis.weaknesses.length || 3, fill: '#f43f5e', polarity: 'Internal Risk' },
    { category: 'Threats', count: market.swot_analysis.threats.length || 3, fill: '#f59e0b', polarity: 'External Risk' },
  ];

  // 7. Marketing & GTM: Acquisition Channel Mix & Cost-Level Impact
  const costTierWeights: Record<string, number> = { 'free': 20, 'low': 45, 'medium': 70, 'high': 90 };
  const channelGraphData = gtm.marketing_channels.map((chan, idx) => ({
    name: chan.channel,
    costLevel: chan.cost_level,
    costValue: costTierWeights[chan.cost_level.toLowerCase()] || 50,
    impactScore: Math.max(40, 92 - (idx * 11))
  }));

  // 8. Marketing & GTM: 12-Month Target KPI Curve
  const quarterlyMilestoneData = [
    { quarter: 'Month 1-3 (Seed)', progressScore: 20, users: '100 Alpha Users', revenue: '$5,000 ARR' },
    { quarter: 'Month 4-6 (Beta)', progressScore: 48, users: '1,000 Active', revenue: '$28,000 ARR' },
    { quarter: 'Month 7-9 (Growth)', progressScore: 76, users: '5,000 Active', revenue: '$120,000 ARR' },
    { quarter: 'Month 10-12 (Scale)', progressScore: 100, users: '18,000 Active', revenue: '$350,000 ARR' },
  ];

  // 9. Operations Roadmap: Execution Velocity & Task Burndown
  const roadmapVelocityData = [
    { phase: 'P1-2 Validate', tasksPlanned: 6, cumulativeCompletion: 18, milestone: 'Problem Discovery' },
    { phase: 'P3-4 Architect', tasksPlanned: 9, cumulativeCompletion: 38, milestone: 'Architecture & MVP Scope' },
    { phase: 'P5-6 Alpha Build', tasksPlanned: 12, cumulativeCompletion: 62, milestone: 'Core Prototype Build' },
    { phase: 'P7-8 User Trial', tasksPlanned: 10, cumulativeCompletion: 84, milestone: 'Beta Customer Pilots' },
    { phase: 'P9 Commercial', tasksPlanned: 8, cumulativeCompletion: 100, milestone: 'Paid Launch & Scale' },
  ];

  return (
    <div className="dashboard-grid">
      {/* Sidebar */}
      <div className="sidebar">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ padding: '6px', background: 'linear-gradient(135deg, #4f46e5, #9333ea)', borderRadius: '8px' }}>🚀</span>
            Builder Suite
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Model Provider: {providers.product.toUpperCase()}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {[
            { id: 'canvas', name: 'Lean Canvas', icon: BookOpen },
            { id: 'market', name: 'Market Analysis', icon: TrendingUp },
            { id: 'finance', name: 'Financial Model', icon: DollarSign },
            { id: 'marketing', name: 'Marketing & GTM', icon: Megaphone },
            { id: 'roadmap', name: 'Operations Roadmap', icon: ClipboardList },
            { id: 'pitch', name: 'Pitch Deck', icon: Presentation },
            { id: 'chat', name: 'Boardroom Advisors', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'canvas' | 'market' | 'finance' | 'marketing' | 'pitch' | 'chat' | 'roadmap')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition-smooth)',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                }}
              >
                <Icon style={{ width: '18px', height: '18px', color: isActive ? '#818cf8' : 'var(--text-muted)' }} />
                {tab.name}
              </button>
            );
          })}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <p style={{ fontWeight: 600, color: 'white', marginBottom: '8px' }}>Generated Brand:</p>
          <p style={{ fontSize: '1rem', color: '#818cf8', fontWeight: 700 }}>{gtm.brand_name_suggestions[0]}</p>
          <p style={{ fontStyle: 'italic', fontSize: '0.75rem', marginTop: '4px' }}>"{gtm.brand_tagline_suggestions[0]}"</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        
        {/* TAB 1: LEAN CANVAS */}
        {activeTab === 'canvas' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Business Lean Canvas</h1>
              <p style={{ color: 'var(--text-muted)' }}>Structured representation of the startup's product strategy, target audience, and business viability.</p>
            </div>
            
            <div className="lean-canvas-grid">
              {/* Problem */}
              <div className="glass-panel canvas-box area-problem">
                <h4>Problem</h4>
                <div className="canvas-box-content">
                  <p style={{ fontWeight: 600, color: '#f3f4f6', marginBottom: '8px' }}>Core Customer Painpoints:</p>
                  <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {product.target_personas.map((p, i) => (
                      <li key={i}><strong>{p.name}:</strong> {p.pain_point}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Solution */}
              <div className="glass-panel canvas-box area-solution">
                <h4>Solution</h4>
                <div className="canvas-box-content">
                  <p>{product.refined_idea}</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="glass-panel canvas-box area-key-metrics">
                <h4>Key Metrics</h4>
                <div className="canvas-box-content">
                  <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {gtm.key_metrics.slice(0, 2).map((m, i) => (
                      <li key={i}><strong>{m.metric}:</strong> {m.target}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Unique Value Proposition */}
              <div className="glass-panel canvas-box area-uvp">
                <h4>Unique Value Prop</h4>
                <div className="canvas-box-content">
                  <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#818cf8', marginBottom: '8px' }}>{product.value_proposition}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>High-Level Concept: Refined product features geared specifically for product-market fit.</p>
                </div>
              </div>

              {/* Unfair Advantage */}
              <div className="glass-panel canvas-box area-unfair-advantage">
                <h4>Unfair Advantage</h4>
                <div className="canvas-box-content">
                  <p>Intellectual property potential, proprietary workflow algorithms, or direct network effects built into the product loop.</p>
                </div>
              </div>

              {/* Channels */}
              <div className="glass-panel canvas-box area-channels">
                <h4>Channels</h4>
                <div className="canvas-box-content">
                  <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {gtm.marketing_channels.slice(0, 2).map((c, i) => (
                      <li key={i}><strong>{c.channel}:</strong> {c.cost_level} cost</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Customer Segments */}
              <div className="glass-panel canvas-box area-segments">
                <h4>Customer Segments</h4>
                <div className="canvas-box-content">
                  <p style={{ fontWeight: 600, color: '#f3f4f6', marginBottom: '8px' }}>Personas Targeted:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {product.target_personas.map((p, i) => (
                      <div key={i} style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: '#c084fc', fontWeight: 600 }}>{p.name}</span> ({p.role})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cost Structure */}
              <div className="glass-panel canvas-box area-cost">
                <h4>Cost Structure</h4>
                <div className="canvas-box-content" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {finance.startup_costs.slice(0, 4).map((cost, i) => (
                    <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem' }}>
                      <strong>{cost.category}:</strong> ${cost.cost_usd.toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Streams */}
              <div className="glass-panel canvas-box area-revenue">
                <h4>Revenue Streams</h4>
                <div className="canvas-box-content">
                  <p><strong>Revenue Model:</strong> {finance.revenue_model}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{finance.pricing_strategy}</p>
                </div>
              </div>
            </div>

            {/* MVP Features Subsection */}
            <div className="glass-panel" style={{ marginTop: '24px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'white' }}>MVP Core Feature Roadmaps</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {product.mvp_features.map((feat, idx) => (
                  <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: 'white', fontSize: '0.95rem' }}>{feat.name}</strong>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontWeight: 600,
                        backgroundColor: feat.priority === 'High' ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)',
                        color: feat.priority === 'High' ? '#f43f5e' : '#f59e0b'
                      }}>{feat.priority} Priority</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{feat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Viability Radar & MVP Priority Analysis Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginTop: '24px' }}>
              {/* Startup Viability Radar Chart */}
              <div className="glass-panel" style={{ padding: '24px', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles style={{ width: '18px', height: '18px', color: '#818cf8' }} />
                      Startup Viability Radar Matrix
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Holistic 6-vector multi-agent readiness evaluation.
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Readiness Index</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#818cf8' }}>
                      {Math.round(viabilityRadarData.reduce((acc, curr) => acc + curr.score, 0) / viabilityRadarData.length)}/100
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, minHeight: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={viabilityRadarData}>
                      <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                      <PolarAngleAxis dataKey="dimension" stroke="#cbd5e1" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.2)" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <Radar name="Viability Score" dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.45} />
                      <Tooltip contentStyle={{ backgroundColor: '#0d1323', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* MVP Feature Priority Distribution Chart */}
              <div className="glass-panel" style={{ padding: '24px', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target style={{ width: '18px', height: '18px', color: '#06b6d4' }} />
                    MVP Scope & Sprint Allocation
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Feature density categorized by sprint delivery urgency.
                  </p>
                </div>

                <div style={{ flex: 1, minHeight: '230px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mvpDistributionData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="priority" stroke="#cbd5e1" tick={{ fill: '#cbd5e1', fontSize: 11 }} width={110} />
                      <Tooltip 
                        formatter={(val, _name, item) => [`${val} features (${item.payload.targetSprint})`, 'Scope']}
                        contentStyle={{ backgroundColor: '#0d1323', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {mvpDistributionData.map((entry, index) => (
                          <Cell key={`cell-mvp-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Total Core Features: <strong style={{ color: 'white' }}>{product.mvp_features.length}</strong></span>
                  <span>Target MVP Velocity: <strong style={{ color: '#10b981' }}>2 Sprints</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MARKET ANALYSIS */}
        {activeTab === 'market' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Market Landscape & SWOT</h1>
              <p style={{ color: 'var(--text-muted)' }}>Sizing calculations, market trends, competitor mapping, and strategic SWOT analysis.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Market Size Sizing Chart */}
              <div className="glass-panel" style={{ padding: '24px', height: '360px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'white' }}>Market Sizing (TAM, SAM, SOM)</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={marketSizeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'USD']}
                      contentStyle={{ backgroundColor: '#0d1323', borderColor: 'rgba(255,255,255,0.1)' }}
                      labelStyle={{ color: 'white', fontWeight: 600 }}
                    />
                    <Bar dataKey="USD" fill="#4f46e5">
                      {marketSizeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? '#06b6d4' : index === 1 ? '#9333ea' : '#4f46e5'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Market Trends Card */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'white' }}>Key Market Trends</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
                  {market.market_trends.map((trend, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ padding: '6px', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                        0{idx + 1}
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.4 }}>{trend}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Competitor Matrix Table */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'white' }}>Competitor Analysis Grid</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Competitor Name</th>
                    <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Strengths</th>
                    <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weaknesses</th>
                    <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unique Angle / UVP</th>
                  </tr>
                </thead>
                <tbody>
                  {market.competitor_matrix.map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '16px 12px', fontWeight: 600, color: 'white', fontSize: '0.95rem' }}>{c.name}</td>
                      <td style={{ padding: '16px 12px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        <ul style={{ paddingLeft: '12px' }}>
                          {c.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        <ul style={{ paddingLeft: '12px' }}>
                          {c.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '0.85rem', color: '#a855f7', fontWeight: 500 }}>{c.unique_value_prop}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Competitor Positioning 2D Matrix & SWOT Balance Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '24px' }}>
              {/* 2D Competitor Positioning Quadrant */}
              <div className="glass-panel" style={{ padding: '24px', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Target style={{ width: '18px', height: '18px', color: '#818cf8' }} />
                      Market Positioning & Innovation Quadrant
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Mapping your startup vs incumbents on Innovation/AI Depth vs Legacy Scale.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', fontWeight: 700, border: '1px solid rgba(129, 140, 248, 0.3)' }}>
                    High Moat Zone
                  </span>
                </div>

                <div style={{ flex: 1, position: 'relative', minHeight: '260px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
                  {/* Quadrant Axis Lines */}
                  <div style={{ position: 'absolute', top: '50%', left: '30px', right: '30px', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <div style={{ position: 'absolute', left: '50%', top: '30px', bottom: '30px', width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

                  {/* Quadrant Labels */}
                  <span style={{ position: 'absolute', top: '10px', right: '16px', fontSize: '0.65rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>
                    🚀 Disruptors (Your Startup)
                  </span>
                  <span style={{ position: 'absolute', top: '10px', left: '16px', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Niche Innovators
                  </span>
                  <span style={{ position: 'absolute', bottom: '10px', right: '16px', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Legacy Incumbents
                  </span>
                  <span style={{ position: 'absolute', bottom: '10px', left: '16px', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Commodity Tools
                  </span>

                  {/* Self Startup Marker */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: '22%', 
                      right: '25%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      zIndex: 10,
                      animation: 'radarPulse 3s infinite'
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderRadius: '20px', background: 'linear-gradient(135deg, #4f46e5, #9333ea)', color: 'white', fontWeight: 800, fontSize: '0.8rem', boxShadow: '0 0 15px rgba(129, 140, 248, 0.6)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles style={{ width: '12px', height: '12px' }} />
                      {gtm.brand_name_suggestions[0] || 'Your Startup'}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#c084fc', fontWeight: 700, marginTop: '2px' }}>High Innovation & High Value</span>
                  </div>

                  {/* Competitor Markers */}
                  {market.competitor_matrix.slice(0, 3).map((comp, idx) => {
                    const topPos = idx === 0 ? '60%' : idx === 1 ? '70%' : '35%';
                    const leftPos = idx === 0 ? '70%' : idx === 1 ? '30%' : '20%';
                    return (
                      <div 
                        key={idx}
                        style={{ 
                          position: 'absolute', 
                          top: topPos, 
                          left: leftPos, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          opacity: 0.85
                        }}
                      >
                        <div style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 600 }}>
                          {comp.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SWOT Strategic Factor Balance Chart */}
              <div className="glass-panel" style={{ padding: '24px', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck style={{ width: '18px', height: '18px', color: '#10b981' }} />
                    SWOT Factor Balance
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Comparison of strategic catalysts versus external risk factors.
                  </p>
                </div>

                <div style={{ flex: 1, minHeight: '230px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={swotBalanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="category" stroke="var(--text-muted)" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                      <YAxis stroke="var(--text-muted)" allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      <Tooltip 
                        formatter={(val, _name, item) => [`${val} factors (${item.payload.polarity})`, 'Weight']}
                        contentStyle={{ backgroundColor: '#0d1323', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {swotBalanceData.map((entry, index) => (
                          <Cell key={`cell-swot-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', fontSize: '0.75rem' }}>
                  <span style={{ color: '#10b981' }}>Positive Drivers: <strong>{market.swot_analysis.strengths.length + market.swot_analysis.opportunities.length}</strong></span>
                  <span style={{ color: '#f43f5e' }}>Risk Mitigations: <strong>{market.swot_analysis.weaknesses.length + market.swot_analysis.threats.length}</strong></span>
                </div>
              </div>
            </div>

            {/* SWOT Matrix Grid */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'white' }}>SWOT Strategic Analysis</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Strengths */}
                <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', backgroundColor: 'rgba(16, 185, 129, 0.02)' }}>
                  <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.2rem' }}>S</span> Strengths
                  </h4>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {market.swot_analysis.strengths.map((item, i) => <li key={i} style={{ color: '#e2e8f0' }}>{item}</li>)}
                  </ul>
                </div>
                {/* Weaknesses */}
                <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)', backgroundColor: 'rgba(244, 63, 94, 0.02)' }}>
                  <h4 style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.2rem' }}>W</span> Weaknesses
                  </h4>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {market.swot_analysis.weaknesses.map((item, i) => <li key={i} style={{ color: '#e2e8f0' }}>{item}</li>)}
                  </ul>
                </div>
                {/* Opportunities */}
                <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.2)', backgroundColor: 'rgba(6, 182, 212, 0.02)' }}>
                  <h4 style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.2rem' }}>O</span> Opportunities
                  </h4>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {market.swot_analysis.opportunities.map((item, i) => <li key={i} style={{ color: '#e2e8f0' }}>{item}</li>)}
                  </ul>
                </div>
                {/* Threats */}
                <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', backgroundColor: 'rgba(245, 158, 11, 0.02)' }}>
                  <h4 style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.2rem' }}>T</span> Threats
                  </h4>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {market.swot_analysis.threats.map((item, i) => <li key={i} style={{ color: '#e2e8f0' }}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FINANCIAL MODEL */}
        {activeTab === 'finance' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Financial Strategy & Projections</h1>
              <p style={{ color: 'var(--text-muted)' }}>Pricing strategy, initial startup capitalization costs, and a 3-year growth model projection.</p>
            </div>

            {/* Top Financial KPI Metric Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#818cf8' }}>
                  <DollarSign style={{ width: '22px', height: '22px' }} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Initial CapEx</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>${totalCapEx.toLocaleString()}</div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}>
                  <Activity style={{ width: '22px', height: '22px' }} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Est. Monthly Burn</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f43f5e' }}>${estimatedMonthlyBurn.toLocaleString()}/mo</div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <ArrowUpRight style={{ width: '22px', height: '22px' }} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Year 3 Profit Margin</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                    {projectionData[2] && projectionData[2].Revenue > 0 ? `${projectionData[2].MarginPct}%` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '24px' }}>
              {/* 3-Year Composed Financial Growth Chart */}
              <div className="glass-panel" style={{ padding: '24px', height: '390px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>3-Year Financial Model & Trajectory</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Revenue volume (Area), Operating expenses (Bar), and Net Profit trajectory (Line).</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 700 }}>
                    Profitable Year 2+
                  </span>
                </div>

                <div style={{ flex: 1, minHeight: '290px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={projectionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: '#cbd5e1' }} />
                      <YAxis stroke="var(--text-muted)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: 'var(--text-muted)' }} />
                      <Tooltip 
                        formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
                        contentStyle={{ backgroundColor: '#0d1323', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        labelStyle={{ color: 'white', fontWeight: 700 }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#cbd5e1', fontSize: '0.8rem' }} />
                      <Area type="monotone" dataKey="Revenue" fill="url(#revenueGrad)" stroke="#10b981" strokeWidth={2} name="Total Revenue" />
                      <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses (OpEx)" barSize={28} />
                      <Line type="monotone" dataKey="Profit" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8', r: 5 }} name="Net Profit" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Startup Capital Cost Breakdown Donut with Center KPI */}
              <div className="glass-panel" style={{ padding: '24px', height: '390px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Capital Costs Breakdown</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Initial allocation of startup capital budget.</p>
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={costData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={88}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {costData.map((_, index) => (
                          <Cell key={`cell-cost-${index}`} fill={costColors[index % costColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Cost']}
                        contentStyle={{ backgroundColor: '#0d1323', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Donut Label */}
                  <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Total CapEx</span>
                    <strong style={{ fontSize: '1.05rem', color: 'white', fontWeight: 800 }}>${(totalCapEx / 1000).toFixed(0)}k</strong>
                  </div>

                  {/* Legend inside pie card */}
                  <div style={{ position: 'absolute', bottom: '4px', width: '100%', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', fontSize: '0.72rem' }}>
                    {costData.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: costColors[idx % costColors.length] }} />
                        <span style={{ color: 'var(--text-muted)' }}>{item.name} ({totalCapEx > 0 ? ((item.value / totalCapEx) * 100).toFixed(0) : 0}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Pricing & Revenue Model */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'white' }}>Monetization Strategy</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <h4 style={{ color: '#06b6d4', fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>Revenue Structure</h4>
                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.4 }}>{finance.revenue_model}</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <h4 style={{ color: '#a855f7', fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>Pricing Strategy Details</h4>
                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.4 }}>{finance.pricing_strategy}</p>
                  </div>
                </div>
              </div>

              {/* Costs Breakdown list */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'white' }}>Capital Expense Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                  {finance.startup_costs.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{item.category}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.description}</div>
                      </div>
                      <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.95rem' }}>
                        ${item.cost_usd.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MARKETING & GTM */}
        {activeTab === 'marketing' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Marketing & Go-To-Market</h1>
              <p style={{ color: 'var(--text-muted)' }}>Launch timelines, acquisition channels, and strategic performance metrics.</p>
            </div>

            {/* Brand Naming Suggestions */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'white' }}>Generated Branding Concepts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {gtm.brand_name_suggestions.map((name, i) => (
                  <div key={i} style={{ padding: '16px', borderRadius: '10px', border: '1px solid rgba(79,70,229,0.2)', backgroundColor: 'rgba(79,70,229,0.01)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '1.15rem' }}>{name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>"{gtm.brand_tagline_suggestions[i] || 'Next-Gen Startup'}"</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GTM Analytics & Growth Trajectory Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Channel Efficiency & Cost-Tier Chart */}
              <div className="glass-panel" style={{ padding: '24px', minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
                      Channel Efficiency & Cost Weight
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Acquisition impact score vs estimated marketing cost.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 700 }}>
                    CAC Optimized
                  </span>
                </div>

                <div style={{ flex: 1, minHeight: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelGraphData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: '#cbd5e1', fontSize: 10 }} angle={-15} textAnchor="end" />
                      <YAxis stroke="var(--text-muted)" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <Tooltip 
                        formatter={(val, _name, item) => [`${val}/100 (${item.payload.costLevel} Cost)`, 'Impact Score']}
                        contentStyle={{ backgroundColor: '#0d1323', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="impactScore" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Projected Channel Impact" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 12-Month Target KPI Milestone Curve */}
              <div className="glass-panel" style={{ padding: '24px', minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp style={{ width: '18px', height: '18px', color: '#06b6d4' }} />
                      12-Month KPI Ramp Trajectory
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Milestone targets scaling from Seed Launch to Series A readiness.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', fontWeight: 700 }}>
                    Quarterly Pace
                  </span>
                </div>

                <div style={{ flex: 1, minHeight: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={quarterlyMilestoneData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="quarter" stroke="var(--text-muted)" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                      <YAxis stroke="var(--text-muted)" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip 
                        formatter={(_val, _name, item) => [`${item.payload.users} · ${item.payload.revenue}`, 'Milestone Target']}
                        contentStyle={{ backgroundColor: '#0d1323', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Area type="monotone" dataKey="progressScore" stroke="#06b6d4" strokeWidth={3} fill="url(#growthGrad)" dot={{ fill: '#06b6d4', r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* GTM Channels list */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'white' }}>Primary Marketing Channels</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {gtm.marketing_channels.map((chan, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ flex: 1, marginRight: '16px' }}>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{chan.channel}</span>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>{chan.description}</p>
                      </div>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        backgroundColor: chan.cost_level === 'Free' || chan.cost_level === 'Low' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                        color: chan.cost_level === 'Free' || chan.cost_level === 'Low' ? '#10b981' : '#f43f5e'
                      }}>{chan.cost_level} Cost</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs & Metrics */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'white' }}>12-Month Targets & KPIs</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {gtm.key_metrics.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ padding: '8px', backgroundColor: 'rgba(147, 51, 234, 0.1)', color: '#c084fc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Percent style={{ width: '16px', height: '16px' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.metric}</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>{m.target}</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch timeline roadmap */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'white' }}>GTM Launch Roadmap</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                {gtm.launch_timeline.map((phase, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', zIndex: 2 }}>
                        {idx + 1}
                      </div>
                      {idx < gtm.launch_timeline.length - 1 && (
                        <div style={{ width: '2px', height: '70px', backgroundColor: 'rgba(255,255,255,0.05)', marginTop: '4px' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h4 style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>{phase.phase}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 600 }}>{phase.time_period}</span>
                      </div>
                      <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {phase.actions.map((act, i) => <li key={i}>{act}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OPERATIONS ROADMAP & CHECKLIST */}
        {activeTab === 'roadmap' && (
          <div>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Operations & Launch Playbook</h1>
                <p style={{ color: 'var(--text-muted)' }}>Validate demand, set up operations, and execute your week-by-week roadmap to the first customer.</p>
              </div>
              
              <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={() => setRoadmapSubTab('journey')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: roadmapSubTab === 'journey' ? '#4f46e5' : 'transparent',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  9-Step Startup Journey
                </button>
                <button
                  onClick={() => setRoadmapSubTab('playbook')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: roadmapSubTab === 'playbook' ? '#4f46e5' : 'transparent',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  12-Week Playbook
                </button>
              </div>
            </div>

            {/* Roadmap Execution Velocity Burndown Chart */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity style={{ width: '18px', height: '18px', color: '#818cf8' }} />
                    Milestone Delivery Velocity & Cumulative Progress
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Sprint allocation and cumulative operational readiness curve across startup phases.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    100% Launch Target
                  </span>
                </div>
              </div>

              <div style={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={roadmapVelocityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="phase" stroke="var(--text-muted)" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                    <YAxis yAxisId="left" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="var(--text-muted)" tickFormatter={(v) => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value, name, item) => [
                        name === 'Cumulative Readiness' ? `${value}% (${item.payload.milestone})` : `${value} tasks`,
                        name
                      ]}
                      contentStyle={{ backgroundColor: '#0d1323', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#cbd5e1' }} />
                    <Bar yAxisId="left" dataKey="tasksPlanned" fill="#818cf8" radius={[4, 4, 0, 0]} name="Planned Actionable Tasks" barSize={32} />
                    <Line yAxisId="right" type="monotone" dataKey="cumulativeCompletion" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} name="Cumulative Readiness" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {roadmapSubTab === 'journey' && (
              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
                {/* Left Side Checklist */}
                <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, padding: '0 8px 12px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList style={{ width: '16px', height: '16px', color: '#818cf8' }} />
                    Operating Checklist
                  </h3>
                  {roadmap.map((step, idx) => {
                    const isSelected = selectedRoadmapStep === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedRoadmapStep(idx)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid rgba(79, 70, 229, 0.4)' : '1px solid rgba(255,255,255,0.03)',
                          backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'rgba(255,255,255,0.01)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'var(--transition-smooth)'
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: step.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : step.status === 'In Progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)',
                          color: step.status === 'Completed' ? '#10b981' : step.status === 'In Progress' ? '#f59e0b' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}>
                          {step.status === 'Completed' ? '✓' : step.step_number}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? 'white' : '#cbd5e1' }}>{step.phase_name}</div>
                          <div style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 700,
                            color: step.status === 'Completed' ? '#10b981' : step.status === 'In Progress' ? '#f59e0b' : 'var(--text-muted)',
                            marginTop: '2px'
                          }}>
                            {step.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Side Step Workspace */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {roadmap[selectedRoadmapStep] && (
                    <>
                      <div className="glass-panel" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
                            {roadmap[selectedRoadmapStep].phase_name}
                          </h2>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '12px',
                            backgroundColor: roadmap[selectedRoadmapStep].status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : roadmap[selectedRoadmapStep].status === 'In Progress' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)',
                            color: roadmap[selectedRoadmapStep].status === 'Completed' ? '#10b981' : roadmap[selectedRoadmapStep].status === 'In Progress' ? '#f59e0b' : 'var(--text-muted)'
                          }}>
                            {roadmap[selectedRoadmapStep].status}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                          {roadmap[selectedRoadmapStep].analysis}
                        </p>
                      </div>

                      <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'white' }}>Actionable Tasks Checklist</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {roadmap[selectedRoadmapStep].actionable_tasks.map((task, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
                              <input type="checkbox" style={{ marginTop: '3px', accentColor: '#4f46e5' }} />
                              <span style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.4 }}>{task}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="glass-panel" style={{ padding: '20px', backgroundColor: 'rgba(129, 140, 248, 0.02)', border: '1px dashed rgba(129, 140, 248, 0.2)', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          💡 Strategic Pro-Tip
                        </span>
                        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                          {roadmap[selectedRoadmapStep].strategic_advice}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {roadmapSubTab === 'playbook' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: 'rgba(6, 182, 212, 0.02)', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                  <div style={{ padding: '10px', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderRadius: '8px' }}>
                    <Calendar style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>12-Week Customer Acquisition Execution Guide</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      A localized, week-by-week playbook outlining exact targets and campaign execution tasks to secure your first paying customer.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {weekly_playbook.map((week, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Week {week.week_number}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px' }}>
                            Targeting Launch
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '12px', lineHeight: 1.4 }}>
                          {week.objective}
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          {week.tasks.map((task, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <input type="checkbox" style={{ marginTop: '3px', accentColor: '#06b6d4' }} />
                              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.3 }}>{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
                            End-of-Week Deliverable
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                            {week.deliverable}
                          </span>
                        </div>

                        <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '6px', borderLeft: '3px solid #06b6d4' }}>
                          <span style={{ fontSize: '0.65rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                            Growth Tip
                          </span>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                            {week.tips}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: PITCH DECK PRESENTATION */}
        {activeTab === 'pitch' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>10-Slide Investor Pitch Deck</h1>
              <p style={{ color: 'var(--text-muted)' }}>Professional slide structures with key points and visual design layout outlines.</p>
            </div>

            {/* Slide Narrative Balance & Progress Bar */}
            <div className="glass-panel" style={{ padding: '16px 20px', maxWidth: '850px', margin: '0 auto 20px auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Presentation style={{ width: '16px', height: '16px', color: '#ec4899' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>
                    Institutional Pitch Narrative Architecture
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 700 }}>
                  Viewing Slide {activeSlide + 1} of 10: {pitch_deck.slides[activeSlide]?.title}
                </span>
              </div>

              {/* 10-Slide Segmented Interactive Visual Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
                {pitch_deck.slides.map((s, idx) => {
                  const isActive = activeSlide === idx;
                  const phaseColor = idx < 3 ? '#38bdf8' : idx < 6 ? '#818cf8' : idx < 8 ? '#10b981' : '#ec4899';
                  return (
                    <div 
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      style={{
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: isActive ? phaseColor : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${isActive ? 'white' : 'rgba(255, 255, 255, 0.08)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isActive ? `0 0 12px ${phaseColor}` : 'none'
                      }}
                      title={`Slide ${idx + 1}: ${s.title}`}
                    >
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isActive ? '#0a0d17' : '#9ca3af' }}>
                        {idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                <span style={{ color: '#38bdf8' }}>● Problem & Market (1-3)</span>
                <span style={{ color: '#818cf8' }}>● Product & Solution (4-6)</span>
                <span style={{ color: '#10b981' }}>● GTM & Business Model (7-8)</span>
                <span style={{ color: '#ec4899' }}>● Projections & Ask (9-10)</span>
              </div>
            </div>

            {/* Slide Presentation Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '850px', margin: '0 auto' }}>
              {/* Actual Slide Frame */}
              <div 
                className="glass-panel" 
                style={{ 
                  aspectRatio: '16/9', 
                  backgroundColor: '#0a0d17', 
                  border: '2px solid #1e293b', 
                  borderRadius: '16px', 
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
                }}
              >
                {/* Slide Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {gtm.brand_name_suggestions[0]} Investor Pitch
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Slide {pitch_deck.slides[activeSlide]?.slide_number} of 10
                  </span>
                </div>

                {/* Slide Body */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 0' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '20px' }}>
                    {pitch_deck.slides[activeSlide]?.title}
                  </h2>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '20px', fontSize: '1.05rem', color: '#cbd5e1' }}>
                    {pitch_deck.slides[activeSlide]?.bullet_points.map((pt, i) => (
                      <li key={i} style={{ lineHeight: 1.5 }}>{pt}</li>
                    ))}
                  </ul>
                </div>

                {/* Slide Footer */}
                <div style={{ fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Confidential Proposal</span>
                  <span>{gtm.brand_tagline_suggestions[0]}</span>
                </div>
              </div>

              {/* Slide Design Notes (Helpful Subcard) */}
              <div className="glass-panel" style={{ padding: '16px 20px', backgroundColor: 'rgba(6, 182, 212, 0.02)', border: '1px dashed rgba(6, 182, 212, 0.2)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  🎨 VC Coach & Design Note
                </span>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {pitch_deck.slides[activeSlide]?.design_note}
                </p>
              </div>

              {/* Slider controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                <button
                  disabled={activeSlide === 0}
                  onClick={() => setActiveSlide(s => s - 1)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Previous Slide
                </button>
                
                {/* Slide dots */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {pitch_deck.slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: activeSlide === idx ? '#818cf8' : 'rgba(255,255,255,0.15)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    />
                  ))}
                </div>

                <button
                  disabled={activeSlide === 9}
                  onClick={() => setActiveSlide(s => s + 1)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Next Slide
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BOARDROOM CHAT (Interactive group chat) */}
        {activeTab === 'chat' && (
          <BoardroomChat report={report} providers={providers} />
        )}
      </div>
    </div>
  );
};
