# WhatsApp Integration - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Get Your Credentials from Meta

1. Go to: **https://developers.facebook.com/**
2. Create/Login to Developer Account
3. Create App → Select "Business" type
4. Add "WhatsApp" product
5. Go to **WhatsApp > API Setup**
6. Copy these two values:
   - **Phone Number ID** (long number)
   - **Access Token** (click "Generate Token", starts with `EAA...`)

### 2. Add to Environment File

Open `server/.env` and add:

```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
```

**Example:**
```env
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Restart Server

```bash
# Stop server (Ctrl+C)
# Then restart:
cd server
npm start
```

### 4. Test It!

**Option A: Test via Admin Dashboard**
- Login as admin
- Use the test endpoint in your API client

**Option B: Test via Order**
- Place a test order
- Complete payment
- Check WhatsApp for order confirmation

---

## 📍 Where to Find Credentials

### Phone Number ID
- **Location**: Meta Developer Dashboard > Your App > WhatsApp > API Setup
- **Look for**: "Phone number ID" section
- **Format**: Long numeric string (e.g., `123456789012345`)

### Access Token
- **Location**: Meta Developer Dashboard > Your App > WhatsApp > API Setup
- **Look for**: "Temporary access token" section
- **Click**: "Generate Token" button
- **Select**: Your WhatsApp Business Account
- **Copy**: Token (starts with `EAA...`)

---

## ✅ What's Already Implemented

- ✅ OTP via WhatsApp (login/signup)
- ✅ Order confirmation messages
- ✅ Order status update notifications
- ✅ Tracking update notifications
- ✅ Automatic phone number formatting
- ✅ Test endpoint for admin

---

## 🧪 Test Endpoint

**URL**: `POST /api/test/whatsapp`  
**Auth**: Admin only  
**Body**:
```json
{
  "phone": "919876543210",
  "message": "Test message from Looklyn!"
}
```

---

## ⚠️ Important

- Phone numbers should include country code (91 for India)
- Free tier: 1000 conversations/month
- Messages work within 24-hour window
- For production, you may need message templates

---

## 📖 Full Documentation

See `WHATSAPP_SETUP_INSTRUCTIONS.md` for detailed setup guide and troubleshooting.

