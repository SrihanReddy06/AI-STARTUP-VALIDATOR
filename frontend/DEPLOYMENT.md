# Frontend Deployment to Netlify

This project uses Vite and requires the backend API base URL to be set via `VITE_API_BASE`.

## Netlify setup

1. In the Netlify dashboard, create or select your site.
2. Under **Site settings** → **Build & deploy** → **Environment**, add:
   - `VITE_API_BASE` = `https://ai-startup-validator-production.up.railway.app`
3. Confirm your build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy the site.

## Build locally for Netlify

```bash
cd frontend
npm install
npm run build
```

## Netlify CLI deploy (optional)

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
netlify env:set VITE_API_BASE https://ai-startup-validator-production.up.railway.app
```

## Verify the deployed frontend

1. Open the deployed Netlify URL.
2. Use browser DevTools Network tab.
3. Confirm API requests go to:
   - `https://ai-startup-validator-production.up.railway.app/api/generate`
   - `https://ai-startup-validator-production.up.railway.app/api/history`

## Railway backend

Your deployed backend must have `GROQ_API_KEY` set in Railway environment variables.

To verify:
1. Open your Railway project and select the production service.
2. Go to the **Variables** tab.
3. Confirm `GROQ_API_KEY` exists and has the correct secret value.
4. Restart the backend service so the new variable is applied.

If the frontend still shows the `api_key` error, the backend process is still not seeing the key or it is the placeholder value.
