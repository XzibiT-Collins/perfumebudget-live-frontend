# Railway Deployment Guide

## ✅ Now Compatible with Railway!

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository with this code

### Steps to Deploy

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect Railway**
   - Go to https://railway.app/dashboard
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Railway will automatically detect the Dockerfile

3. **Environment Variables** (Optional)
   Add in Railway Dashboard → Variables:
   ```
   VITE_API_BACKEND_URL=https://your-api.railway.app
   GEMINI_API_KEY=your-key
   ```

4. **Deploy**
   - Click "Deploy Now"
   - Railway will build your image and deploy it
   - Your app will be available at: `https://your-project.railway.app`

### What's Configured

- ✅ Dynamic port handling (uses Railway's `$PORT` variable)
- ✅ Docker build with Vite
- ✅ Nginx for efficient static serving
- ✅ Health checks enabled
- ✅ Security headers configured
- ✅ Gzip compression enabled
- ✅ SPA routing working (React Router)
- ✅ Environment variables support

### Verify Before Deploying

```bash
# Build locally to test
docker build -t perfume-budget:latest .

# Run with Railway-like environment
docker run -p 8000:8000 -e PORT=8000 perfume-budget:latest

# Visit http://localhost:8000
```

### Troubleshooting

**App not loading?**
- Check Railway logs: `railway logs`
- Verify PORT is not hardcoded
- Ensure build completed: `railway status`

**CORS errors?**
- Update `nginx.conf` to add CORS headers if calling external APIs
- Or configure your backend to allow your Railway domain

**API calls failing?**
- Set `VITE_API_BACKEND_URL` environment variable in Railway
- Make sure backend is also deployed or accessible

### API Configuration

If you have a backend API on Railway too:

1. Deploy backend to Railway first
2. Get its URL: `https://backend.railway.app`
3. Set in frontend environment: `VITE_API_BACKEND_URL=https://backend.railway.app`

The nginx proxy will automatically route `/api/*` calls to your backend.

