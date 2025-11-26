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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

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
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  addresses: [{
    name: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    isDefault: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// OTP Schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 10 * 60 * 1000) }, // 10 minutes
  verified: { type: Boolean, default: false }
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

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
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

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, mode } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
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

    // Delete old OTPs for this email
    await OTP.deleteMany({ email });

    // Generate new OTP
    const otpCode = generateOTP();
    const otp = new OTP({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await otp.save();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@axno.com',
      to: email,
      subject: 'AXNO - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5c3d8a;">AXNO - Own The Look</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #5c3d8a; font-size: 32px; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">${otpCode}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: 'OTP sent successfully' });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // In development, still return success and log OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`OTP for ${email}: ${otpCode}`);
        res.json({ message: 'OTP sent successfully (check console in dev mode)', otp: otpCode });
      } else {
        res.status(500).json({ error: 'Failed to send email' });
      }
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

    // Find OTP
    const otpRecord = await OTP.findOne({ email, otp, verified: false });

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
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      addresses: []
    });

    await user.save();

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
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
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

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Login error:', error);
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
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 CORS enabled for http://localhost:8080`);
});

