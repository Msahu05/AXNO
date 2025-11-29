# Google Sign-In Setup Guide

## ✅ Step 1: Add Google Client ID to Environment Variables

### For Frontend (Root Directory)

Create or edit `.env` file in the **root directory** of your project (same level as `package.json`):

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**Example:**
```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

### Important Notes:
- ✅ The `.env` file should be in the **root directory** (not in `server/` folder)
- ✅ Variable name must start with `VITE_` for Vite to expose it to the frontend
- ✅ No quotes needed around the value
- ✅ Restart your dev server after adding the variable

---

## ✅ Step 2: Verify Setup

1. **Restart your frontend dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

2. **Check the Auth page:**
   - Go to `/auth`
   - You should see the Google Sign-In button below the login form
   - If you see a warning in console, the Client ID might be missing

---

## ✅ Step 3: Test Google Sign-In

1. Click the Google Sign-In button
2. Select your Google account
3. You should be logged in automatically
4. Check your MongoDB - a new user should be created (or existing user logged in)

---

## 🔧 Troubleshooting

### Google Sign-In button not showing?
- ✅ Check browser console for errors
- ✅ Verify `VITE_GOOGLE_CLIENT_ID` is in `.env` file (root directory)
- ✅ Restart dev server after adding the variable
- ✅ Make sure the variable name starts with `VITE_`

### "Invalid Client ID" error?
- ✅ Verify the Client ID is correct (no extra spaces)
- ✅ Check Google Cloud Console - make sure OAuth consent screen is configured
- ✅ Add your domain to authorized JavaScript origins in Google Cloud Console

### Button shows but doesn't work?
- ✅ Check browser console for JavaScript errors
- ✅ Verify the Google Sign-In script is loaded (check Network tab)
- ✅ Make sure backend is running and `/api/auth/google` endpoint is accessible

---

## 📝 Google Cloud Console Configuration

Make sure in Google Cloud Console:

1. **OAuth Consent Screen:**
   - User Type: External (or Internal if using Google Workspace)
   - App name: Looklyn
   - Support email: your email
   - Authorized domains: your domain (or localhost for development)

2. **Credentials:**
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:8080` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:8080` (for development)
     - `https://yourdomain.com` (for production)

---

## ✅ That's It!

Once you add the Client ID to `.env` and restart the server, Google Sign-In will work!

