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
from typing import Dict, List, Any
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.config import settings
from app.services import orchestrate_startup_builder
from app.agents.base import get_llm
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.database import init_db, SessionLocal, StartupPlan

# Initialize local database
init_db()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("startup_builder")

app = FastAPI(title="Multi-Agent Startup Builder API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    idea: str
    providers: Dict[str, str] = {
        "product": "gemini",
        "market": "gemini",
        "finance": "gemini",
        "marketing": "gemini",
        "pitch": "gemini"
    }

class ChatMessage(BaseModel):
    role: str  # 'user', 'strategist', 'cfo', or 'marketer'
    content: str

class BoardroomChatRequest(BaseModel):
    report: Dict[str, Any]
    messages: List[ChatMessage]
    providers: Dict[str, str] = {"chat": "groq"}  # default to groq for ultra-fast chat responses

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Server is running"}

async def run_orchestrator_in_background(plan_id: int, idea: str, providers: Dict[str, str]):
    queue = asyncio.Queue()
    task = asyncio.create_task(
        orchestrate_startup_builder(idea, providers, queue)
    )
    
    try:
        while True:
            item = await queue.get()
            queue.task_done()
            
            if item.get("type") == "result":
                payload = item.get("payload", {})
                brand_names = payload.get("gtm", {}).get("brand_name_suggestions", [])
                brand_name = brand_names[0] if brand_names else "Startup Project"
                
                db = SessionLocal()
                try:
                    plan = db.query(StartupPlan).filter(StartupPlan.id == plan_id).first()
                    if plan:
                        plan.status = "completed"
                        plan.brand_name = brand_name
                        plan.report_json = json.dumps(payload)
                        db.commit()
                finally:
                    db.close()
                break
                
            elif item.get("type") == "error":
                message = item.get("message", "Unknown error")
                db = SessionLocal()
                try:
                    plan = db.query(StartupPlan).filter(StartupPlan.id == plan_id).first()
                    if plan:
                        plan.status = "failed"
                        plan.brand_name = "Generation Failed"
                        plan.error_message = message
                        db.commit()
                finally:
                    db.close()
                break
    except Exception as e:
        logger.exception(f"Background task failed for plan {plan_id}")
        db = SessionLocal()
        try:
            plan = db.query(StartupPlan).filter(StartupPlan.id == plan_id).first()
            if plan:
                plan.status = "failed"
                plan.brand_name = "Generation Failed"
                plan.error_message = str(e)
                db.commit()
        finally:
            db.close()
    finally:
        await task

@app.post("/api/generate")
async def generate_startup(req: GenerateRequest, background_tasks: BackgroundTasks):
    """
    POST endpoint that triggers startup generation in the background.
    Returns immediately with plan metadata and a 'processing' status.
    """
    logger.info(f"Received generation request for idea: {req.idea[:60]}...")
    
    db = SessionLocal()
    try:
        db_plan = StartupPlan(
            idea=req.idea,
            brand_name="Generating...",
            status="processing"
        )
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)
        plan_id = db_plan.id
    finally:
        db.close()
        
    background_tasks.add_task(
        run_orchestrator_in_background, plan_id, req.idea, req.providers
    )
    
    return {"status": "processing", "plan_id": plan_id}

@app.post("/api/chat")
async def boardroom_chat(req: BoardroomChatRequest):
    """
    Streams a courtroom/boardroom discussion among the 3 key advisors (CFO, Product Strategist, CMO)
    responding to the user's inquiry regarding their generated startup.
    """
    logger.info("Received boardroom chat request")
    
    # Extract startup information for the prompt
    product_data = req.report.get("product", {})
    market_data = req.report.get("market", {})
    finance_data = req.report.get("finance", {})
    gtm_data = req.report.get("gtm", {})
    
    startup_context = (
        f"Startup Refined Idea: {product_data.get('refined_idea', '')}\n"
        f"Unique Value Prop: {product_data.get('value_proposition', '')}\n"
        f"Revenue Model: {finance_data.get('revenue_model', '')}\n"
        f"Pricing Strategy: {finance_data.get('pricing_strategy', '')}\n"
        f"TAM: ${market_data.get('tam_usd', 0)} | SOM: ${market_data.get('som_usd', 0)}\n"
        f"Target Marketing Channels: {', '.join([c.get('channel', '') for c in gtm_data.get('marketing_channels', [])])}\n"
    )
    
    # Get last message (the user's new question)
    user_question = req.messages[-1].content if req.messages else "What should our next steps be?"
    
    # Format message history
    history_str = ""
    for msg in req.messages[:-1]:
        history_str += f"{msg.role.upper()}: {msg.content}\n"

    async def chat_generator():
        # Get chosen provider for the chat (default to groq for speed, fall back to gemini)
        chat_provider = req.providers.get("chat", "groq")
        llm = get_llm(chat_provider, temperature=0.7)
        
        # 1. Spawn CFO Agent response
        yield f"data: {json.dumps({'type': 'status', 'speaker': 'CFO', 'message': 'CFO is reviewing the financial implications...'})}\n\n"
        await asyncio.sleep(0.5)
        
        cfo_prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are the Chief Financial Officer (CFO) of the startup. Here is the startup context:\n{context}\n"
                "Review the user's question, the conversation history, and provide advice strictly from a financial, "
                "budgeting, unit economics, and fundraising perspective. Be direct and analytical. Keep it to 3-5 sentences."
            )),
            ("user", "Conversation History:\n{history}\n\nUser Question:\n{question}")
        ])
        cfo_chain = cfo_prompt | llm | StrOutputParser()
        cfo_response = await cfo_chain.ainvoke({
            "context": startup_context,
            "history": history_str,
            "question": user_question
        })
        
        yield f"data: {json.dumps({'type': 'message', 'speaker': 'CFO', 'content': cfo_response})}\n\n"
        await asyncio.sleep(0.5)
        
        # Update history with CFO reply
        history_with_cfo = history_str + f"CFO: {cfo_response}\n"
        
        # 2. Spawn Product Strategist response
        yield f"data: {json.dumps({'type': 'status', 'speaker': 'Product Strategist', 'message': 'Product Strategist is adjusting features and user flow...'})}\n\n"
        await asyncio.sleep(0.5)
        
        product_prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are the Product Strategist of the startup. Here is the startup context:\n{context}\n"
                "Review the user's question, the conversation history (including the CFO's financial feedback), and "
                "provide product-centric advice regarding MVP features, user experience, and roadmap adjustments. Keep it to 3-5 sentences."
            )),
            ("user", "Conversation History:\n{history}\n\nUser Question:\n{question}")
        ])
        product_chain = product_prompt | llm | StrOutputParser()
        product_response = await product_chain.ainvoke({
            "context": startup_context,
            "history": history_with_cfo,
            "question": user_question
        })
        
        yield f"data: {json.dumps({'type': 'message', 'speaker': 'Product Strategist', 'content': product_response})}\n\n"
        await asyncio.sleep(0.5)
        
        # Update history with Product reply
        history_with_product = history_with_cfo + f"PRODUCT STRATEGIST: {product_response}\n"
        
        # 3. Spawn Marketing & GTM response
        yield f"data: {json.dumps({'type': 'status', 'speaker': 'Marketing Director', 'message': 'Marketing Director is tailoring launch strategy...'})}\n\n"
        await asyncio.sleep(0.5)
        
        marketing_prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are the Chief Marketing Officer (CMO) of the startup. Here is the startup context:\n{context}\n"
                "Review the user's question and the conversation history (including the CFO's and Product Strategist's views), "
                "and provide advice on brand positioning, user acquisition channels, and launch marketing strategies. Keep it to 3-5 sentences."
            )),
            ("user", "Conversation History:\n{history}\n\nUser Question:\n{question}")
        ])
        marketing_chain = marketing_prompt | llm | StrOutputParser()
        marketing_response = await marketing_chain.ainvoke({
            "context": startup_context,
            "history": history_with_product,
            "question": user_question
        })
        
        yield f"data: {json.dumps({'type': 'message', 'speaker': 'Marketing Director', 'content': marketing_response})}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(chat_generator(), media_type="text/event-stream")

@app.get("/api/history")
def get_history():
    db = SessionLocal()
    try:
        plans = db.query(StartupPlan).order_by(StartupPlan.created_at.desc()).all()
        return [
            {
                "id": p.id,
                "idea": p.idea,
                "brand_name": p.brand_name,
                "status": p.status,
                "error_message": p.error_message,
                "created_at": p.created_at.isoformat()
            }
            for p in plans
        ]
    finally:
        db.close()

@app.get("/api/history/{plan_id}")
def get_history_detail(plan_id: int):
    db = SessionLocal()
    try:
        plan = db.query(StartupPlan).filter(StartupPlan.id == plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        return {
            "id": plan.id,
            "idea": plan.idea,
            "brand_name": plan.brand_name,
            "status": plan.status,
            "error_message": plan.error_message,
            "created_at": plan.created_at.isoformat(),
            "report": json.loads(plan.report_json) if plan.report_json else None
        }
    finally:
        db.close()

@app.delete("/api/history/{plan_id}")
def delete_history(plan_id: int):
    db = SessionLocal()
    try:
        plan = db.query(StartupPlan).filter(StartupPlan.id == plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        db.delete(plan)
        db.commit()
        return {"status": "ok", "message": "Plan deleted"}
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

