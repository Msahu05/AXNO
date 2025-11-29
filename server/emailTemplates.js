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

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email address
      to, // Recipient email address
      subject, // Email subject
      html // Email body (HTML format)
    };

    // Send email via SMTP
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    return { success: false, error: error.message };
  }
};

export { emailTemplates, sendEmail };

