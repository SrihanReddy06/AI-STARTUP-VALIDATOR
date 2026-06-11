import asyncio
import sys
import os

# Dynamic path resolution to find the parent directory of 'app'
current_dir = os.path.dirname(os.path.abspath(__file__))
while current_dir and current_dir != os.path.dirname(current_dir):
    if os.path.exists(os.path.join(current_dir, "app")):
        if current_dir not in sys.path:
            sys.path.insert(0, current_dir)
        break
    current_dir = os.path.dirname(current_dir)

from app.database import init_db, SessionLocal, StartupPlan
from app.main import run_orchestrator_in_background

async def main():
    # 1. Initialize DB
    init_db()
    
    # 2. Insert a new processing record
    print("Inserting test plan record...")
    db = SessionLocal()
    db_plan = StartupPlan(
        idea="Industry: Tech B2B SaaS\nLocation: India / South Asia\nBudget: Bootstrapped\n\nStartup Idea:\nA developer platform for managing distributed celery worker tasks",
        brand_name="Generating...",
        status="processing"
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    plan_id = db_plan.id
    db.close()
    
    print(f"Record created! ID: {plan_id}. Starting background task...")
    
    # 3. Execute background orchestrator
    providers = {
        "product": "groq",
        "market": "groq",
        "finance": "groq",
        "marketing": "groq",
        "pitch": "groq"
    }
    await run_orchestrator_in_background(plan_id, db_plan.idea, providers)
    
    # 4. Check DB status
    db = SessionLocal()
    plan = db.query(StartupPlan).filter(StartupPlan.id == plan_id).first()
    print("\n==============================================")
    print("VERIFICATION RESULTS:")
    print("==============================================")
    print("Plan ID:", plan.id)
    print("Status:", plan.status)
    print("Brand Name:", plan.brand_name)
    print("Error:", plan.error_message)
    print("Payload Length:", len(plan.report_json) if plan.report_json else 0)
    db.close()

if __name__ == "__main__":
    asyncio.run(main())
