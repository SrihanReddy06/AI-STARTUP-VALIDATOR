# Full-Stack Deployment Guide

This project consists of a **FastAPI backend** and a **Vite + React frontend** (deployed on Netlify).

---

## 1. Backend Free Hosting (Render / Koyeb / Hugging Face)

### Option A: Render.com (Recommended Free Tier)
1. Log in to [Render.com](https://render.com/).
2. Click **New +** → **Blueprint** (or **Web Service**).
3. Connect your GitHub repository `SrihanReddy06/AI-STARTUP-VALIDATOR`.
4. Render will auto-detect `render.yaml`:
   - Root Directory: `backend`
   - Build Command: `pip install --no-cache-dir -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. In the **Environment Variables** section on Render, set:
   - `GEMINI_API_KEY` = `<your_gemini_api_key>`
   - `GROQ_API_KEY` = `<your_groq_api_key>`
6. Click **Apply** or **Deploy**. Once deployed, copy your backend URL (e.g. `https://ai-startup-validator-backend.onrender.com`).

---

### Option B: Koyeb (Free Micro Tier)
1. Sign up / log in to [Koyeb.com](https://koyeb.com/).
2. Create a new service and select **GitHub**.
3. Select repo `SrihanReddy06/AI-STARTUP-VALIDATOR`, set Workdir to `backend`.
4. Set Build Type to **Dockerfile** (uses `backend/Dockerfile`).
5. Add Environment Variables (`GEMINI_API_KEY`, `GROQ_API_KEY`).
6. Deploy and copy your Koyeb app URL.

---

### Option C: Hugging Face Spaces (Free Docker Tier)
1. Create a new Space on [Hugging Face](https://huggingface.co/spaces) selecting **Docker** SDK (Blank Docker).
2. Push your `backend` folder and `Dockerfile` to the Space repository.
3. Set secrets `GEMINI_API_KEY` and `GROQ_API_KEY` in Space Settings.
4. Your free Space endpoint will be live at `https://<username>-<spacename>.hf.space`.

---

## 2. Frontend Netlify Configuration

Once your backend is live on Render/Koyeb:

1. Open your **Netlify Dashboard** → select your frontend site.
2. Go to **Site settings** → **Build & deploy** → **Environment variables**.
3. Set or update `VITE_API_BASE`:
   ```env
   VITE_API_BASE=https://ai-startup-validator-backend.onrender.com
   ```
4. Trigger a **Clear cache and deploy site** on Netlify so the new API URL is built into Vite.

---

## 3. Local Development

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```
