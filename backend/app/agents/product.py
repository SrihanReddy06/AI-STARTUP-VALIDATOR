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
from typing import Optional
from app.agents.base import get_llm, stream_log, extract_json_object
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
        "You are an elite Startup CTO, Systems Architect, and Principal Product Manager. Your role is to analyze a raw startup idea "
        "and architect it into a highly detailed, appropriate product specification.\n\n"
        "First, determine the startup's classification: B2B SaaS/Enterprise Tech, B2C App/Consumer Software, Marketplace/Platform, "
        "E-Commerce/D2C Retail, Hardware/IoT, Local Business/Brick-and-Mortar, or Professional Services/Agency.\n\n"
        "Deliver deep-dive specifications customized strictly to this classification. Avoid generic templates or forcing software-developer "
        "infrastructure (like Celery or Redis) on non-software/non-realtime ideas. For the deliverables:\n"
        "- Value Proposition: Define the specific technological, operational, or structural edge that enables the solution (e.g., a proprietary roasting technique for a bakery, localized sourcing channels for retail, custom routing algorithms for services, or database query optimizations for B2B tech).\n"
        "- User Personas: Profile target user segments including their specific operational environments, tools they use daily, and their primary bottlenecks.\n"
        "- MVP Features: Outline core capabilities and delivery systems. Tailor the tech stack to the category (e.g., Shopify + Stripe for e-commerce; POS systems & inventory databases for retail; booking engines for local services; React Native + serverless functions for consumer apps; or PostgreSQL + caching layer for B2B tech).\n"
        "- User Flow Steps: Define the customer journey as a sequence of interactions. Ensure it represents the actual business workflow (e.g., ordering, payment, and local pickup for a physical storefront; registration, card checkout, and shipment tracking for e-commerce; or onboarding, discovery, and booking for a marketplace).\n\n"
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
    
    try:
        result = await chain.ainvoke({"idea": idea})
    except Exception as exc:
        await stream_log(queue, agent_name, "warning", "Structured ProductRefinement output failed; falling back to raw JSON parse.")
        logging.warning(f"Structured ProductRefinement failed: {exc}")
        
        # Escape curly braces in the JSON schema so ChatPromptTemplate doesn't treat them as format variables
        fallback_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a product strategist. Respond ONLY with valid JSON (no markdown) that matches: "
             "{{\"refined_idea\": <string>, \"value_proposition\": <string>, "
             "\"target_personas\": [{{\"name\": <string>, \"role\": <string>, \"pain_point\": <string>, \"solution\": <string>}}], "
             "\"mvp_features\": [{{\"name\": <string>, \"description\": <string>, \"priority\": <string>}}], "
             "\"user_flow_steps\": [<strings>]}}"),
            ("user", "Here is the raw startup idea:\n\n{idea}\n\nGenerate product refinement JSON NOW.")
        ])
        
        raw = await (fallback_prompt | llm).ainvoke({"idea": idea})
        raw_text = getattr(raw, "content", str(raw))
        if isinstance(raw_text, list):
            raw_text = "\n".join(str(item) for item in raw_text)
        
        json_body = extract_json_object(str(raw_text))
        if json_body is None:
            logging.error(f"Fallback parse failed. Raw text: {raw_text[:500]}")
            raise ValueError(f"Could not extract valid JSON from fallback response.")
        
        result = ProductRefinement.model_validate_json(json_body)
    
    if critique:
        await stream_log(queue, agent_name, "completed", "Product plan refined and cost-optimized successfully!")
    else:
        await stream_log(queue, agent_name, "completed", "Refined product plan successfully created!")
    
    return result

