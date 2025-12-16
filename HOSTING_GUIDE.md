# 🚀 Complete Hosting Guide for AXNO/Looklyn

This guide will walk you through hosting your full-stack application step-by-step.

## 📋 Overview

Your application consists of:
- **Frontend**: React + Vite (runs on port 8080 in dev, static build for production)
- **Backend**: Express.js server (runs on port 3001)
- **Database**: MongoDB (needs cloud hosting)
- **File Storage**: Local uploads (needs cloud storage for production)

---

## 🎯 Step-by-Step Hosting Process

### Step 1: Set Up MongoDB Atlas (Database) - 15 minutes

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up with your email

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Select **FREE** tier (M0 Sandbox)
   - Choose a cloud provider (AWS recommended)
   - Select region closest to you (e.g., Mumbai for India)
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Authentication Method: Password
   - Username: `looklyn-admin` (or your choice)
   - Password: Click "Autogenerate Secure Password" and **SAVE IT**
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" → "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ **For production**: Add only your hosting provider IPs later
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password (remove `<` and `>`)
   - Add database name: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/looklyn?retryWrites=true&w=majority`

6. **Test Connection Locally**
   - Create `server/.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/looklyn?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-use-random-string-min-32-chars
   PORT=3001
   NODE_ENV=development
   ```
   - Run: `cd server && npm install && npm run dev`
   - You should see: `✅ MongoDB connected`

---

### Step 2: Deploy Backend to Render (Recommended) - 20 minutes

**Why Render?**
- ✅ Free tier available (spins down after 15min inactivity)
- ✅ Auto-deploys from GitHub
- ✅ Easy environment variable management
- ✅ Automatic HTTPS
- ✅ No credit card required for free tier
- ⚠️ Note: Free tier has cold starts (first request after inactivity may take 30-60 seconds)

#### 2.1: Prepare Your Code

1. **Push to GitHub** (if not already)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/axno.git
   git push -u origin main
   ```

2. **Create `.gitignore`** (if not exists)
   ```
   node_modules/
   .env
   server/.env
   dist/
   .DS_Store
   uploads/
   server/uploads/
   ```

#### 2.2: Deploy to Render

1. **Sign up for Render**
   - Go to https://render.com
   - Click "Get Started for Free"
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub account (if not already)
   - Select your repository
   - Click "Connect"

3. **Configure Backend Service**
   - **Name**: `axno-backend` (or your choice)
   - **Environment**: `Node`
   - **Region**: Choose closest to you (e.g., Singapore for India)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter for $7/month - no cold starts)

4. **Add Environment Variables**
   - Scroll down to "Environment Variables"
   - Click "Add Environment Variable" for each:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/looklyn?retryWrites=true&w=majority
     JWT_SECRET=generate-random-32-char-string-here
     NODE_ENV=production
     ```
   - To generate JWT_SECRET: Run `openssl rand -base64 32` in terminal
   - Note: Render sets PORT automatically, don't add it

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Wait for deployment to complete (5-10 minutes first time)
   - Your backend URL will be: `https://your-app-name.onrender.com`
   - Copy this URL

6. **Test Backend**
   - Visit: `https://your-backend-url.onrender.com/api/products`
   - First request may be slow (30-60 seconds) if on free tier due to cold start
   - Subsequent requests will be fast

---

### Step 3: Deploy Frontend to Vercel (Recommended) - 15 minutes

**Why Vercel?**
- ✅ Free tier with unlimited deployments
- ✅ Perfect for React/Vite apps
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deploys on git push

#### 3.1: Deploy to Vercel

1. **Sign up for Vercel**
   - Go to https://vercel.com
   - Click "Sign Up" → Use GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite

3. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Root Directory: `.` (root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**
   - Go to "Settings" → "Environment Variables"
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   - Replace `your-backend-url.onrender.com` with your actual Render URL

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Vercel will give you a URL like: `https://your-app.vercel.app`

6. **Test Frontend**
   - Visit your Vercel URL
   - Try logging in/signing up
   - Check if API calls work

---

## 🔄 Alternative Hosting Options

### Backend Alternatives

#### Option B: Railway (Paid tier recommended)
1. Sign up: https://railway.app
2. New Project → Deploy from GitHub
3. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables
5. Deploy

#### Option C: Heroku (Paid, but reliable)
1. Sign up: https://heroku.com
2. Create new app
3. Connect GitHub
4. Add environment variables
5. Deploy

### Frontend Alternatives

#### Option B: Netlify
1. Sign up: https://netlify.com
2. New site from Git
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variable: `VITE_API_URL`
5. Deploy

---

## 📝 Environment Variables Summary

### Backend (Render)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/looklyn?retryWrites=true&w=majority
JWT_SECRET=your-random-32-character-secret-key
NODE_ENV=production
PORT=3001
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
ADMIN_SECRET=your-admin-secret-key
PAYMENT_MODE=test
```

### Frontend (Vercel/Netlify)
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## 🔧 Post-Deployment Checklist

- [ ] MongoDB Atlas cluster created and connected
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set correctly
- [ ] Test user registration/login
- [ ] Test product browsing
- [ ] Test file uploads (if applicable)
- [ ] Update CORS settings if needed
- [ ] Test payment flow (if applicable)
- [ ] Set up custom domain (optional)

---

## 🐛 Troubleshooting

### Backend Issues

**"MongoDB connection error"**
- Check connection string in Render environment variables
- Verify password doesn't have `<` or `>` brackets
- Check IP whitelist in MongoDB Atlas
- Ensure database name is in the URI

**"Port already in use"**
- Render sets PORT automatically via `process.env.PORT`
- Don't add PORT to environment variables
- Your code already handles this: `const PORT = process.env.PORT || 3001;`

**"CORS error"**
- Your CORS is already configured to allow all origins: `app.use(cors())`
- If you need to restrict, update CORS in `server/index.js`:
  ```js
  app.use(cors({
    origin: ['https://your-frontend.vercel.app', 'http://localhost:8080'],
    credentials: true
  }));
  ```

### Frontend Issues

**"API calls failing"**
- Verify `VITE_API_URL` is set correctly in Vercel (should be Render URL)
- Check backend URL is accessible
- First request may be slow (30-60 seconds) on Render free tier due to cold start
- Ensure CORS is configured on backend (already set to allow all)
- Rebuild frontend after changing env vars

**"Build fails"**
- Check build logs in Vercel
- Ensure all dependencies are in `package.json`
- Try building locally: `npm run build`

---

## 🚀 Quick Deploy Commands

### Local Testing with Cloud DB
```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
npm install
npm run dev
```

### Production Deployment
1. Push to GitHub
2. Render auto-deploys backend (may take 5-10 min first time)
3. Vercel auto-deploys frontend
4. Done! 🎉

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Starting)
- **MongoDB Atlas**: FREE (512MB storage)
- **Render**: FREE (spins down after 15min inactivity, cold starts)
- **Vercel**: FREE (unlimited)
- **Total**: $0/month ✅

### When You Scale
- **MongoDB Atlas**: $9/month (M10 cluster)
- **Render**: $7/month (Starter plan - no cold starts, always on)
- **Vercel**: FREE (or $20/month for Pro)
- **Total**: ~$16-30/month

---

## 📚 Next Steps After Deployment

1. **Set up custom domain** (optional)
   - Vercel: Settings → Domains
   - Render: Settings → Custom Domain

2. **Set up monitoring**
   - Render: Built-in logs
   - Vercel: Analytics (Pro plan)

3. **Configure email service**
   - Set up Gmail App Password
   - Add to backend environment variables

4. **Set up file storage** (for production)
   - Consider AWS S3 or Cloudinary for file uploads
   - Update upload logic in backend

5. **Enable production payment gateway**
   - Configure Razorpay/Cashfree
   - Update `PAYMENT_MODE=production`

---

## 🆘 Need Help?

If you encounter issues:
1. Check the deployment logs in Render/Vercel
2. Verify all environment variables are set
3. Test backend API directly (use Postman/curl)
4. Check browser console for frontend errors
5. Review MongoDB Atlas connection status

**You're all set! Your app should now be live! 🎉**

