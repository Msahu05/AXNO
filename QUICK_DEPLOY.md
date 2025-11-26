# 🚀 Quick Deployment Guide

## TL;DR: Deploy to Cloud in 30 Minutes

### 1. Database (MongoDB Atlas) - 10 min
1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create FREE cluster
3. Create database user (save password!)
4. Whitelist IP: 0.0.0.0/0
5. Copy connection string → Update `server/.env`

### 2. Backend (Railway) - 10 min
1. Sign up: https://railway.app
2. New Project → Deploy from GitHub
3. Add env vars:
   - `MONGODB_URI` (from Atlas)
   - `JWT_SECRET` (random string)
4. Deploy → Get URL

### 3. Frontend (Vercel) - 10 min
1. Sign up: https://vercel.com
2. Import from GitHub
3. Add env var:
   - `VITE_API_URL` (Railway backend URL)
4. Deploy → Done!

**Total Cost: $0/month (Free tiers)**

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

