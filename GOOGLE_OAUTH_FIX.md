# Fix Google OAuth "Error 401: invalid_client"

## 🔴 Common Causes:

1. **Client ID not added to authorized origins**
2. **OAuth consent screen not configured**
3. **Wrong Client ID format**
4. **Client ID not restarted after adding to .env**

---

## ✅ Step-by-Step Fix:

### 1. **Check Your .env File**

Make sure your `.env` file in the **root directory** has:
```env
VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

**Important:**
- ✅ No quotes around the value
- ✅ No spaces around the `=`
- ✅ Full Client ID including `.apps.googleusercontent.com`

---

### 2. **Configure Google Cloud Console**

Go to: https://console.cloud.google.com/apis/credentials

#### A. **OAuth Consent Screen** (CRITICAL!)

1. Click **"OAuth consent screen"** in left sidebar
2. Select **"External"** (unless you have Google Workspace)
3. Fill in:
   - **App name:** Looklyn
   - **User support email:** Your email
   - **Developer contact:** Your email
4. Click **"Save and Continue"**
5. **Scopes:** Click "Save and Continue" (default scopes are fine)
6. **Test users:** Add your email if in testing mode
7. Click **"Save and Continue"** → **"Back to Dashboard"**

#### B. **Authorized JavaScript Origins**

1. Go to **"Credentials"** → Click your **OAuth 2.0 Client ID**
2. Under **"Authorized JavaScript origins"**, click **"+ ADD URI"**
3. Add these URLs:
   ```
   http://localhost:8080
   http://localhost:3000
   ```
4. Click **"Save"**

#### C. **Authorized Redirect URIs**

1. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**
2. Add:
   ```
   http://localhost:8080
   http://localhost:3000
   ```
3. Click **"Save"**

---

### 3. **Restart Your Dev Server**

After making changes:

```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

**Important:** Environment variables are only loaded when the server starts!

---

### 4. **Verify Client ID Format**

Your Client ID should look like:
```
123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

**NOT:**
- ❌ Just the numbers: `123456789`
- ❌ Without `.apps.googleusercontent.com`
- ❌ With extra spaces or quotes

---

### 5. **Check Browser Console**

Open browser console (F12) and check for:
- ✅ No errors about missing Client ID
- ✅ Google Sign-In script loaded
- ✅ Client ID is being read correctly

---

## 🔍 Quick Checklist:

- [ ] Client ID added to `.env` file (root directory)
- [ ] OAuth consent screen configured
- [ ] Authorized JavaScript origins added (`http://localhost:8080`)
- [ ] Authorized redirect URIs added (`http://localhost:8080`)
- [ ] Dev server restarted after adding Client ID
- [ ] Client ID format is correct (includes `.apps.googleusercontent.com`)
- [ ] No quotes or spaces in `.env` file

---

## 🆘 Still Not Working?

1. **Double-check Client ID:**
   - Copy it directly from Google Cloud Console
   - Make sure it's the **OAuth 2.0 Client ID** (not API key)

2. **Clear browser cache:**
   - Clear cookies for `localhost`
   - Try incognito/private window

3. **Check OAuth consent screen status:**
   - Should be "In production" or "Testing"
   - If "Testing", add your email as a test user

4. **Verify the Client ID is for "Web application" type:**
   - Not "Desktop app" or "Mobile app"

---

## ✅ After Fixing:

1. Restart dev server
2. Go to `/auth` page
3. Click Google Sign-In button
4. Should work now! 🎉

