# 📝 How to Create `.env` File

## ✅ I've Created It For You!

I've created the `server/.env` file for you. Here's what you need to do:

---

## 📍 Location

The file is located at: `server/.env`

---

## 🔧 What You Need to Fill In

### 1. **Email Configuration** (Required for emails to work)

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password-here
```

**Steps to get Gmail App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **"App passwords"** (under 2-Step Verification)
4. Select **"Mail"** → **"Other"** → Type **"Looklyn Server"**
5. Click **"Generate"**
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
7. **Remove all spaces** and paste it in `.env` file

**Example:**
```env
EMAIL_USER=looklyn@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

---

### 2. **JWT Secret** (Required for authentication)

```env
JWT_SECRET=your-secret-key-change-this-to-a-random-string-minimum-32-characters
```

**How to generate:**
- Option 1: Use any random string (at least 32 characters)
- Option 2: Run in terminal: `openssl rand -base64 32`

**Example:**
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

### 3. **MongoDB URI** (Required for database)

```env
MONGODB_URI=mongodb://localhost:27017/axno
```

**If using MongoDB Atlas (cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/axno?retryWrites=true&w=majority
```

---

## 📋 Complete Example `.env` File

```env
# Database
MONGODB_URI=mongodb://localhost:27017/axno

# JWT
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Server
PORT=3001

# Email (Gmail)
EMAIL_USER=looklyn@gmail.com
EMAIL_PASS=abcdefghijklmnop

# Admin
ADMIN_SECRET=my-secure-admin-secret-key

# Environment
NODE_ENV=development
```

---

## ⚠️ Important Notes

1. **Never commit `.env` file to Git** - It contains sensitive information
2. **No spaces** around the `=` sign
3. **No quotes** needed around values
4. **Remove spaces** from Gmail App Password
5. **Restart server** after making changes

---

## ✅ After Filling In

1. Save the `.env` file
2. Restart your server:
   ```bash
   cd server
   npm run dev
   ```
3. Look for: `✅ Email server is ready to send messages`
4. If you see errors, check the troubleshooting section below

---

## 🆘 Troubleshooting

### Error: "Email server is not ready"
- ✅ Check `EMAIL_USER` and `EMAIL_PASS` are filled in
- ✅ Make sure no spaces in App Password
- ✅ Verify 2-Step Verification is enabled
- ✅ Try generating a new App Password

### Error: "MongoDB connection error"
- ✅ Check `MONGODB_URI` is correct
- ✅ Make sure MongoDB is running (if using local)
- ✅ Check connection string format (if using Atlas)

### Error: "JWT_SECRET is not set"
- ✅ Make sure `JWT_SECRET` has a value
- ✅ Use at least 32 characters

---

## 📁 File Location

```
your-project/
  └── server/
      └── .env  ← This file
```

---

**The `.env` file is ready! Just fill in your email credentials and you're good to go!** 🚀

