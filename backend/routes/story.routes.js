// ============================================================
// story.routes.js  —  FIXED VERSION
// ============================================================
const express      = require('express');
const router       = express.Router();
const multer       = require('multer');
const protectRoute = require('../middleware/protectRoute');

// ✅ Use memoryStorage so req.files have .buffer (needed for base64 → Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB per file
});

const {
  addSucessStory,
  getAllStories,
  getMyStories,       // ✅ broker's own stories (protected)
  getSingleStory,
  updateStory,
  deleteStory,
} = require('../controllers/story.controller');

// ➕ Add Story  (protected)
router.post('/add-success-story',   protectRoute, upload.array('photos', 5), addSucessStory);

// 📥 Get ALL public active stories  (public)
router.get('/all-success-stories',  getAllStories);

// 📥 Get MY stories  (protected) ✅ protectRoute added here — THIS was the bug
router.get('/my-success-stories',   protectRoute, getMyStories);

// 📥 Get single story  (public)
router.get('/success-story/:id',    getSingleStory);

// ✏️  Update  (protected)
router.put('/success-story/:id',    protectRoute, upload.array('photos', 5), updateStory);

// ❌ Delete  (protected)
router.delete('/success-story/:id', protectRoute, deleteStory);

module.exports = router;