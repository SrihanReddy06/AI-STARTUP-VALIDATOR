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
from typing import Optional
from app.agents.base import get_llm, stream_log
from app.schemas import ProductRefinement
from langchain_core.prompts import ChatPromptTemplate

async def run_product_strategist(
    idea: str,
    industry: str,
    location: str,
    budget: str,
    provider: str,
    queue: asyncio.Queue,
    critique: Optional[str] = None
) -> ProductRefinement:
    """
    Refines the raw startup idea and defines target personas, MVP features, and user flow,
    tailoring to target industry, location, and funding budget.
    """
    agent_name = "Product Strategist"
    
    if critique:
        await stream_log(queue, agent_name, "active", "Refining product plan based on Financial Officer's budget feedback...")
    else:
        await stream_log(queue, agent_name, "active", "Analyzing raw startup idea...")
        await asyncio.sleep(0.5)
        await stream_log(queue, agent_name, "active", "Formulating value proposition and target user personas...")
        await asyncio.sleep(0.5)
        await stream_log(queue, agent_name, "active", "Drafting core MVP feature set and mapping user flow...")
    
    system_instruction = (
        "You are an elite, deeply technical Startup CTO, Systems Architect, and Principal Product Manager. Your role is to analyze a raw startup idea "
        "and architect it into a highly detailed, technically rigorous product specification.\n\n"
        "Deliver professional, deep-dive specifications. Avoid generic statements. For the deliverables:\n"
        "- Value Proposition: Define the exact architectural edge, technological moat, or proprietary algorithm/data flow that enables the solution.\n"
        "- User Personas: Profile technical, operational, or business personas including their specific technical environments, tech stack dependencies, and infrastructure bottlenecks.\n"
        "- MVP Features: Outline core technical capabilities, specifying underlying protocols, databases, API integrations, data processing mechanisms, or algorithms (e.g. utilizing Redis for caching, PostgreSQL for relational storage, specific LLM fine-tuning pipelines, or WebSockets for real-time sync).\n"
        "- User Flow Steps: Define the user journey as a sequence of technical interactions, system events, and API/data flow cycles (e.g., Auth verification via OAuth2, event trigger to Celery worker, data write to database, and SSE update to client).\n\n"
        f"You MUST customize the product architecture and MVP specifications for these parameters:\n"
        f"1. Target Industry: {industry}\n"
        f"2. Launch Location: {location}\n"
        f"3. Funding Budget: {budget}\n\n"
        "CRITICAL BUDGET DIRECTIVES:\n"
        "- If the budget is 'Bootstrapped' (under $10k), prioritize highly cost-effective, serverless, or open-source solutions. Propose using free-tier DBs (Supabase, Firebase), simple self-hosted nodes, or serverless functions rather than expensive dedicated Kubernetes clusters or enterprise-tier databases.\n"
        "- If the budget is 'Angel' or 'VC Seed', you may propose more comprehensive infrastructures, staging servers, and SOC2/HIPAA compliance preparation pipelines."
    )

    if critique:
        system_instruction += (
            f"\n\n[REFINEMENT LOOP DIRECTIVE]\n"
            f"The Financial Officer reviewed your initial specification and provided the following budget critique:\n"
            f"--- CFO CRITIQUE ---\n{critique}\n--------------------\n"
            f"You MUST revise your MVP features and tech stack to strictly fit within the target budget constraint ({budget}) "
            f"and address the cost concerns raised. Simplify high-overhead services, replace paid APIs with open-source/self-hosted equivalents, or defer advanced features to v2."
        )

    # Prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("user", "Here is the raw startup idea:\n\n{idea}")
    ])
    
    # Get LLM and attach structured output parser
    llm = get_llm(provider, temperature=0.1)
    structured_llm = llm.with_structured_output(ProductRefinement)
    
    chain = prompt | structured_llm
    
    # Execute the chain
    result = await chain.ainvoke({"idea": idea})
    
    if critique:
        await stream_log(queue, agent_name, "completed", "Product plan refined and cost-optimized successfully!")
    else:
        await stream_log(queue, agent_name, "completed", "Refined product plan successfully created!")
    
    return result

