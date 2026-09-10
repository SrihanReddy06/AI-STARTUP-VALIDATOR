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
            logger.warning("GROQ_API_KEY not found or is placeholder, using default settings or environment.")
        
        # Valid active Groq production model
        model = model_name or os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
        return ChatGroq(
            model=model,
            temperature=temperature,
            groq_api_key=api_key,
            max_tokens=8000,
            max_retries=3,
        )
    else:  # Default to gemini
        from langchain_google_genai import ChatGoogleGenerativeAI
        api_key = gemini_key
        if not api_key or api_key == "your_gemini_api_key_here":
            logger.warning("GEMINI_API_KEY not found or is placeholder, using default settings or environment.")
        
        # Valid Gemini production model
        model = model_name or os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        return ChatGoogleGenerativeAI(
            model=model,
            temperature=temperature,
            google_api_key=api_key,
            max_output_tokens=8192,
        )

def _repair_truncated_json(text: str) -> Optional[str]:
    """
    Repairs truncated JSON strings by closing unclosed strings, removing incomplete
    key/values, and closing unclosed arrays and objects.
    """
    if not text or "{" not in text:
        return None

    import re
    start_idx = text.find("{")
    s = text[start_idx:].strip()

    in_string = False
    escape = False
    stack = []

    for char in s:
        if escape:
            escape = False
            continue
        if char == "\\":
            escape = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        if in_string:
            continue

        if char in "{[":
            stack.append(char)
        elif char in "}]":
            if stack:
                top = stack[-1]
                if (char == "}" and top == "{") or (char == "]" and top == "["):
                    stack.pop()

    if not stack and not in_string:
        return s

    if in_string:
        s += '"'

    s = re.sub(r",\s*$", "", s)
    s = re.sub(r":\s*\"[^\"]*\"?$", "", s)
    s = re.sub(r":\s*$", "", s)
    s = re.sub(r",\s*$", "", s)
    s = re.sub(r",\s*\"[^\"]*\"\s*$", "", s)

    for open_char in reversed(stack):
        if open_char == "{":
            s += "}"
        elif open_char == "[":
            s += "]"

    s = re.sub(r",\s*([\]}])", r"\1", s)
    return s

def extract_json_object(text: str) -> Optional[str]:
    """
    Extracts and parses a complete or repairable JSON object { ... } from text.
    Handles nested braces, ignores braces in strings, cleans trailing commas,
    and repairs incomplete/truncated JSON if necessary.
    """
    if not text:
        return None

    import re
    import json

    cleaned = str(text).strip()

    # 1. Remove markdown code block wrappers if any
    if "```" in cleaned:
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
        if match:
            cleaned = match.group(1).strip()
        else:
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
            cleaned = cleaned.strip()

    start_idx = cleaned.find("{")
    if start_idx == -1:
        return None
    cleaned = cleaned[start_idx:]

    def try_parse(candidate_str: str) -> Optional[str]:
        try:
            json.loads(candidate_str)
            return candidate_str
        except Exception:
            pass
        no_trailing = re.sub(r",\s*([\]}])", r"\1", candidate_str)
        try:
            json.loads(no_trailing)
            return no_trailing
        except Exception:
            return None

    # 2. Balanced brace counting with string literal awareness
    in_string = False
    escape = False
    depth = 0
    candidate = None

    for idx, char in enumerate(cleaned):
        if escape:
            escape = False
            continue
        if char == "\\":
            escape = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        if in_string:
            continue

        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                candidate = cleaned[: idx + 1]
                parsed = try_parse(candidate)
                if parsed:
                    return parsed

    if candidate:
        parsed = try_parse(candidate)
        if parsed:
            return parsed

    # 3. Fallback to repair truncated JSON
    repaired = _repair_truncated_json(cleaned)
    if repaired:
        parsed = try_parse(repaired)
        if parsed:
            return parsed

    return None

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

