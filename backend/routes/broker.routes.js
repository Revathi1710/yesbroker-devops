const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const path       = require('path');
const {
  brokerRegister,
  myProfile,
  updateProfile,
  getBrokerById,
  getZones,
  getBrokerBySlug,
  getBrokerProperties,
  getBrokerStories,
  getAllBroker,
  updateBrokerstatus,
  getFeatureBroker,
  brokerLogin,verifyRegisterOtp,resendRegisterOtp,
  sendLoginOtp,verifyLoginOtp,resendLoginOtp,brokerLogout,getRecentActivity
} = require('../controllers/brokers.controller');
const protectRoute = require('../middleware/protectRoute');
const Broker = require('../models/Broker');

// ── Multer config ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed (jpg, png, webp)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// ── Public routes ─────────────────────────────────────────────
router.get('/zones',                                             getZones);

// ── Registration Flow ─────────────────────────────────────────
router.post('/brokerRegister',            upload.single('profileImage'), brokerRegister);
router.post('/brokerRegister/verify-otp', verifyRegisterOtp);
router.post('/brokerRegister/resend-otp', resendRegisterOtp);
 router.get('/broker/recent-activity', protectRoute, getRecentActivity);
// ── Login Flow ────────────────────────────────────────────────
router.post('/broker/send-otp',    sendLoginOtp);
router.post('/broker/verify-otp',  verifyLoginOtp);
router.post('/broker/resend-otp',  resendLoginOtp);
router.get('/broker/:id', getBrokerById);

// ── Private routes ────────────────────────────────────────────
router.get('/brokerProfile', protectRoute, myProfile);
router.put('/broker/update-profile', protectRoute, upload.single('profileImage'), updateProfile);
router.post('/broker/logout', brokerLogout);
router.get('/brokers/:slug', getBrokerBySlug);
router.get('/brokers/:slug/properties',getBrokerProperties);
router.get('/brokers/:slug/success-stories',getBrokerStories);
router.get('/allbrokers',getAllBroker);
router.put('/update-broker-status/:id',updateBrokerstatus);
router.get('/feature-broker',getFeatureBroker);

module.exports = router;