const Property = require('../models/Property');
const cloudinary = require('../utils/cloudinary');

// ✅ ADD PROPERTY (Linked to Broker)
const addProperty = async (req, res) => {
    try {
        const { 
            listingType, propertyType, localities, 
            size, price, description, status 
        } = req.body;

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) =>
                cloudinary.uploader.upload(file.path, { folder: "yesbroker_properties" })
            );
            const uploadResults = await Promise.all(uploadPromises);
            imageUrls = uploadResults.map((result) => result.secure_url);
        }

        const newProperty = new Property({
            listingType,
            propertyType,
            localities: Array.isArray(localities) ? localities : JSON.parse(localities),
            size,
            price,
            description,
            status: status || "Active",
            photos: imageUrls,
            broker: req.user._id // ✨ Link the property to the logged-in broker
        });

        const savedProperty = await newProperty.save();

        res.status(201).json({
            success: true,
            message: "Property added successfully!",
            data: savedProperty,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ GET BROKER-SPECIFIC PROPERTIES (My Properties)
const getMyProperties = async (req, res) => {
    try {
        // ✨ Only find properties where the broker ID matches the logged-in user
        const properties = await Property.find({ broker: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const editPropertyBroker=async (req,res) => {
    try {
         const properties = await Property.find({ broker: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}/* ─── GET Single Property by ID ─────────────────────────────────────────────── */
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
 
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found." });
    }
 
    // Only the owner broker can view their property in edit context
    if (property.broker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }
 
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
/* ─── PUT Edit Property ──────────────────────────────────────────────────────── */
const editProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
 
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found." });
    }
 
    // Only the owner broker can edit
    if (property.broker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }
 
    const {
      listingType,
      propertyType,
      localities,
      size,
      price,
      description,
      status,
      removedPhotos, // JSON string array of old photo URLs to remove
    } = req.body;
 
    /* ── Handle removed photos ── */
    let updatedPhotos = [...(property.photos || [])];
 
    if (removedPhotos) {
      const removed = JSON.parse(removedPhotos); // array of URLs
 
      // If using Cloudinary — delete from cloud storage
      for (const url of removed) {
        // Extract public_id from URL  e.g. ".../upload/v123/folder/filename.jpg"
        const parts = url.split("/");
        const filenameWithExt = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        const publicId = `${folder}/${filenameWithExt.split(".")[0]}`;
 
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("Cloudinary delete failed for:", publicId, err.message);
        }
      }
 
      // Remove from photos array
      updatedPhotos = updatedPhotos.filter((url) => !removed.includes(url));
    }
 
    /* ── Handle new uploaded photos ── */
    if (req.files && req.files.length > 0) {
      if (updatedPhotos.length + req.files.length > 5) {
        return res.status(400).json({
          success: false,
          message: "Maximum 5 photos allowed.",
        });
      }
 
      // ── If using Cloudinary ──
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "properties" })
      );
      const uploadResults = await Promise.all(uploadPromises);
      const newUrls = uploadResults.map((r) => r.secure_url);
      updatedPhotos = [...updatedPhotos, ...newUrls];
 
      // ── If using local multer storage (not Cloudinary), replace above with:
      // const newUrls = req.files.map((f) => `/uploads/${f.filename}`);
      // updatedPhotos = [...updatedPhotos, ...newUrls];
    }
 
    /* ── Update fields ── */
    property.listingType  = listingType  ?? property.listingType;
    property.propertyType = propertyType ?? property.propertyType;
    property.localities   = localities ? JSON.parse(localities) : property.localities;
    property.size         = size         ?? property.size;
    property.price        = price        ?? property.price;
    property.description  = description  ?? property.description;
    property.status       = status       ?? property.status;
    property.photos       = updatedPhotos;
 
    const updated = await property.save();
 
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
/* ─── DELETE Property ────────────────────────────────────────────────────────── */
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
 
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found." });
    }
 
    // Only the owner broker can delete
    if (property.broker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }
 
    /* ── Delete all photos from Cloudinary ── */
    if (property.photos && property.photos.length > 0) {
      for (const url of property.photos) {
        const parts = url.split("/");
        const filenameWithExt = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        const publicId = `${folder}/${filenameWithExt.split(".")[0]}`;
 
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("Cloudinary delete failed for:", publicId, err.message);
        }
      }
    }
 
    await property.deleteOne();
 
    res
      .status(200)
      .json({ success: true, message: "Property deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/** get locality by search */
const getPropertiesByLocality = async (req, res) => {
  try {
    const { slug } = req.params;            // locality slug (or "all")
    const { type, propertyType } = req.query; // listingType OR propertyType
 
    let query = {};
 
    // 1. Locality filter — skip if "all"
    if (slug && slug.toLowerCase() !== 'all') {
      const slugArray = slug.split(',');
      const localityQueries = slugArray.map(s => new RegExp(s.trim(), 'i'));
      query.localities = { $in: localityQueries };
    }
 
    // 2. listingType filter (buy/rent/pg/commercial/plots)
    if (type && type.toLowerCase() !== 'all') {
      query.listingType = new RegExp(type.trim(), 'i');
    }
 
    // ✅ FIX: propertyType filter — was using `type` variable by mistake
    if (propertyType && propertyType.toLowerCase() !== 'all') {
      query.propertyType = new RegExp(propertyType.trim(), 'i');
    }
 
    const properties = await Property.find(query)
      .populate({
        path: 'broker',
        match: { active: true },
        select: 'name mobile_number email slug',
      })
      .sort({ createdAt: -1 });
 
    // Remove properties whose broker is inactive (null after populate)
    const filteredProperties = properties.filter(p => p.broker !== null);
 
    res.status(200).json({
      success: true,
      count: filteredProperties.length,
      data: filteredProperties,
    });
 
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
/** get rent properties limited to 4 */
/** get rent properties limited to 4 */
const getPropertiesRent = async (req, res) => {
    try {
        const { type } = req.query; 

        let query = {
           
            listingType: 'Rent' 
        };

        if (type) {
            query.listingType = new RegExp(type, 'i');
        }

        const properties = await Property.find(query)
            .populate({
                path: 'broker',
                match: { active: true }, // ✅ only active brokers
                select: 'name mobile_number email slug'
            })
            .sort({ createdAt: -1 })
            .limit(4);

        // ❗ Remove inactive broker properties
        const filteredProperties = properties.filter(p => p.broker !== null);

        res.status(200).json({
            success: true,
            count: filteredProperties.length,
            data: filteredProperties
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
//
const getPropertiesSell = async (req, res) => {
    try {
        const { type } = req.query; 

        let query = {
          
            listingType: 'Sell' 
        };

        if (type) {
            query.listingType = new RegExp(type, 'i');
        }

        const properties = await Property.find(query)
            .populate({
                path: 'broker',
                match: { active: true }, // ✅ filter active brokers
                select: 'name mobile_number email slug'
            })
            .sort({ createdAt: -1 })
            .limit(4);

        // ❗ Remove properties where broker is null
        const filteredProperties = properties.filter(p => p.broker !== null);

        res.status(200).json({
            success: true,
            count: filteredProperties.length,
            data: filteredProperties
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
const addPropertyAdmin = async (req, res) => {
    try {
        const { 
            listingType, propertyType, localities, 
            size, price, description, status,broker_id
        } = req.body;

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) =>
                cloudinary.uploader.upload(file.path, { folder: "yesbroker_properties" })
            );
            const uploadResults = await Promise.all(uploadPromises);
            imageUrls = uploadResults.map((result) => result.secure_url);
        }

        const newProperty = new Property({
            listingType,
            propertyType,
            localities: Array.isArray(localities) ? localities : JSON.parse(localities),
            size,
            price,
            description,
            status: status || "Active",
            photos: imageUrls,
            broker:broker_id// ✨ Link the property to the logged-in broker
        });

        const savedProperty = await newProperty.save();

        res.status(201).json({
            success: true,
            message: "Property added successfully!",
            data: savedProperty,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
/* ─── PUT Edit Property ──────────────────────────────────────────────────────── */
 
const getPropertyByIdAdmin = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("broker", "name phone email slug"); // ✅ populate broker so frontend gets broker._id
 
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }
 
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
  
const editPropertyAdmin = async (req, res) => {
  try {
    // 1. Find the property
    const property = await Property.findById(req.params.id);
 
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }
 
    // 2. Destructure ALL fields including broker_id
    const {
      listingType,
      propertyType,
      localities,
      size,
      price,
      description,
      status,
      removedPhotos, // JSON string — array of Cloudinary URLs to delete
      broker_id,     // ✅ FIX: was destructured before but never applied
    } = req.body;
 
    // ── Handle removed photos ──────────────────────────────────────────────
    let updatedPhotos = [...(property.photos || [])];
 
    if (removedPhotos) {
      let removed = [];
      try {
        removed = JSON.parse(removedPhotos);
      } catch {
        return res.status(400).json({ success: false, message: "Invalid removedPhotos format." });
      }
 
      // Delete each removed photo from Cloudinary
      for (const url of removed) {
        try {
          const parts          = url.split("/");
          const filenameNoExt  = parts[parts.length - 1].split(".")[0];
          const folder         = parts[parts.length - 2];
          const publicId       = `${folder}/${filenameNoExt}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          // Log but don't block — photo may already be deleted
          console.warn("Cloudinary delete failed:", err.message);
        }
      }
 
      // Remove from the in-memory array
      updatedPhotos = updatedPhotos.filter((url) => !removed.includes(url));
    }
 
    // ── Handle newly uploaded photos ───────────────────────────────────────
    if (req.files && req.files.length > 0) {
      if (updatedPhotos.length + req.files.length > 5) {
        return res.status(400).json({
          success: false,
          message: `Maximum 5 photos allowed. You already have ${updatedPhotos.length}.`,
        });
      }
 
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "yesbroker_properties" })
      );
      const results  = await Promise.all(uploadPromises);
      const newUrls  = results.map((r) => r.secure_url);
      updatedPhotos  = [...updatedPhotos, ...newUrls];
    }
 
    // ── Update scalar fields (only if provided) ────────────────────────────
    if (listingType)  property.listingType  = listingType;
    if (propertyType) property.propertyType = propertyType;
    if (size)         property.size         = size;
    if (price)        property.price        = price;
    if (description !== undefined) property.description = description;
    if (status)       property.status       = status;
 
    // ── Parse and update localities ────────────────────────────────────────
    if (localities) {
      try {
        property.localities = typeof localities === "string"
          ? JSON.parse(localities)
          : localities;
      } catch {
        return res.status(400).json({ success: false, message: "Invalid localities format." });
      }
    }
 
    // ── ✅ FIX: Actually apply the broker update ───────────────────────────
    if (broker_id) {
      property.broker = broker_id;
    }
 
    // ── Apply updated photos ───────────────────────────────────────────────
    property.photos = updatedPhotos;
 
    const updated = await property.save();
 
    res.status(200).json({ success: true, data: updated });
 
  } catch (error) {
    console.error("editPropertyAdmin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getPublicPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate({
        path: 'broker',
        match: { active: true },                      // only show active brokers
        select: 'name mobile_number email slug',      // never expose password/tokens
      });
 
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }
 
    // If broker is inactive after populate, it becomes null — treat as unavailable
    if (!property.broker) {
      return res.status(404).json({ success: false, message: 'This listing is no longer active.' });
    }
 
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { addProperty, getMyProperties,
editProperty,editPropertyBroker,editPropertyAdmin,getPropertyByIdAdmin,
getPropertyById,deleteProperty,
getPropertiesByLocality,getPropertiesRent,getPropertiesSell,addPropertyAdmin,getPublicPropertyById };

