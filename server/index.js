import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// IMPORTANT: Load environment variables BEFORE importing services that use them
// Get __dirname for ES modules and load .env explicitly from server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import { emailTemplates, sendEmail } from './emailTemplates.js';
import { 
  sendOTPviaWhatsApp, 
  sendOrderConfirmation, 
  sendOrderStatusUpdate,
  sendTrackingUpdate,
  isWhatsAppConfigured 
} from './whatsappService.js';

// Payment Gateway Configuration
const PAYMENT_MODE = process.env.PAYMENT_MODE || 'test'; // 'test' or 'production'

const app = express();
app.use(cors());
// Increase body parser limit to handle base64 images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif) and documents (pdf, doc, docx) are allowed'));
    }
  }
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/axno';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server will start but authentication will not work without MongoDB');
    console.log('💡 To fix: Start MongoDB or set MONGODB_URI in .env file');
  });

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: '' }, // Optional for Google OAuth users
  googleId: { type: String, default: '' }, // For Google OAuth
  authMethod: { type: String, enum: ['email', 'google'], default: 'email' }, // How user registered
  phone: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  addresses: [{
    name: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    isDefault: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  passwordResetToken: { type: String, default: '' },
  passwordResetExpires: { type: Date }
});

const User = mongoose.model('User', userSchema);

// OTP Schema
const otpSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 10 * 60 * 1000) }, // 10 minutes
  verified: { type: Boolean, default: false },
  purpose: { type: String, default: 'verification' } // 'verification' or 'password-reset'
});

const OTP = mongoose.model('OTP', otpSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  attachments: [{
    type: { type: String, enum: ['image', 'file'], required: true },
    url: { type: String, required: true },
    name: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: String, default: null }, // Optional - for custom products
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, default: 'Custom' },
    audience: { type: String, default: 'Unisex' }
  }],
  shippingAddress: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  customDesign: {
    files: [{ type: String }], // File URLs
    referenceLinks: { type: String, default: '' },
    instructions: { type: String, default: '' },
    submittedAt: { type: Date }
  },
  payment: {
    method: { type: String, default: 'stripe' },
    transactionId: { type: String, default: '' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paidAt: { type: Date }
  },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  tracking: {
    status: { 
      type: String, 
      enum: ['order_placed', 'confirmed', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'], 
      default: 'order_placed' 
    },
    trackingNumber: { type: String, default: '' },
    estimatedDelivery: { type: Date },
    updates: [{
      status: { type: String, required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      location: { type: String, default: '' }
    }]
  },
  total: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Function to generate slug from product name
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true }, // URL-friendly slug
  description: { type: String, default: '' },
  category: { type: String, required: true, enum: ['Hoodie', 'T-Shirt', 'Sweatshirt'] },
  audience: { type: String, required: true, enum: ['men', 'women', 'kids'] },
  price: { type: Number, required: true }, // Current price
  originalPrice: { type: Number, required: true }, // Previous price
  accent: { type: String, default: 'linear-gradient(135deg,#5c3d8a,#7a5bff)' },
  gallery: [{
    url: { type: String, default: '' }, // Keep for backward compatibility
    data: { type: String, default: '' }, // Base64 image data
    mimeType: { type: String, default: 'image/jpeg' }, // Image MIME type
    isMain: { type: Boolean, default: false }, // Main image flag
    order: { type: Number, default: 0 } // Order in gallery
  }],
  colorOptions: [{
    name: { type: String, required: true }, // Color name (e.g., "Black", "Navy Blue")
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null }, // Link to other color variant (optional)
    hexCode: { type: String, default: '' }, // Color hex code for display
    hex: { type: String, default: '' } // Alternative hex field name
  }],
  sizes: { type: [String], default: ['S', 'M', 'L', 'XL'] },
  stock: { type: Number, default: 0 }, // Stock quantity
  isActive: { type: Boolean, default: true }, // Product visibility
  tags: [{ type: String }], // Product tags for search
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.index({ category: 1, audience: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ slug: 1 }); // Index for slug lookups

// Pre-save hook to generate slug from name if not provided
productSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    let baseSlug = generateSlug(this.name);
    this.slug = baseSlug;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

// Size Chart Schema
const sizeChartSchema = new mongoose.Schema({
  category: { type: String, required: true, enum: ['Hoodie', 'T-Shirt', 'Sweatshirt'], unique: true },
  fitDescription: { type: String, default: 'Oversized Fit' },
  fitDetails: { type: String, default: 'Falls loosely on the body' },
  measurements: {
    inches: {
      type: Map,
      of: {
        type: Map,
        of: Number
      }
    },
    cms: {
      type: Map,
      of: {
        type: Map,
        of: Number
      }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SizeChart = mongoose.model('SizeChart', sizeChartSchema);

// Generate unique order ID
// Generate sequential order ID in format ODR-001, ODR-002, etc.
const generateOrderId = async () => {
  try {
    // Find all orders with ODR- format and get the highest number
    const orders = await Order.find({ orderId: /^ODR-\d+$/ })
      .select('orderId')
      .sort({ orderId: -1 })
      .limit(1);
    
    let nextNum = 1;
    
    if (orders.length > 0 && orders[0].orderId) {
      // Extract the numeric part from the order ID (e.g., "ODR-001" -> 1)
      const match = orders[0].orderId.match(/ODR-(\d+)/);
      if (match && match[1]) {
        const lastNum = parseInt(match[1]);
        if (!isNaN(lastNum) && lastNum >= 1) {
          nextNum = lastNum + 1;
        }
      }
    }
    
    // Generate the new order ID
    let newOrderId = `ODR-${nextNum.toString().padStart(3, '0')}`;
    
    // Double-check that this ID doesn't already exist (race condition protection)
    let attempts = 0;
    while (attempts < 100) {
      const existing = await Order.findOne({ orderId: newOrderId });
      if (!existing) {
        return newOrderId;
      }
      // If it exists, try the next number
      nextNum++;
      newOrderId = `ODR-${nextNum.toString().padStart(3, '0')}`;
      attempts++;
    }
    
    // If we've tried 100 times and still have duplicates, use timestamp fallback
    console.warn('Warning: Could not generate unique sequential order ID, using timestamp fallback');
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ODR-${timestamp}-${random}`;
  } catch (error) {
    console.error('Error generating order ID:', error);
    // Fallback: use timestamp-based ID if there's an error
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ODR-${timestamp}-${random}`;
  }
};

// Email transporter setup (SMTP Configuration)
// ============================================
// STEP 1: Choose your email service (Gmail, SendGrid, Mailgun, etc.)
// STEP 2: Add your credentials to server/.env file:
//   EMAIL_USER=your-email@gmail.com
//   EMAIL_PASS=your-app-password-or-smtp-password
// STEP 3: Restart your server
// ============================================

const transporter = nodemailer.createTransport({
  service: 'gmail', // Options: 'gmail', 'outlook', 'yahoo', or use custom SMTP (see below)
  
  // For Gmail, Outlook, Yahoo - use 'service' above
  // For custom SMTP, comment out 'service' and use:
  // host: process.env.SMTP_HOST || 'smtp.gmail.com',
  // port: process.env.SMTP_PORT || 587,
  // secure: false, // true for 465, false for 587
  
  auth: {
    user: process.env.EMAIL_USER, // Your email address (REQUIRED)
    pass: process.env.EMAIL_PASS  // Your email password/app password (REQUIRED)
  }
});

// Test email connection on server start
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email configuration error:', error.message);
    console.log('⚠️  Emails will not be sent until EMAIL_USER and EMAIL_PASS are configured in server/.env');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to verify admin access
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      // Check if user is admin
      const user = await User.findById(decoded.userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      req.user = decoded;
      req.adminUser = user;
      next();
    });
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, phone, mode } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    // For login, check if user exists
    if (mode === 'login') {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found. Please sign up first.' });
      }
    }

    // For signup, check if user already exists
    if (mode === 'signup') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists. Please login instead.' });
      }
    }

    // Delete old OTPs for this email/phone
    if (email) {
      await OTP.deleteMany({ email });
    }
    if (phone) {
      await OTP.deleteMany({ phone });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const otp = new OTP({
      email: email || '',
      phone: phone || '',
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await otp.save();

    let sentVia = [];
    let errors = [];

    // Send via WhatsApp if phone provided and WhatsApp is configured
    if (phone) {
      console.log('📱 Attempting to send OTP via WhatsApp to:', phone);
      if (isWhatsAppConfigured()) {
        const whatsappResult = await sendOTPviaWhatsApp(phone, otpCode);
        if (whatsappResult.success) {
          sentVia.push('whatsapp');
          console.log('✅ OTP sent via WhatsApp to:', phone);
        } else {
          errors.push(`WhatsApp: ${whatsappResult.error}`);
          console.error('❌ Failed to send OTP via WhatsApp:', whatsappResult.error);
          if (whatsappResult.details) {
            console.error('   Error details:', JSON.stringify(whatsappResult.details, null, 2));
          }
        }
      } else {
        console.warn('⚠️  WhatsApp not configured. Skipping WhatsApp OTP.');
        errors.push('WhatsApp: Not configured');
      }
    }

    // Send via email if email provided
    if (email) {
      const emailResult = await sendEmail(transporter, email,
        'Looklyn - Email Verification OTP',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #5c3d8a;">Looklyn - Own The Look</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #5c3d8a; font-size: 32px; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">${otpCode}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `
      );

      if (emailResult.success) {
        sentVia.push('email');
      } else {
        errors.push(`Email: ${emailResult.error || 'Failed to send email'}`);
      }
    }

    if (sentVia.length > 0) {
      res.json({ 
        message: `OTP sent successfully via ${sentVia.join(' and ')}`,
        methods: sentVia,
        ...(errors.length > 0 && { warnings: errors })
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send OTP', 
        details: errors 
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find OTP (by email or phone)
    const otpRecord = await OTP.findOne({ 
      $or: [{ email }, { phone: email }], 
      otp, 
      verified: false 
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'All fields including phone number are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Format phone number
    let formattedPhone = phone || '';
    if (formattedPhone && !formattedPhone.startsWith('+91')) {
      const cleaned = formattedPhone.replace(/^\+91\s*/, '').replace(/^91\s*/, '').trim();
      formattedPhone = '+91 ' + cleaned;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone: formattedPhone,
      addresses: []
    });

    await user.save();

    // Send welcome email
    sendEmail(transporter, user.email,
      emailTemplates.welcomeEmail(user.name).subject,
      emailTemplates.welcomeEmail(user.name).html
    ).catch(err => console.error('Failed to send welcome email:', err));

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        isAdmin: user.isAdmin || false,
        addresses: user.addresses,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// OTP-based Signup
app.post('/api/auth/signup-otp', async (req, res) => {
  try {
    const { name, email, otp, phone } = req.body;

    if (!name || !email || !otp || !phone) {
      return res.status(400).json({ error: 'All fields including phone number are required' });
    }

    // Find OTP
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      verified: false,
      purpose: 'verification'
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Format phone number
    let formattedPhone = phone || '';
    if (formattedPhone && !formattedPhone.startsWith('+91')) {
      const cleaned = formattedPhone.replace(/^\+91\s*/, '').replace(/^91\s*/, '').trim();
      formattedPhone = '+91 ' + cleaned;
    }

    // Create user (no password for OTP signup)
    const user = new User({
      name,
      email,
      password: '', // No password for OTP-based signup
      phone: formattedPhone,
      authMethod: 'email',
      addresses: []
    });

    await user.save();

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Send welcome email
    sendEmail(transporter, user.email,
      emailTemplates.welcomeEmail(user.name).subject,
      emailTemplates.welcomeEmail(user.name).html
    ).catch(err => console.error('Failed to send welcome email:', err));

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        isAdmin: user.isAdmin || false,
        addresses: user.addresses,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('OTP signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Google OAuth Sign-in
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleId, email, name, image } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({ error: 'Google ID, email, and name are required' });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (user) {
      // User exists - update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authMethod = 'google';
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId,
        password: '', // No password for Google OAuth
        authMethod: 'google',
        addresses: []
      });
      await user.save();

      // Send welcome email
      sendEmail(transporter, user.email,
        emailTemplates.welcomeEmail(user.name).subject,
        emailTemplates.welcomeEmail(user.name).html
      ).catch(err => console.error('Failed to send welcome email:', err));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Generate password reset token for recovery link
    const resetToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send login notification email with recovery link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
    sendEmail(transporter, user.email,
      emailTemplates.loginNotification(user, new Date(), resetLink).subject,
      emailTemplates.loginNotification(user, new Date(), resetLink).html
    ).catch(err => console.error('Failed to send login notification:', err));

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        isAdmin: user.isAdmin || false,
        addresses: user.addresses,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user registered with Google
    if (user.authMethod === 'google') {
      return res.status(400).json({ 
        error: 'This account was created with Google Sign-In. Please use Google Sign-In to login.',
        authMethod: 'google'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Generate password reset token for recovery link
    const resetToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send login notification email with recovery link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
    sendEmail(transporter, user.email, 
      emailTemplates.loginNotification(user, new Date(), resetLink).subject,
      emailTemplates.loginNotification(user, new Date(), resetLink).html
    ).catch(err => console.error('Failed to send login notification:', err));

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        isAdmin: user.isAdmin || false,
        addresses: user.addresses,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// OTP-based Login
app.post('/api/auth/login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find OTP
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      verified: false,
      purpose: 'login'
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Generate password reset token for recovery link
    const resetToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send login notification email with recovery link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
    sendEmail(transporter, user.email,
      emailTemplates.loginNotification(user, new Date(), resetLink).subject,
      emailTemplates.loginNotification(user, new Date(), resetLink).html
    ).catch(err => console.error('Failed to send login notification:', err));

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        isAdmin: user.isAdmin || false,
        addresses: user.addresses,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('OTP login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send OTP for login
app.post('/api/auth/send-login-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    // Delete old OTPs
    await OTP.deleteMany({ email, purpose: 'login' });

    // Generate OTP
    const otpCode = generateOTP();
    const otp = new OTP({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      purpose: 'login'
    });

    await otp.save();

    // Send email via SMTP
    const emailResult = await sendEmail(transporter, email,
      'Looklyn - Login OTP',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5c3d8a;">Looklyn - Own The Look</h2>
          <p>Your login verification code is:</p>
          <h1 style="color: #5c3d8a; font-size: 32px; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">${otpCode}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    );

    if (emailResult.success) {
      res.json({ message: 'OTP sent successfully' });
    } else {
      res.status(500).json({ error: emailResult.error || 'Failed to send email' });
    }
  } catch (error) {
    console.error('Send login OTP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot Password - Send Reset Link
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }

    // Generate password reset token
    const resetToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;

    // Send email with reset link
    const emailResult = await sendEmail(transporter, email,
      emailTemplates.passwordResetLink(user.name, resetLink).subject,
      emailTemplates.passwordResetLink(user.name, resetLink).html
    );

    // Always return success message (don't reveal if email exists for security)
    if (emailResult.success) {
      res.json({ message: 'If the email exists, a password reset link has been sent' });
    } else {
      // Still return success to prevent email enumeration
      res.json({ message: 'If the email exists, a password reset link has been sent' });
      console.error('Failed to send password reset email:', emailResult.error);
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password - Verify Token and Set New Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if token matches and is not expired
    if (user.passwordResetToken !== token) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = '';
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify Reset Token (for frontend to check if token is valid)
app.get('/api/auth/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if token matches and is not expired
    if (user.passwordResetToken !== token) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    res.json({ valid: true, email: user.email });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Debug: Log the isAdmin value and full user object
    console.log('=== GET /api/auth/me ===');
    console.log('User email:', user.email);
    console.log('User isAdmin (raw):', user.isAdmin);
    console.log('User isAdmin (type):', typeof user.isAdmin);
    console.log('User isAdmin (=== true):', user.isAdmin === true);
    console.log('Full user object:', JSON.stringify(user.toObject(), null, 2));
    
    // Explicitly check for true (handle both boolean true and string "true")
    const isAdminValue = user.isAdmin === true || user.isAdmin === 'true' || user.isAdmin === 1;
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      isAdmin: isAdminValue,
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add address
app.post('/api/user/addresses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, address, city, state, pincode, phone, isDefault } = req.body;

    // If this is default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Format phone number
    let formattedPhone = phone || '';
    if (formattedPhone && !formattedPhone.startsWith('+91')) {
      const cleaned = formattedPhone.replace(/^\+91\s*/, '').replace(/^91\s*/, '').trim();
      formattedPhone = '+91 ' + cleaned;
    }

    user.addresses.push({
      name,
      address,
      city,
      state,
      pincode,
      phone: formattedPhone,
      isDefault: isDefault || false
    });

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get addresses
app.get('/api/user/addresses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ addresses: user.addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, phone } = req.body;

    if (name) {
      user.name = name;
    }
    if (phone !== undefined) {
      // Ensure phone starts with +91
      if (phone && !phone.startsWith('+91')) {
        // Remove any existing +91 or country code
        const cleaned = phone.replace(/^\+91\s*/, '').replace(/^91\s*/, '').trim();
        user.phone = '+91 ' + cleaned;
      } else {
        user.phone = phone || '';
      }
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      isAdmin: user.isAdmin || false,
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update address
app.put('/api/user/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { addressId } = req.params;
    const { name, address, city, state, pincode, phone, isDefault } = req.body;

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // If this is default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Format phone number
    let formattedPhone = phone || '';
    if (formattedPhone && !formattedPhone.startsWith('+91')) {
      const cleaned = formattedPhone.replace(/^\+91\s*/, '').replace(/^91\s*/, '').trim();
      formattedPhone = '+91 ' + cleaned;
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      name,
      address,
      city,
      state,
      pincode,
      phone: formattedPhone,
      isDefault: isDefault || false
    };

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reviews for a product
app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-__v');
    
    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add review (with file uploads)
app.post('/api/reviews/:productId', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const files = req.files || [];

    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Process uploaded files
    const attachments = files.map(file => {
      const fileUrl = `/uploads/${file.filename}`;
      const isImage = file.mimetype.startsWith('image/');
      return {
        type: isImage ? 'image' : 'file',
        url: fileUrl,
        name: file.originalname
      };
    });

    // Create review
    const review = new Review({
      productId,
      userId: user._id,
      userName: user.name,
      rating: parseInt(rating),
      comment,
      attachments
    });

    await review.save();

    res.json({ 
      message: 'Review added successfully',
      review: {
        _id: review._id,
        productId: review.productId,
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
        attachments: review.attachments,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Test Payment - Simulate payment (for development)
app.post('/api/payments/test-payment', authenticateToken, async (req, res) => {
  try {
    const { amount, orderId, status = 'success' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate payment result
    if (status === 'success') {
      res.json({
        success: true,
        orderId: orderId,
        paymentStatus: 'PAID',
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        message: 'Payment successful (Test Mode)',
      });
    } else {
      res.json({
        success: false,
        orderId: orderId,
        paymentStatus: 'FAILED',
        message: 'Payment failed (Test Mode)',
      });
    }
  } catch (error) {
    console.error('Test payment error:', error);
    res.status(500).json({ error: error.message || 'Payment simulation failed' });
  }
});

// Payment Verification - Verify payment (works for both test and production)
app.post('/api/payments/verify', authenticateToken, async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (PAYMENT_MODE === 'test') {
      // In test mode, just verify the transaction ID exists
      if (transactionId) {
        res.json({
          success: true,
          orderId: orderId,
          paymentStatus: 'PAID',
          transactionId: transactionId,
        });
      } else {
        res.status(400).json({ error: 'Invalid transaction ID' });
      }
    } else {
      // In production mode, verify with actual payment gateway
      // TODO: Implement real payment gateway verification here
      res.status(500).json({ error: 'Production payment gateway not configured yet' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify payment' });
  }
});

// Payment Webhook - Handle payment notifications (for production gateways)
app.post('/api/payments/webhook', async (req, res) => {
  try {
    // Payment gateway sends payment status updates via webhook
    const { orderId, orderStatus, paymentDetails } = req.body;
    
    console.log('Payment webhook received:', { orderId, orderStatus });
    
    // TODO: Implement webhook verification and order status update for production gateway
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Payment Confirmation - Create order after payment
app.post('/api/payments/confirm', authenticateToken, upload.array('designFiles', 10), async (req, res) => {
  try {
    const { orderId: paymentOrderId, transactionId, items, shippingAddress, customDesign, totals } = req.body;

    if (!paymentOrderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Parse JSON fields if they're strings (FormData sends them as strings)
    let parsedItems;
    try {
      parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    } catch (e) {
      console.error('Error parsing items:', e, 'Raw items:', items);
      return res.status(400).json({ error: 'Invalid order items format' });
    }

    if (!parsedItems || !Array.isArray(parsedItems) || parsedItems.length === 0) {
      console.error('Items validation failed:', { parsedItems, type: typeof parsedItems, isArray: Array.isArray(parsedItems) });
      return res.status(400).json({ error: 'Order items are required' });
    }

    let parsedShippingAddress;
    try {
      parsedShippingAddress = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;
    } catch (e) {
      console.error('Error parsing shippingAddress:', e);
      return res.status(400).json({ error: 'Invalid shipping address format' });
    }

    if (!parsedShippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    let parsedTotals;
    try {
      parsedTotals = typeof totals === 'string' ? JSON.parse(totals) : totals;
    } catch (e) {
      console.error('Error parsing totals:', e);
      return res.status(400).json({ error: 'Invalid order totals format' });
    }

    if (!parsedTotals) {
      return res.status(400).json({ error: 'Order totals are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Process custom design files if uploaded
    const designFiles = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        designFiles.push(`/uploads/${file.filename}`);
      });
    }

    const parsedCustomDesign = customDesign ? (typeof customDesign === 'string' ? JSON.parse(customDesign) : customDesign) : {};

    // Calculate estimated delivery (7-8 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    // Create order
    const newOrderId = await generateOrderId();
    const order = new Order({
      orderId: newOrderId,
      userId: user._id,
      items: parsedItems,
      shippingAddress: parsedShippingAddress,
      customDesign: {
        files: designFiles.length > 0 ? designFiles : (parsedCustomDesign.files || []),
        referenceLinks: parsedCustomDesign.referenceLinks || '',
        instructions: parsedCustomDesign.instructions || '',
        submittedAt: designFiles.length > 0 || parsedCustomDesign.instructions ? new Date() : null
      },
      payment: {
        method: PAYMENT_MODE === 'test' ? 'test' : 'gateway',
        transactionId: transactionId || paymentOrderId,
        amount: parsedTotals.total || 0,
        status: 'paid',
        paidAt: new Date()
      },
      status: 'processing',
      tracking: {
        status: 'order_placed',
        estimatedDelivery: estimatedDelivery,
        updates: [{
          status: 'order_placed',
          message: 'Order placed successfully',
          timestamp: new Date(),
          location: parsedShippingAddress.city || ''
        }]
      },
      total: parsedTotals.total || 0,
      subtotal: parsedTotals.subtotal || 0,
      shipping: parsedTotals.shipping || 0,
      tax: parsedTotals.tax || 0
    });

    console.log('Creating order with items:', parsedItems.length, 'items');

    await order.save();

    // Send order confirmation email and WhatsApp
    const populatedOrder = await Order.findOne({ orderId: order.orderId })
      .populate('userId', 'name email phone');
    
    if (populatedOrder && populatedOrder.userId) {
      // Send email
      sendEmail(transporter, populatedOrder.userId.email,
        emailTemplates.orderConfirmation({
          orderId: order.orderId,
          userName: populatedOrder.userId.name,
          total: order.total,
          status: order.status
        }).subject,
        emailTemplates.orderConfirmation({
          orderId: order.orderId,
          userName: populatedOrder.userId.name,
          total: order.total,
          status: order.status
        }).html
      ).catch(err => console.error('Failed to send order confirmation email:', err));

      // Send WhatsApp notification if phone number exists
      if (populatedOrder.userId.phone) {
        console.log('📱 Attempting to send order confirmation via WhatsApp to:', populatedOrder.userId.phone);
        if (isWhatsAppConfigured()) {
          sendOrderConfirmation(populatedOrder.userId.phone, populatedOrder)
            .then(result => {
              if (result.success) {
                console.log('✅ Order confirmation sent via WhatsApp to:', populatedOrder.userId.phone);
              } else {
                console.error('❌ Failed to send WhatsApp order confirmation:', result.error);
                if (result.details) {
                  console.error('   Error details:', JSON.stringify(result.details, null, 2));
                }
              }
            })
            .catch(err => {
              console.error('❌ WhatsApp order confirmation error:', err);
              console.error('   Error stack:', err.stack);
            });
        } else {
          console.warn('⚠️  WhatsApp not configured. Skipping WhatsApp notification.');
        }
      } else {
        console.log('⚠️  No phone number found for user. Skipping WhatsApp notification.');
      }
    }

    res.json({
      success: true,
      message: 'Order created successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create order (legacy endpoint - for non-payment orders)
app.post('/api/orders', authenticateToken, upload.array('designFiles', 10), async (req, res) => {
  try {
    const { items, shippingAddress, customDesign, payment, totals } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    if (!totals) {
      return res.status(400).json({ error: 'Order totals are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Process custom design files if uploaded
    const designFiles = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        designFiles.push(`/uploads/${file.filename}`);
      });
    }

    // Parse JSON fields if they're strings
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    const parsedShippingAddress = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;
    const parsedCustomDesign = customDesign ? (typeof customDesign === 'string' ? JSON.parse(customDesign) : customDesign) : {};
    const parsedPayment = payment ? (typeof payment === 'string' ? JSON.parse(payment) : payment) : {};
    const parsedTotals = typeof totals === 'string' ? JSON.parse(totals) : totals;

    // Calculate estimated delivery (7-8 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    // Create order
    const orderId = await generateOrderId();
    const order = new Order({
      orderId: orderId,
      userId: user._id,
      items: parsedItems,
      shippingAddress: parsedShippingAddress,
      customDesign: {
        files: designFiles.length > 0 ? designFiles : (parsedCustomDesign.files || []),
        referenceLinks: parsedCustomDesign.referenceLinks || '',
        instructions: parsedCustomDesign.instructions || '',
        submittedAt: designFiles.length > 0 || parsedCustomDesign.instructions ? new Date() : null
      },
      payment: {
        method: parsedPayment.method || 'razorpay',
        transactionId: parsedPayment.transactionId || '',
        amount: parsedTotals.total || parsedPayment.amount || 0,
        status: parsedPayment.status || 'pending',
        paidAt: parsedPayment.status === 'paid' ? new Date() : null
      },
      status: 'pending',
      tracking: {
        status: 'order_placed',
        estimatedDelivery: estimatedDelivery,
        updates: [{
          status: 'order_placed',
          message: 'Order placed successfully',
          timestamp: new Date(),
          location: parsedShippingAddress.city || ''
        }]
      },
      total: parsedTotals.total || 0,
      subtotal: parsedTotals.subtotal || 0,
      shipping: parsedTotals.shipping || 0,
      tax: parsedTotals.tax || 0
    });

    await order.save();

    // Send order confirmation email and WhatsApp
    const populatedOrder = await Order.findOne({ orderId: order.orderId })
      .populate('userId', 'name email phone');
    
    if (populatedOrder && populatedOrder.userId) {
      // Send email
      sendEmail(transporter, populatedOrder.userId.email,
        emailTemplates.orderConfirmation({
          orderId: order.orderId,
          userName: populatedOrder.userId.name,
          total: order.total,
          status: order.status
        }).subject,
        emailTemplates.orderConfirmation({
          orderId: order.orderId,
          userName: populatedOrder.userId.name,
          total: order.total,
          status: order.status
        }).html
      ).catch(err => console.error('Failed to send order confirmation email:', err));

      // Send WhatsApp notification if phone number exists
      if (populatedOrder.userId.phone) {
        console.log('📱 Attempting to send order confirmation via WhatsApp to:', populatedOrder.userId.phone);
        if (isWhatsAppConfigured()) {
          sendOrderConfirmation(populatedOrder.userId.phone, populatedOrder)
            .then(result => {
              if (result.success) {
                console.log('✅ Order confirmation sent via WhatsApp to:', populatedOrder.userId.phone);
              } else {
                console.error('❌ Failed to send WhatsApp order confirmation:', result.error);
                if (result.details) {
                  console.error('   Error details:', JSON.stringify(result.details, null, 2));
                }
              }
            })
            .catch(err => {
              console.error('❌ WhatsApp order confirmation error:', err);
              console.error('   Error stack:', err.stack);
            });
        } else {
          console.warn('⚠️  WhatsApp not configured. Skipping WhatsApp notification.');
        }
      } else {
        console.log('⚠️  No phone number found for user. Skipping WhatsApp notification.');
      }
    }

    res.json({
      message: 'Order created successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get user's orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select('-__v')
      .limit(50);
    
    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order details
app.get('/api/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId, userId: req.user.userId })
      .populate('userId', 'name email phone')
      .select('-__v');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (Admin only)
app.put('/api/admin/orders/:orderId/status', authenticateAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    // Send email and WhatsApp notification to user
    const populatedOrder = await Order.findOne({ orderId })
      .populate('userId', 'name email phone');
    
    if (populatedOrder && populatedOrder.userId) {
      // Send email
      sendEmail(transporter, populatedOrder.userId.email,
        emailTemplates.orderStatusUpdate(populatedOrder, oldStatus).subject,
        emailTemplates.orderStatusUpdate(populatedOrder, oldStatus).html
      ).catch(err => console.error('Failed to send order status email:', err));

      // Send WhatsApp notification if phone number exists
      if (populatedOrder.userId.phone && isWhatsAppConfigured()) {
        sendOrderStatusUpdate(populatedOrder.userId.phone, populatedOrder, status)
          .then(result => {
            if (result.success) {
              console.log('Order status update sent via WhatsApp to:', populatedOrder.userId.phone);
            } else {
              console.error('Failed to send WhatsApp status update:', result.error);
            }
          })
          .catch(err => console.error('WhatsApp status update error:', err));
      }
    }

    res.json({
      message: 'Order status updated successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order tracking status (Admin only)
app.put('/api/admin/orders/:orderId/tracking', authenticateAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingStatus, trackingNumber, message, location } = req.body;

    const validTrackingStatuses = ['order_placed', 'confirmed', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
    
    if (!trackingStatus || !validTrackingStatuses.includes(trackingStatus)) {
      return res.status(400).json({ error: 'Valid tracking status is required' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Initialize tracking if it doesn't exist
    if (!order.tracking) {
      order.tracking = {
        status: 'order_placed',
        trackingNumber: '',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        updates: []
      };
    }

    const oldTrackingStatus = order.tracking.status;
    order.tracking.status = trackingStatus;
    
    if (trackingNumber) {
      order.tracking.trackingNumber = trackingNumber;
    }

    // Add tracking update
    const statusMessages = {
      'order_placed': 'Order placed successfully',
      'confirmed': 'Order confirmed',
      'processing': 'Order is being processed',
      'shipped': 'Order has been shipped',
      'in_transit': 'Order is in transit',
      'out_for_delivery': 'Order is out for delivery',
      'delivered': 'Order has been delivered'
    };

    order.tracking.updates.push({
      status: trackingStatus,
      message: message || statusMessages[trackingStatus] || 'Status updated',
      timestamp: new Date(),
      location: location || order.shippingAddress.city || ''
    });

    // Update main order status based on tracking status
    if (trackingStatus === 'delivered') {
      order.status = 'delivered';
    } else if (trackingStatus === 'shipped' || trackingStatus === 'in_transit' || trackingStatus === 'out_for_delivery') {
      order.status = 'shipped';
    } else if (trackingStatus === 'processing' || trackingStatus === 'confirmed') {
      order.status = 'processing';
    }

    order.updatedAt = new Date();
    await order.save();

    // Send email and WhatsApp notification to user
    const populatedOrder = await Order.findOne({ orderId })
      .populate('userId', 'name email phone');
    
    if (populatedOrder && populatedOrder.userId) {
      // Send email
      sendEmail(transporter, populatedOrder.userId.email,
        emailTemplates.orderStatusUpdate(populatedOrder, oldTrackingStatus).subject,
        emailTemplates.orderStatusUpdate(populatedOrder, oldTrackingStatus).html
      ).catch(err => console.error('Failed to send tracking update email:', err));

      // Send WhatsApp notification if phone number exists
      if (populatedOrder.userId.phone && isWhatsAppConfigured()) {
        sendTrackingUpdate(populatedOrder.userId.phone, populatedOrder, {
          status: trackingStatus,
          trackingNumber: order.tracking.trackingNumber,
          location: location || order.shippingAddress.city || '',
          message: message || ''
        })
          .then(result => {
            if (result.success) {
              console.log('Tracking update sent via WhatsApp to:', populatedOrder.userId.phone);
            } else {
              console.error('Failed to send WhatsApp tracking update:', result.error);
            }
          })
          .catch(err => console.error('WhatsApp tracking update error:', err));
      }
    }

    res.json({
      message: 'Tracking status updated successfully',
      order: {
        orderId: order.orderId,
        tracking: order.tracking,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Update tracking status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all orders (Admin only)
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    
    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-__v');
    
    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get admin order details
app.get('/api/admin/orders/:orderId', authenticateAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId })
      .populate('userId', 'name email phone addresses')
      .select('-__v');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get admin order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order details (Admin only) - for updating address, items, etc.
app.put('/api/admin/orders/:orderId', authenticateAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { shippingAddress, items, totals } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update shipping address if provided
    if (shippingAddress) {
      order.shippingAddress = {
        ...order.shippingAddress,
        ...shippingAddress
      };
    }

    // Update items if provided
    if (items && Array.isArray(items)) {
      order.items = items;
    }

    // Update totals if provided
    if (totals) {
      if (totals.subtotal !== undefined) order.subtotal = totals.subtotal;
      if (totals.shipping !== undefined) order.shipping = totals.shipping;
      if (totals.tax !== undefined) order.tax = totals.tax;
      if (totals.total !== undefined) order.total = totals.total;
    }

    order.updatedAt = new Date();
    await order.save();

    res.json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Set user as admin (for initial setup - you can remove this after setting yourself as admin)
// This endpoint allows you to set your email as admin
app.post('/api/admin/set-admin', async (req, res) => {
  try {
    const { email, adminSecret } = req.body;
    
    // Use environment variable for admin secret, or default for development
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'set-admin-secret-in-production';
    
    if (adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({ error: 'Invalid admin secret' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isAdmin = true;
    await user.save();

    res.json({ message: 'User set as admin successfully', email: user.email });
  } catch (error) {
    console.error('Set admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create manual order for any user
app.post('/api/admin/orders/create', authenticateAdmin, upload.array('designFiles', 10), async (req, res) => {
  try {
    const { userId, items, shippingAddress, customDesign, totals, description } = req.body;

    if (!userId || !items || !shippingAddress || !totals) {
      return res.status(400).json({ error: 'User ID, items, shipping address, and totals are required' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Process custom design files if uploaded
    const designFiles = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        designFiles.push(`/uploads/${file.filename}`);
      });
    }

    // Parse JSON fields if they're strings
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    const parsedShippingAddress = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;
    const parsedCustomDesign = customDesign ? (typeof customDesign === 'string' ? JSON.parse(customDesign) : customDesign) : {};
    const parsedTotals = typeof totals === 'string' ? JSON.parse(totals) : totals;

    // Calculate estimated delivery (7-8 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    // Create order
    const orderId = await generateOrderId();
    const order = new Order({
      orderId: orderId,
      userId: user._id,
      items: parsedItems,
      shippingAddress: parsedShippingAddress,
      customDesign: {
        files: designFiles.length > 0 ? designFiles : (parsedCustomDesign.files || []),
        referenceLinks: parsedCustomDesign.referenceLinks || '',
        instructions: parsedCustomDesign.instructions || description || '',
        submittedAt: new Date()
      },
      payment: {
        method: 'manual',
        transactionId: `ADMIN-${Date.now()}`,
        amount: parsedTotals.total || 0,
        status: 'paid',
        paidAt: new Date()
      },
      status: 'pending',
      tracking: {
        status: 'order_placed',
        estimatedDelivery: estimatedDelivery,
        updates: [{
          status: 'order_placed',
          message: 'Order placed successfully',
          timestamp: new Date(),
          location: parsedShippingAddress.city || ''
        }]
      },
      total: parsedTotals.total || 0,
      subtotal: parsedTotals.subtotal || 0,
      shipping: parsedTotals.shipping || 0,
      tax: parsedTotals.tax || 0
    });

    await order.save();

    // Send order confirmation email and WhatsApp
    const populatedOrder = await Order.findOne({ orderId: order.orderId })
      .populate('userId', 'name email phone');
    
    if (populatedOrder && populatedOrder.userId) {
      // Send email
      sendEmail(transporter, populatedOrder.userId.email,
        emailTemplates.orderConfirmation({
          orderId: order.orderId,
          userName: populatedOrder.userId.name,
          total: order.total,
          status: order.status
        }).subject,
        emailTemplates.orderConfirmation({
          orderId: order.orderId,
          userName: populatedOrder.userId.name,
          total: order.total,
          status: order.status
        }).html
      ).catch(err => console.error('Failed to send order confirmation email:', err));

      // Send WhatsApp notification if phone number exists
      if (populatedOrder.userId.phone) {
        console.log('📱 Attempting to send order confirmation via WhatsApp to:', populatedOrder.userId.phone);
        if (isWhatsAppConfigured()) {
          sendOrderConfirmation(populatedOrder.userId.phone, populatedOrder)
            .then(result => {
              if (result.success) {
                console.log('✅ Order confirmation sent via WhatsApp to:', populatedOrder.userId.phone);
              } else {
                console.error('❌ Failed to send WhatsApp order confirmation:', result.error);
                if (result.details) {
                  console.error('   Error details:', JSON.stringify(result.details, null, 2));
                }
              }
            })
            .catch(err => {
              console.error('❌ WhatsApp order confirmation error:', err);
              console.error('   Error stack:', err.stack);
            });
        } else {
          console.warn('⚠️  WhatsApp not configured. Skipping WhatsApp notification.');
        }
      } else {
        console.log('⚠️  No phone number found for user. Skipping WhatsApp notification.');
      }
    }

    res.json({
      message: 'Order created successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Admin create order error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get all users (Admin only)
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get user details
app.get('/api/admin/users/:userId', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select('-password -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's orders
    const orders = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderId status total createdAt');

    res.json({
      user: {
        ...user.toObject(),
        recentOrders: orders
      }
    });
  } catch (error) {
    console.error('Get admin user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Update user (except password/credentials)
app.put('/api/admin/users/:userId', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, addresses, isAdmin } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields only (no password/credentials)
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (addresses !== undefined) user.addresses = addresses;
    if (isAdmin !== undefined && typeof isAdmin === 'boolean') user.isAdmin = isAdmin;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
        isAdmin: user.isAdmin,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Update admin user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all products (from products.js data)
// Admin: Add product to user's order manually
app.post('/api/admin/users/:userId/add-product', authenticateAdmin, upload.array('productImage', 1), async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, productName, productPrice, productDescription, category, audience } = req.body;

    if (!productName || !productPrice) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's default address or first address
    const shippingAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
    if (!shippingAddress) {
      return res.status(400).json({ error: 'User has no shipping address. Please add an address first.' });
    }

    // Handle product image
    let productImage = '';
    if (req.files && req.files.length > 0) {
      productImage = `/uploads/${req.files[0].filename}`;
    }

    // If productId is provided, try to fetch product details
    let productDetails = null;
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      try {
        productDetails = await Product.findById(productId);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    }

    // Create order item - use product details if available, otherwise use form data
    const orderItem = {
      productId: productId && mongoose.Types.ObjectId.isValid(productId) ? productId.toString() : null,
      name: productDetails ? productDetails.name : productName,
      price: productDetails ? productDetails.price : parseFloat(productPrice),
      quantity: 1,
      size: 'M', // Default size
      image: productImage || (productDetails && productDetails.gallery && productDetails.gallery.length > 0 
        ? (typeof productDetails.gallery[0] === 'string' ? productDetails.gallery[0] : productDetails.gallery[0].url || productDetails.gallery[0])
        : 'https://via.placeholder.com/300'),
      category: productDetails ? productDetails.category : (category || 'Custom'),
      audience: productDetails ? productDetails.audience : (audience || 'Unisex')
    };

    const subtotal = orderItem.price;
    const shipping = 100; // Default shipping
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + shipping + tax;

    // Calculate estimated delivery (7-8 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    // Create order
    const orderId = await generateOrderId();
    const order = new Order({
      orderId: orderId,
      userId: user._id,
      items: [orderItem],
      shippingAddress: {
        name: shippingAddress.name,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        phone: shippingAddress.phone
      },
      customDesign: {
        files: productImage ? [productImage] : [],
        instructions: productDescription || '',
        submittedAt: new Date()
      },
      payment: {
        method: 'manual',
        transactionId: `ADMIN-${Date.now()}`,
        amount: total,
        status: 'paid',
        paidAt: new Date()
      },
      status: 'pending',
      tracking: {
        status: 'order_placed',
        estimatedDelivery: estimatedDelivery,
        updates: [{
          status: 'order_placed',
          message: 'Order placed successfully',
          timestamp: new Date(),
          location: shippingAddress.city || ''
        }]
      },
      total: total,
      subtotal: subtotal,
      shipping: shipping,
      tax: tax
    });

    await order.save();

    // Send order confirmation email and WhatsApp
    const populatedOrder = await Order.findOne({ orderId: order.orderId })
      .populate('userId', 'name email phone');
    
    if (populatedOrder && populatedOrder.userId) {
      // Send email
      sendEmail(transporter, populatedOrder.userId.email,
        emailTemplates.orderConfirmation({
          orderId: order.orderId,
          userName: populatedOrder.userId.name,
          total: order.total,
          status: order.status
        }).subject,
        emailTemplates.orderConfirmation({
          orderId: order.orderId,
          userName: populatedOrder.userId.name,
          total: order.total,
          status: order.status
        }).html
      ).catch(err => console.error('Failed to send order confirmation email:', err));

      // Send WhatsApp notification if phone number exists
      if (populatedOrder.userId.phone) {
        console.log('📱 Attempting to send order confirmation via WhatsApp to:', populatedOrder.userId.phone);
        if (isWhatsAppConfigured()) {
          sendOrderConfirmation(populatedOrder.userId.phone, populatedOrder)
            .then(result => {
              if (result.success) {
                console.log('✅ Order confirmation sent via WhatsApp to:', populatedOrder.userId.phone);
              } else {
                console.error('❌ Failed to send WhatsApp order confirmation:', result.error);
                if (result.details) {
                  console.error('   Error details:', JSON.stringify(result.details, null, 2));
                }
              }
            })
            .catch(err => {
              console.error('❌ WhatsApp order confirmation error:', err);
              console.error('   Error stack:', err.stack);
            });
        } else {
          console.warn('⚠️  WhatsApp not configured. Skipping WhatsApp notification.');
        }
      } else {
        console.log('⚠️  No phone number found for user. Skipping WhatsApp notification.');
      }
    }

    res.json({
      message: 'Product added to user order successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Add product to user error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Test WhatsApp endpoint (Admin only)
app.post('/api/test/whatsapp', authenticateAdmin, async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Check configuration
    const configStatus = {
      hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
      hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'Not set',
      accessTokenLength: process.env.WHATSAPP_ACCESS_TOKEN ? process.env.WHATSAPP_ACCESS_TOKEN.length : 0,
      isConfigured: isWhatsAppConfigured()
    };

    if (!isWhatsAppConfigured()) {
      return res.status(400).json({ 
        error: 'WhatsApp not configured',
        configStatus
      });
    }

    const testMessage = message || '🧪 Test message from Looklyn!\n\nThis is a test to verify WhatsApp integration is working correctly.';
    console.log('🧪 Testing WhatsApp with phone:', phone);
    const result = await sendWhatsAppMessage(phone, testMessage);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'WhatsApp message sent successfully',
        messageId: result.messageId,
        configStatus
      });
    } else {
      res.status(500).json({ 
        error: result.error || 'Failed to send WhatsApp message',
        details: result.details,
        configStatus
      });
    }
  } catch (error) {
    console.error('Test WhatsApp error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Check WhatsApp configuration (Admin only)
app.get('/api/test/whatsapp/config', authenticateAdmin, async (req, res) => {
  try {
    res.json({
      configured: isWhatsAppConfigured(),
      hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
      hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? 'Set (' + process.env.WHATSAPP_PHONE_NUMBER_ID + ')' : 'Not set',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN ? 'Set (' + process.env.WHATSAPP_ACCESS_TOKEN.length + ' characters)' : 'Not set'
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get admin dashboard stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    
    const totalRevenue = await Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        totalRevenue: revenue
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// PRODUCT API ENDPOINTS
// ============================================

// Public: Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { category, audience, search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (audience) query.audience = audience;
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Convert _id to id for frontend compatibility and format gallery images
    const formattedProducts = products.map(p => {
      // Generate slug if not present
      if (!p.slug && p.name) {
        p.slug = generateSlug(p.name);
        // Save the slug to database (async, don't wait)
        Product.findByIdAndUpdate(p._id, { slug: p.slug }).catch(err => console.error('Error saving slug:', err));
      }
      return {
        ...p,
        id: p._id.toString(),
        original: p.originalPrice,
        slug: p.slug || generateSlug(p.name),
        gallery: p.gallery.map(g => {
          if (g.data) {
            return `data:${g.mimeType || 'image/jpeg'};base64,${g.data}`;
          }
          return g.url || '';
        })
      };
    });
    
    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: Get product by ID or slug
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product;
    
    // Check if it's a valid ObjectId, otherwise treat as slug
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).lean();
    } else {
      // Treat as slug
      product = await Product.findOne({ slug: id }).lean();
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Generate slug if not present
    if (!product.slug && product.name) {
      product.slug = generateSlug(product.name);
      // Save the slug to database (async, don't wait)
      Product.findByIdAndUpdate(product._id, { slug: product.slug }).catch(err => console.error('Error saving slug:', err));
    }
    
    // Convert _id to id and format gallery images
    const formattedProduct = {
      ...product,
      id: product._id.toString(),
      original: product.originalPrice,
      slug: product.slug || generateSlug(product.name),
      gallery: product.gallery.map(g => {
        if (g.data) {
          return `data:${g.mimeType || 'image/jpeg'};base64,${g.data}`;
        }
        return g.url || '';
      })
    };
    
    res.json(formattedProduct);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all products (with filters)
app.get('/api/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const { category, audience, search, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (audience) query.audience = audience;
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Convert _id to id for frontend compatibility and format gallery images
    const formattedProducts = products.map(p => {
      // Generate slug if not present
      if (!p.slug && p.name) {
        p.slug = generateSlug(p.name);
        // Save the slug to database (async, don't wait)
        Product.findByIdAndUpdate(p._id, { slug: p.slug }).catch(err => console.error('Error saving slug:', err));
      }
      return {
        ...p,
        id: p._id.toString(),
        original: p.originalPrice,
        slug: p.slug || generateSlug(p.name),
        gallery: p.gallery.map(g => {
          if (g.data) {
            return `data:${g.mimeType || 'image/jpeg'};base64,${g.data}`;
          }
          return g.url || '';
        })
      };
    });
    
    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create product
app.post('/api/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, category, audience, price, originalPrice, sizes, stock, colorOptions, tags, galleryImages } = req.body;
    
    if (!name || !category || !audience || !price || !originalPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Process gallery images - accept base64 images from request body
    const gallery = [];
    if (galleryImages && Array.isArray(galleryImages) && galleryImages.length > 0) {
      galleryImages.forEach((imageData, index) => {
        // imageData should be { data: 'data:image/jpeg;base64,...', mimeType: 'image/jpeg' }
        if (imageData.data) {
          // Extract base64 data and mime type
          const base64Match = imageData.data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
          if (base64Match) {
            gallery.push({
              data: base64Match[2], // Store only base64 string without data URI prefix
              mimeType: base64Match[1] || imageData.mimeType || 'image/jpeg',
              isMain: index === 0,
              order: index
            });
          } else if (typeof imageData.data === 'string' && imageData.data.length > 0) {
            // Already base64 without data URI prefix
            gallery.push({
              data: imageData.data,
              mimeType: imageData.mimeType || 'image/jpeg',
              isMain: index === 0,
              order: index
            });
          }
        }
      });
    }
    
    if (gallery.length === 0) {
      return res.status(400).json({ error: 'At least one product image is required' });
    }
    
    // Parse sizes, colorOptions, tags
    const sizesArray = sizes ? (Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim())) : ['S', 'M', 'L', 'XL'];
    const tagsArray = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [];
    
    let colorOptionsArray = [];
    if (colorOptions) {
      try {
        colorOptionsArray = typeof colorOptions === 'string' ? JSON.parse(colorOptions) : colorOptions;
        // Clean and validate colorOptions
        colorOptionsArray = colorOptionsArray.map(color => {
          const cleaned = {
            name: color.name || '',
            hexCode: color.hex || color.hexCode || '',
            hex: color.hex || color.hexCode || ''
          };
          // Handle productId - remove quotes and validate
          if (color.productId) {
            let productIdStr = String(color.productId).replace(/^["']+|["']+$/g, '').trim();
            if (productIdStr && mongoose.Types.ObjectId.isValid(productIdStr)) {
              cleaned.productId = new mongoose.Types.ObjectId(productIdStr);
            }
          }
          return cleaned;
        });
      } catch (e) {
        console.warn('Error parsing colorOptions:', e);
      }
    }
    
    const product = new Product({
      name,
      description: description || '',
      category,
      audience,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice),
      gallery,
      sizes: sizesArray,
      stock: parseInt(stock) || 0,
      colorOptions: colorOptionsArray,
      tags: tagsArray,
      isActive: true
    });
    
    await product.save();
    
    // Format response - return data URLs for images
    const formattedProduct = {
      ...product.toObject(),
      id: product._id.toString(),
      original: product.originalPrice,
      gallery: product.gallery.map(g => {
        if (g.data) {
          return `data:${g.mimeType || 'image/jpeg'};base64,${g.data}`;
        }
        return g.url || '';
      })
    };
    
    res.status(201).json({
      message: 'Product created successfully',
      product: formattedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Admin: Update product
app.put('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, audience, price, originalPrice, sizes, stock, colorOptions, tags, galleryImages } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update fields
    if (name) {
      product.name = name;
      // Regenerate slug if name changes
      product.slug = generateSlug(name);
    }
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (audience) product.audience = audience;
    if (price) product.price = parseFloat(price);
    if (originalPrice) product.originalPrice = parseFloat(originalPrice);
    if (sizes) {
      product.sizes = Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim());
    }
    if (stock !== undefined) product.stock = parseInt(stock);
    if (tags) {
      product.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }
    if (colorOptions) {
      try {
        let colorOptionsArray = typeof colorOptions === 'string' ? JSON.parse(colorOptions) : colorOptions;
        // Clean and validate colorOptions
        colorOptionsArray = colorOptionsArray.map(color => {
          const cleaned = {
            name: color.name || '',
            hexCode: color.hex || color.hexCode || '',
            hex: color.hex || color.hexCode || ''
          };
          // Handle productId - remove quotes and validate
          if (color.productId) {
            let productIdStr = String(color.productId).replace(/^["']+|["']+$/g, '').trim();
            if (productIdStr && mongoose.Types.ObjectId.isValid(productIdStr)) {
              cleaned.productId = new mongoose.Types.ObjectId(productIdStr);
            }
          }
          return cleaned;
        });
        product.colorOptions = colorOptionsArray;
      } catch (e) {
        console.warn('Error parsing colorOptions:', e);
      }
    }
    
    // Update gallery if new images uploaded (base64 from request body)
    if (galleryImages && Array.isArray(galleryImages) && galleryImages.length > 0) {
      const newGallery = [];
      galleryImages.forEach((imageData, index) => {
        if (imageData.data) {
          const base64Match = imageData.data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
          if (base64Match) {
            newGallery.push({
              data: base64Match[2],
              mimeType: base64Match[1] || imageData.mimeType || 'image/jpeg',
              isMain: index === 0,
              order: index
            });
          } else if (typeof imageData.data === 'string' && imageData.data.length > 0) {
            newGallery.push({
              data: imageData.data,
              mimeType: imageData.mimeType || 'image/jpeg',
              isMain: index === 0,
              order: index
            });
          }
        }
      });
      if (newGallery.length > 0) {
        product.gallery = newGallery;
      }
    }
    
    product.updatedAt = new Date();
    await product.save();
    
    // Format response - return data URLs for images
    const formattedProduct = {
      ...product.toObject(),
      id: product._id.toString(),
      original: product.originalPrice,
      gallery: product.gallery.map(g => {
        if (g.data) {
          return `data:${g.mimeType || 'image/jpeg'};base64,${g.data}`;
        }
        return g.url || '';
      })
    };
    
    res.json({
      message: 'Product updated successfully',
      product: formattedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Admin: Delete product
// Size Charts API Endpoints
// Get all size charts (admin)
app.get('/api/admin/size-charts', authenticateAdmin, async (req, res) => {
  try {
    const sizeCharts = await SizeChart.find({});
    res.json(sizeCharts);
  } catch (error) {
    console.error('Error fetching size charts:', error);
    res.status(500).json({ error: 'Failed to fetch size charts' });
  }
});

// Get size chart by category (public)
app.get('/api/size-charts/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const sizeChart = await SizeChart.findOne({ category });
    if (!sizeChart) {
      return res.status(404).json({ error: 'Size chart not found' });
    }
    res.json(sizeChart);
  } catch (error) {
    console.error('Error fetching size chart:', error);
    res.status(500).json({ error: 'Failed to fetch size chart' });
  }
});

// Create or update size chart (admin)
app.post('/api/admin/size-charts', authenticateAdmin, async (req, res) => {
  try {
    const { category, fitDescription, fitDetails, measurements } = req.body;
    
    const sizeChart = await SizeChart.findOneAndUpdate(
      { category },
      {
        category,
        fitDescription,
        fitDetails,
        measurements
      },
      { upsert: true, new: true }
    );
    
    res.json(sizeChart);
  } catch (error) {
    console.error('Error saving size chart:', error);
    res.status(500).json({ error: 'Failed to save size chart' });
  }
});

// Delete size chart (admin)
app.delete('/api/admin/size-charts/:category', authenticateAdmin, async (req, res) => {
  try {
    const { category } = req.params;
    await SizeChart.findOneAndDelete({ category });
    res.json({ message: 'Size chart deleted successfully' });
  } catch (error) {
    console.error('Error deleting size chart:', error);
    res.status(500).json({ error: 'Failed to delete size chart' });
  }
});

app.delete('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await Product.findByIdAndDelete(id);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 CORS enabled for http://localhost:8080`);
  
  // Check WhatsApp configuration
  console.log('\n📱 WhatsApp Configuration Check:');
  if (isWhatsAppConfigured()) {
    console.log('   ✅ WhatsApp is configured');
    console.log('   📞 Phone Number ID:', process.env.WHATSAPP_PHONE_NUMBER_ID ? 'Set' : 'Missing');
    console.log('   🔑 Access Token:', process.env.WHATSAPP_ACCESS_TOKEN ? `Set (${process.env.WHATSAPP_ACCESS_TOKEN.length} chars)` : 'Missing');
  } else {
    console.log('   ⚠️  WhatsApp is NOT configured');
    console.log('   💡 Add WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to server/.env');
  }
  console.log('');
});

