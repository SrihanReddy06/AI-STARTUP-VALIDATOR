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
import re
from app.agents.base import get_llm, stream_log, search_web, extract_json_object
from app.schemas import FinancialModel, ProductRefinement, MarketAnalysis
from langchain_core.prompts import ChatPromptTemplate

async def run_financial_officer(
    product_context: ProductRefinement,
    market_context: MarketAnalysis,
    industry: str,
    location: str,
    budget: str,
    provider: str,
    queue: asyncio.Queue
) -> FinancialModel:
    """
    Formulates a pricing strategy, models startup costs, and creates a 3-year financial projection.
    Tailors cost estimations and capital constraints strictly to industry, location, and budget.
    """
    agent_name = "Financial Officer"
    
    # Live search for salary and hosting benchmarks
    search_query = f"average tech developer salary and server hosting pricing in {location} {industry}"
    await stream_log(queue, agent_name, "active", f"Searching salary and hosting benchmarks in {location}...")
    search_results = await asyncio.to_thread(search_web, search_query)
    
    await stream_log(queue, agent_name, "active", "Modeling startup costs (hosting, ops, marketing, development)...")
    await asyncio.sleep(0.5)
    
    await stream_log(queue, agent_name, "active", "Designing pricing plans and subscription/transaction tiers...")
    await asyncio.sleep(0.5)
    
    await stream_log(queue, agent_name, "active", "Calculating 3-year revenue and expense growth projections...")
    
    system_instruction = (
        "You are a sophisticated Startup CFO and venture modeling expert. Your task is to construct "
        "a precise financial model and 3-year growth projection.\n\n"
        "First, determine the startup's classification: B2B SaaS, B2C App, Marketplace, E-Commerce/Retail, Hardware/IoT, Local Business, or Agency.\n\n"
        "Analyze the finances with specific sector depth, avoiding SaaS-only assumptions for non-SaaS ideas:\n"
        "- Monetization & Pricing: Define specific pricing tiers or revenue streams matching the sector (e.g., transaction fees/commissions for marketplaces; product unit price & gross margin for e-commerce/retail; service fees or hourly rates for agency/local businesses; or subscriptions for software).\n"
        "- Startup Costs & COGS: Break down detailed setup expenses. If it's a physical storefront/bakery, include items like lease deposit, baking equipment, inventory, and POS systems. If it's software, include hosting, software licenses, and developer costs. COGS must match the delivery cost of the service (e.g., flour, sugar, packaging for a bakery; cloud compute/APIs for software).\n"
        "- Yearly Projections: Ensure consistent calculations where Revenue - Expenses = Profit. The expenses must explicitly scale with customer volume (accounting for inventory replenishment, local sales commissions, server scaling, or customer support hiring).\n\n"
        f"GEOGRAPHIC, SECTOR & BUDGET MODELING DIRECTIVES:\n"
        f"- Target Industry: {industry}\n"
        f"- Target Location: {location}\n"
        f"- Funding Budget Constraint: {budget}\n\n"
        f"CRITICAL REGIONAL & BUDGET RULES:\n"
        f"1. REGIONAL LOCALIZATION: All projections, salaries, marketing CPC, rent, and operational costs MUST be strictly localized to standard benchmarks in '{location}'. Use local salary benchmarks (e.g. standard developer or baker salaries in India vs France vs US) and operating costs. Precompute local currency equivalent if relevant, but report all numbers in USD standard. Localize pricing to what the target local customer base can bear.\n"
        f"2. BUDGET ALIGNMENT: You MUST model the startup costs to align with the funding budget constraint '{budget}':\n"
        f"   - If the budget is 'Bootstrapped' (under $10k), the SUM of all items in `startup_costs` MUST be less than $10,000 USD. Propose free tiers, founder sweat-equity, minimal inventory, or home-based starting models.\n"
        f"   - If the budget is 'Angel Funded ($50k - $200k)', the SUM of all `startup_costs` must be between $20,000 and $150,000 USD.\n"
        f"   - If the budget is 'VC Seed Funding ($500k+)', the SUM of all `startup_costs` should reflect VC scaling (e.g. $100,000 - $400,000 USD) including full-time teams and robust systems.\n"
        f"3. Ensure the financial projections (SOM) align logically with the startup's target market size (SOM: ${market_context.som_usd} USD)."
    )

    # Prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("user", (
            "Here is the startup context:\n"
            "Refined Idea: {refined_idea}\n"
            "Value Proposition: {value_prop}\n"
            "Target SOM: ${som_usd} USD\n"
            "Competitor Pricing Reference: {competitors}\n\n"
            "Cost & Salary Search Reference:\n{search_results}"
        ))
    ])
    
    # Format competitors context
    competitor_str = ", ".join([f"{c.name} ({c.unique_value_prop})" for c in market_context.competitor_matrix])
    
    # Get LLM and attach structured output parser
    llm = get_llm(provider, temperature=0.1)
    structured_llm = llm.with_structured_output(FinancialModel)
    
    chain = prompt | structured_llm
    
    try:
        result = await chain.ainvoke({
            "refined_idea": product_context.refined_idea,
            "value_prop": product_context.value_proposition,
            "som_usd": market_context.som_usd,
            "competitors": competitor_str,
            "search_results": search_results
        })
    except Exception as exc:
        await stream_log(queue, agent_name, "warning", "Structured FinancialModel output failed; falling back to raw JSON parse.")
        logging.warning(f"Structured FinancialModel failed: {exc}")
        
        fallback_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a CFO. Respond ONLY with valid JSON (no markdown) that matches: "
             "{{\"revenue_model\": <string>, \"pricing_strategy\": <string>, "
             "\"startup_costs\": [{{\"category\": <string>, \"cost_usd\": <number>, \"description\": <string>}}], "
             "\"yearly_projections\": [{{\"year\": <number>, \"revenue_usd\": <number>, \"expenses_usd\": <number>, \"profit_usd\": <number>}}]}}"),
            ("user", "Refined Idea: {refined_idea}\nValue Prop: {value_prop}\nSOM: {som_usd}\nCompetitors: {competitors}\n"
             "Search Results: {search_results}\n\nGenerate financial model JSON NOW.")
        ])
        
        raw = await (fallback_prompt | llm).ainvoke({
            "refined_idea": product_context.refined_idea,
            "value_prop": product_context.value_proposition,
            "som_usd": market_context.som_usd,
            "competitors": competitor_str,
            "search_results": search_results
        })
        raw_text = getattr(raw, "content", str(raw))
        if isinstance(raw_text, list):
            raw_text = "\n".join(str(item) for item in raw_text)
        
        json_body = extract_json_object(str(raw_text))
        if json_body is None:
            logging.error(f"Fallback parse failed. Raw text: {raw_text[:500]}")
            raise ValueError(f"Could not extract valid JSON from fallback response.")
        
        result = FinancialModel.model_validate_json(json_body)
    
    await stream_log(queue, agent_name, "completed", "Financial model and 3-year projections generated!")
    
    return result

