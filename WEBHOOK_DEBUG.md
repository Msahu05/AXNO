# Webhook Debugging Guide

## Current Error: 400 Bad Request

### Possible Causes:

1. **Missing Webhook Secret in .env**
   - Check `server/.env` file
   - Should have: `RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx`
   - If missing, webhook will skip signature verification but might still fail

2. **Signature Verification Failing**
   - Razorpay sends `x-razorpay-signature` header
   - If webhook secret is wrong, signature won't match
   - Check server logs for "Invalid signature" error

3. **Body Parsing Issue**
   - Webhook uses `express.raw()` to get raw body
   - JSON parsing might fail if body is malformed

## How to Debug:

### Step 1: Check Server Logs

Look for these log messages:
- `📦 Webhook received - Headers:` - Shows all headers
- `📦 Webhook received - Body type:` - Should be "object" or "string"
- `❌ Missing Razorpay signature header` - Signature header missing
- `❌ Invalid webhook signature` - Signature doesn't match
- `❌ Error parsing webhook body` - JSON parsing failed

### Step 2: Check ngrok Web Interface

1. Open: http://127.0.0.1:4040
2. Click on the failed webhook request
3. Check:
   - **Request Headers** - Look for `x-razorpay-signature`
   - **Request Body** - Should be valid JSON
   - **Response** - What error is returned

### Step 3: Verify .env Configuration

Check `server/.env`:
```env
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

If missing:
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Click on your webhook
3. Copy the "Webhook Secret"
4. Add to `.env` file
5. Restart server

### Step 4: Test Webhook Manually

You can test the webhook endpoint manually:

```powershell
# Test without signature (should work if webhook secret not set)
curl -X POST http://localhost:3001/api/payments/webhook `
  -H "Content-Type: application/json" `
  -d '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test123"}},"order":{"entity":{"id":"order_test123"}}}}'
```

### Step 5: Check Razorpay Webhook Settings

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Check:
   - Webhook URL is correct
   - Events are enabled (payment.captured, payment.authorized, payment.failed)
   - Webhook is active

## Common Fixes:

### Fix 1: Add Webhook Secret
```env
RAZORPAY_WEBHOOK_SECRET=whsec_your_secret_here
```

### Fix 2: Disable Signature Verification (Testing Only)
If webhook secret is not set, signature verification is skipped. But make sure the webhook URL is correct.

### Fix 3: Check ngrok URL
- Make sure ngrok is still running
- URL hasn't changed
- Update Razorpay webhook URL if ngrok restarted

### Fix 4: Test with Razorpay Test Webhook
1. In Razorpay Dashboard → Webhooks
2. Click "Send Test Webhook"
3. Check if it reaches your server

## Expected Logs (Success):

```
📦 Webhook received - Headers: {...}
📦 Webhook received - Body type: object
✅ Webhook signature verified
📦 Razorpay webhook received: payment.captured pay_xxxxx
💳 Processing payment: pay_xxxxx for order: order_xxxxx
✅ Order payment status updated: ORDER-xxxxx
```

## Next Steps:

1. Check server logs for detailed error
2. Verify `.env` has webhook secret
3. Check ngrok web interface for request details
4. Test webhook manually if needed

