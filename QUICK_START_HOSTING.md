# ⚡ Quick Start - Host Your App in 30 Minutes

Follow these steps to get your app live quickly.

## 🎯 The 3-Step Process

### 1️⃣ Database (10 min)
**MongoDB Atlas - Free Cloud Database**

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create account → Build Database → Choose FREE tier
3. Create database user → Save password!
4. Network Access → Allow from anywhere (0.0.0.0/0)
5. Connect → Copy connection string
6. Update connection string: Replace `<password>` and add `/looklyn` at end

**Connection String Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/looklyn?retryWrites=true&w=majority
```

---

### 2️⃣ Backend (10 min)
**Render - Free Backend Hosting**

1. Go to https://render.com → Sign up with GitHub
2. New → Web Service → Connect your GitHub repository
3. Configure settings:
   - **Name**: `axno-backend` (or your choice)
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Environment Variables → Add:
   ```
   MONGODB_URI=your-connection-string-from-step-1
   JWT_SECRET=generate-with-openssl-rand-base64-32
   NODE_ENV=production
   ```
5. Click "Create Web Service" → Wait for deploy (5-10 min)
6. Copy your URL (e.g., `https://your-app.onrender.com`)

---

### 3️⃣ Frontend (10 min)
**Vercel - Free Frontend Hosting**

1. Go to https://vercel.com → Sign up with GitHub
2. Add New Project → Import your GitHub repo
3. Settings → Environment Variables:
   ```
   VITE_API_URL=https://your-render-url.onrender.com/api
   ```
   (Replace with your actual Render URL from step 2)
4. Deploy → Wait 2 minutes → Done! 🎉

---

## ✅ Test Your Deployment

1. **Backend**: Visit `https://your-render-url.onrender.com/api/products`
2. **Frontend**: Visit your Vercel URL
3. Try registering a new user
4. Browse products

---

## 🔧 Common Issues

**"MongoDB connection failed"**
- Check connection string has correct password
- Verify IP whitelist allows 0.0.0.0/0

**"Frontend can't connect to backend"**
- Verify `VITE_API_URL` matches your Render URL exactly
- Check Render deployment is successful
- Note: Render free tier spins down after 15min inactivity (first request may be slow)

**"CORS error"**
- Backend CORS is already configured to allow all origins
- If issues persist, check Render logs

---

## 📚 Need More Details?

See `HOSTING_GUIDE.md` for comprehensive instructions.

---

## 💰 Cost

**Total: $0/month** (all free tiers)

- MongoDB Atlas: FREE
- Render: FREE (spins down after 15min inactivity on free tier)
- Vercel: FREE

---

**That's it! Your app is now live! 🚀**

