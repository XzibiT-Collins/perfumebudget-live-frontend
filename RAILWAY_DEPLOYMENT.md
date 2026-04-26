# Railway Deployment Guide

This frontend is now set up to deploy on Railway as a static site behind Nginx.

## What Changed

- Multi-stage `Dockerfile` builds the Vite app in a Node image and serves the compiled `dist/` output with Nginx.
- Nginx serves the app as a single-page application, so React Router routes keep working on refresh.
- Railway is configured to start Nginx instead of the missing `/entrypoint.sh`.

## Deploy Steps

1. Push your changes to GitHub.
2. In Railway, create or update the service from this repository.
3. Railway should detect the root `Dockerfile`.
4. Set environment variables in Railway as needed:
   - `VITE_API_BACKEND_URL=https://your-backend.railway.app`
   - `GEMINI_API_KEY=your-key`
   - `PORT=8080` if you want to override the default
5. Deploy the service.

## How It Works

- The build stage runs `npm ci` and `npm run build`.
- The runtime stage uses the official Nginx image.
- The Nginx config is rendered from `/etc/nginx/templates/default.conf.template`, so `${PORT}` is injected at startup.
- Requests that do not map to a real file fall back to `index.html`, which keeps SPA routing intact.

## Local Verification

```bash
docker build -t perfume-budget:latest .
docker run -p 8080:8080 -e PORT=8080 perfume-budget:latest
```

Then open `http://localhost:8080`.

## Notes

- If your frontend calls an API, set `VITE_API_BACKEND_URL` to the deployed backend URL.
- The app does not need the old Express `server.ts` process in production when served this way.
