# WhatsApp Integration Setup Instructions

## ✅ Code Implementation Complete!

All WhatsApp integration code has been implemented. Now you just need to configure your WhatsApp API credentials.

---

## 📋 Step-by-Step Setup Guide

### Step 1: Create Meta Developer Account

1. Go to **https://developers.facebook.com/**
2. Click **"Get Started"** or **"Log In"** if you already have a Facebook account
3. Complete the developer account setup

### Step 2: Create a New App

1. In the Meta Developer Dashboard, click **"Create App"**
2. Select **"Business"** as the app type
3. Fill in the details:
   - **App Name**: `Looklyn E-commerce` (or any name you prefer)
   - **App Contact Email**: Your email address
   - **Business Account**: Select or create a business account
4. Click **"Create App"**

### Step 3: Add WhatsApp Product

1. In your app dashboard, find **"Add Product"** section
2. Look for **"WhatsApp"** and click **"Set Up"**
3. You'll be redirected to WhatsApp setup page

### Step 4: Get Your Credentials

1. Go to **WhatsApp > API Setup** in the left sidebar
2. You'll see:
   - **Phone Number ID**: A long number (e.g., `123456789012345`)
   - **WhatsApp Business Account ID**: Another ID
   - **Temporary Access Token**: A token starting with `EAA...` (valid for 24 hours)

### Step 5: Generate Permanent Access Token

1. In **WhatsApp > API Setup**, scroll to **"Temporary access token"** section
2. Click **"Generate Token"** button
3. Select your **WhatsApp Business Account**
4. Copy the token (it will look like: `EAAxxxxxxxxxxxxxxxxxxxxx`)
5. **Important**: This token is permanent, but you can regenerate it if needed

### Step 6: Get Your Phone Number

1. In **WhatsApp > API Setup**, you'll see a phone number
2. This is your WhatsApp Business number (format: `+1XXXXXXXXXX` or `+91XXXXXXXXXX`)
3. Users will receive messages from this number
4. **Note**: You can test with this number, but for production, you may need to verify it

### Step 7: Add Credentials to Environment File

1. Open `server/.env` file
2. Add these two lines:

```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
```

**Example:**
```env
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 8: Restart Your Server

1. Stop your server (Ctrl+C)
2. Start it again:
   ```bash
   cd server
   npm start
   ```

---

## 🧪 Testing WhatsApp Integration

### Test 1: Test Endpoint (Admin Only)

1. Login as admin
2. Use the test endpoint:
   ```bash
   POST http://localhost:3001/api/test/whatsapp
   Headers: Authorization: Bearer YOUR_ADMIN_TOKEN
   Body: {
     "phone": "919876543210",
     "message": "Test message from Looklyn!"
   }
   ```

### Test 2: Test OTP via WhatsApp

1. Go to your login/signup page
2. Enter your phone number (with country code, e.g., `+91 9876543210`)
3. Request OTP
4. You should receive OTP via WhatsApp

### Test 3: Test Order Confirmation

1. Place a test order
2. Complete the payment
3. You should receive order confirmation via WhatsApp (if phone number is in your profile)

---

## 📝 What to Enter Where

### In `server/.env` file:

```env
# WhatsApp Cloud API Configuration
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Where to find these values:**

1. **WHATSAPP_PHONE_NUMBER_ID**:
   - Go to: Meta Developer Dashboard > Your App > WhatsApp > API Setup
   - Look for "Phone number ID" section
   - Copy the number (it's a long numeric string)

2. **WHATSAPP_ACCESS_TOKEN**:
   - Go to: Meta Developer Dashboard > Your App > WhatsApp > API Setup
   - Scroll to "Temporary access token" section
   - Click "Generate Token"
   - Select your WhatsApp Business Account
   - Copy the token (starts with `EAA...`)

---

## 🔧 Features Implemented

### ✅ OTP via WhatsApp
- Users can receive OTP codes via WhatsApp
- Works alongside email OTP
- Phone number is automatically formatted

### ✅ Order Confirmations
- Automatic WhatsApp notifications when orders are placed
- Includes order details, items, and shipping address

### ✅ Order Status Updates
- WhatsApp notifications when order status changes
- Includes tracking information when available

### ✅ Tracking Updates
- Real-time WhatsApp notifications for tracking status changes
- Includes tracking number and location updates

---

## ⚠️ Important Notes

### Phone Number Format
- **Always use format without +**: `919876543210` (not `+91 9876543210`)
- The system automatically formats phone numbers
- Include country code (91 for India)

### Rate Limits
- **Free Tier**: 1000 conversations/month
- **Paid Tier**: Based on your plan
- Messages sent within 24 hours count as one conversation

### Message Templates (For Production)
- For messages sent outside 24-hour window, you need message templates
- Templates must be approved by Meta
- For now, messages work within 24-hour window

### Testing
- You can test with your own phone number
- Make sure your phone number is registered on WhatsApp
- Test messages will come from your WhatsApp Business number

---

## 🐛 Troubleshooting

### Error: "WhatsApp not configured"
- **Solution**: Make sure both `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` are in `server/.env`
- Restart your server after adding credentials

### Error: "Invalid OAuth access token"
- **Solution**: 
  - Check if your access token is correct
  - Regenerate token in Meta Developer Dashboard
  - Make sure token hasn't expired

### Error: "Invalid phone number"
- **Solution**: 
  - Ensure phone number format is correct
  - Include country code (91 for India)
  - Remove +, spaces, and special characters

### Messages not received
- **Check**: 
  - Phone number is registered on WhatsApp
  - Access token is valid
  - Check Meta App Dashboard for error logs
  - Verify phone number format

### Error: "Rate limit exceeded"
- **Solution**: 
  - You've exceeded free tier limit (1000 conversations/month)
  - Wait for next month or upgrade to paid plan

---

## 📚 Additional Resources

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [WhatsApp Business API Pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/message-templates)

---

## ✅ Checklist

- [ ] Created Meta Developer Account
- [ ] Created App in Meta Developer Dashboard
- [ ] Added WhatsApp Product to App
- [ ] Got Phone Number ID from API Setup
- [ ] Generated Access Token
- [ ] Added credentials to `server/.env`
- [ ] Restarted server
- [ ] Tested with test endpoint
- [ ] Tested OTP via WhatsApp
- [ ] Tested order confirmation

---

## 🎉 You're All Set!

Once you've added the credentials to `.env` and restarted the server, WhatsApp integration will be fully functional!

All order confirmations, status updates, and OTP codes will automatically be sent via WhatsApp (in addition to email) when users have phone numbers in their profiles.

