# AI-STARTUP-VALIDATOR

Multi-Agent Advisory Board that generates and evaluates comprehensive startup plans using AI agents (Product Strategist, Market Researcher, CFO, CMO, Pitch Architect).

## Architecture & Integration

- **Frontend**: Vite + React + TypeScript + Lucide Icons
- **Backend**: FastAPI (Python) + LangChain + SQLite (SQLAlchemy)
- **Communication**: REST API + Server-Sent Events (SSE) for real-time boardroom advisory chat

---

## Quick Start (Local Setup)

### 1. Start the Backend API (FastAPI)

```bash
cd backend

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start FastAPI server on port 8000
uvicorn app.main:app --reload --port 8000
```
Backend will be live at: `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

---

### 2. Start the Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend will be live at: `http://localhost:5173`.

---

## Environment Configuration

### Frontend (`frontend/.env`)
- `VITE_API_BASE`: Backend API base URL (defaults to `http://localhost:8000` for local development).
- For production deployments (Render, Koyeb, etc.), set `VITE_API_BASE=https://<your-backend-url>`.

### Backend (`backend/.env`)
- `GROQ_API_KEY`: Groq API key for high-speed model inference.
- `GEMINI_API_KEY`: Google Gemini API key.
- `PORT`: (Optional) Server port, defaults to `8000`.