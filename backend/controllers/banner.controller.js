const Banner = require('../models/Banner');
const cloudinary = require('../utils/cloudinary');

// ✅ ADD BANNER
const addBanner = async (req, res) => {
    try {
        const { title, subtitle, button, url } = req.body;

        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload a banner image." });
        }

        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "yesbroker_banners",
        });

        const newBanner = new Banner({
            title,
            subtitle,
            button,
            url,
            profileImage: uploadResult.secure_url,
        });

        const savedBanner = await newBanner.save();

        res.status(201).json({
            success: true,
            message: "Banner added successfully!",
            data: savedBanner,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ GET ALL BANNERS
const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: banners.length, data: banners });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ GET BANNER BY ID
const getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });
        res.status(200).json({ success: true, data: banner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ EDIT BANNER
const editBanner = async (req, res) => {
    try {
        const { title, subtitle, button, url } = req.body;
        let banner = await Banner.findById(req.params.id);

        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

        let imageUrl = banner.profileImage;

        // If a new file is uploaded, replace the old one on Cloudinary
        if (req.file) {
            // Optional: Delete old image from Cloudinary here
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: "yesbroker_banners",
            });
            imageUrl = uploadResult.secure_url;
        }

        const updatedBanner = await Banner.findByIdAndUpdate(
            req.params.id,
            { title, subtitle, button, url, profileImage: imageUrl },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Banner updated!", data: updatedBanner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ DELETE BANNER
const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

        // Delete from Cloudinary logic (Optional but recommended)
        const publicId = banner.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`yesbroker_banners/${publicId}`);

        await banner.deleteOne();
        res.status(200).json({ success: true, message: "Banner deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    addBanner, 
    getBanners, 
    getBannerById, 
    editBanner, 
    deleteBanner 
};