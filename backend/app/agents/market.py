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
from app.agents.base import get_llm, stream_log, search_web
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
        "You are an expert Technical Market Researcher, Industry Analyst, and Business Intelligence Specialist. Your goal is to conduct "
        "a highly rigorous, data-driven market landscape analysis, calculate granular market sizes (TAM, SAM, SOM in USD) using bottom-up or top-down methodology, "
        "identify 3 key technical competitors, and write a deeply analytical SWOT analysis.\n\n"
        "Focus heavily on the technical and industry dynamics:\n"
        "- Market Trends: Highlight deep technological macro trends (e.g., shifting to decentralized ledger architectures, growth of edge inference, zero-trust security compliance, or semantic caching).\n"
        "- Competitor Landscape: Analyze competitors specifically on their technical limitations, proprietary technology moats (IP, patents, open-source adoption), and API/integration limits.\n"
        "- SWOT Analysis: Document specific infrastructure, compliance (SOC2, HIPAA, GDPR), scalability, technical debt, and system architectural vulnerabilities as core strengths, weaknesses, opportunities, and threats.\n\n"
        f"GEOGRAPHIC & SECTOR TAILORING DIRECTIVES:\n"
        f"- Target Industry Sector: {industry}\n"
        f"- Target Region/Location: {location}\n"
        f"- Focus your market sizing (TAM, SAM, SOM in USD) and competitor identification strictly on the specified region: {location}.\n"
        f"- If the region is India / South Asia, compute realistic market sizes reflecting the local economic landscape, ARPU (Average Revenue Per User) standards, and purchasing power parity (PPP), and prioritize actual local competitors or global solutions popular in that region.\n\n"
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
    
    # Get LLM and attach structured output parser
    llm = get_llm(provider, temperature=0.1)
    structured_llm = llm.with_structured_output(MarketAnalysis)
    
    chain = prompt | structured_llm
    
    # Execute the chain
    result = await chain.ainvoke({
        "refined_idea": product_context.refined_idea,
        "value_prop": product_context.value_proposition,
        "search_results": search_results
    })
    
    await stream_log(queue, agent_name, "completed", "Market research and competitor analysis completed!")
    
    return result

