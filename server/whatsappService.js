import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables (in case they weren't loaded yet)
dotenv.config();

// WhatsApp Cloud API Configuration
// Read from process.env each time to ensure latest values
const getWhatsAppConfig = () => {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const apiUrl = phoneNumberId 
    ? `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`
    : null;
  return { phoneNumberId, accessToken, apiUrl };
};

/**
 * Format phone number for WhatsApp API
 * Removes +, spaces, and ensures country code is present
 * @param {string} phone - Phone number in any format
 * @returns {string} Formatted phone number (e.g., 919876543210)
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  // Remove all non-numeric characters
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  // If number starts with 0, remove it (for Indian numbers)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // If number doesn't start with country code, assume India (91)
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
};

/**
 * Check if WhatsApp is configured
 * @returns {boolean}
 */
export const isWhatsAppConfigured = () => {
  const { phoneNumberId, accessToken, apiUrl } = getWhatsAppConfig();
  const configured = !!(phoneNumberId && accessToken && apiUrl);
  if (!configured) {
    console.warn('⚠️  WhatsApp not configured. Missing:', {
      hasPhoneNumberId: !!phoneNumberId,
      hasAccessToken: !!accessToken,
      phoneNumberId: phoneNumberId ? 'Set' : 'Missing',
      accessToken: accessToken ? 'Set (length: ' + accessToken.length + ')' : 'Missing'
    });
  }
  return configured;
};

/**
 * Send WhatsApp message
 * @param {string} to - Phone number in any format (will be formatted automatically)
 * @param {string} message - Message text
 * @returns {Promise} API response
 */
export const sendWhatsAppMessage = async (to, message) => {
  console.log('📱 Attempting to send WhatsApp message to:', to);
  
  const { phoneNumberId, accessToken, apiUrl } = getWhatsAppConfig();
  
  if (!isWhatsAppConfigured()) {
    console.warn('❌ WhatsApp not configured. Please add WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to .env');
    return { 
      success: false, 
      error: 'WhatsApp not configured' 
    };
  }

  try {
    const phoneNumber = formatPhoneNumber(to);
    console.log('📞 Formatted phone number:', phoneNumber, '(from:', to, ')');
    
    if (!phoneNumber) {
      console.error('❌ Invalid phone number format:', to);
      return { 
        success: false, 
        error: 'Invalid phone number format' 
      };
    }

    console.log('📤 Sending WhatsApp message via API:', apiUrl);
    console.log('📝 Message preview:', message.substring(0, 50) + '...');
    console.log('🔑 Access Token (first 20 chars):', accessToken ? accessToken.substring(0, 20) + '...' : 'Missing');

    const response = await axios.post(
      apiUrl,
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
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsApp message sent successfully! Message ID:', response.data.messages[0].id);
    return { 
      success: true, 
      messageId: response.data.messages[0].id 
    };
  } catch (error) {
    console.error('❌ WhatsApp API Error Details:');
    console.error('   Status:', error.response?.status);
    console.error('   Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('   Error Message:', error.message);
    return { 
      success: false, 
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error
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
  const message = `🔐 *Looklyn Verification Code*\n\n` +
    `Your OTP is: *${otp}*\n\n` +
    `This code will expire in 10 minutes.\n\n` +
    `If you didn't request this code, please ignore this message.\n\n` +
    `_Do not share this code with anyone._`;
  
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
    `• ${item.name} (Size: ${item.size}) - ₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}`
  ).join('\n');

  const message = `✅ *Order Confirmed!*\n\n` +
    `Thank you for your order with Looklyn!\n\n` +
    `*Order Details:*\n` +
    `Order ID: *${order.orderId}*\n` +
    `Total Amount: *₹${order.total?.toLocaleString('en-IN') || 0}*\n\n` +
    `*Items Ordered:*\n${itemsList}\n\n` +
    `*Shipping Address:*\n` +
    `${order.shippingAddress?.name || 'N/A'}\n` +
    `${order.shippingAddress?.address || ''}\n` +
    `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.pincode || ''}\n` +
    `Phone: ${order.shippingAddress?.phone || 'N/A'}\n\n` +
    `We'll process your order and keep you updated via WhatsApp.\n\n` +
    `Thank you for choosing Looklyn! 🎉`;

  return await sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Send order status update via WhatsApp
 * @param {string} phoneNumber - User's phone number
 * @param {Object} order - Order object
 * @param {string} newStatus - New order status
 * @param {Object} trackingInfo - Optional tracking information
 * @returns {Promise} API response
 */
export const sendOrderStatusUpdate = async (phoneNumber, order, newStatus, trackingInfo = {}) => {
  const statusMessages = {
    'order_placed': '📦 Your order has been placed',
    'confirmed': '✅ Your order has been confirmed',
    'processing': '🔄 Your order is being processed',
    'shipped': '🚚 Your order has been shipped!',
    'in_transit': '🚛 Your order is in transit',
    'out_for_delivery': '🚗 Your order is out for delivery',
    'delivered': '✅ Your order has been delivered!',
    'cancelled': '❌ Your order has been cancelled'
  };

  let message = `${statusMessages[newStatus] || '📦 Order Status Update'}\n\n` +
    `Order ID: *${order.orderId}*\n` +
    `Status: *${newStatus.replace(/_/g, ' ').toUpperCase()}*\n`;

  if (trackingInfo.trackingNumber) {
    message += `Tracking Number: *${trackingInfo.trackingNumber}*\n`;
  }

  if (trackingInfo.location) {
    message += `Current Location: ${trackingInfo.location}\n`;
  }

  if (trackingInfo.message) {
    message += `\n${trackingInfo.message}\n`;
  }

  message += `\nWe'll keep you updated on your order progress.`;

  return await sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Send tracking update via WhatsApp
 * @param {string} phoneNumber - User's phone number
 * @param {Object} order - Order object
 * @param {Object} trackingUpdate - Tracking update object
 * @returns {Promise} API response
 */
export const sendTrackingUpdate = async (phoneNumber, order, trackingUpdate) => {
  return await sendOrderStatusUpdate(
    phoneNumber, 
    order, 
    trackingUpdate.status, 
    {
      trackingNumber: trackingUpdate.trackingNumber,
      location: trackingUpdate.location,
      message: trackingUpdate.message
    }
  );
};

