# 📧 Production Email Setup Guide

## ❗ Problem: Emails work locally but not in production

This happens because **environment variables are not set in your production hosting platform**.

---

## ✅ Solution: Set Environment Variables in Production

### Step 1: Identify Your Hosting Platform

Check where your backend is deployed:
- **Render** (https://render.com)
- **Railway** (https://railway.app)
- **Vercel** (https://vercel.com)
- **Heroku** (https://heroku.com)
- **Other**

---

## 🔧 Step 2: Add Environment Variables

### For Render.com:

1. **Go to Render Dashboard** → Your Backend Service
2. **Click on "Environment"** tab
3. **Add these variables:**

```env
# Required Email Variables
EMAIL_USER=your-smtp-login-email@smtp-relay.brevo.com
EMAIL_PASS=your-brevo-smtp-key-here
FROM_EMAIL=your-verified-email@example.com
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587

# Other Required Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/axno?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-minimum-32-characters
ADMIN_SECRET=your-admin-secret-key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Payment (if using)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PAYMENT_MODE=production
```

4. **Click "Save Changes"**
5. **Redeploy** your service (Render will auto-redeploy)

---

### For Railway.app:

1. **Go to Railway Dashboard** → Your Project → Backend Service
2. **Click on "Variables"** tab
3. **Add the same variables** as above
4. **Deploy** will happen automatically

---

### For Vercel (if backend is on Vercel):

1. **Go to Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. **Add the same variables** as above
4. **Redeploy** your project

---

## 📋 Quick Checklist:

### ✅ Brevo SMTP Configuration:

1. **Go to Brevo Dashboard**: https://www.brevo.com/
2. **Settings** → **SMTP & API** → **SMTP**
3. **Copy these values:**
   - **SMTP Login** → Use as `EMAIL_USER`
   - **SMTP Key** → Use as `EMAIL_PASS`

4. **Settings** → **Senders**
5. **Add and verify a sender email** → Use as `FROM_EMAIL`

### ✅ Environment Variables to Add:

- [ ] `EMAIL_USER` - Brevo SMTP login email
- [ ] `EMAIL_PASS` - Brevo SMTP key
- [ ] `FROM_EMAIL` - Verified sender email in Brevo
- [ ] `SMTP_HOST` - `smtp-relay.brevo.com`
- [ ] `SMTP_PORT` - `587`
- [ ] `FRONTEND_URL` - Your frontend URL (for email links)

---

## 🧪 Step 3: Test Production Emails

1. **Wait for deployment to complete** (2-5 minutes)
2. **Check server logs** in your hosting dashboard
3. **Try logging in** on production site
4. **Check console logs** for:
   - `✅ Email server is ready to send messages` (on server start)
   - `📧 Attempting to send email to...`
   - `✅ Email sent successfully to...`

5. **Check your email inbox** (and spam folder)

---

## 🐛 Troubleshooting

### Emails still not sending?

1. **Check server logs** for errors:
   ```
   ❌ FROM_EMAIL not configured!
   ❌ Email sending error: ...
   ```

2. **Verify all variables are set:**
   - Go to your hosting dashboard
   - Check Environment Variables section
   - Make sure all email variables are present

3. **Common Issues:**
   - **FROM_EMAIL not verified** → Verify sender in Brevo dashboard
   - **Wrong EMAIL_USER** → Should be SMTP login, not your account email
   - **SMTP Key expired** → Generate new key in Brevo
   - **Missing FRONTEND_URL** → Email links won't work

4. **Restart/Redeploy** after adding variables

---

## 📝 Example Values:

```env
EMAIL_USER=9e6e77001@smtp-relay.brevo.com
EMAIL_PASS=xsmtp-abc123xyz789...
FROM_EMAIL=noreply@yourdomain.com
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
FRONTEND_URL=https://your-app.vercel.app
```

**⚠️ Important:** 
- `EMAIL_USER` = SMTP Login (from Brevo SMTP section)
- `FROM_EMAIL` = Verified sender email (different from EMAIL_USER)
- Both are required!

---

## ✅ Verification:

After setting variables and redeploying, check:

1. ✅ Server starts without email errors
2. ✅ Login sends email notification
3. ✅ Order confirmation emails work
4. ✅ Admin notifications work

If all ✅, your production emails are working! 🎉



