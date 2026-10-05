const Locality = require('../models/Locality');

// ✅ Create New Locality
exports.addLocality = async (req, res) => {
    try {
        const { zone, state, active } = req.body;
        const newLocality = new Locality({ zone, state, active });
        await newLocality.save();
        
        res.status(201).json({ 
            success: true, 
            message: "Locality added!", 
            data: newLocality 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get All Localities
exports.getAllLocalities = async (req, res) => {
    try {
        const localities = await Locality.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: localities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Update Locality
exports.updateLocality = async (req, res) => {
    try {
        const updated = await Locality.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Delete Locality
exports.deleteLocality = async (req, res) => {
    try {
        await Locality.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Locality deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};