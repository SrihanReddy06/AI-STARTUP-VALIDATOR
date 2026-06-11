import React, { useState } from 'react';
import { Sparkles, Brain, Cpu } from 'lucide-react';

interface IdeaFormProps {
  onSubmit: (idea: string, providers: Record<string, string>) => void;
  isLoading: boolean;
}

export const IdeaForm: React.FC<IdeaFormProps> = ({ onSubmit, isLoading }) => {
  const [idea, setIdea] = useState('');
  const [industry, setIndustry] = useState('Tech B2B SaaS');
  const [budget, setBudget] = useState('Bootstrapped');
  const [region, setRegion] = useState('Global');
  
  // Custom provider states for each agent
  const [providers, setProviders] = useState<Record<string, string>>({
    product: 'gemini',
    market: 'gemini',
    finance: 'gemini',
    marketing: 'gemini',
    pitch: 'gemini',
    chat: 'groq',
  });

  const handleProviderChange = (agent: string, provider: string) => {
    setProviders((prev) => ({
      ...prev,
      [agent]: provider,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    
    // Compile a full pitch input incorporating metadata
    const compiledIdea = `Industry: ${industry}\nLocation: ${region}\nBudget: ${budget}\n\nStartup Idea:\n${idea}`;
    onSubmit(compiledIdea, providers);
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', maxWidth: '780px', margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '50%', marginBottom: '16px' }}>
          <Sparkles style={{ width: '32px', height: '32px', color: '#818cf8' }} />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '8px' }}>
          Launch Your Startup with <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Autonomous Agents</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Describe your business idea. Our specialized advisory agents will research, model, brand, and design your complete business.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#cbd5e1' }}>Describe your startup idea:</label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. A marketplace connecting freelance video editors with YouTubers, with an escrow payment system and AI video quality check tools..."
            required
            rows={5}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--panel-border)',
              color: 'white',
              fontSize: '1rem',
              fontFamily: 'var(--font-sans)',
              resize: 'vertical',
              outline: 'none',
              transition: 'var(--transition-smooth)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--panel-border)'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Industry Sector</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--panel-border)',
                color: 'white',
                outline: 'none',
              }}
            >
              <option value="Tech B2B SaaS">Tech B2B SaaS</option>
              <option value="Consumer Web/Mobile App">Consumer Web/Mobile App</option>
              <option value="E-Commerce & Retail">E-Commerce & Retail</option>
              <option value="Fintech & Web3">Fintech & Web3</option>
              <option value="Healthcare & EdTech">Healthcare & EdTech</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Other / Physical Service">Other / Physical Service</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Location</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--panel-border)',
                color: 'white',
                outline: 'none',
              }}
            >
              <option value="Global">Global</option>
              <option value="North America (US/CA)">North America (US/CA)</option>
              <option value="Europe / UK">Europe / UK</option>
              <option value="India / South Asia">India / South Asia</option>
              <option value="Latin America">Latin America</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Funding Budget</label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--panel-border)',
                color: 'white',
                outline: 'none',
              }}
            >
              <option value="Bootstrapped">Bootstrapped (under $10k)</option>
              <option value="Angel Funded ($50k - $200k)">Angel Funded ($50k - $200k)</option>
              <option value="VC Seed Funding ($500k+)">VC Seed Funding ($500k+)</option>
            </select>
          </div>
        </div>

        {/* LLM Router Configuration Panel */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu style={{ width: '16px', height: '16px', color: '#a855f7' }} /> Multi-Model Agent Routing Configuration
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Route each specialized agent to your preferred LLM provider. Run reasoning agents on Gemini and speed-focused advisors on Groq.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { id: 'product', name: 'Product Strategist Agent' },
              { id: 'market', name: 'Market Researcher Agent' },
              { id: 'finance', name: 'Financial Officer Agent' },
              { id: 'marketing', name: 'Marketing & GTM Agent' },
              { id: 'pitch', name: 'Pitch Deck Designer Agent' },
              { id: 'chat', name: 'Boardroom Chat (Interactive)' },
            ].map((agent) => (
              <div key={agent.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1' }}>{agent.name}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleProviderChange(agent.id, 'gemini')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      backgroundColor: providers[agent.id] === 'gemini' ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                      color: providers[agent.id] === 'gemini' ? '#818cf8' : 'var(--text-muted)',
                      borderColor: providers[agent.id] === 'gemini' ? 'var(--primary)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderChange(agent.id, 'groq')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      backgroundColor: providers[agent.id] === 'groq' ? 'rgba(147, 51, 234, 0.2)' : 'transparent',
                      color: providers[agent.id] === 'groq' ? '#c084fc' : 'var(--text-muted)',
                      borderColor: providers[agent.id] === 'groq' ? 'var(--secondary)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    Groq
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !idea.trim()}
          className="btn btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '12px' }}
        >
          {isLoading ? (
            <>
              <Brain className="badge-active" style={{ animation: 'spin 2s linear infinite' }} />
              Simulating Agent Advisory Board...
            </>
          ) : (
            <>
              <Sparkles />
              Spawn Advisory Pipeline
            </>
          )}
        </button>
      </form>
    </div>
  );
};
