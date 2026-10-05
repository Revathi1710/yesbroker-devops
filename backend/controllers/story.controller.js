// ============================================================
// story.controller.js  —  FIXED VERSION
// ============================================================
const SuccessStory = require('../models/SuccessStory');
const cloudinary   = require('../utils/cloudinary');

/* ─── helper: upload one file buffer → cloudinary ─────────────────────── */
const uploadToCloudinary = (file) =>
  cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    { folder: 'success-stories' }
  );

/* ─── helper: delete by URL ────────────────────────────────────────────── */
const deleteFromCloudinary = async (url) => {
  try {
    // URL pattern: .../upload/v123456/success-stories/filename.jpg
    const parts    = url.split('/');
    const filename = parts[parts.length - 1].split('.')[0];   // strip extension
    const folder   = parts[parts.length - 2];                 // folder name
    await cloudinary.uploader.destroy(`${folder}/${filename}`);
  } catch (err) {
    console.warn('Cloudinary delete warning:', err.message);
  }
};

// ================= ADD STORY =================
const addSucessStory = async (req, res) => {
  try {
    const {
      title, shortSummary, description,
      totalPropertiesSold, totalRevenue, dealValue,
      timeTaken, location, propertyType,
      clientName, clientFeedback, rating, successDate,
    } = req.body;

    // Upload all photos
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      const results = await Promise.all(req.files.map(uploadToCloudinary));
      photoUrls = results.map((r) => r.secure_url);
    }

    const story = await SuccessStory.create({
      broker: req.user._id,        // ✅ req.user set by protectRoute
      title,
      shortSummary,
      description,
      totalPropertiesSold,
      totalRevenue,
      dealValue,
      timeTaken,
      location,
      propertyType,
      clientName,
      clientFeedback,
      rating,
      successDate,
      photos: photoUrls,
    });

    res.status(201).json({ success: true, message: 'Story added successfully', data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET ALL (public) =================
const getAllStories = async (req, res) => {
  try {
    const stories = await SuccessStory.find({ status: 'Active' })
      .populate('broker', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: stories.length, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET MY STORIES (broker's own) =================
const getMyStories = async (req, res) => {
  try {
    // ✅ req.user._id available because protectRoute runs first
    const stories = await SuccessStory.find({ broker: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: stories.length, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET SINGLE =================
const getSingleStory = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id)
      .populate('broker', 'name email');

    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE =================
const updateStory = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);

    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    // ✅ req.user._id available because protectRoute runs first
    if (story.broker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    /* ── Handle removed photos ── */
    let updatedPhotos = [...(story.photos || [])];

    if (req.body.removedPhotos) {
      const removed = JSON.parse(req.body.removedPhotos);   // array of URLs
      await Promise.all(removed.map(deleteFromCloudinary));
      updatedPhotos = updatedPhotos.filter((url) => !removed.includes(url));
    }

    /* ── Upload new photos ── */
    if (req.files && req.files.length > 0) {
      if (updatedPhotos.length + req.files.length > 5) {
        return res.status(400).json({ success: false, message: 'Maximum 5 photos allowed.' });
      }
      const results  = await Promise.all(req.files.map(uploadToCloudinary));
      const newUrls  = results.map((r) => r.secure_url);
      updatedPhotos  = [...updatedPhotos, ...newUrls];
    }

    /* ── Strip non-schema keys (removedPhotos) before update ── */
    const { removedPhotos, ...fieldsToUpdate } = req.body;

    const updated = await SuccessStory.findByIdAndUpdate(
      req.params.id,
      { ...fieldsToUpdate, photos: updatedPhotos },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Story updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE =================
const deleteStory = async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);

    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    // ✅ req.user._id available because protectRoute runs first
    if (story.broker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete all photos from Cloudinary
    if (story.photos?.length > 0) {
      await Promise.all(story.photos.map(deleteFromCloudinary));
    }

    await story.deleteOne();

    res.status(200).json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addSucessStory,
  getAllStories,
  getMyStories,      // ✅ NEW — export this
  getSingleStory,
  updateStory,
  deleteStory,
};