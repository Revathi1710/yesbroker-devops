// controllers/adminController.js
const Property     = require('../models/Property');
const Subscription = require('../models/Subscription');
const Admin        = require('../models/Admin');
const Broker       = require('../models/Broker');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const slugify      = require('slugify');
const cloudinary   = require('cloudinary').v2;
const fs           = require('fs');
const { adminGenerateToken } = require('../utils/generateToken');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const deleteTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (_) {}
  }
};

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      { folder: 'brokers', resource_type: 'image' },
      (err, result) => {
        deleteTempFile(file.path);
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
  });

const toArray = (val) => {
  if (Array.isArray(val))      return val;
  if (!val)                    return [];
  const str = val.toString().trim();
  if (str.startsWith('[')) {
    try { return JSON.parse(str); } catch { /* fall through */ }
  }
  return str.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
};

const toBool = (val) => val === true || val === 'true';
const toNum  = (val) => { const n = Number(val); return isNaN(n) ? 0 : n; };

const generateSlug = async (name) => {
  const base  = slugify(name, { lower: true, strict: true });
  let slug    = base;
  let suffix  = 1;
  while (await Broker.exists({ slug })) slug = `${base}-${suffix++}`;
  return slug;
};

// ─────────────────────────────────────────────────────────────
// Helper: format relative time
// ─────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)          return `${diff}s ago`;
  if (diff < 3600)        return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)       return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ─────────────────────────────────────────────────────────────
// ADD BROKER
// ─────────────────────────────────────────────────────────────

const addBroker = async (req, res) => {
  try {
    const body = req.body ?? {};

    const name   = body.name?.toString().trim()          || '';
    const mobile = body.mobile_number?.toString().trim() || '';
    const email  = body.email?.toString().trim()         || '';

    const missing = [];
    if (!name)   missing.push('name');
    if (!mobile) missing.push('mobile_number');
    if (!email)  missing.push('email');

    if (missing.length > 0) {
      deleteTempFile(req.file?.path);
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Profile photo is required.' });
    }

    const service_offered  = toArray(body.service_offered);
    const languages_spoken = toArray(body.languages_spoken);
    const locality         = toArray(body.locality);
    const area             = toArray(body.area);
    const success_stories  = toArray(body.success_stories);
    const testimonials     = toArray(body.testimonials);

    if (service_offered.length === 0) {
      deleteTempFile(req.file.path);
      return res.status(400).json({ message: 'At least one service must be selected.' });
    }

    const duplicate = await Broker.findOne({
      $or: [{ mobile_number: mobile }, { email: email.toLowerCase() }],
    });
    if (duplicate) {
      deleteTempFile(req.file.path);
      const field = duplicate.mobile_number === mobile ? 'mobile number' : 'email';
      return res.status(409).json({ message: `A broker with this ${field} already exists.` });
    }

    let profileImage;
    try {
      profileImage = await uploadToCloudinary(req.file);
    } catch (uploadErr) {
      deleteTempFile(req.file.path);
      console.error('Cloudinary upload error:', uploadErr);
      return res.status(500).json({ error: 'Image upload failed.' });
    }

    const slug = await generateSlug(name);

    const broker = await Broker.create({
      name,
      slug,
      mobile_number:     mobile,
      email:             email.toLowerCase(),
      profileImage,
      introduction:      body.introduction?.toString()   || '',
      about:             body.about?.toString()          || '',
      languages_spoken,
      service_offered,
      agency_name:       body.agency_name?.toString()    || '',
      rera_no:           body.rera_no?.toString()        || '',
      city:              body.city?.toString()           || '',
      year_experience:   toNum(body.year_experience),
      office_address:    body.office_address?.toString() || '',
      locality,
      area,
      success_stories,
      testimonials,
      property_listings: toNum(body.property_listings),
      deals_closed:      toNum(body.deals_closed),
      happy_clients:     toNum(body.happy_clients),
      active:            toBool(body.active),
      feature:           toBool(body.feature),
    });

    return res.status(201).json({ message: 'Broker added successfully.', data: broker });

  } catch (error) {
    deleteTempFile(req.file?.path);
    console.error('Error in addBroker:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN AUTH
// ─────────────────────────────────────────────────────────────

const createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Admin.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    adminGenerateToken(user._id, res);

    res.json({
      message: 'Login successful',
      admin: { id: user._id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminCheckAuth = async (req, res) => {
  res.status(200).json({ success: true, admin: req.admin });
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await Admin.findById(req.admin._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD SUMMARY  ← fully dynamic
// ─────────────────────────────────────────────────────────────

const getAdminDashboardStats = async (req, res) => {
  try {
    const now          = new Date();
    const year         = now.getFullYear();
    const monthStart   = new Date(year, now.getMonth(), 1);
    const lastMonthStart = new Date(year, now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(year, now.getMonth(), 0, 23, 59, 59);

    // ── Core counts ──────────────────────────────────────────
    const [
      totalBrokers,
      totalProperties,
      activeSubscriptions,
      lastMonthBrokers,
      lastMonthProperties,
      lastMonthSubs,
    ] = await Promise.all([
      Broker.countDocuments(),
      Property.countDocuments(),
      Subscription.countDocuments({ status: 'Active' }),
      Broker.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      Property.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
      Subscription.countDocuments({ status: 'Active', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);

    // ── Revenue MTD & last month ──────────────────────────────
    const [revMTD, revLastMonth] = await Promise.all([
      Subscription.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
      Subscription.aggregate([
        { $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
    ]);

    const revenueMTD      = revMTD[0]?.total      ?? 0;
    const revenueLastMonth = revLastMonth[0]?.total ?? 0;

    // ── Delta helpers ─────────────────────────────────────────
    const pct = (curr, prev) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const d = (((curr - prev) / prev) * 100).toFixed(1);
      return d >= 0 ? `+${d}%` : `${d}%`;
    };

    // current month broker/property/sub counts
    const [curBrokers, curProperties, curSubs] = await Promise.all([
      Broker.countDocuments({ createdAt: { $gte: monthStart } }),
      Property.countDocuments({ createdAt: { $gte: monthStart } }),
      Subscription.countDocuments({ status: 'Active', createdAt: { $gte: monthStart } }),
    ]);

    const brokerDelta   = pct(curBrokers,    lastMonthBrokers);
    const propertyDelta = pct(curProperties, lastMonthProperties);
    const subsDelta     = pct(curSubs,       lastMonthSubs);
    const revDelta      = pct(revenueMTD,    revenueLastMonth);

    // ── Monthly chart (properties per month this year) ───────
    const monthlyStats = await Property.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
        },
      },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const chartData = Array(12).fill(0);
    monthlyStats.forEach(item => { chartData[item._id - 1] = item.count; });

    // ── Top brokers ───────────────────────────────────────────
    const topBrokers = await Broker
      .find({ active: true })
      .sort({ deals_closed: -1, dealsClosed: -1 })
      .limit(5)
      .select('name city locality area deals_closed rating')

    const topBrokersMapped = topBrokers.map(b => ({
      name:   b.name,
      city:   b.city || '—',
      deals:  b.deals_closed ?? b.dealsClosed ?? 0,
      rating: b.rating ?? 4.5,
    }));

    // ── Recent properties ─────────────────────────────────────
    const recentPropertiesRaw = await Property
      .find()
      .populate('broker', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentProperties = recentPropertiesRaw.map(p => ({
      id:       `#${p._id.toString().slice(-4).toUpperCase()}`,
      title:    p.title    || 'Property',
      location: p.location || p.city || '—',
      price:    p.price    ? `₹${p.price}` : '—',
      type:     p.listingType || p.type || 'Sale',
      status:   p.status   || 'Active',
    }));

    // ── Activity feed (last 10 events across brokers + properties + subs) ─
    const [recentBrokers, recentPropertyDocs, recentSubs] = await Promise.all([
      Broker.find().sort({ createdAt: -1 }).limit(4).select('name createdAt active'),
      Property.find().sort({ createdAt: -1 }).limit(4).select('title status createdAt _id'),
      Subscription.find().sort({ createdAt: -1 }).limit(4).select('broker plan status createdAt').populate('broker', 'name'),
    ]);

    const activityEvents = [];

    recentBrokers.forEach(b => {
      activityEvents.push({
        type:     'broker',
        strong:   b.name,
        text:     'New broker',
        action:   'registered',
        time:     timeAgo(b.createdAt),
        sortDate: b.createdAt,
      });
    });

    recentPropertyDocs.forEach(p => {
      const isActive = p.status === 'Active';
      activityEvents.push({
        type:     isActive ? 'property' : 'remove',
        strong:   `#${p._id.toString().slice(-4).toUpperCase()}`,
        text:     'Property',
        action:   isActive ? 'listed for sale' : `marked as ${p.status?.toLowerCase()}`,
        time:     timeAgo(p.createdAt),
        sortDate: p.createdAt,
      });
    });

    recentSubs.forEach(s => {
      const isPro = s.plan && s.plan.toLowerCase().includes('pro');
      activityEvents.push({
        type:     isPro ? 'pro' : 'deal',
        strong:   s.broker?.name || 'Broker',
        text:     'Broker',
        action:   isPro ? `upgraded to ${s.plan}` : `subscribed to ${s.plan || 'plan'}`,
        time:     timeAgo(s.createdAt),
        sortDate: s.createdAt,
      });
    });

    // Sort newest first, take top 6
    activityEvents.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));
    const activity = activityEvents.slice(0, 6).map(({ sortDate, ...rest }) => rest);

    // ── Response ──────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      stats: [
        {
          label: 'Total Brokers',
          value: totalBrokers.toLocaleString('en-IN'),
          delta: brokerDelta,
          up:    !brokerDelta.startsWith('-'),
          key:   'brokers',
          accent:'#1a335d',
        },
        {
          label: 'Total Properties',
          value: totalProperties.toLocaleString('en-IN'),
          delta: propertyDelta,
          up:    !propertyDelta.startsWith('-'),
          key:   'properties',
          accent:'#0ea5a4',
        },
        {
          label: 'Active Subscriptions',
          value: activeSubscriptions.toLocaleString('en-IN'),
          delta: subsDelta,
          up:    !subsDelta.startsWith('-'),
          key:   'subs',
          accent:'#f59e0b',
        },
        {
          label: 'Revenue (MTD)',
          value: `₹${(revenueMTD / 100000).toFixed(2)}L`,
          delta: revDelta,
          up:    !revDelta.startsWith('-'),
          key:   'revenue',
          accent:'#ef4444',
        },
      ],
      chartData,
      topBrokers:        topBrokersMapped,
      recentProperties,
      activity,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PROPERTIES
// ─────────────────────────────────────────────────────────────

const getAllProperty = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate({ path: 'broker', match: { active: true }, select: 'name mobile_number email slug active profileImage' })
      .sort({ createdAt: -1 });
    const filteredData = properties.filter(p => p.broker !== null);
    res.status(200).json({ success: true, count: filteredData.length, data: filteredData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true, runValidators: true }
    );
    if (!updatedProperty) return res.status(404).json({ success: false, message: 'Property not found' });
    res.status(200).json({ success: true, message: 'Property status updated successfully', data: updatedProperty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePropertyAdmin = async (req, res) => {
  try {
    const deletedProperty = await Property.findByIdAndDelete(req.params.id);
    if (!deletedProperty) return res.status(404).json({ success: false, message: 'Property not found' });
    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const adminLogout = (req, res) => {
  res.clearCookie('adminjwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
module.exports = {
  getAdminDashboardStats,
  getAllProperty,
  updatePropertyStatus,
  deletePropertyAdmin,
  addBroker,
  createAdmin,
  adminLogin,
  changePassword,
  adminCheckAuth,adminLogout
};