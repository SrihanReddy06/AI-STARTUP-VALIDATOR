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
  Calendar
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
  Cell
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

  // Formatting financial projections for Recharts
  const projectionData = finance.yearly_projections.map(proj => ({
    name: `Year ${proj.year}`,
    Revenue: proj.revenue_usd,
    Expenses: proj.expenses_usd,
    Profit: proj.profit_usd
  }));

  // Formatting startup costs for Recharts PieChart
  const costColors = ['#4f46e5', '#9333ea', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
  const costData = finance.startup_costs.map(item => ({
    name: item.category,
    value: item.cost_usd
  }));

  // Formatting TAM/SAM/SOM for Recharts
  const marketSizeData = [
    { name: 'TAM', USD: market.tam_usd, desc: 'Total Addressable Market' },
    { name: 'SAM', USD: market.sam_usd, desc: 'Serviceable Addressable Market' },
    { name: 'SOM', USD: market.som_usd, desc: 'Serviceable Obtainable Market' }
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

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '24px' }}>
              {/* 3-Year Projection Chart */}
              <div className="glass-panel" style={{ padding: '24px', height: '360px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'white' }}>3-Year Financial Model</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'USD']}
                      contentStyle={{ backgroundColor: '#0d1323', borderColor: 'rgba(255,255,255,0.1)' }}
                      labelStyle={{ color: 'white', fontWeight: 600 }}
                    />
                    <Legend />
                    <Bar dataKey="Revenue" fill="#10b981" />
                    <Bar dataKey="Expenses" fill="#f43f5e" />
                    <Bar dataKey="Profit" fill="#818cf8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Startup Capital Cost breakdown pie */}
              <div className="glass-panel" style={{ padding: '24px', height: '360px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: 'white' }}>Capital Costs Breakdown</h3>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {costData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={costColors[index % costColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'USD']} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend inside pie card */}
                  <div style={{ position: 'absolute', bottom: '10px', width: '100%', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', fontSize: '0.75rem' }}>
                    {costData.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: costColors[idx % costColors.length] }} />
                        <span style={{ color: 'var(--text-muted)' }}>{item.name} ({((item.value / finance.startup_costs.reduce((a,b) => a+b.cost_usd, 0)) * 100).toFixed(0)}%)</span>
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
