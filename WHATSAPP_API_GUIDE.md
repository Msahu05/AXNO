# WhatsApp API Integration Guide

This guide will help you integrate WhatsApp Business API for:
1. **OTP Verification** - Send OTP codes via WhatsApp for mobile verification
2. **Order Confirmations** - Send order confirmation messages directly to WhatsApp

## Overview

There are two main approaches to WhatsApp integration:

### Option 1: WhatsApp Business API (Official - Recommended for Production)
- **Provider**: Meta (Facebook) WhatsApp Business API
- **Cost**: Pay-per-message (varies by country, ~$0.005-0.01 per message in India)
- **Setup**: Requires business verification
- **Best for**: Production use, high volume

### Option 2: WhatsApp Cloud API (Free Tier Available)
- **Provider**: Meta WhatsApp Cloud API
- **Cost**: Free tier available (1000 conversations/month)
- **Setup**: Easier setup, no business verification needed initially
- **Best for**: Development and small-scale production

### Option 3: Third-Party Services (Easier Integration)
- **Providers**: Twilio, MessageBird, 360dialog, etc.
- **Cost**: Varies by provider
- **Setup**: Easier, handles API complexity
- **Best for**: Quick integration, managed service

---

## Recommended: WhatsApp Cloud API (Free Tier)

We'll use **WhatsApp Cloud API** as it's the easiest to set up and has a free tier.

### Step 1: Create Meta Developer Account

1. Go to https://developers.facebook.com/
2. Click "Get Started" and create a developer account
3. Create a new app:
   - Click "Create App"
   - Select "Business" type
   - Enter app name (e.g., "Looklyn E-commerce")
   - Enter contact email

### Step 2: Add WhatsApp Product

1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. You'll get:
   - **Phone Number ID**
   - **WhatsApp Business Account ID**
   - **Temporary Access Token** (valid for 24 hours)

### Step 3: Get Permanent Access Token

1. Go to **WhatsApp > API Setup** in your app dashboard
2. Click "Generate Token" under "Temporary access token"
3. Select your WhatsApp Business Account
4. Copy the token (starts with `EAA...`)

### Step 4: Get Phone Number

1. In **WhatsApp > API Setup**, you'll see a phone number
2. This is your WhatsApp Business number (format: +1XXXXXXXXXX)
3. Users will receive messages from this number

### Step 5: Set Up Webhook (Optional for now)

For receiving message status updates, you can set up a webhook later.

---

## Implementation Steps

### 1. Install Required Package

```bash
cd server
npm install axios
```

### 2. Create WhatsApp Service

Create `server/whatsappService.js`:

```javascript
import axios from 'axios';

// WhatsApp Cloud API Configuration
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

/**
 * Send WhatsApp message
 * @param {string} to - Phone number in format: 919876543210 (without +)
 * @param {string} message - Message text
 * @returns {Promise} API response
 */
export const sendWhatsAppMessage = async (to, message) => {
  try {
    // Format phone number (remove +, spaces, etc.)
    const phoneNumber = to.replace(/[^0-9]/g, '');
    
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, messageId: response.data.messages[0].id };
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.error?.message || error.message 
    };
  }
};

/**
 * Send OTP via WhatsApp
 * @param {string} phoneNumber - User's phone number
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise} API response
 */
export const sendOTPviaWhatsApp = async (phoneNumber, otp) => {
  const message = `🔐 Your Looklyn verification code is: *${otp}*\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this message.`;
  
  return await sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Send order confirmation via WhatsApp
 * @param {string} phoneNumber - User's phone number
 * @param {Object} order - Order object with details
 * @returns {Promise} API response
 */
export const sendOrderConfirmation = async (phoneNumber, order) => {
  const itemsList = order.items.map(item => 
    `• ${item.name} (${item.size}) - ₹${item.price} x ${item.quantity}`
  ).join('\n');

  const message = `✅ *Order Confirmed!*\n\n` +
    `Order ID: *${order.orderId}*\n` +
    `Total: *₹${order.total}*\n\n` +
    `*Items:*\n${itemsList}\n\n` +
    `*Shipping Address:*\n${order.shippingAddress.name}\n` +
    `${order.shippingAddress.address}\n` +
    `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}\n\n` +
    `We'll confirm your order details on WhatsApp within 12 hours. Thank you for choosing Looklyn! 🎉`;

  return await sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Send order status update via WhatsApp
 * @param {string} phoneNumber - User's phone number
 * @param {Object} order - Order object
 * @param {string} newStatus - New order status
 * @returns {Promise} API response
 */
export const sendOrderStatusUpdate = async (phoneNumber, order, newStatus) => {
  const statusMessages = {
    'processing': '🔄 Your order is being processed',
    'shipped': '🚚 Your order has been shipped!',
    'delivered': '✅ Your order has been delivered!',
    'cancelled': '❌ Your order has been cancelled'
  };

  const message = `${statusMessages[newStatus] || '📦 Order Status Update'}\n\n` +
    `Order ID: *${order.orderId}*\n` +
    `Status: *${newStatus.toUpperCase()}*\n\n` +
    `We'll keep you updated on your order progress.`;

  return await sendWhatsAppMessage(phoneNumber, message);
};
```

### 3. Update Environment Variables

Add to `server/.env`:

```env
# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
```

### 4. Update OTP Endpoint

In `server/index.js`, update the OTP sending endpoint:

```javascript
import { sendOTPviaWhatsApp } from './whatsappService.js';

// In your send-otp endpoint, add WhatsApp option:
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, phone, mode } = req.body; // Add phone parameter
    
    // ... existing OTP generation code ...
    
    // Send via WhatsApp if phone provided
    if (phone) {
      const whatsappResult = await sendOTPviaWhatsApp(phone, otpCode);
      if (whatsappResult.success) {
        return res.json({ 
          message: 'OTP sent successfully via WhatsApp',
          method: 'whatsapp'
        });
      }
    }
    
    // Fallback to email
    const emailResult = await sendEmail(transporter, email, ...);
    // ... rest of code
  } catch (error) {
    // ... error handling
  }
});
```

### 5. Update Order Confirmation

In `server/index.js`, in your payment confirmation endpoint:

```javascript
import { sendOrderConfirmation, sendOrderStatusUpdate } from './whatsappService.js';

// After order is created/confirmed:
if (user.phone) {
  await sendOrderConfirmation(user.phone, order).catch(err => 
    console.error('Failed to send WhatsApp confirmation:', err)
  );
}
```

### 6. Update Order Status Endpoint

In your order status update endpoint:

```javascript
// When order status changes:
if (order.userId.phone) {
  await sendOrderStatusUpdate(order.userId.phone, order, newStatus).catch(err =>
    console.error('Failed to send WhatsApp status update:', err)
  );
}
```

---

## Testing

### Test WhatsApp Message

Create a test endpoint in `server/index.js`:

```javascript
import { sendWhatsAppMessage } from './whatsappService.js';

app.post('/api/test/whatsapp', authenticateToken, async (req, res) => {
  try {
    const { phone, message } = req.body;
    const result = await sendWhatsAppMessage(phone, message || 'Test message from Looklyn!');
    
    if (result.success) {
      res.json({ success: true, message: 'WhatsApp message sent successfully' });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Test with:
```bash
curl -X POST http://localhost:3001/api/test/whatsapp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "919876543210", "message": "Test message"}'
```

---

## Important Notes

### Phone Number Format
- **Always use format without +**: `919876543210` (not `+91 9876543210`)
- Remove all spaces, dashes, and plus signs
- Include country code (91 for India)

### Rate Limits
- **Free Tier**: 1000 conversations/month
- **Paid Tier**: Based on your plan
- Messages sent within 24 hours count as one conversation

### Message Templates (Required for some messages)
- For messages sent outside 24-hour window, you need message templates
- Templates must be approved by Meta
- For OTP and order confirmations, you can use templates

### Webhook Setup (Optional)
To receive delivery receipts and read receipts, set up a webhook:
1. Go to WhatsApp > Configuration in Meta App Dashboard
2. Add webhook URL: `https://yourdomain.com/api/whatsapp/webhook`
3. Verify webhook token
4. Subscribe to `messages` events

---

## Alternative: Using Twilio WhatsApp API

If you prefer a managed service:

```bash
npm install twilio
```

```javascript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendWhatsAppMessage = async (to, message) => {
  try {
    const result = await client.messages.create({
      from: 'whatsapp:+14155238886', // Twilio WhatsApp number
      to: `whatsapp:+${to}`,
      body: message
    });
    return { success: true, messageId: result.sid };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

---

## Next Steps

1. ✅ Set up Meta Developer Account
2. ✅ Get WhatsApp Phone Number ID and Access Token
3. ✅ Add environment variables
4. ✅ Create `whatsappService.js`
5. ✅ Update OTP endpoint to support WhatsApp
6. ✅ Update order confirmation to send WhatsApp messages
7. ✅ Test with your phone number
8. ⏭️ Set up message templates (for production)
9. ⏭️ Set up webhook (for delivery receipts)

---

## Troubleshooting

### Error: "Invalid OAuth access token"
- Check if your access token is correct
- Regenerate token if expired

### Error: "Invalid phone number"
- Ensure phone number format is correct (no +, spaces, etc.)
- Include country code

### Error: "Rate limit exceeded"
- You've exceeded free tier limit
- Upgrade to paid plan or wait for next month

### Messages not received
- Check if phone number is registered on WhatsApp
- Verify access token is valid
- Check Meta App Dashboard for error logs

---

## Resources

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [WhatsApp Business API Pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/message-templates)

