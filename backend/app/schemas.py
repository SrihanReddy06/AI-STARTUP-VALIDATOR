from typing import List, Dict, Any
from pydantic import BaseModel, Field

# ----------------------------------------------------
# 1. Product Strategist Schema
# ----------------------------------------------------
class Persona(BaseModel):
    name: str = Field(description="Name or segment of the target user persona")
    role: str = Field(description="Their professional role or lifestyle context")
    pain_point: str = Field(description="Their primary pain point related to this startup idea")
    solution: str = Field(description="How the product solves their specific pain point")

class MVPFeature(BaseModel):
    name: str = Field(description="Feature name")
    description: str = Field(description="Feature description")
    priority: str = Field(description="Priority level (High, Medium, Low)")

class ProductRefinement(BaseModel):
    refined_idea: str = Field(description="A refined, professional elevator pitch of the startup idea")
    value_proposition: str = Field(description="Clear and compelling unique value proposition statement")
    target_personas: List[Persona] = Field(description="Representative customer personas")
    mvp_features: List[MVPFeature] = Field(description="Core feature list for the MVP")
    user_flow_steps: List[str] = Field(description="Step-by-step description of the user journey in the MVP")

# ----------------------------------------------------
# 2. Market Researcher Schema
# ----------------------------------------------------
class Competitor(BaseModel):
    name: str = Field(description="Name of the competitor")
    strengths: List[str] = Field(description="Key strengths of the competitor")
    weaknesses: List[str] = Field(description="Key weaknesses of the competitor")
    unique_value_prop: str = Field(description="Their unique value proposition or angle")

class SWOT(BaseModel):
    strengths: List[str] = Field(description="Internal strengths")
    weaknesses: List[str] = Field(description="Internal weaknesses")
    opportunities: List[str] = Field(description="External opportunities")
    threats: List[str] = Field(description="External threats")

class MarketAnalysis(BaseModel):
    tam_usd: int = Field(description="Total Addressable Market in USD (e.g. 500000000)")
    sam_usd: int = Field(description="Serviceable Addressable Market in USD")
    som_usd: int = Field(description="Serviceable Obtainable Market in USD")
    market_trends: List[str] = Field(description="Top 3-5 macro trends in this market sector")
    competitor_matrix: List[Competitor] = Field(description="Competitor landscape comparison")
    swot_analysis: SWOT = Field(description="SWOT matrix analysis")

# ----------------------------------------------------
# 3. Financial Officer Schema
# ----------------------------------------------------
class StartupCostItem(BaseModel):
    category: str = Field(description="Cost category, e.g. Hosting, Marketing, Legal")
    cost_usd: int = Field(description="Estimated cost in USD")
    description: str = Field(description="Brief explanation of the expense")

class YearlyProjection(BaseModel):
    year: int = Field(description="Year number (1, 2, or 3)")
    revenue_usd: int = Field(description="Projected revenue in USD")
    expenses_usd: int = Field(description="Projected expenses in USD")
    profit_usd: int = Field(description="Projected profit in USD")

class FinancialModel(BaseModel):
    revenue_model: str = Field(description="How the startup makes money, e.g. SaaS Subscription, Transaction Fees")
    pricing_strategy: str = Field(description="Proposed pricing tier descriptions and strategy")
    startup_costs: List[StartupCostItem] = Field(description="Estimated initial startup expenses to get to launch")
    yearly_projections: List[YearlyProjection] = Field(description="3-Year financial projection")

# ----------------------------------------------------
# 4. Marketing & GTM Schema
# ----------------------------------------------------
class MarketingChannel(BaseModel):
    channel: str = Field(description="Channel name, e.g. Content Marketing, PPC Ads, Influencers")
    cost_level: str = Field(description="Cost level (Free, Low, Medium, High)")
    description: str = Field(description="Strategy for leveraging this channel")

class LaunchPhase(BaseModel):
    phase: str = Field(description="Phase name, e.g. Pre-Launch, Launch, Post-Launch Growth")
    time_period: str = Field(description="Timeline, e.g. Months 1-2, Month 3")
    actions: List[str] = Field(description="Actionable steps during this phase")

class KeyMetric(BaseModel):
    metric: str = Field(description="Metric name, e.g. CAC, LTV, Monthly Active Users")
    target: str = Field(description="12-month target value")
    description: str = Field(description="Why this metric matters for this startup")

class GTMStrategy(BaseModel):
    brand_name_suggestions: List[str] = Field(description="3-5 catchy brand/startup name suggestions")
    brand_tagline_suggestions: List[str] = Field(description="3-5 impactful startup slogans/taglines")
    marketing_channels: List[MarketingChannel] = Field(description="Top marketing channels for customer acquisition")
    launch_timeline: List[LaunchPhase] = Field(description="Month-by-month GTM roadmap")
    key_metrics: List[KeyMetric] = Field(description="Primary KPIs to measure success")

# ----------------------------------------------------
# 5. Pitch Deck Schema
# ----------------------------------------------------
class PitchSlide(BaseModel):
    slide_number: int = Field(description="Order of the slide (1-10)")
    title: str = Field(description="Slide title")
    bullet_points: List[str] = Field(description="Core talking points or content for the slide")
    design_note: str = Field(description="Suggestions for design layout, visuals, or icon usage")

class PitchDeck(BaseModel):
    slides: List[PitchSlide] = Field(description="10-Slide pitch deck structure")

# ----------------------------------------------------
class RoadmapStep(BaseModel):
    step_number: int = Field(description="Step number (1-9)")
    phase_name: str = Field(description="Name of the startup phase (e.g. Identify a Problem)")
    status: str = Field(description="Phase status (e.g. Completed, In Progress, Planned)")
    analysis: str = Field(description="Deep real-time analysis specific to this startup idea")
    actionable_tasks: List[str] = Field(description="Specific actionable list of tasks to execute this step")
    strategic_advice: str = Field(description="Venture/expert strategic advice for this step")

class WeeklyTask(BaseModel):
    week_number: int = Field(description="Week number (1-12)")
    objective: str = Field(description="Main objective for this week")
    tasks: List[str] = Field(description="Actionable tasks to complete this week")
    deliverable: str = Field(description="Expected deliverable/milestone at the end of the week")
    tips: str = Field(description="Pro tips or shortcuts to achieve this week's goal")

# Master Report Schema
# ----------------------------------------------------
class StartupReport(BaseModel):
    product: ProductRefinement
    market: MarketAnalysis
    finance: FinancialModel
    gtm: GTMStrategy
    pitch_deck: PitchDeck
    roadmap: List[RoadmapStep] = Field(description="9-step startup operating roadmap")
    weekly_playbook: List[WeeklyTask] = Field(description="12-week step-by-step customer acquisition playbook")
