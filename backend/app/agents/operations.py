import sys
import os

# Dynamic path resolution to find the parent directory of the 'app' package
current_dir = os.path.dirname(os.path.abspath(__file__))
while current_dir and current_dir != os.path.dirname(current_dir):
    if os.path.exists(os.path.join(current_dir, "app")):
        if current_dir not in sys.path:
            sys.path.insert(0, current_dir)
        break
    current_dir = os.path.dirname(current_dir)

import asyncio
import logging
from typing import List
from app.agents.base import get_llm, stream_log, extract_json_object
from app.schemas import ProductRefinement, MarketAnalysis, FinancialModel, GTMStrategy, RoadmapStep, WeeklyTask
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

class OperationsOutput(BaseModel):
    roadmap: List[RoadmapStep] = Field(description="9-step startup operating roadmap")
    weekly_playbook: List[WeeklyTask] = Field(description="12-week step-by-step customer acquisition playbook")

async def run_operations_agent(
    product_context: ProductRefinement,
    market_context: MarketAnalysis,
    financial_context: FinancialModel,
    gtm_context: GTMStrategy,
    industry: str,
    location: str,
    budget: str,
    provider: str,
    queue: asyncio.Queue
) -> OperationsOutput:
    """
    Synthesizes the entire business context (product, market, finance, marketing) to formulate
    a 9-step operations roadmap and a highly localized, actionable 12-week customer acquisition playbook.
    """
    agent_name = "Operations & Launch Specialist"
    
    await stream_log(queue, agent_name, "active", "Structuring the 9-step startup operating roadmap...")
    await asyncio.sleep(0.5)
    
    await stream_log(queue, agent_name, "active", f"Designing a localized 12-week customer acquisition playbook for {location}...")
    await asyncio.sleep(0.5)

    system_instruction = (
        "You are an elite Venture Builder, Startup Operations Specialist, and Growth Hacking Expert. Your task is to analyze the "
        "compiled product specification, competitor landscape, financial model, and marketing strategy to generate two deliverables:\n"
        "1. A 9-Step Operating Roadmap\n"
        "2. A 12-Week Customer Acquisition Playbook\n\n"
        "Both deliverables MUST be highly specific to the target industry, location, and budget, avoiding any vague or generic checklists.\n\n"
        "----------------------------------------------------\n"
        "DELIVERABLE 1: 9-STEP OPERATING ROADMAP\n"
        "----------------------------------------------------\n"
        "You must output exactly 9 steps, with these exact phase names in order:\n"
        "1. 'Identify a problem' (Status: Completed. Analysis: Synthesize the core customer pain points & architectural bottleneck your product solves.)\n"
        "2. 'Market research' (Status: Completed. Analysis: Synthesize TAM/SAM/SOM and specific technical competitor weaknesses from the market report.)\n"
        "3. 'Customer interviews' (Status: In Progress. Analysis: Identify target roles/demographics for interviews in the target location, and write 3 custom, non-leading, highly specific questions to ask them.)\n"
        "4. 'Validate demand' (Status: Planned. Analysis: Propose a concrete smoke test or landing page concept with exact target signup/conversion numbers and metrics.)\n"
        "5. 'Define business model' (Status: Planned. Analysis: Explain how the monetization model and pricing tiers fit the regional purchasing power/ARPU and budget.)\n"
        "6. 'Build MVP' (Status: Planned. Analysis: Define the core tech stack deployment sequence, highlighting server/database architecture decisions based on budget.)\n"
        "7. 'Get first users/customers' (Status: Planned. Analysis: Detail specific regional channels and acquisition volume goals to reach validation.)\n"
        "8. 'Register the company' (Status: Planned. Analysis: Provide highly localized details on corporate registration in the target location, e.g. Private Limited/LLP structure in India, LLC/C-Corp in the US, SAS/SARL in France. Include local registration portals, tax IDs required (e.g. GST, EIN), and realistic local costs/timelines.)\n"
        "9. 'Hire team & scale' (Status: Planned. Analysis: Detail the first 2-3 key hires (e.g., founding engineer, growth marketer) and localized compensation benchmarks for the target location.)\n\n"
        "For each step, write:\n"
        "- `step_number`: 1 to 9\n"
        "- `phase_name`: As specified above\n"
        "- `status`: 'Completed', 'In Progress', or 'Planned'\n"
        "- `analysis`: Custom, deep-dive business analysis\n"
        "- `actionable_tasks`: A list of 3-4 concrete, quantitative check-points (e.g. 'Draft 10 outreach templates', 'Build landing page on Webflow', 'Obtain EIN from IRS')\n"
        "- `strategic_advice`: A 'pro tip' or warning regarding local regulatory hurdles, scaling bottlenecks, or speed-to-market loops.\n\n"
        "----------------------------------------------------\n"
        "DELIVERABLE 2: 12-WEEK CUSTOMER ACQUISITION PLAYBOOK\n"
        "----------------------------------------------------\n"
        "Build a week-by-week (Weeks 1 to 12) tactical execution plan targeting the FIRST CUSTOMER. It must be highly customized to the startup category:\n"
        "- If E-Commerce/D2C: focus on influencer seeding, social media ad creative testing, micro-influencer outreach, and email list building.\n"
        "- If B2B SaaS/API: focus on cold email setups, domain warmup, ICP lead scraping, LinkedIn network building, and booking demo calls.\n"
        "- If Marketplace: focus on supply side manual onboarding, followed by localized demand generation/postings.\n"
        "- If Local Services: focus on local SEO, Google Business Profiles, flyer distribution, local group postings, and launch discounts.\n"
        "Every week must have:\n"
        "- `week_number`: 1 to 12\n"
        "- `objective`: High-impact weekly goal\n"
        "- `tasks`: 3-4 concrete checklists with quantitative targets (e.g. 'Reach out to 25 local restaurant owners via cold call', 'Set up 3 email domains and warm up for 14 days')\n"
        "- `deliverable`: Concrete milestone output of the week\n"
        "- `tips`: Growth hacks or optimization shortcuts.\n\n"
        "REGIONAL TAILORING DIRECTIVES:\n"
        f"- Target Industry: {industry}\n"
        f"- Target Location: {location}\n"
        f"- Target Budget: {budget}\n"
        "- Localize all currency, registration requirements, salary expectations, entity structures, and outreach channels strictly to the norms of the region."
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("user", (
            "Here is the compiled business context:\n"
            "--- PRODUCT ---\n"
            "Refined Idea: {refined_idea}\n"
            "Value Prop: {value_prop}\n"
            "MVP Features: {mvp_features}\n\n"
            "--- MARKET ---\n"
            "SOM: ${som_usd} USD\n"
            "Competitors: {competitors}\n\n"
            "--- FINANCIALS ---\n"
            "Revenue Model: {revenue_model}\n"
            "Pricing Strategy: {pricing_strategy}\n\n"
            "--- MARKETING ---\n"
            "Channels: {channels}\n\n"
            "Generate the Operations & Launch Plan now."
        ))
    ])

    # Context formatting
    mvp_features_str = ", ".join([f"{f.name}: {f.description}" for f in product_context.mvp_features])
    competitors_str = ", ".join([f"{c.name} (Strengths: {', '.join(c.strengths)}, Weaknesses: {', '.join(c.weaknesses)})" for c in market_context.competitor_matrix])
    channels_str = ", ".join([f"{c.channel}: {c.description}" for c in gtm_context.marketing_channels])

    llm = get_llm(provider, temperature=0.2)
    structured_llm = llm.with_structured_output(OperationsOutput)
    chain = prompt | structured_llm

    try:
        result = await chain.ainvoke({
            "refined_idea": product_context.refined_idea,
            "value_prop": product_context.value_proposition,
            "mvp_features": mvp_features_str,
            "som_usd": market_context.som_usd,
            "competitors": competitors_str,
            "revenue_model": financial_context.revenue_model,
            "pricing_strategy": financial_context.pricing_strategy,
            "channels": channels_str
        })
    except Exception as exc:
        await stream_log(queue, agent_name, "warning", "Structured OperationsOutput failed; falling back to raw JSON parse.")
        logging.warning(f"Structured OperationsOutput failed: {exc}")

        fallback_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an operations expert. Respond ONLY with valid JSON (no markdown) matching this schema:\n"
             "{{\"roadmap\": [{{ \"step_number\": <number>, \"phase_name\": <string>, \"status\": <string>, \"analysis\": <string>, \"actionable_tasks\": [<strings>], \"strategic_advice\": <string> }}],\n"
             "\"weekly_playbook\": [{{ \"week_number\": <number>, \"objective\": <string>, \"tasks\": [<strings>], \"deliverable\": <string>, \"tips\": <string> }}]}}"),
            ("user", "Generate operations JSON for refined idea: {refined_idea}")
        ])

        raw = await (fallback_prompt | llm).ainvoke({"refined_idea": product_context.refined_idea})
        raw_text = getattr(raw, "content", str(raw))
        if isinstance(raw_text, list):
            raw_text = "\n".join(str(item) for item in raw_text)

        json_body = extract_json_object(str(raw_text))
        if json_body is None:
            logging.error(f"Operations fallback parse failed. Raw: {raw_text[:500]}")
            raise ValueError("Could not extract valid JSON for operations.")

        result = OperationsOutput.model_validate_json(json_body)

    await stream_log(queue, agent_name, "completed", "Startup operating roadmap and 12-week customer acquisition playbook ready!")
    return result
