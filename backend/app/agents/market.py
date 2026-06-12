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
import json
import logging
import re
from app.agents.base import get_llm, stream_log, search_web, extract_json_object
from app.schemas import MarketAnalysis, ProductRefinement
from langchain_core.prompts import ChatPromptTemplate

async def run_market_researcher(
    product_context: ProductRefinement,
    industry: str,
    location: str,
    provider: str,
    queue: asyncio.Queue
) -> MarketAnalysis:
    """
    Performs web searches to identify competitors and compile market data.
    Then performs SWOT analysis and estimates TAM/SAM/SOM, tailored to target industry and location.
    """
    agent_name = "Market Researcher"
    
    # 1. Live Web Search targeted to location & industry
    search_query = f"{product_context.refined_idea} {industry} market size competitor products in {location}"
    await stream_log(queue, agent_name, "active", f"Launching targeted web search in {location} for: '{product_context.refined_idea[:60]}...'...")
    
    # Run the synchronous search in a separate thread to avoid blocking the event loop
    search_results = await asyncio.to_thread(search_web, search_query)
    
    await stream_log(queue, agent_name, "active", "Processing web search data and analyzing competitors...")
    await asyncio.sleep(0.5)
    
    await stream_log(queue, agent_name, "active", "Estimating TAM, SAM, SOM and drafting SWOT matrix...")
    
    system_instruction = (
        "You are an expert Market Researcher, Industry Analyst, and Business Intelligence Specialist. Your goal is to conduct "
        "a rigorous, data-driven market landscape analysis, calculate market sizes (TAM, SAM, SOM in USD) using bottom-up or top-down methodology, "
        "identify 3 key competitors, and write a deeply analytical SWOT analysis.\n\n"
        "First, determine the startup's classification: B2B SaaS, B2C App, Marketplace, E-Commerce/Retail, Hardware/IoT, Local Business, or Agency.\n\n"
        "Tailor the SWOT analysis and market trends strictly to this classification and the target region, avoiding default IT/software compliance terms (like SOC2/HIPAA) for non-enterprise ideas:\n"
        "- Market Trends: Highlight macro trends relevant to the sector and region (e.g., supply chain decarbonization for retail; rise of quick-commerce in South Asia; zero-trust security for B2B fintech; or health regulations for local food options).\n"
        "- Competitor Landscape: Analyze competitors on their product features, pricing models, weaknesses, and regional presence.\n"
        "- SWOT Analysis: Document internal strengths/weaknesses and external opportunities/threats that represent the true operational reality of the business (e.g., physical lease overheads, shipping costs, customer trust, regulatory compliance, or technical scaling limits).\n\n"
        f"GEOGRAPHIC & SECTOR TAILORING DIRECTIVES:\n"
        f"- Target Industry Sector: {industry}\n"
        f"- Target Region/Location: {location}\n"
        f"- Focus your market sizing (TAM, SAM, SOM in USD) and competitor identification strictly on the specified region: {location}.\n"
        f"- Compute realistic, localized market sizes (TAM, SAM, SOM) reflecting the target region's economic landscape, purchasing power parity (PPP), and Average Revenue Per User (ARPU) standards (for example, India or Latin America standard ARPU is much lower than US standard ARPU; adjust the size estimates accordingly to keep them realistic).\n"
        f"- Prioritize actual local competitors or global solutions popular in that region."
        "Use the provided live web search results as real-time context to identify actual competitors and market trends if available. "
        "Ensure all TAM, SAM, and SOM figures are logical, methodologically explained estimates in USD."
    )

    # Prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("user", (
            "Here is the product context:\n"
            "Refined Idea: {refined_idea}\n"
            "Value Proposition: {value_prop}\n\n"
            "Live Web Search Results:\n{search_results}"
        ))
    ])
    
    # Get LLM and try structured output parsing
    llm = get_llm(provider, temperature=0.1)
    structured_llm = llm.with_structured_output(MarketAnalysis)
    chain = prompt | structured_llm

    try:
        result = await chain.ainvoke({
            "refined_idea": product_context.refined_idea,
            "value_prop": product_context.value_proposition,
            "search_results": search_results
        })
    except Exception as exc:
        await stream_log(queue, agent_name, "warning", "Structured MarketAnalysis output failed; falling back to raw JSON parse.")
        logging.warning(f"Structured MarketAnalysis failed: {exc}")

        fallback_prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are a technical market researcher. Respond ONLY with valid JSON (no markdown, no explanation) "
                "that matches this exact structure:\n"
                "{{\"tam_usd\": <number>, \"sam_usd\": <number>, \"som_usd\": <number>, "
                "\"market_trends\": [<strings>], \"competitor_matrix\": [{{\"name\": <string>, \"strengths\": [<strings>], "
                "\"unique_value_prop\": <string>, \"weaknesses\": [<strings>]}}], "
                "\"swot_analysis\": {{\"strengths\": [<strings>], \"weaknesses\": [<strings>], "
                "\"opportunities\": [<strings>], \"threats\": [<strings>]}}}}"
            )),
            ("user", (
                "Here is the product context:\n"
                "Refined Idea: {refined_idea}\n"
                "Value Proposition: {value_prop}\n\n"
                "Live Web Search Results:\n{search_results}\n\n"
                "Generate market analysis JSON NOW."
            ))
        ])
        
        raw = await (fallback_prompt | llm).ainvoke({
            "refined_idea": product_context.refined_idea,
            "value_prop": product_context.value_proposition,
            "search_results": search_results
        })
        raw_text = getattr(raw, "content", str(raw))
        if isinstance(raw_text, list):
            raw_text = "\n".join(str(item) for item in raw_text)

        json_body = extract_json_object(str(raw_text))
        if json_body is None:
            logging.error(f"Fallback parse failed. Raw text: {raw_text[:500]}")
            raise ValueError(f"Could not extract valid JSON from fallback response.")

        result = MarketAnalysis.model_validate_json(json_body)

    await stream_log(queue, agent_name, "completed", "Market research and competitor analysis completed!")

    return result

