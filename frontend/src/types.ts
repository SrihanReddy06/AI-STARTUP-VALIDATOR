export interface Persona {
  name: string;
  role: string;
  pain_point: string;
  solution: string;
}

export interface MVPFeature {
  name: string;
  description: string;
  priority: string;
}

export interface ProductRefinement {
  refined_idea: string;
  value_proposition: string;
  target_personas: Persona[];
  mvp_features: MVPFeature[];
  user_flow_steps: string[];
}

export interface Competitor {
  name: string;
  strengths: string[];
  weaknesses: string[];
  unique_value_prop: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface MarketAnalysis {
  tam_usd: number;
  sam_usd: number;
  som_usd: number;
  market_trends: string[];
  competitor_matrix: Competitor[];
  swot_analysis: SWOT;
}

export interface StartupCostItem {
  category: string;
  cost_usd: number;
  description: string;
}

export interface YearlyProjection {
  year: number;
  revenue_usd: number;
  expenses_usd: number;
  profit_usd: number;
}

export interface FinancialModel {
  revenue_model: string;
  pricing_strategy: string;
  startup_costs: StartupCostItem[];
  yearly_projections: YearlyProjection[];
}

export interface MarketingChannel {
  channel: string;
  cost_level: string;
  description: string;
}

export interface LaunchPhase {
  phase: string;
  time_period: string;
  actions: string[];
}

export interface KeyMetric {
  metric: string;
  target: string;
  description: string;
}

export interface GTMStrategy {
  brand_name_suggestions: string[];
  brand_tagline_suggestions: string[];
  marketing_channels: MarketingChannel[];
  launch_timeline: LaunchPhase[];
  key_metrics: KeyMetric[];
}

export interface PitchSlide {
  slide_number: number;
  title: string;
  bullet_points: string[];
  design_note: string;
}

export interface PitchDeck {
  slides: PitchSlide[];
}

export interface RoadmapStep {
  step_number: number;
  phase_name: string;
  status: string;
  analysis: string;
  actionable_tasks: string[];
  strategic_advice: string;
}

export interface WeeklyTask {
  week_number: number;
  objective: string;
  tasks: string[];
  deliverable: string;
  tips: string;
}

export interface StartupReport {
  product: ProductRefinement;
  market: MarketAnalysis;
  finance: FinancialModel;
  gtm: GTMStrategy;
  pitch_deck: PitchDeck;
  roadmap: RoadmapStep[];
  weekly_playbook: WeeklyTask[];
}

export interface AgentLog {
  agent: string;
  status: 'idle' | 'active' | 'completed' | 'failed';
  detail: string;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'cfo' | 'strategist' | 'marketer';
  content: string;
  timestamp: string;
}
