# Razorpay Webhook Setup - Current ngrok URL

## ✅ ngrok is Running!

Your ngrok tunnel is active:
- **Public URL**: `https://misitemized-janet-quodlibetical.ngrok-free.dev`
- **Local Server**: `http://localhost:3001`
- **Web Interface**: `http://127.0.0.1:4040` (to monitor requests)

## Step 1: Add Webhook to Razorpay Dashboard

1. **Open Razorpay Dashboard**: https://dashboard.razorpay.com/
2. **Go to**: Settings → Webhooks
3. **Click**: "Add New Webhook"
4. **Enter Webhook URL**:
   ```
   https://misitemized-janet-quodlibetical.ngrok-free.dev/api/payments/webhook
   ```
5. **Select Events** (check these):
   - ✅ `payment.captured`
   - ✅ `payment.authorized`
   - ✅ `payment.failed`
6. **Click**: "Create Webhook"
7. **Copy the Webhook Secret** (you'll need this)

## Step 2: Add Webhook Secret to .env

Update your `server/.env` file:

```env
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_razorpay_dashboard
```

## Step 3: Test the Webhook

1. Make sure your server is running:
   ```powershell
   cd server
   npm run dev
   ```

2. Make a test payment through your app

3. Check ngrok web interface: http://127.0.0.1:4040
   - You'll see all incoming requests here
   - Look for POST requests to `/api/payments/webhook`

4. Check server logs for webhook events

## Important Notes

⚠️ **Free ngrok URLs change**:
- When you restart ngrok, you'll get a new URL
- You'll need to update the webhook URL in Razorpay Dashboard
- Or use ngrok's paid plan for a fixed domain

💡 **Keep ngrok running**:
- Don't close the ngrok console while testing
- Keep it running in a separate terminal window

🔍 **Monitor requests**:
- Open http://127.0.0.1:4040 in browser
- See all requests in real-time
- Inspect webhook payloads

## Current Webhook URL

```
https://misitemized-janet-quodlibetical.ngrok-free.dev/api/payments/webhook
```

Copy this and add it to Razorpay Dashboard!

