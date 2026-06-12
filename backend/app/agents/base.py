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
from typing import Any, Dict, Optional
from app.config import settings

logger = logging.getLogger("startup_builder")

def get_llm(provider: str, model_name: Optional[str] = None, temperature: float = 0.7):
    """
    Returns a LangChain LLM instance for Gemini or Groq based on the provider and configuration.
    """
    # Normalize provider name
    provider = provider.strip().lower()

    # Automatic fallback if the selected API key is missing
    gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    groq_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    
    has_gemini = gemini_key and gemini_key != "" and gemini_key != "your_gemini_api_key_here"
    has_groq = groq_key and groq_key != "" and groq_key != "your_groq_api_key_here"

    if provider == "gemini" and not has_gemini and has_groq:
        logger.info("GEMINI_API_KEY not set, but GROQ_API_KEY is available. Falling back to Groq.")
        provider = "groq"
    elif provider == "groq" and not has_groq and has_gemini:
        logger.info("GROQ_API_KEY not set, but GEMINI_API_KEY is available. Falling back to Gemini.")
        provider = "gemini"

    if provider == "groq":
        from langchain_groq import ChatGroq
        api_key = groq_key
        if not api_key or api_key == "your_groq_api_key_here":
            # Fallback if key not set
            logger.warning("GROQ_API_KEY not found or is placeholder, using default settings or environment.")
        
        # Default model for Groq
        model = model_name or "llama-3.3-70b-versatile"
        return ChatGroq(
            model=model,
            temperature=temperature,
            groq_api_key=api_key
        )
    else:  # Default to gemini
        from langchain_google_genai import ChatGoogleGenerativeAI
        api_key = gemini_key
        if not api_key or api_key == "your_gemini_api_key_here":
            logger.warning("GEMINI_API_KEY not found or is placeholder, using default settings or environment.")
        
        # Default model for Gemini
        model = model_name or "gemini-2.5-flash"
        return ChatGoogleGenerativeAI(
            model=model,
            temperature=temperature,
            google_api_key=api_key
        )

async def stream_log(queue: asyncio.Queue, agent: str, status: str, detail: str = ""):
    """
    Helper to push a formatted log status dictionary into the streaming queue.
    """
    await queue.put({
        "type": "log",
        "agent": agent,
        "status": status,
        "detail": detail
    })
    # Small sleep to ensure front-end receives logs sequentially and naturally
    await asyncio.sleep(0.1)

def search_web(query: str) -> str:
    """
    Synchronous helper to run DuckDuckGo text search.
    """
    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
            if not results:
                return "No live search results found."
            formatted = []
            for r in results:
                title = r.get("title", "No Title")
                href = r.get("href", "")
                body = r.get("body", "")
                formatted.append(f"Source: {title}\nURL: {href}\nSnippet: {body}")
            return "\n\n".join(formatted)
    except Exception as e:
        return f"Live search failed: {str(e)}. Falling back to general knowledge."

