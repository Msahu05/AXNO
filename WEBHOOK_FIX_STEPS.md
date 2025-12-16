# Webhook 400 Error - Fix Steps

## ✅ Code Updated

I've improved the webhook handler with better error logging. Now follow these steps:

## Step 1: Check Your .env File

Open `server/.env` and verify:

```env
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**If missing:**
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Click on your webhook
3. Copy the "Webhook Secret" (starts with `whsec_`)
4. Add to `server/.env`
5. Save the file

## Step 2: Restart Your Server

```powershell
# Stop current server (Ctrl+C)
# Then restart:
cd server
npm run dev
```

## Step 3: Check Server Logs

When you test the webhook, you should now see detailed logs:

**Good logs (success):**
```
📦 Webhook received - Headers: {...}
✅ Webhook signature verified
📦 Razorpay webhook received: payment.captured
💳 Processing payment: pay_xxxxx
✅ Order payment status updated
```

**Error logs to look for:**
- `❌ Missing Razorpay signature header` - Signature header not sent
- `❌ Invalid webhook signature` - Signature doesn't match
- `❌ Error parsing webhook body` - JSON parsing failed

## Step 4: Test the Webhook

### Option A: Use Razorpay Test Webhook
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Click on your webhook
3. Click "Send Test Webhook"
4. Check server logs

### Option B: Make a Test Payment
1. Make a test payment through your app
2. Check server logs for webhook events
3. Check ngrok interface: http://127.0.0.1:4040

## Common Issues & Fixes:

### Issue 1: "Missing signature header"
**Fix:** This is normal if `RAZORPAY_WEBHOOK_SECRET` is not set. Add it to `.env`.

### Issue 2: "Invalid signature"
**Fix:** 
- Check webhook secret in `.env` matches Razorpay Dashboard
- Make sure there are no extra spaces
- Restart server after updating `.env`

### Issue 3: "Error parsing webhook body"
**Fix:** 
- Check ngrok web interface to see the actual request body
- Verify Razorpay is sending valid JSON

## Quick Test Command

You can test the endpoint manually:

```powershell
# Test webhook endpoint (without signature - for testing)
curl -X POST http://localhost:3001/api/payments/webhook `
  -H "Content-Type: application/json" `
  -d '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test"}},"order":{"entity":{"id":"order_test"}}}}'
```

## What Changed:

1. ✅ Better error logging
2. ✅ More detailed error messages
3. ✅ Handles missing webhook secret gracefully
4. ✅ Better payload validation
5. ✅ Searches for orders by both order ID and payment ID

## Next Steps:

1. ✅ Update `.env` with webhook secret
2. ✅ Restart server
3. ✅ Test webhook from Razorpay Dashboard
4. ✅ Check server logs for detailed errors

