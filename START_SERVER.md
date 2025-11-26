# Quick Start Guide

## To Fix the "Connection Refused" Error:

### Step 1: Start the Backend Server

Open a **new terminal window** and run:

```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 3001
📡 API available at http://localhost:3001/api
```

### Step 2: If MongoDB Connection Fails

The server will still start, but authentication won't work. You need MongoDB:

**Option A: Use MongoDB Atlas (Cloud - Easiest)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Create `server/.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/axno
   JWT_SECRET=your-secret-key-here
   PORT=3001
   ```

**Option B: Install MongoDB Locally**
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Create `server/.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/axno
   JWT_SECRET=your-secret-key-here
   PORT=3001
   ```

### Step 3: Refresh Your Browser

Once the server is running, refresh your browser page (Ctrl+Shift+R) and try logging in again.

### Troubleshooting

- **Port 3001 already in use?** Change `PORT=3002` in `server/.env` and update `VITE_API_URL` in root `.env`
- **Still not working?** Check the terminal where you ran `npm run dev` for error messages


