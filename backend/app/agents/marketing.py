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
from app.schemas import GTMStrategy, ProductRefinement, MarketAnalysis
from langchain_core.prompts import ChatPromptTemplate

async def run_marketing_agent(
    product_context: ProductRefinement,
    market_context: MarketAnalysis,
    industry: str,
    location: str,
    provider: str,
    queue: asyncio.Queue
) -> GTMStrategy:
    """
    Brainstorms branding, outlines marketing channels, and designs a 12-month launch timeline.
    Tailored to target industry and location.
    """
    agent_name = "Marketing & GTM"
    
    # Live search for customer acquisition cost and PPC bids
    search_query = f"typical customer acquisition cost CAC and digital marketing channels in {location} for {industry}"
    await stream_log(queue, agent_name, "active", f"Searching CAC and marketing CPC benchmarks in {location}...")
    search_results = await asyncio.to_thread(search_web, search_query)
    
    await stream_log(queue, agent_name, "active", "Brainstorming creative brand names and taglines...")
    await asyncio.sleep(0.5)
    
    await stream_log(queue, agent_name, "active", "Selecting high-impact marketing acquisition channels...")
    await asyncio.sleep(0.5)
    
    await stream_log(queue, agent_name, "active", "Creating 12-month launch timeline and determining growth KPIs...")
    
    system_instruction = (
        "You are a sophisticated Technical CMO, Developer Relations (DevRel) Director, and growth engineering expert. Your goal is to design "
        "a high-impact Go-To-Market (GTM) strategy optimized for modern tech adoption, product-led growth (PLG), or enterprise acquisition.\n\n"
        "Structure the strategy with high technical fidelity:\n"
        "- Brand Name & Slogans: Brainstorm catchy, modern tech brand names and engineering-centric or business-value-focused taglines.\n"
        "- Marketing Channels: Detail B2B or B2C acquisition loops (e.g., programmatic SEO for API/library queries, DevRel/open-source seeding, GitHub integration directory marketing, technical documentation optimization, engineering-as-marketing tools like free sandboxes).\n"
        "- Launch Timeline & KPIs: Build a month-by-month roadmap focusing on developer preview releases, open-beta, security audits, and key system performance/adoption metrics (e.g., SDK downloads, API response usage, monthly active keys, CAC targets, and LTV calculations).\n\n"
        f"GEOGRAPHIC & SECTOR TAILORING DIRECTIVES:\n"
        f"- Target Industry: {industry}\n"
        f"- Target Location: {location}\n"
        f"- You MUST localize the brand naming suggestions and marketing acquisition channels to fit standard business practices, customer preferences, and language norms in '{location}'.\n"
        f"- For example, B2B SaaS in India might benefit from a combination of global content marketing and regional community building/events. Use the provided search results to model realistic CAC levels and channel budgets."
    )

    # Prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("user", (
            "Here is the product and market context:\n"
            "Refined Idea: {refined_idea}\n"
            "Value Proposition: {value_prop}\n"
            "Target Market Trends: {trends}\n\n"
            "Marketing CPC & CAC Search Reference:\n{search_results}"
        ))
    ])
    
    # Format trends context
    trends_str = "\n".join([f"- {t}" for t in market_context.market_trends])
    
    # Get LLM and attach structured output parser
    llm = get_llm(provider, temperature=0.2)
    structured_llm = llm.with_structured_output(GTMStrategy)
    
    chain = prompt | structured_llm
    
    # Execute the chain
    result = await chain.ainvoke({
        "refined_idea": product_context.refined_idea,
        "value_prop": product_context.value_proposition,
        "trends": trends_str,
        "search_results": search_results
    })
    
    await stream_log(queue, agent_name, "completed", "Go-To-Market strategy and branding guide ready!")
    
    return result
