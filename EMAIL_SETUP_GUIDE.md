# 📧 Email Setup Guide

## How Emails Work

The system uses **SMTP (Simple Mail Transfer Protocol)** to send emails through **Gmail** by default. Here's how it works:

### Current Setup:
- **Service**: Gmail SMTP
- **From Address**: Uses `EMAIL_USER` environment variable
- **Method**: Nodemailer with Gmail service
- **Development Mode**: Logs emails to console (doesn't actually send)
- **Production Mode**: Sends real emails via SMTP

---

## 🔧 Setup Instructions

### Option 1: Gmail (Recommended for Development)

1. **Use a Gmail Account:**
   - Create a Gmail account for your business (e.g., `looklyn@gmail.com`)
   - Or use your existing Gmail account

2. **Enable 2-Factor Authentication:**
   - Go to Google Account → Security
   - Enable 2-Step Verification

3. **Generate App Password:**
   - Go to Google Account → Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Click "Select app" → Choose "Mail"
   - Click "Select device" → Choose "Other" → Enter "Looklyn Server"
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

4. **Add to `server/.env`:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```
   ⚠️ **Important**: Remove spaces from the app password!

---

### Option 2: Custom SMTP (For Production)

If you want to use a custom email service (like SendGrid, Mailgun, etc.):

1. **Update `server/index.js`** (around line 173):
   ```javascript
   const transporter = nodemailer.createTransport({
     host: process.env.SMTP_HOST || 'smtp.gmail.com',
     port: process.env.SMTP_PORT || 587,
     secure: false, // true for 465, false for other ports
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASS
     }
   });
   ```

2. **Add to `server/.env`:**
   ```env
   SMTP_HOST=smtp.your-email-service.com
   SMTP_PORT=587
   EMAIL_USER=noreply@yourdomain.com
   EMAIL_PASS=your-smtp-password
   ```

---

## 📋 Complete `.env` File Example

### `server/.env`:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/looklyn?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-secret-key-here

# Server
PORT=3001
NODE_ENV=development

# Email (Gmail)
EMAIL_USER=looklyn@gmail.com
EMAIL_PASS=abcdefghijklmnop

# Admin
ADMIN_SECRET=your-admin-secret-key
```

---

## 🧪 Testing Email Setup

### Development Mode:
- Emails are **logged to console** (not actually sent)
- Check your server terminal for email logs
- Format: `📧 Email would be sent to user@example.com:`

### Production Mode:
- Set `NODE_ENV=production` in `.env`
- Emails will be **actually sent** via SMTP
- Check recipient's inbox (and spam folder)

---

## 📧 Email Types Sent

1. **Welcome Email** - When user signs up
2. **Login Notification** - When user logs in
3. **Order Confirmation** - When order is created
4. **Order Status Update** - When admin updates order status
5. **OTP Codes** - For login, signup, password reset

---

## 🔒 Security Notes

1. **Never commit `.env` file** to Git
2. **Use App Password** (not your regular Gmail password)
3. **Keep credentials secure** - don't share them
4. **Use environment variables** - never hardcode credentials

---

## 🆘 Troubleshooting

### Error: "Invalid login"
- **Fix**: Check `EMAIL_USER` and `EMAIL_PASS` are correct
- Make sure you're using App Password, not regular password
- Remove spaces from App Password

### Error: "Connection timeout"
- **Fix**: Check your internet connection
- Verify Gmail SMTP is accessible
- Try using port 465 with `secure: true`

### Emails not sending in production
- **Fix**: Check `NODE_ENV=production` is set
- Verify SMTP credentials are correct
- Check spam folder
- Verify email service limits

### Emails going to spam
- **Fix**: Use a custom domain email (not Gmail)
- Set up SPF, DKIM records for your domain
- Use a professional email service (SendGrid, Mailgun)

---

## 🚀 Production Recommendations

For production, consider using:
- **SendGrid** - Free tier: 100 emails/day
- **Mailgun** - Free tier: 5,000 emails/month
- **AWS SES** - Very cheap, scalable
- **Resend** - Modern, developer-friendly

These services provide:
- Better deliverability
- Analytics
- Templates
- Higher sending limits
- Professional "from" addresses

---

## ✅ Quick Setup Checklist

- [ ] Gmail account created/selected
- [ ] 2-Factor Authentication enabled
- [ ] App Password generated
- [ ] `EMAIL_USER` added to `server/.env`
- [ ] `EMAIL_PASS` added to `server/.env`
- [ ] Server restarted
- [ ] Test email sent (check console in dev mode)

---

**Current Configuration**: Gmail SMTP (can be changed to any SMTP service)

