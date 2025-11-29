# MongoDB Setup Guide

## ⚡ Quick Start: MongoDB Atlas (Cloud - Recommended)

**Why Atlas?** 
- ✅ Runs 24/7 - No manual start needed
- ✅ Free tier available (512MB)
- ✅ Works from anywhere
- ✅ Production-ready

### Step-by-Step Setup:

1. **Create Account**: https://www.mongodb.com/cloud/atlas/register
2. **Create Free Cluster**:
   - Click "Build a Database"
   - Choose **FREE** tier (M0 Sandbox)
   - Select region closest to you
   - Click "Create" (takes 3-5 minutes)

3. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Username: `looklyn-admin`
   - Password: Click "Autogenerate Secure Password" (SAVE THIS!)
   - Privileges: "Atlas admin"
   - Click "Add User"

4. **Whitelist IP**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Add database name: Change `/?retryWrites...` to `/looklyn?retryWrites...`

6. **Update `.env` file**:
   - Create `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://looklyn-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/looklyn?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=3001
   ```

7. **Test**: Restart server → Should see `✅ MongoDB connected`

**That's it! No more manual MongoDB starts! 🎉**

---

## Alternative: Local MongoDB (Not Recommended)

### Option B: Local MongoDB
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. ⚠️ **Note**: You'll need to start MongoDB manually every time you restart your PC

## 2. Setup Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/looklyn?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001
```

For local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/looklyn
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001
```

## 3. Install Server Dependencies

```bash
cd server
npm install
```

## 4. Start the Server

```bash
npm run dev
```

The server will run on `http://localhost:3001`

## 5. Update Frontend Environment

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001/api
```

## 6. Test the Setup

1. Start the server: `cd server && npm run dev`
2. Start the frontend: `npm run dev`
3. Try signing up a new user
4. Check MongoDB to see the user was created

## Database Schema

### Users Collection
- `_id`: ObjectId
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `addresses`: Array of address objects
- `createdAt`: Date

### Address Object
- `name`: String
- `address`: String
- `city`: String
- `state`: String
- `pincode`: String
- `phone`: String
- `isDefault`: Boolean

