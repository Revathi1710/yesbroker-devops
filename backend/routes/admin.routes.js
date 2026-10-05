// routes/adminRoutes.js
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const {
  getAdminDashboardStats,
  getAllProperty,
  updatePropertyStatus,
  deletePropertyAdmin,
  addBroker,
  createAdmin,
  adminLogin,
  changePassword,adminCheckAuth,
  adminLogout
} = require('../controllers/adminController');

const Adminprotect = require('../middleware/AdminProtect');


// ── Ensure temp folder exists ─────────────────────────────────
const TEMP_DIR = 'uploads/temp/';
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// ── Multer config ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/i;
  if (allowed.test(path.extname(file.originalname))) return cb(null, true);
  cb(new Error('Only JPEG, JPG, PNG and WEBP images are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Wrap multer so errors return JSON instead of crashing
const handleUpload = (req, res, next) => {
  upload.single('profileImage')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// ── Routes ────────────────────────────────────────────────────

// Auth
router.post('/create-admin',  createAdmin);
router.post('/admin-login',   adminLogin);
router.put('/change-password', Adminprotect, changePassword);

// Dashboard / Properties
router.get('/dashboard-summary',           Adminprotect, getAdminDashboardStats);
router.get('/all-property-admin',          getAllProperty);
router.put('/update-property-status/:id',  Adminprotect, updatePropertyStatus);
router.delete('/delete-property-admin/:id', Adminprotect, deletePropertyAdmin);

// ✅ Add Broker — handleUpload MUST come before addBroker
//    Without it, req.file is undefined and req.body is empty
router.post('/addbroker', Adminprotect, handleUpload, addBroker);
router.get('/admin/check-auth', Adminprotect, adminCheckAuth);
router.post('/admin/logout', Adminprotect, adminLogout);

module.exports = router;