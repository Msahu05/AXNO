# Deployment Guide - Cloud Setup

## 🎯 Quick Answer

**Yes, you need to start local MongoDB manually after restarting your PC.**

**Solution: Use MongoDB Atlas (Cloud) - It runs 24/7 for FREE!**

---

## 📦 Part 1: Database Setup (MongoDB Atlas - Cloud)

### Why MongoDB Atlas?
- ✅ **Free tier available** (512MB storage, enough for development)
- ✅ **Runs 24/7** - No manual start needed
- ✅ **Accessible from anywhere** - Works on any device
- ✅ **Automatic backups** - Your data is safe
- ✅ **Production-ready** - Same setup for deployment

### Setup Steps:

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose **FREE** tier (M0 Sandbox)
   - Select a cloud provider (AWS recommended)
   - Choose a region closest to you
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Username: `axno-admin` (or any name)
   - Password: Generate a strong password (save it!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" → "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ For production: Add only your server IPs
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password
   - Add database name: `mongodb+srv://username:password@cluster.mongodb.net/axno?retryWrites=true&w=majority`

6. **Update Your .env File**
   - Create `server/.env` file:
   ```env
   MONGODB_URI=mongodb+srv://axno-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/axno?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-use-random-string
   PORT=3001
   ```

7. **Test Connection**
   - Restart your server: `cd server && npm run dev`
   - You should see: `✅ MongoDB connected`
   - **No more manual MongoDB start needed!**

---

## 🚀 Part 2: Backend Deployment (Server Hosting)

### Option A: Railway (Recommended - Easiest)
**Free tier: $5 credit/month (enough for small apps)**

1. **Sign up**: https://railway.app
2. **Create New Project** → "Deploy from GitHub repo"
3. **Add Environment Variables**:
   - `MONGODB_URI` (from Atlas)
   - `JWT_SECRET` (same as local)
   - `PORT` (Railway sets this automatically)
4. **Deploy**: Railway auto-detects Node.js and deploys
5. **Get your URL**: `https://your-app.railway.app`

### Option B: Render (Free tier available)
**Free tier: Spins down after 15min inactivity**

1. **Sign up**: https://render.com
2. **New Web Service** → Connect GitHub repo
3. **Settings**:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: Node
4. **Add Environment Variables** (same as Railway)
5. **Deploy**

### Option C: Vercel (For serverless)
**Free tier available**

1. **Sign up**: https://vercel.com
2. **Import Project** from GitHub
3. **Configure** as serverless functions
4. **Add Environment Variables**

---

## 🌐 Part 3: Frontend Deployment

### Option A: Vercel (Recommended - Best for React)
**Free tier: Unlimited**

1. **Sign up**: https://vercel.com
2. **Import Project** from GitHub
3. **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend.railway.app/api
   ```
4. **Deploy** - Automatic on every push!

### Option B: Netlify
**Free tier: 100GB bandwidth/month**

1. **Sign up**: https://netlify.com
2. **New site from Git**
3. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Environment Variables**: Same as Vercel
5. **Deploy**

---

## 🔐 Part 4: Environment Variables Setup

### Development (Local)
**`server/.env`**:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/axno?retryWrites=true&w=majority
JWT_SECRET=dev-secret-key-change-in-production
PORT=3001
```

**Root `.env`**:
```env
VITE_API_URL=http://localhost:3001/api
```

### Production (Cloud)
**Backend (Railway/Render)**:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/axno?retryWrites=true&w=majority
JWT_SECRET=super-secure-random-string-min-32-chars
NODE_ENV=production
```

**Frontend (Vercel/Netlify)**:
```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## 📋 Deployment Checklist

### Before Deploying:
- [ ] MongoDB Atlas cluster created and connected
- [ ] Database user created with strong password
- [ ] IP whitelist configured (0.0.0.0/0 for dev, specific IPs for prod)
- [ ] `.env` files created with correct values
- [ ] Tested locally with Atlas connection
- [ ] Generated strong `JWT_SECRET` (use: `openssl rand -base64 32`)

### Backend Deployment:
- [ ] Code pushed to GitHub
- [ ] Railway/Render account created
- [ ] Project connected to GitHub repo
- [ ] Environment variables added
- [ ] Server deployed and running
- [ ] Tested API endpoints

### Frontend Deployment:
- [ ] Code pushed to GitHub
- [ ] Vercel/Netlify account created
- [ ] Project connected to GitHub repo
- [ ] `VITE_API_URL` set to production backend URL
- [ ] Frontend deployed
- [ ] Tested login/signup flow

---

## 🔄 Workflow After Deployment

### Development:
1. **Local MongoDB Atlas** → No manual start needed ✅
2. **Local Backend** → `cd server && npm run dev`
3. **Local Frontend** → `npm run dev`
4. **Push to GitHub** → Auto-deploys to production

### Production:
- **Database**: MongoDB Atlas (always running)
- **Backend**: Railway/Render (always running)
- **Frontend**: Vercel/Netlify (always running)
- **Updates**: Push to GitHub → Auto-deploy

---

## 💰 Cost Breakdown

### Free Tier (Development):
- **MongoDB Atlas**: FREE (512MB storage)
- **Railway**: $5 credit/month (usually free for small apps)
- **Vercel**: FREE (unlimited)
- **Total**: $0/month ✅

### Production (When you scale):
- **MongoDB Atlas**: $9/month (M10 cluster)
- **Railway**: ~$5-20/month (based on usage)
- **Vercel**: FREE (or $20/month for Pro)
- **Total**: ~$15-50/month

---

## 🆘 Troubleshooting

### "MongoDB connection error"
- Check your connection string in `.env`
- Verify password is correct (no `<` or `>` brackets)
- Check IP whitelist in Atlas
- Ensure database name is in the URI

### "Backend not connecting"
- Verify `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend
- Ensure backend is running and accessible

### "Environment variables not working"
- Restart server after changing `.env`
- In production: Check platform's environment variable settings
- Ensure variable names match exactly

---

## 📚 Next Steps

1. **Set up MongoDB Atlas** (15 minutes)
2. **Update local `.env`** with Atlas connection string
3. **Test locally** with cloud database
4. **Deploy backend** to Railway/Render
5. **Deploy frontend** to Vercel
6. **Update frontend `.env`** with production backend URL
7. **Test production** deployment

**You're all set! No more manual database starts! 🎉**

