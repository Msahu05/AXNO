// Email Templates for Looklyn

const emailTemplates = {
  // Order confirmation
  orderConfirmation: (order) => ({
    subject: `Order Confirmed - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #5c3d8a;">Looklyn - Own The Look</h2>
        <h3 style="color: #333;">Order Confirmed!</h3>
        <p>Dear ${order.userName},</p>
        <p>Thank you for your order! Your order has been confirmed and we're preparing it for you.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Total Amount:</strong> ₹${order.total.toLocaleString()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>
        <p>We'll send you another email when your order ships.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">If you have any questions, please contact our support team.</p>
      </div>
    `
  }),

  // Order status update
  orderStatusUpdate: (order, oldStatus) => ({
    subject: `Order ${order.orderId} - Status Updated`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #5c3d8a;">Looklyn - Own The Look</h2>
        <h3 style="color: #333;">Order Status Updated</h3>
        <p>Dear ${order.userName},</p>
        <p>Your order status has been updated:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Previous Status:</strong> ${oldStatus}</p>
          <p><strong>New Status:</strong> <span style="color: #5c3d8a; font-weight: bold;">${order.status}</span></p>
        </div>
        ${order.status === 'shipped' ? '<p>Your order has been shipped! You can track it using the order ID.</p>' : ''}
        ${order.status === 'delivered' ? '<p>Your order has been delivered! We hope you love your purchase.</p>' : ''}
        <p style="color: #666; font-size: 12px; margin-top: 30px;">If you have any questions, please contact our support team.</p>
      </div>
    `
  }),

  // Login notification
  loginNotification: (user, loginTime, resetLink) => ({
    subject: 'New Login to Your Looklyn Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #5c3d8a;">Looklyn - Own The Look</h2>
        <h3 style="color: #333;">New Login Detected</h3>
        <p>Dear ${user.name},</p>
        <p>We noticed a new login to your Looklyn account:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Time:</strong> ${new Date(loginTime).toLocaleString()}</p>
        </div>
        <p>If this wasn't you, please secure your account immediately by resetting your password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #5c3d8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Recover Password</a>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">If you have any concerns, please contact our support team.</p>
      </div>
    `
  }),

  // Password reset link
  passwordResetLink: (userName, resetLink) => ({
    subject: 'Reset Your Looklyn Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #5c3d8a;">Looklyn - Own The Look</h2>
        <h3 style="color: #333;">Password Reset Request</h3>
        <p>Dear ${userName},</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #5c3d8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
      </div>
    `
  }),

  // Welcome email
  welcomeEmail: (userName) => ({
    subject: 'Welcome to Looklyn - Own The Look!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #5c3d8a;">Looklyn - Own The Look</h2>
        <h3 style="color: #333;">Welcome, ${userName}!</h3>
        <p>Thank you for joining Looklyn! We're excited to have you as part of our community.</p>
        <p>Start exploring our custom upperwear collection and create your unique style.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">Happy shopping!</p>
      </div>
    `
  }),

  // Admin order notification
  adminOrderNotification: (order, customer) => ({
    subject: `🆕 New Order Received - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #5c3d8a;">Looklyn - Admin Notification</h2>
        <h3 style="color: #333; background: #f0f0f0; padding: 15px; border-radius: 8px;">🆕 New Order Placed!</h3>
        <p>Dear Admin,</p>
        <p>A new order has been placed on Looklyn. Please review the details below:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #5c3d8a; margin-top: 0;">Order Details</h4>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleString()}</p>
          <p><strong>Order Status:</strong> <span style="color: #5c3d8a; font-weight: bold;">${order.status || 'processing'}</span></p>
          <p><strong>Total Amount:</strong> ₹${(order.total || 0).toLocaleString()}</p>
          <p><strong>Subtotal:</strong> ₹${(order.subtotal || 0).toLocaleString()}</p>
          <p><strong>Shipping:</strong> ₹${(order.shipping || 0).toLocaleString()}</p>
          <p><strong>Tax:</strong> ₹${(order.tax || 0).toLocaleString()}</p>
        </div>
        <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #5c3d8a; margin-top: 0;">Customer Information</h4>
          <p><strong>Name:</strong> ${customer.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
        </div>
        ${order.shippingAddress ? `
        <div style="background: #fff9e6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #5c3d8a; margin-top: 0;">Shipping Address</h4>
          <p>${order.shippingAddress.name || ''}</p>
          <p>${order.shippingAddress.address || ''}</p>
          <p>${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.zipCode || order.shippingAddress.pincode || ''}</p>
          <p>Phone: ${order.shippingAddress.phone || 'N/A'}</p>
        </div>
        ` : ''}
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Items Count:</strong> ${order.items ? order.items.length : 0} item(s)</p>
          ${order.items && order.items.length > 0 ? `
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${order.items.slice(0, 3).map(item => `
                <li>${item.name || 'Product'} - Qty: ${item.quantity || 1} - ₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</li>
              `).join('')}
              ${order.items.length > 3 ? `<li>...and ${order.items.length - 3} more item(s)</li>` : ''}
            </ul>
          ` : ''}
        </div>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin?tab=orders" 
             style="background-color: #5c3d8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            View Order in Admin Panel
          </a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">This is an automated notification from Looklyn admin system.</p>
      </div>
    `
  })
};

// Helper function to send emails via SMTP
const sendEmail = async (transporter, to, subject, html) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email not configured: EMAIL_USER and EMAIL_PASS must be set in server/.env');
      return { success: false, error: 'Email service not configured' };
    }

    // FROM_EMAIL is REQUIRED - must be a verified sender email in Brevo
    // EMAIL_USER is the SMTP login and cannot be used as "from" address
    if (!process.env.FROM_EMAIL) {
      console.error('❌ FROM_EMAIL not configured! You must set FROM_EMAIL in server/.env');
      console.error('   FROM_EMAIL must be a verified sender email in Brevo (not the SMTP login)');
      console.error('   Go to Brevo Dashboard → Settings → Senders → Add and verify a sender');
      return { 
        success: false, 
        error: 'FROM_EMAIL not configured. Please add a verified sender email in Brevo and set FROM_EMAIL in .env' 
      };
    }
    
    const fromEmail = process.env.FROM_EMAIL;
    
    const mailOptions = {
      from: `Looklyn <${fromEmail}>`, // Sender email with name (must be verified in Brevo)
      to, // Recipient email address
      subject, // Email subject
      html // Email body (HTML format)
    };

    console.log(`📧 Attempting to send email to ${to} from ${fromEmail}`);
    
    // Send email via SMTP
    const info = await transporter.sendMail(mailOptions);
    
    // Log detailed response from SMTP server
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response || 'No response'}`);
    
    return { 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error command:', error.command);
    
    // Check for specific Brevo sender validation errors
    if (error.message && error.message.includes('sender') && error.message.includes('not valid')) {
      console.error('   ⚠️  SENDER VALIDATION ERROR:');
      console.error('   The sender email is not verified in Brevo.');
      console.error('   SOLUTION:');
      console.error('   1. Go to Brevo Dashboard → Settings → Senders');
      console.error('   2. Click "Add a sender" or "Create a new sender"');
      console.error('   3. Add your email address (e.g., noreply@yourdomain.com)');
      console.error('   4. Verify the email by clicking the verification link sent to that email');
      console.error('   5. Set FROM_EMAIL in server/.env to the verified email');
    }
    
    // Check for specific Brevo errors
    if (error.response) {
      console.error('   SMTP Response:', error.response);
    }
    if (error.responseCode) {
      console.error('   SMTP Response Code:', error.responseCode);
    }
    
    console.error('   Full error:', JSON.stringify(error, null, 2));
    
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      response: error.response
    };
  }
};

export { emailTemplates, sendEmail };

