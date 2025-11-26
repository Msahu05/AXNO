# Complete Setup Guide

## ✅ What's Been Fixed

1. **Search Suggestions** - Now shows women/kids products properly
2. **MongoDB Integration** - Complete backend API setup
3. **Authentication** - Working login/signup with JWT sessions
4. **Saved Addresses** - Now uses real user data from MongoDB
5. **TypeScript to JavaScript** - Key files converted (ongoing)

## 🚀 Quick Start

### 1. Setup MongoDB Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start server
npm run dev
```

### 2. Setup Frontend

```bash
# In root directory
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3001/api" > .env

# Start frontend
npm run dev
```

### 3. Test Authentication

1. Go to http://localhost:8080
2. Click "Login" button
3. Click "Create account"
4. Sign up with email/password
5. You should be logged in and redirected

## 📝 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

### Backend (server/.env)
```
MONGODB_URI=mongodb://localhost:27017/axno
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/axno

JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=3001
```

## 🔧 MongoDB Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Add to `server/.env`

### Option 2: Local MongoDB
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB
3. Use `mongodb://localhost:27017/axno` in `.env`

## 🐛 Troubleshooting

### Auth not working?
- Check server is running on port 3001
- Check MongoDB connection
- Check browser console for errors
- Verify JWT_SECRET is set

### Addresses not showing?
- Make sure you're logged in
- Check browser console for API errors
- Verify user has addresses in MongoDB

### Search not showing products?
- Clear browser cache
- Check that products exist in `src/data/products.ts`
- Verify search term matches product names

## 📦 Project Structure

```
mirror-page/
├── server/              # MongoDB backend API
│   ├── index.js        # Express server
│   ├── package.json
│   └── .env
├── src/
│   ├── contexts/
│   │   ├── auth-context.jsx  # ✅ Converted to JSX
│   │   └── ...
│   ├── pages/
│   │   ├── Auth.jsx          # ✅ Converted to JSX
│   │   └── ...
│   ├── lib/
│   │   └── api.js            # ✅ Converted to JS
│   └── ...
└── package.json
```

## 🔄 TypeScript to JavaScript Conversion

See `TS_TO_JS_CONVERSION.md` for detailed conversion guide.

Key files already converted:
- ✅ `src/contexts/auth-context.jsx`
- ✅ `src/pages/Auth.jsx`
- ✅ `src/lib/api.js`
- ✅ `src/main.jsx`
- ✅ `src/App.jsx`

Remaining files can be converted following the same pattern.

