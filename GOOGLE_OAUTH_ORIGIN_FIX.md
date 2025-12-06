# Fix Google OAuth "Error 400: origin_mismatch" - Quick Fix Guide

## 🔴 Problem:
Google Sign-In showing error: **"Error 400: origin_mismatch"**

This means your current URL (origin) is not registered in Google Cloud Console.

---

## ✅ Step-by-Step Fix:

### Step 1: Find Your Current Port

Check what port your app is running on:
- **Vite default:** `http://localhost:5173`
- **Check browser address bar** - it will show the exact URL

Common ports:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000`
- `http://localhost:8080`

---

### Step 2: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/apis/credentials
2. Select your project (or create one if needed)

---

### Step 3: Find Your OAuth 2.0 Client ID

1. Under **"Credentials"**, find your **OAuth 2.0 Client ID**
2. Click on it to edit

---

### Step 4: Add Authorized JavaScript Origins

1. Scroll to **"Authorized JavaScript origins"**
2. Click **"+ ADD URI"**
3. Add your current URL (check browser address bar):
   ```
   http://localhost:5173
   ```
   (Replace `5173` with your actual port if different)

4. **Also add common ports** (to avoid future issues):
   ```
   http://localhost:5173
   http://localhost:3000
   http://localhost:8080
   http://localhost:5174
   ```

5. Click **"Save"**

---

### Step 5: Add Authorized Redirect URIs

1. Scroll to **"Authorized redirect URIs"**
2. Click **"+ ADD URI"**
3. Add the same URLs:
   ```
   http://localhost:5173
   http://localhost:3000
   http://localhost:8080
   http://localhost:5174
   ```

4. Click **"Save"**

---

### Step 6: Verify OAuth Consent Screen

1. Go to **"OAuth consent screen"** (left sidebar)
2. Make sure it's configured:
   - **App name:** Looklyn (or your app name)
   - **User support email:** Your email
   - **Developer contact:** Your email
3. If in "Testing" mode, add your email as a test user

---

### Step 7: Wait & Clear Cache

1. **Wait 1-2 minutes** for Google to update (changes can take a moment)
2. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Clear cookies for `localhost`
3. **Or use Incognito/Private window** to test

---

### Step 8: Restart Your Dev Server

```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

---

### Step 9: Test Again

1. Go to `/auth` page
2. Click Google Sign-In button
3. Should work now! 🎉

---

## 🔍 Quick Checklist:

- [ ] Found your current port (check browser address bar)
- [ ] Added `http://localhost:YOUR_PORT` to **Authorized JavaScript origins**
- [ ] Added `http://localhost:YOUR_PORT` to **Authorized redirect URIs**
- [ ] Added common ports too (3000, 5173, 8080) for flexibility
- [ ] OAuth consent screen is configured
- [ ] Waited 1-2 minutes after saving
- [ ] Cleared browser cache or used incognito
- [ ] Restarted dev server
- [ ] Tested again

---

## 🆘 Still Not Working?

### Check Your Exact URL:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Type: `window.location.origin`
4. Copy the exact URL shown
5. Add that exact URL to Google Cloud Console

### Common Issues:

1. **Wrong port:**
   - Check browser address bar for exact port
   - Add that specific port to Google Cloud Console

2. **HTTP vs HTTPS:**
   - For localhost, use `http://` (not `https://`)
   - Don't add `https://localhost:5173`

3. **Trailing slash:**
   - Use `http://localhost:5173` (no trailing slash)
   - Don't use `http://localhost:5173/`

4. **Changes not applied:**
   - Wait 2-3 minutes after saving
   - Clear browser cache completely
   - Try incognito/private window

5. **Wrong Client ID:**
   - Make sure you're editing the **OAuth 2.0 Client ID** (not API key)
   - Verify Client ID in `.env` matches Google Cloud Console

---

## 📝 Example Configuration:

**Authorized JavaScript origins:**
```
http://localhost:5173
http://localhost:3000
http://localhost:8080
```

**Authorized redirect URIs:**
```
http://localhost:5173
http://localhost:3000
http://localhost:8080
```

---

## ✅ After Fixing:

Your Google Sign-In should work! If you still have issues, check:
1. Browser console for any other errors
2. Network tab to see if requests are being made
3. Google Cloud Console to verify all settings are saved

