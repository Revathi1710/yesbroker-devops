const Broker = require('../models/Broker');
const { generateToken } = require('../utils/generateToken');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const generateUniqueSlug = require('../utils/generateUniqueSlug');
const Property = require('../models/Property');
const SuccessStory = require('../models/SuccessStory');
const nodemailer = require('nodemailer');

// ── Chennai Zones & Localities ────────────────────────────────
const CHENNAI_ZONES = {
  'South Chennai': [
    'Velachery', 'Medavakkam', 'Pallikaranai', 'Perumbakkam', 'Sholinganallur',
    'Thoraipakkam', 'Perungudi', 'Nanganallur', 'Madipakkam', 'Chromepet',
    'Pallavaram', 'Tambaram', 'Guduvanchery', 'Urapakkam', 'Keelkattalai',
    'Selaiyur', 'Madambakkam',
  ],
  'Central Chennai': [
    'T. Nagar', 'Nungambakkam', 'Chetpet', 'Adyar', 'Mylapore', 'Alwarpet',
    'Teynampet', 'Kilpauk', 'Kodambakkam', 'Saidapet', 'Guindy',
    'Vadapalani', 'Ashok Nagar',
  ],
  'West Chennai': [
    'Porur', 'Valasaravakkam', 'Ambattur', 'Mogappair', 'Poonamallee', 'Avadi',
    'Korattur', 'Thirumangalam', 'Ramapuram', 'Manapakkam', 'Virugambakkam',
  ],
  'North Chennai': [
    'Madhavaram', 'Perambur', 'Kolathur', 'Villivakkam', 'Tondiarpet',
    'Manali', 'Korukkupet', 'Tiruvottiyur', 'Ayanavaram',
  ],
  'East Chennai / OMR / ECR': [
    'OMR', 'ECR', 'Thiruvanmiyur',
    'Kottivakkam', 'Neelankarai', 'Injambakkam', 'Kovalam', 'Siruseri',
  ],
};

// ── In-Memory OTP Store ───────────────────────────────────────
// Structure: { email: { otp, expiresAt, attempts, requestCount, windowEnd, purpose } }
// purpose: 'register' | 'login'
const otpStore = new Map();

// ── Nodemailer Transporter ────────────────────────────────────
// ── Final Transporter Fix ────────────────────────────────────
// ── Hard-Coded IPv4 Transporter ────────────────────────────────────
const transporter = nodemailer.createTransport({
  // Use a direct Google IPv4 address to bypass Render's IPv6 routing
  host: '74.125.130.108', 
  port: 465, 
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // CRITICAL: Tell the TLS handshake to expect the gmail hostname
  tls: {
    servername: 'smtp.gmail.com',
    rejectUnauthorized: false
  },
  // Explicitly force IPv4 at the socket level
  family: 4,
  connectionTimeout: 20000,
  greetingTimeout: 20000,
});

// ── Helper: safely delete a local temp file ───────────────────
const deleteTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (_) {}
  }
};

// ── Helper: upload to Cloudinary and clean up temp ────────────
const uploadToCloudinary = async (file, folder = 'broker_profiles') => {
  const result = await cloudinary.uploader.upload(file.path, { folder });
  deleteTempFile(file.path);
  return result.secure_url;
};

// ── Helper: parse all array/number fields from FormData ───────
const parseFormFields = (updates) => {
  const arrayFields = [
    'service_offered', 'languages_spoken',
    'locality', 'area', 'success_stories', 'testimonials',
  ];
  const numberFields = [
    'year_experience', 'property_listings', 'deals_closed', 'happy_clients',
  ];

  arrayFields.forEach(field => {
    if (updates[field] !== undefined && typeof updates[field] === 'string') {
      try {
        const parsed = JSON.parse(updates[field]);
        updates[field] = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        updates[field] = updates[field] ? [updates[field]] : [];
      }
    }
  });

  numberFields.forEach(field => {
    if (updates[field] !== undefined && updates[field] !== '') {
      const num = Number(updates[field]);
      updates[field] = isNaN(num) ? 0 : num;
    } else if (updates[field] === '') {
      updates[field] = 0;
    }
  });

  Object.keys(updates).forEach(key => {
    if (updates[key] === 'undefined' || updates[key] === 'null') {
      delete updates[key];
    }
  });

  return updates;
};

// ── Helper: generate 6-digit OTP ─────────────────────────────
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── Helper: send OTP email ────────────────────────────────────
const sendOtpEmail = async (email, otp, purpose = 'login') => {
  const isRegister = purpose === 'register';
  const subject    = isRegister ? 'Verify your Email – OTP' : 'Your Login OTP';
  const heading    = isRegister ? 'Verify Your Email Address' : 'Your Login OTP';
  const subtext    = isRegister
    ? 'You\'re almost there! Use the code below to verify your email and complete registration.'
    : 'Use the code below to log in to your account. It expires in <strong>2 minutes</strong>.';

  await transporter.sendMail({
    from:    `"${process.env.APP_NAME || 'Real Estate Platform'}" <${process.env.SMTP_USER}>`,
    to:      email,
    subject,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:500px;margin:auto;padding:0;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10)">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#e8341c,#ff6b35);padding:36px 32px 28px;text-align:center">
          <div style="font-size:2.5rem;margin-bottom:8px">${isRegister ? '📬' : '🔐'}</div>
          <h1 style="color:#fff;margin:0;font-size:1.5rem;font-weight:800;letter-spacing:-0.5px">${heading}</h1>
        </div>
        <!-- Body -->
        <div style="background:#fff;padding:36px 32px">
          <p style="color:#64748b;line-height:1.7;margin:0 0 24px">${subtext}</p>
          <!-- OTP Box -->
          <div style="text-align:center;margin:28px 0">
            <div style="display:inline-block;background:#fff1ee;border:2px solid #fbd0c9;border-radius:16px;padding:20px 40px">
              <div style="font-size:0.75rem;font-weight:700;letter-spacing:2px;color:#e8341c;margin-bottom:6px;text-transform:uppercase">Your OTP</div>
              <div style="font-size:2.8rem;font-weight:900;letter-spacing:14px;color:#e8341c;font-family:'Courier New',monospace">${otp}</div>
            </div>
          </div>
          <!-- Timer note -->
          <div style="background:#f8fafc;border-radius:10px;padding:14px 18px;text-align:center;margin-bottom:24px">
            <span style="color:#64748b;font-size:0.88rem">⏱&nbsp; This code expires in <strong>2 minutes</strong></span>
          </div>
          <p style="color:#94a3b8;font-size:0.82rem;text-align:center;margin:0">
            If you didn't request this, you can safely ignore this email.<br/>
            Never share this OTP with anyone.
          </p>
        </div>
        <!-- Footer -->
        <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #f0f0f0">
          <p style="color:#cbd5e1;font-size:0.78rem;margin:0">&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Real Estate Platform'}. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

// ── Helper: OTP rate-limit check & store ─────────────────────
const storeOtp = (email, otp, purpose) => {
  const existing   = otpStore.get(email);
  const now        = Date.now();
  const windowEnd  = (existing?.windowEnd && now < existing.windowEnd)
    ? existing.windowEnd
    : now + 10 * 60 * 1000; // 10-min rate-limit window
  const requestCount = (existing?.windowEnd && now < existing.windowEnd)
    ? (existing.requestCount || 0) + 1
    : 1;

  otpStore.set(email, {
    otp,
    expiresAt:    now + 2 * 60 * 1000, // 2-min TTL
    attempts:     0,
    requestCount,
    windowEnd,
    purpose,
  });
};

const checkRateLimit = (email) => {
  const existing = otpStore.get(email);
  if (!existing) return null;
  const now = Date.now();
  if (existing.requestCount >= 3 && now < existing.windowEnd) {
    const waitMin = Math.ceil((existing.windowEnd - now) / 60000);
    return `Too many OTP requests. Please wait ${waitMin} minute(s).`;
  }
  return null;
};

// ════════════════════════════════════════════════════════════════
// REGISTER — STEP 1: Submit form → send verification OTP
// @route   POST /api/brokerRegister
// ════════════════════════════════════════════════════════════════
const brokerRegister = async (req, res) => {
  try {
    const { name, mobile_number, email, service_offered } = req.body;

    // ── Basic validation ──
    if (!name || !mobile_number || !email) {
      deleteTempFile(req.file?.path);
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    // ── Check duplicates ──
    const existing = await Broker.findOne({
      $or: [{ mobile_number }, { email: email.trim().toLowerCase() }],
    });
    if (existing) {
      deleteTempFile(req.file?.path);
      return res.status(400).json({
        message: existing.mobile_number === mobile_number
          ? 'Mobile number already registered'
          : 'Email already registered',
      });
    }

    // ── Image required ──
    if (!req.file) {
      return res.status(400).json({ message: 'Profile image is required' });
    }

    // ── Parse services ──
    let parsedServices = service_offered;
    if (typeof service_offered === 'string') {
      try { parsedServices = JSON.parse(service_offered); }
      catch { parsedServices = [service_offered]; }
    }
    if (!Array.isArray(parsedServices) || parsedServices.length === 0) {
      deleteTempFile(req.file?.path);
      return res.status(400).json({ message: 'At least one service must be selected' });
    }

    // ── Rate-limit check ──
    const rateLimitMsg = checkRateLimit(email.trim().toLowerCase());
    if (rateLimitMsg) {
      deleteTempFile(req.file?.path);
      return res.status(429).json({ message: rateLimitMsg });
    }

    // ── Upload image to Cloudinary ──
    const profileImageUrl = await uploadToCloudinary(req.file);

    // ── Generate slug ──
    const cleanName = name.trim();
    const slug      = await generateUniqueSlug(cleanName);

    // ── Generate & send OTP ──
    const otp = generateOtp();
    storeOtp(email.trim().toLowerCase(), otp, 'register');

    // Temporarily store pending broker data alongside OTP
    const otpRecord      = otpStore.get(email.trim().toLowerCase());
    otpRecord.pendingData = {
      name:          cleanName,
      slug,
      mobile_number: mobile_number.trim(),
      email:         email.trim().toLowerCase(),
      profileImage:  profileImageUrl,
      service_offered: parsedServices,
    };
    otpStore.set(email.trim().toLowerCase(), otpRecord);

    await sendOtpEmail(email.trim().toLowerCase(), otp, 'register');

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      email:   email.trim().toLowerCase(),
    });

  } catch (error) {
    deleteTempFile(req.file?.path);
    console.error('Error in brokerRegister:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ════════════════════════════════════════════════════════════════
// REGISTER — STEP 2: Verify OTP → create broker account
// @route   POST /api/brokerRegister/verify-otp
// ════════════════════════════════════════════════════════════════
const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const record          = otpStore.get(normalizedEmail);

    // ── OTP checks ──
    if (!record || record.purpose !== 'register') {
      return res.status(400).json({ message: 'OTP not found. Please restart registration.' });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }
    if (record.attempts >= 5) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'Too many failed attempts. Please restart registration.' });
    }
    if (record.otp !== otp.toString().trim()) {
      record.attempts += 1;
      otpStore.set(normalizedEmail, record);
      const remaining = 5 - record.attempts;
      return res.status(400).json({
        message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      });
    }

    // ── OTP valid — create broker ──
    const { pendingData } = record;
    otpStore.delete(normalizedEmail);

    if (!pendingData) {
      return res.status(400).json({ message: 'Registration data not found. Please restart.' });
    }

    const newBroker = new Broker({
      ...pendingData,
      emailVerified: true,
    });

    try {
      await newBroker.save();
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.slug) {
        const newSlug   = await generateUniqueSlug(pendingData.name);
        newBroker.slug  = newSlug;
        await newBroker.save();
      } else {
        throw err;
      }
    }

    generateToken(newBroker._id, res);

    res.status(201).json({
      message: 'Registration successful! Welcome aboard.',
      data: {
        _id:             newBroker._id,
        name:            newBroker.name,
        slug:            newBroker.slug,
        mobile_number:   newBroker.mobile_number,
        email:           newBroker.email,
        profileImage:    newBroker.profileImage,
        service_offered: newBroker.service_offered,
        emailVerified:   newBroker.emailVerified,
      },
    });

  } catch (error) {
    console.error('Error in verifyRegisterOtp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ════════════════════════════════════════════════════════════════
// REGISTER — Resend OTP (registration)
// @route   POST /api/brokerRegister/resend-otp
// ════════════════════════════════════════════════════════════════
const resendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const normalizedEmail = email.trim().toLowerCase();

    const rateLimitMsg = checkRateLimit(normalizedEmail);
    if (rateLimitMsg) return res.status(429).json({ message: rateLimitMsg });

    const existing = otpStore.get(normalizedEmail);
    if (!existing || !existing.pendingData) {
      return res.status(400).json({ message: 'No pending registration found. Please start again.' });
    }

    const otp         = generateOtp();
    const pendingData = existing.pendingData;

    storeOtp(normalizedEmail, otp, 'register');
    const record      = otpStore.get(normalizedEmail);
    record.pendingData = pendingData; // preserve pending data
    otpStore.set(normalizedEmail, record);

    await sendOtpEmail(normalizedEmail, otp, 'register');

    res.status(200).json({ message: 'New OTP sent to your email.' });

  } catch (error) {
    console.error('Error in resendRegisterOtp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ════════════════════════════════════════════════════════════════
// LOGIN — STEP 1: Send OTP to registered email
// @route   POST /api/broker/send-otp
// ════════════════════════════════════════════════════════════════
const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Check broker exists ──
    const broker = await Broker.findOne({ email: normalizedEmail });
    if (!broker) {
      return res.status(404).json({
        message: 'No account found with this email. Please register first.',
      });
    }

    // ── Rate-limit ──
    const rateLimitMsg = checkRateLimit(normalizedEmail);
    if (rateLimitMsg) return res.status(429).json({ message: rateLimitMsg });

    // ── Generate & send OTP ──
    const otp = generateOtp();
    storeOtp(normalizedEmail, otp, 'login');

    await sendOtpEmail(normalizedEmail, otp, 'login');

    res.status(200).json({ message: 'OTP sent successfully to your email.' });

  } catch (error) {
    console.error('Error in sendLoginOtp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ════════════════════════════════════════════════════════════════
// LOGIN — STEP 2: Verify OTP → issue token
// @route   POST /api/broker/verify-otp
// ════════════════════════════════════════════════════════════════
const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const record          = otpStore.get(normalizedEmail);

    if (!record || record.purpose !== 'login') {
      return res.status(400).json({ message: 'OTP not found. Please request a new one.' });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }
    if (record.attempts >= 5) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }
    if (record.otp !== otp.toString().trim()) {
      record.attempts += 1;
      otpStore.set(normalizedEmail, record);
      const remaining = 5 - record.attempts;
      return res.status(400).json({
        message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      });
    }

    otpStore.delete(normalizedEmail);

    const broker = await Broker.findOne({ email: normalizedEmail });
    if (!broker) {
      return res.status(404).json({ message: 'Broker account not found.' });
    }

    generateToken(broker._id, res);

    res.status(200).json({
      message: `Welcome back, ${broker.name}!`,
      data: {
        _id:             broker._id,
        name:            broker.name,
        email:           broker.email,
        mobile_number:   broker.mobile_number,
        profileImage:    broker.profileImage,
        slug:            broker.slug,
        service_offered: broker.service_offered,
        emailVerified:   broker.emailVerified,
      },
    });

  } catch (error) {
    console.error('Error in verifyLoginOtp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ════════════════════════════════════════════════════════════════
// LOGIN — Resend OTP (login)
// @route   POST /api/broker/resend-otp
// ════════════════════════════════════════════════════════════════
const resendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const normalizedEmail = email.trim().toLowerCase();

    const broker = await Broker.findOne({ email: normalizedEmail });
    if (!broker) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    const rateLimitMsg = checkRateLimit(normalizedEmail);
    if (rateLimitMsg) return res.status(429).json({ message: rateLimitMsg });

    const otp = generateOtp();
    storeOtp(normalizedEmail, otp, 'login');
    await sendOtpEmail(normalizedEmail, otp, 'login');

    res.status(200).json({ message: 'New OTP sent to your email.' });

  } catch (error) {
    console.error('Error in resendLoginOtp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const brokerLogout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
// add to module.exports: brokerLogout
// ════════════════════════════════════════════════════════════════
// GET /api/zones
// ════════════════════════════════════════════════════════════════
const getZones = (_req, res) => {
  res.status(200).json({ zones: CHENNAI_ZONES });
};

// ════════════════════════════════════════════════════════════════
// GET /api/brokerProfile
// ════════════════════════════════════════════════════════════════
const myProfile = async (req, res) => {
  try {
    const broker = await Broker.findById(req.user._id).lean();
    if (!broker) return res.status(404).json({ message: 'Broker not found' });
    res.status(200).json(broker);
  } catch (error) {
    console.error('Error in myProfile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ════════════════════════════════════════════════════════════════
// PUT /api/broker/update-profile
// ════════════════════════════════════════════════════════════════
const updateProfile = async (req, res) => {
  try {
    const brokerId = req.user._id;
    const broker   = await Broker.findById(brokerId);
    if (!broker) {
      deleteTempFile(req.file?.path);
      return res.status(404).json({ message: 'Broker not found' });
    }

    let updates = { ...req.body };

    if (req.file) {
      try {
        updates.profileImage = await uploadToCloudinary(req.file);
      } catch (uploadErr) {
        deleteTempFile(req.file?.path);
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ error: 'Image upload failed' });
      }
    }

    updates = parseFormFields(updates);

    if (Array.isArray(updates.locality)) {
      const allLocalities = Object.values(CHENNAI_ZONES).flat();
      const invalid       = updates.locality.filter(l => !allLocalities.includes(l));
      if (invalid.length > 0) {
        return res.status(400).json({ message: `Invalid localities: ${invalid.join(', ')}` });
      }
    }

    ['mobile_number', 'email', '__v', '_id', 'createdAt', 'updatedAt'].forEach(
      key => delete updates[key]
    );

    const updatedBroker = await Broker.findByIdAndUpdate(
      brokerId,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    res.status(200).json({ message: 'Profile updated successfully', data: updatedBroker });

  } catch (error) {
    deleteTempFile(req.file?.path);
    console.error('Error in updateProfile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ════════════════════════════════════════════════════════════════
// GET /api/broker/:id
// ════════════════════════════════════════════════════════════════
const getBrokerById = async (req, res) => {
  try {
    const broker = await Broker.findById(req.params.id).select('-__v').lean();
    if (!broker) return res.status(404).json({ message: 'Broker not found' });
    res.status(200).json(broker);
  } catch (error) {
    console.error('Error in getBrokerById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ════════════════════════════════════════════════════════════════
// GET /api/brokers/:slug
// ════════════════════════════════════════════════════════════════
const getBrokerBySlug = async (req, res) => {
  try {
    const broker = await Broker.findOne({ slug: req.params.slug }).select('-__v').lean();
    if (!broker) return res.status(404).json({ message: 'Broker not found' });
    res.status(200).json(broker);
  } catch (error) {
    console.error('Error in getBrokerBySlug:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ════════════════════════════════════════════════════════════════
// GET /api/brokers/:slug/properties
// ════════════════════════════════════════════════════════════════
const getBrokerProperties = async (req, res) => {
  try {
    const broker = await Broker.findOne({ slug: req.params.slug });
    if (!broker) return res.status(404).json({ message: 'Broker not found' });

    const properties = await Property.find({ broker: broker._id })
      .sort({ createdAt: -1 }).lean();

    res.status(200).json(properties);
  } catch (error) {
    console.error('Error in getBrokerProperties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ════════════════════════════════════════════════════════════════
// GET /api/brokers/:slug/success-stories
// ════════════════════════════════════════════════════════════════
const getBrokerStories = async (req, res) => {
  try {
    const broker = await Broker.findOne({ slug: req.params.slug });
    if (!broker) return res.status(404).json({ message: 'Broker not found' });

    const stories = await SuccessStory.find({ broker: broker._id })
      .sort({ createdAt: -1 }).lean();

    res.status(200).json(stories);
  } catch (error) {
    console.error('Error in getBrokerStories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ════════════════════════════════════════════════════════════════
// ADMIN — GET /api/admin/brokers
// ════════════════════════════════════════════════════════════════
const getAllBroker = async (req, res) => {
  try {
    const brokers = await Broker.find();
    res.status(200).json({ success: true, data: brokers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching brokers', error: error.message });
  }
};

// ════════════════════════════════════════════════════════════════
// ADMIN — PATCH /api/admin/brokers/:id/status
// ════════════════════════════════════════════════════════════════
const updateBrokerstatus = async (req, res) => {
  try {
    const updated = await Broker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ════════════════════════════════════════════════════════════════
// GET /api/brokers/featured
// ════════════════════════════════════════════════════════════════
const getFeatureBroker = async (req, res) => {
  try {
    const featured = await Broker.find({ feature: true, active: true });
    res.json({ success: true, data: featured });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getRecentActivity = async (req, res) => {
  try {
    const brokerId = req.user._id;
 
    // Fetch broker, properties, and stories in parallel
    const [broker, properties, stories] = await Promise.all([
      Broker.findById(brokerId).lean(),
      Property.find({ broker: brokerId }).sort({ createdAt: -1 }).limit(5).lean(),
      SuccessStory.find({ broker: brokerId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);
 
    if (!broker) return res.status(404).json({ message: 'Broker not found' });
 
    const activities = [];
 
    // ── Profile created ──
    activities.push({
      type:    'profile',
      icon:    '👤',
      color:   '#8b5cf6',
      message: 'Your broker profile was created',
      time:    broker.createdAt,
    });
 
    // ── Profile updated (if updatedAt differs from createdAt) ──
    if (
      broker.updatedAt &&
      new Date(broker.updatedAt).getTime() - new Date(broker.createdAt).getTime() > 5000
    ) {
      activities.push({
        type:    'profile_update',
        icon:    '✏️',
        color:   '#f59e0b',
        message: 'You updated your profile',
        time:    broker.updatedAt,
      });
    }
 
    // ── Email verified ──
    if (broker.emailVerified) {
      activities.push({
        type:    'verification',
        icon:    '✅',
        color:   '#22c55e',
        message: 'Email address verified successfully',
        time:    broker.createdAt,
      });
    }
 
    // ── Properties added ──
    properties.forEach((p) => {
      activities.push({
        type:    'property',
        icon:    '🏠',
        color:   '#e8341c',
        message: `Property listed: ${p.title || p.propertyType || 'New Property'}`,
        time:    p.createdAt,
        meta:    p.status || null,
      });
    });
 
    // ── Success stories ──
    stories.forEach((s) => {
      activities.push({
        type:    'story',
        icon:    '📖',
        color:   '#10b981',
        message: `Success story added: ${s.title || s.clientName || 'New Story'}`,
        time:    s.createdAt,
      });
    });
 
    // ── Profile completion nudge ──
    const completionFields = [
      broker.about,
      broker.locality?.length,
      broker.languages_spoken?.length,
    ];
    const completionScore = Math.round(
      (completionFields.filter(Boolean).length / completionFields.length) * 100
    );
    if (completionScore < 100) {
      activities.push({
        type:    'nudge',
        icon:    '💡',
        color:   '#f59e0b',
        message: `Profile ${completionScore}% complete — add more details to attract clients`,
        time:    new Date(),
        isNudge: true,
      });
    }
 
    // Sort by time descending, take latest 10
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const latest = activities.slice(0, 10);
 
    res.status(200).json({ success: true, data: latest });
 
  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ════════════════════════════════════════════════════════════════
// Exports
// ════════════════════════════════════════════════════════════════
module.exports = {
  // Registration flow
  brokerRegister,
  verifyRegisterOtp,
  resendRegisterOtp,

  // Login flow
  sendLoginOtp,
  verifyLoginOtp,
  resendLoginOtp,

  // Profile
  myProfile,
  updateProfile,
  getBrokerById,
  getBrokerBySlug,
  getBrokerProperties,
  getBrokerStories,

  // Admin
  getAllBroker,
  updateBrokerstatus,
  getFeatureBroker,
brokerLogout,
  // Zones
  getZones,getRecentActivity,

  // Exported for tests
  _parseFormFields: parseFormFields,
  _CHENNAI_ZONES:   CHENNAI_ZONES,
};