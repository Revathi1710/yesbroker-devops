const express = require('express');
const router = express.Router();
const multer     = require('multer');
const { addBanner, getBanners, getBannerById, editBanner, deleteBanner } = require('../controllers/banner.controller');
// 1. Configure Multer Storage
// We use memoryStorage or a temp 'uploads' folder because we are sending to Cloudinary
const storage = multer.diskStorage({}); 

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Optional: limit 5MB per file
});

router.post('/banner/add', upload.single('profileImage'), addBanner);
router.get('/banner/all', getBanners);
router.get('/banner/:id', getBannerById);
router.put('/banner/edit/:id', upload.single('profileImage'), editBanner);
router.delete('/banner/delete/:id', deleteBanner);

module.exports = router;