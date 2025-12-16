# Razorpay Payment Gateway Setup Guide

This guide will help you set up Razorpay payment gateway for your Looklyn application.

## Prerequisites

1. A Razorpay account (Sign up at https://razorpay.com/)
2. Access to Razorpay Dashboard

## Step 1: Get Your Razorpay Keys

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. You'll see two sets of keys:
   - **Test Mode Keys** (for development)
   - **Live Mode Keys** (for production)

### For Development (Test Mode)
- Copy the **Key ID** and **Key Secret** from Test Mode section
- These keys start with `rzp_test_`

### For Production (Live Mode)
- Copy the **Key ID** and **Key Secret** from Live Mode section
- These keys start with `rzp_live_`
- ⚠️ **Important**: Only use live keys in production environment

## Step 2: Configure Webhook (Optional but Recommended)

Webhooks allow Razorpay to notify your server about payment status updates.

⚠️ **Important**: Razorpay cannot send webhooks to `localhost` URLs directly. You need a publicly accessible URL.

### For Local Development

You have several options to test webhooks locally:

#### Option 1: Using ngrok (Recommended)

1. **Install ngrok**:
   ```bash
   # Download from https://ngrok.com/download
   # Or using npm:
   npm install -g ngrok
   ```

2. **Start your local server**:
   ```bash
   cd server
   npm run dev
   # Server runs on http://localhost:3001
   ```

3. **Start ngrok tunnel**:
   ```bash
   ngrok http 3001
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **In Razorpay Dashboard**:
   - Go to **Settings** → **Webhooks**
   - Click **Add New Webhook**
   - Enter webhook URL: `https://abc123.ngrok.io/api/payments/webhook`
   - Select events: `payment.captured`, `payment.authorized`, `payment.failed`
   - Copy the **Webhook Secret**

#### Option 2: Using localtunnel

1. **Install localtunnel**:
   ```bash
   npm install -g localtunnel
   ```

2. **Start tunnel**:
   ```bash
   lt --port 3001
   ```

3. **Use the provided URL** in Razorpay webhook settings

#### Option 3: Using Cloudflare Tunnel (cloudflared)

1. **Install cloudflared**:
   ```bash
   # Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   ```

2. **Start tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:3001
   ```

### For Production

1. In Razorpay Dashboard, go to **Settings** → **Webhooks**
2. Click **Add New Webhook**
3. Enter your production webhook URL:
   ```
   https://your-domain.com/api/payments/webhook
   ```
4. Select events to listen to:
   - `payment.captured`
   - `payment.authorized`
   - `payment.failed`
5. Copy the **Webhook Secret** (you'll need this for environment variables)

### Testing Webhooks Locally

After setting up a tunnel:

1. Update your `.env` with the webhook secret from Razorpay Dashboard
2. Make sure your tunnel is running
3. Test a payment - the webhook should be received by your local server
4. Check server logs for webhook events

**Note**: Each time you restart ngrok/localtunnel, you'll get a new URL. You may need to update the webhook URL in Razorpay Dashboard if you're using the free tier.

## Step 3: Configure Environment Variables

Update your `server/.env` file with the following:

```env
# Payment Gateway Configuration
PAYMENT_MODE=production  # Change from 'test' to 'production'

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### Example for Test Mode:
```env
PAYMENT_MODE=production
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Example for Live Mode:
```env
PAYMENT_MODE=production
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## Step 4: Test the Integration

### Test Mode (Development)
1. Use Razorpay test cards from [Razorpay Test Cards](https://razorpay.com/docs/payments/test-cards/)
2. Common test cards:
   - **Success**: `4111 1111 1111 1111`
   - **Failure**: `4000 0000 0000 0002`
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date

### Production Mode
1. Use real payment methods
2. Test with small amounts first
3. Monitor webhook events in Razorpay Dashboard

## Step 5: Verify Installation

1. Start your server:
   ```bash
   cd server
   npm run dev
   ```

2. Check server logs for:
   ```
   ✅ Razorpay initialized
   ```

3. Test payment flow:
   - Add items to cart
   - Proceed to checkout
   - Complete payment using Razorpay checkout

## Payment Flow

1. **Order Creation**: Frontend calls `/api/payments/create-order` to create a Razorpay order
2. **Checkout**: Razorpay checkout modal opens with payment options
3. **Payment**: User completes payment through Razorpay
4. **Verification**: Frontend calls `/api/payments/verify` to verify payment signature
5. **Order Confirmation**: Frontend calls `/api/payments/confirm` to create order in database
6. **Webhook** (Optional): Razorpay sends webhook to update order status

## Troubleshooting

### Razorpay not initialized
- Check if `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in `.env`
- Verify `PAYMENT_MODE=production` is set
- Restart the server after updating `.env`

### Payment verification fails
- Ensure you're using the correct key (test vs live)
- Check that the signature verification is working
- Verify webhook secret if using webhooks

### Webhook not receiving events
- **For localhost**: Use ngrok or similar tunneling service (see Step 2)
- Verify webhook URL is accessible from internet (test with browser or curl)
- Check webhook secret is correct in `.env`
- Ensure webhook events are enabled in Razorpay Dashboard
- Check server logs for webhook errors
- Verify the tunnel is running and pointing to correct port
- Test webhook URL manually: `curl -X POST https://your-webhook-url/api/payments/webhook`

### Test mode still active
- Verify `PAYMENT_MODE=production` in `.env`
- Check that Razorpay script is loaded in `index.html`
- Clear browser cache and reload

## Security Best Practices

1. **Never commit `.env` file** with real keys to version control
2. **Use environment variables** for all sensitive data
3. **Enable webhook signature verification** in production
4. **Use HTTPS** for webhook endpoints
5. **Rotate keys** periodically
6. **Monitor payment logs** regularly

## Support

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- Test Cards: https://razorpay.com/docs/payments/test-cards/

## Fallback to Test Mode

If Razorpay is not configured or fails to initialize, the application will automatically fall back to test mode, allowing you to test the complete order flow without real payments.

