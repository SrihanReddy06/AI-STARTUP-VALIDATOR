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
from app.agents.base import get_llm, stream_log
from app.schemas import PitchDeck, ProductRefinement, MarketAnalysis, FinancialModel, GTMStrategy
from langchain_core.prompts import ChatPromptTemplate

async def run_pitch_agent(
    product: ProductRefinement,
    market: MarketAnalysis,
    finance: FinancialModel,
    gtm: GTMStrategy,
    industry: str,
    location: str,
    budget: str,
    provider: str,
    queue: asyncio.Queue
) -> PitchDeck:
    """
    Synthesizes the output of all preceding agents into a professional 10-slide pitch deck,
    tailored to target industry, location, and budget.
    """
    agent_name = "Pitch Designer"
    
    await stream_log(queue, agent_name, "active", "Collating data from all active business agents...")
    await asyncio.sleep(0.5)
    
    await stream_log(queue, agent_name, "active", "Structuring 10-slide pitch outline (Problem, Solution, Market, Revenue, Competitors, GTM, Financials, Ask)...")
    await asyncio.sleep(0.5)
    
    await stream_log(queue, agent_name, "active", "Adding presenter talking points and layout design notes...")
    
    system_instruction = (
        "You are an elite Tech Venture Capital (VC) partner and pitch deck specialist. Your task is to write the detailed contents of "
        "a 10-slide technical investor pitch deck based on the startup's generated business details.\n\n"
        "Ensure the content is highly professional, quantitative, and data-driven. The slide structure should follow standard technical VC templates:\n"
        "1. Title (Brand & Slogan)\n"
        "2. The Problem (Industry structural inefficiency, high technical overhead, scalability blockers)\n"
        "3. The Solution (Your core architectural breakthrough, API-first approach, speed/cost advantages)\n"
        "4. Product Features & MVP (Detailed MVP technical flow, database schema, algorithm, integration layer)\n"
        "5. Market Size (TAM, SAM, SOM with bottom-up calculation reference)\n"
        "6. Business Model (Pricing tiers, unit economics, infrastructure gross margins)\n"
        "7. Competition (Technical matrix, proprietary IP, algorithm/data network effects, SWOT moats)\n"
        "8. Go-To-Market (DevRel, SDK seeding, Product-Led Growth, high-conversion technical channels)\n"
        "9. Financial Projections (3-Year revenue/expenses scaling models based on infrastructure cost COGS)\n"
        "10. The Ask & Next Steps (Funding target, allocation to engineering hire, server cluster deployment, security audits)\n\n"
        f"PITCH TAILORING DIRECTIVES:\n"
        f"- Target Industry: {industry}\n"
        f"- Target Location/Region: {location}\n"
        f"- Funding Model/Budget: {budget}\n"
        f"- Slide 5 (Market Size) MUST reflect calculations local to {location}.\n"
        f"- Slide 10 (The Ask) MUST be realistic to a '{budget}' funding model (e.g. if Bootstrapped under $10k, ask for small founder-friendly debt, custom project pre-sales, or minimal angel support; if VC Seed, ask for $500k-$1.5M for team scale-up).\n\n"
        "For each slide, write a title, 3-4 data-rich, professional bullet points, and a detailed design note suggesting flowcharts, database diagrams, architectural layouts, or charts."
    )

    # Prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("user", (
            "Here are the consolidated business plan details:\n\n"
            "--- PRODUCT ---\n"
            "Brand suggestion: {brand_name}\n"
            "Tagline: {tagline}\n"
            "Refined Idea: {refined_idea}\n"
            "MVP features: {mvp_features}\n\n"
            "--- MARKET ---\n"
            "TAM: ${tam} | SAM: ${sam} | SOM: ${som}\n"
            "Competitors: {competitor_names}\n\n"
            "--- FINANCIALS ---\n"
            "Monetization: {monetization}\n"
            "Pricing: {pricing}\n"
            "Year 3 Revenue Goal: ${y3_rev}\n\n"
            "--- MARKETING ---\n"
            "Acquisition channels: {channels}"
        ))
    ])
    
    # Context compilation
    brand_name = gtm.brand_name_suggestions[0] if gtm.brand_name_suggestions else "Startup"
    tagline = gtm.brand_tagline_suggestions[0] if gtm.brand_tagline_suggestions else "Next Generation Product"
    mvp_features_str = ", ".join([f.name for f in product.mvp_features])
    competitor_names_str = ", ".join([c.name for c in market.competitor_matrix])
    channels_str = ", ".join([c.channel for c in gtm.marketing_channels])
    
    # Get LLM and attach structured output parser
    llm = get_llm(provider, temperature=0.1)
    structured_llm = llm.with_structured_output(PitchDeck)
    
    chain = prompt | structured_llm
    
    try:
        result = await chain.ainvoke({
            "brand_name": brand_name,
            "tagline": tagline,
            "refined_idea": product.refined_idea,
            "mvp_features": mvp_features_str,
            "tam": market.tam_usd,
            "sam": market.sam_usd,
            "som": market.som_usd,
            "competitor_names": competitor_names_str,
            "monetization": finance.revenue_model,
            "pricing": finance.pricing_strategy,
            "y3_rev": finance.yearly_projections[-1].revenue_usd if finance.yearly_projections else 100000,
            "channels": channels_str
        })
    except Exception as exc:
        await stream_log(queue, agent_name, "warning", "Structured PitchDeck output failed; falling back to raw JSON parse.")
        logging.warning(f"Structured PitchDeck failed: {exc}")
        
        fallback_prompt = ChatPromptTemplate.from_messages([
            # Escape JSON braces so ChatPromptTemplate does not interpret them as variables
            ("system", "You are a pitch coach. Respond ONLY with valid JSON (no markdown) that matches: "
             "{{\"slides\": [{{\"slide_number\": <number>, \"title\": <string>, \"key_points\": [<strings>], "
             "\"visual_note\": <string>}}]}}"),
            ("user", "Brand: {brand_name}\\nTagline: {tagline}\\nIdea: {refined_idea}\\nFeatures: {mvp_features}\\n"
             "TAM: ${tam}\\nSAM: ${sam}\\nSOM: ${som}\\nCompetitors: {competitor_names}\\nMonetization: {monetization}\\n"
             "Pricing: {pricing}\\nYear 3 Revenue: ${y3_rev}\\nChannels: {channels}\\n\\n"
             "Generate 10-slide pitch deck JSON NOW.")
        ])
        
        raw = await (fallback_prompt | llm).ainvoke({
            "brand_name": brand_name,
            "tagline": tagline,
            "refined_idea": product.refined_idea,
            "mvp_features": mvp_features_str,
            "tam": market.tam_usd,
            "sam": market.sam_usd,
            "som": market.som_usd,
            "competitor_names": competitor_names_str,
            "monetization": finance.revenue_model,
            "pricing": finance.pricing_strategy,
            "y3_rev": finance.yearly_projections[-1].revenue_usd if finance.yearly_projections else 100000,
            "channels": channels_str
        })
        raw_text = getattr(raw, "content", str(raw))
        if isinstance(raw_text, list):
            raw_text = "\n".join(str(item) for item in raw_text)
        
        json_body = extract_json_object(str(raw_text))
        if json_body is None:
            logging.error(f"Fallback parse failed. Raw text: {raw_text[:500]}")
            raise ValueError(f"Could not extract valid JSON from fallback response.")
        
        result = PitchDeck.model_validate_json(json_body)
    
    await stream_log(queue, agent_name, "completed", "Investor pitch deck slides designed successfully!")
    
    return result
