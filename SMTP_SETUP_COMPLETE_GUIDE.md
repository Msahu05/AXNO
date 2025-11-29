# 📧 Complete SMTP Email Setup Guide - From Zero to Working

## 🎯 What We're Setting Up

Your Looklyn website will send emails for:
- ✅ Welcome emails (when users sign up)
- ✅ Login notifications (security alerts)
- ✅ Order confirmations
- ✅ Order status updates
- ✅ OTP codes (for login, signup, password reset)

**All emails will be sent via SMTP** (no development mode - real emails always).

---

## 📋 Step-by-Step Setup

### **Option 1: Gmail (Easiest - Recommended for Beginners)**

#### Step 1: Create or Choose a Gmail Account

1. Go to [Gmail.com](https://gmail.com)
2. Create a new account for your business (e.g., `looklyn@gmail.com`)
   - OR use your existing Gmail account
3. Sign in to this account

#### Step 2: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on **"2-Step Verification"**
3. Click **"Get Started"**
4. Follow the steps to enable 2-Step Verification
   - You'll need your phone number
   - Google will send you a verification code

#### Step 3: Generate App Password

1. Still in [Google Account Security](https://myaccount.google.com/security)
2. Scroll down to **"2-Step Verification"** section
3. Click on **"App passwords"** (below 2-Step Verification)
4. You might need to sign in again
5. Under "Select app", choose **"Mail"**
6. Under "Select device", choose **"Other (Custom name)"**
7. Type: **"Looklyn Server"**
8. Click **"Generate"**
9. **IMPORTANT**: Copy the 16-character password that appears
   - It looks like: `abcd efgh ijkl mnop`
   - **Remove all spaces** when using it: `abcdefghijklmnop`
   - You won't be able to see this password again!

#### Step 4: Add Credentials to Your Project

1. Open your project folder
2. Go to `server` folder
3. Open or create `.env` file
4. Add these lines:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

**Example:**
```env
EMAIL_USER=looklyn@gmail.com
EMAIL_PASS=abcd1234efgh5678
```

⚠️ **Important:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `abcdefghijklmnop` with your actual App Password (no spaces!)
- Don't use quotes around the values
- Don't add spaces before or after the `=` sign

#### Step 5: Restart Your Server

1. Stop your server (press `Ctrl+C` in the terminal)
2. Start it again:
   ```bash
   cd server
   npm run dev
   ```

3. **Look for this message:**
   ```
   ✅ Email server is ready to send messages
   ```

   If you see this, you're all set! ✅

   If you see an error, check the troubleshooting section below.

#### Step 6: Test It!

1. Go to your website
2. Sign up with a new account
3. Check the email inbox you used to sign up
4. You should receive a welcome email! 🎉

---

### **Option 2: Custom SMTP (For Production/Professional Use)**

If you want to use a professional email service (SendGrid, Mailgun, etc.):

#### Step 1: Choose an Email Service

**Recommended Services:**
- **SendGrid** - Free tier: 100 emails/day
- **Mailgun** - Free tier: 5,000 emails/month  
- **Resend** - Modern, developer-friendly
- **AWS SES** - Very cheap, scalable

#### Step 2: Sign Up and Get SMTP Credentials

**Example: SendGrid**
1. Sign up at [SendGrid.com](https://sendgrid.com)
2. Go to Settings → API Keys
3. Create a new API Key
4. Copy the SMTP credentials:
   - SMTP Host: `smtp.sendgrid.net`
   - SMTP Port: `587`
   - Username: `apikey`
   - Password: (your API key)

#### Step 3: Update `server/index.js`

Find this section (around line 173):

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail', // ← Comment this out
  // host: process.env.SMTP_HOST || 'smtp.gmail.com', // ← Uncomment this
  // port: process.env.SMTP_PORT || 587, // ← Uncomment this
  // secure: false, // ← Uncomment this
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

Change it to:

```javascript
const transporter = nodemailer.createTransport({
  // service: 'gmail', // ← Commented out for custom SMTP
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // For SendGrid: use 'apikey'
    pass: process.env.EMAIL_PASS  // Your SMTP password/API key
  }
});
```

#### Step 4: Update `server/.env`

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key-here
```

---

## 📁 Complete `server/.env` File Example

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/looklyn?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-secret-key-here-minimum-32-characters

# Server Port
PORT=3001

# Email Configuration (Gmail)
EMAIL_USER=looklyn@gmail.com
EMAIL_PASS=abcdefghijklmnop

# Email Configuration (Custom SMTP - uncomment if using)
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587

# Admin Secret
ADMIN_SECRET=your-admin-secret-key
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `server/.env` file exists
- [ ] `EMAIL_USER` is set to your email address
- [ ] `EMAIL_PASS` is set to your App Password (Gmail) or SMTP password
- [ ] No spaces in the password
- [ ] Server restarted after adding credentials
- [ ] Server shows: `✅ Email server is ready to send messages`
- [ ] Test email received (try signing up)

---

## 🆘 Troubleshooting

### Error: "Invalid login" or "Authentication failed"

**Problem:** Wrong email or password

**Solutions:**
1. ✅ Check `EMAIL_USER` matches your Gmail address exactly
2. ✅ Check `EMAIL_PASS` is the App Password (not your regular password)
3. ✅ Remove all spaces from App Password
4. ✅ Make sure 2-Step Verification is enabled
5. ✅ Generate a new App Password if needed

### Error: "Connection timeout"

**Problem:** Network or firewall issue

**Solutions:**
1. ✅ Check your internet connection
2. ✅ Try using port 465 with `secure: true`
3. ✅ Check if your firewall is blocking port 587
4. ✅ Try a different network

### Error: "Email server is not ready"

**Problem:** Credentials not configured

**Solutions:**
1. ✅ Check `server/.env` file exists
2. ✅ Check `EMAIL_USER` and `EMAIL_PASS` are set
3. ✅ Restart your server after adding credentials
4. ✅ Check for typos in `.env` file

### Emails not being received

**Solutions:**
1. ✅ Check spam/junk folder
2. ✅ Verify email address is correct
3. ✅ Check server logs for errors
4. ✅ Try sending to a different email address
5. ✅ Wait a few minutes (sometimes there's a delay)

### "Less secure app access" error (Old Gmail)

**Solution:** This shouldn't happen with App Passwords, but if it does:
1. Use App Passwords (not regular password)
2. Make sure 2-Step Verification is enabled
3. Don't use "Less secure app access" (it's deprecated)

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.env` file** to Git
2. ✅ **Use App Passwords** (not your regular email password)
3. ✅ **Keep credentials secret** - don't share them
4. ✅ **Use environment variables** - never hardcode credentials
5. ✅ **Rotate passwords** periodically
6. ✅ **Use different accounts** for development and production

---

## 📧 Email Service Comparison

| Service | Free Tier | Best For | Setup Difficulty |
|---------|-----------|----------|------------------|
| **Gmail** | Unlimited* | Development, Small projects | ⭐ Easy |
| **SendGrid** | 100/day | Small businesses | ⭐⭐ Medium |
| **Mailgun** | 5,000/month | Growing businesses | ⭐⭐ Medium |
| **Resend** | 3,000/month | Modern apps | ⭐⭐ Medium |
| **AWS SES** | 62,000/month** | Large scale | ⭐⭐⭐ Hard |

*Gmail has daily sending limits (500-2000 emails/day)
**AWS SES free tier for first 12 months

---

## 🎉 You're Done!

Once you see `✅ Email server is ready to send messages` in your server logs, your email system is fully configured and ready to send real emails!

**Next Steps:**
1. Test by signing up a new account
2. Check your email inbox
3. Verify you received the welcome email
4. All future emails will be sent automatically! 🚀

---

## 📞 Need Help?

If you're stuck:
1. Check the troubleshooting section above
2. Verify your `.env` file format
3. Make sure server is restarted
4. Check server logs for specific error messages

**Common Issues:**
- Forgot to enable 2-Step Verification → Enable it first
- Using regular password instead of App Password → Generate App Password
- Typos in `.env` file → Double-check spelling
- Server not restarted → Restart after changing `.env`

