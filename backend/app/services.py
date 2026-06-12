import asyncio
import json
import logging
from typing import Dict, Any
from app.schemas import StartupReport
from app.agents.base import stream_log, get_llm
from app.agents.product import run_product_strategist
from app.agents.market import run_market_researcher
from app.agents.finance import run_financial_officer
from app.agents.marketing import run_marketing_agent
from app.agents.pitch import run_pitch_agent
from app.agents.operations import run_operations_agent

logger = logging.getLogger("startup_builder")

async def orchestrate_startup_builder(
    idea: str,
    providers: Dict[str, str],
    queue: asyncio.Queue
):
    """
    Runs the advanced agent pipeline:
    1. Parse industry, location, and budget metadata.
    2. CTO Agent (Product Strategist) designs initial spec.
    3. Market Researcher targets competitors and sizers local to the region.
    4. CFO Agent (Financial Officer) generates initial numbers.
    5. Critique/Debate loop: If bootstrapped and costs exceed $10k, CFO critiques and CTO cost-optimizes, then CFO recalculates.
    6. CMO Agent (Marketing) builds GTM strategy.
    7. Programmatic Math Verification: Enforce Profit = Revenue - Expenses.
    8. Pitch Designer structures slides matching ask size and region.
    """
    try:
        # 1. Parse metadata from the compiled idea
        industry = "Tech B2B SaaS"
        location = "Global"
        budget = "Bootstrapped"
        clean_idea = idea

        if "Industry:" in idea and "Location:" in idea and "Budget:" in idea:
            try:
                lines = idea.split("\n")
                for line in lines:
                    if line.startswith("Industry:"):
                        industry = line.replace("Industry:", "").strip()
                    elif line.startswith("Location:"):
                        location = line.replace("Location:", "").strip()
                    elif line.startswith("Budget:"):
                        budget = line.replace("Budget:", "").strip()
                
                if "Startup Idea:" in idea:
                    clean_idea = idea.split("Startup Idea:\n", 1)[-1].strip()
            except Exception as e:
                logger.warning(f"Failed to parse metadata from idea string: {str(e)}")

        await stream_log(queue, "Orchestrator", "active", f"Parsed Target Parameters - Industry: '{industry}', Region: '{location}', Budget: '{budget}'")
        await asyncio.sleep(0.5)

        # Step 1: Product Strategist (Initial)
        product_provider = providers.get("product", "gemini")
        product_refinement = await run_product_strategist(
            idea=clean_idea,
            industry=industry,
            location=location,
            budget=budget,
            provider=product_provider,
            queue=queue
        )
        
        # Step 2: Market Researcher
        market_provider = providers.get("market", "gemini")
        market_analysis = await run_market_researcher(
            product_context=product_refinement,
            industry=industry,
            location=location,
            provider=market_provider,
            queue=queue
        )
        
        # Step 3: Financial Officer (Initial Run)
        finance_provider = providers.get("finance", "gemini")
        financial_model = await run_financial_officer(
            product_context=product_refinement,
            market_context=market_analysis,
            industry=industry,
            location=location,
            budget=budget,
            provider=finance_provider,
            queue=queue
        )

        # ----------------------------------------------------
        # Critique & Debate Cycle: Enforce Bootstrapped Budget Ceiling
        # ----------------------------------------------------
        is_bootstrapped = "bootstrapped" in budget.lower() or "under $10k" in budget.lower()
        total_costs = sum(item.cost_usd for item in financial_model.startup_costs)
        
        if is_bootstrapped and total_costs > 10000:
            await stream_log(
                queue, "Orchestrator", "active",
                f"Budget violation detected! Initial costs total ${total_costs:,} (limit is $10,000). Triggering Multi-Agent Critique Loop..."
            )
            
            # CFO writes a critique of the initial product specifications
            cfo_llm = get_llm(finance_provider, temperature=0.2)
            # Avoid nested f-strings inside a single f-string literal which causes
            # "Nested replacement fields are not allowed" syntax errors. Precompute
            # the string representations first and then build the prompt.
            mvp_names = [f.name for f in product_refinement.mvp_features]
            startup_costs_str = ", ".join([f"{c.category}: ${c.cost_usd}" for c in financial_model.startup_costs])

            cfo_critique_prompt = (
                "You are the Startup CFO. Review the MVP features: "
                f"{mvp_names}\n"
                f"and these initial startup costs: {startup_costs_str} which sum to ${total_costs}.\n"
                "We are on a strict Bootstrapped budget under $10,000. Write a direct, highly critical 3-4 sentence review "
                "explaining exactly which infrastructure, services, or developer costs are causing us to exceed our limit, "
                "and advising the CTO (Product Strategist) on what specific free/open-source tools or hosting architectures they must substitute to get costs below $10,000."
            )
            
            from langchain_core.messages import HumanMessage
            cfo_response = await cfo_llm.ainvoke([HumanMessage(content=cfo_critique_prompt)])
            cfo_critique = cfo_response.content
            
            await stream_log(
                queue, "Financial Officer", "active",
                f"CFO Critique: {cfo_critique}"
            )
            await asyncio.sleep(1.0)
            
            # CTO refines features based on CFO critique
            product_refinement = await run_product_strategist(
                idea=clean_idea,
                industry=industry,
                location=location,
                budget=budget,
                provider=product_provider,
                queue=queue,
                critique=cfo_critique
            )
            
            # CFO recalculates costs
            financial_model = await run_financial_officer(
                product_context=product_refinement,
                market_context=market_analysis,
                industry=industry,
                location=location,
                budget=budget,
                provider=finance_provider,
                queue=queue
            )
            
            new_total = sum(item.cost_usd for item in financial_model.startup_costs)
            await stream_log(
                queue, "Orchestrator", "active",
                f"Critique loop complete! New startup cost total is ${new_total:,} (Reduced from ${total_costs:,})."
            )

        # Step 4: Run GTM/Marketing (uses refined product)
        marketing_provider = providers.get("marketing", "gemini")
        await stream_log(queue, "Orchestrator", "active", "Spawning GTM Marketing agent...")
        
        gtm_strategy = await run_marketing_agent(
            product_context=product_refinement,
            market_context=market_analysis,
            industry=industry,
            location=location,
            provider=marketing_provider,
            queue=queue
        )
        
        # Step 5: Run Operations Agent (uses product, market, finance, marketing contexts)
        operations_provider = providers.get("marketing", "gemini")
        await stream_log(queue, "Orchestrator", "active", "Spawning Operations & Launch Specialist agent...")
        operations_output = await run_operations_agent(
            product_context=product_refinement,
            market_context=market_analysis,
            financial_context=financial_model,
            gtm_context=gtm_strategy,
            industry=industry,
            location=location,
            budget=budget,
            provider=operations_provider,
            queue=queue
        )

        # Step 6: Programmatic Math Verification for Yearly Projections
        await stream_log(queue, "Orchestrator", "active", "Performing programmatic math verification on CFO projections...")
        for projection in financial_model.yearly_projections:
            # Enforce: Profit = Revenue - Expenses
            projection.profit_usd = projection.revenue_usd - projection.expenses_usd
        
        # Step 7: Pitch Designer
        pitch_provider = providers.get("pitch", "gemini")
        pitch_deck = await run_pitch_agent(
            product=product_refinement,
            market=market_analysis,
            finance=financial_model,
            gtm=gtm_strategy,
            industry=industry,
            location=location,
            budget=budget,
            provider=pitch_provider,
            queue=queue
        )
        
        # Compile master report
        report = StartupReport(
            product=product_refinement,
            market=market_analysis,
            finance=financial_model,
            gtm=gtm_strategy,
            pitch_deck=pitch_deck,
            roadmap=operations_output.roadmap,
            weekly_playbook=operations_output.weekly_playbook
        )
        
        # Stream final success event with the complete report payload
        await queue.put({
            "type": "result",
            "agent": "Orchestrator",
            "status": "completed",
            "message": "All agents finished successfully!",
            "payload": report.model_dump()
        })
        
    except Exception as e:
        logger.exception("Error during agent orchestration")
        await queue.put({
            "type": "error",
            "agent": "Orchestrator",
            "status": "failed",
            "message": f"Orchestrator execution failed: {str(e)}"
        })

