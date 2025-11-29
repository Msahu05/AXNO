# 🔧 Environment Variables Setup Guide

## 📍 You're Here: After Copying MongoDB Atlas Connection String

### ✅ What You've Done:
1. ✅ Created MongoDB Atlas account
2. ✅ Created a cluster
3. ✅ Created database user
4. ✅ Whitelisted IP (0.0.0.0/0)
5. ✅ Copied connection string

### 🎯 Next Steps:

---

## Step 1: Update `server/.env` File

1. **Open** `server/.env` file in your editor

2. **Find your connection string** - It looks like:
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

3. **Replace `<password>`** with your actual database user password
   - Remove the `<` and `>` brackets
   - Use the password you created for the database user

4. **Add database name** - Change:
   ```
   ...mongodb.net/?retryWrites...
   ```
   To:
   ```
   ...mongodb.net/looklyn?retryWrites...
   ```
   (Add `/looklyn` before the `?`)

5. **Final format should be:**
   ```env
   MONGODB_URI=mongodb+srv://looklyn-admin:YourActualPassword123@cluster0.xxxxx.mongodb.net/looklyn?retryWrites=true&w=majority
   ```

6. **Generate JWT Secret:**
   - Open PowerShell/Terminal
   - Run: `openssl rand -base64 32`
   - Copy the output
   - Paste it as `JWT_SECRET` value
   - OR use any long random string (at least 32 characters)

---

## Step 2: Update Root `.env` File (Frontend)

1. **Open** `.env` file in the root directory

2. **Set the API URL:**
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

---

## Step 3: Test the Connection

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Look for this message:**
   ```
   ✅ MongoDB connected
   🚀 Server running on port 3001
   ```

3. **If you see an error:**
   - ❌ Check your password (no `<` or `>` brackets)
   - ❌ Check database name is `/looklyn` before `?`
   - ❌ Check IP whitelist in Atlas (should be 0.0.0.0/0)
   - ❌ Check connection string format

---

## Step 4: Start Frontend

1. **In a new terminal:**
   ```bash
   npm run dev
   ```

2. **Test the app:**
   - Go to http://localhost:8080
   - Try signing up a new user
   - Check if it works!

---

## 📝 Example `.env` Files

### `server/.env`:
```env
MONGODB_URI=mongodb+srv://looklyn-admin:MySecurePassword123@cluster0.abc123.mongodb.net/looklyn?retryWrites=true&w=majority
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
PORT=3001
```

### Root `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🆘 Troubleshooting

### Error: "MongoServerError: Authentication failed"
- **Fix:** Check your password in the connection string
- Make sure you removed `<` and `>` brackets
- Verify password in MongoDB Atlas → Database Access

### Error: "MongoServerError: IP not whitelisted"
- **Fix:** Go to MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (allows from anywhere)
- Wait 1-2 minutes for changes to apply

### Error: "Invalid connection string"
- **Fix:** Check the format:
  - Should start with `mongodb+srv://`
  - Should have `/looklyn` before `?`
  - Should not have spaces
  - Should have `?retryWrites=true&w=majority` at the end

### Error: "Cannot connect to server"
- **Fix:** Make sure backend server is running
- Check `PORT=3001` in `server/.env`
- Verify server started: `🚀 Server running on port 3001`

---

## ✅ Success Checklist

- [ ] `server/.env` file created with correct `MONGODB_URI`
- [ ] Password replaced (no `<` or `>` brackets)
- [ ] Database name `/looklyn` added before `?`
- [ ] `JWT_SECRET` set to a random string
- [ ] Root `.env` has `VITE_API_URL=http://localhost:3001/api`
- [ ] Backend server shows `✅ MongoDB connected`
- [ ] Frontend can connect to backend
- [ ] Can sign up/login successfully

---

## 🎉 You're Done!

Once you see `✅ MongoDB connected`, you're all set! The database will run 24/7 in the cloud - no more manual starts needed!

