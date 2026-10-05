const express = require('express');
const router = express.Router();
const { addProperty,getMyProperties,getPropertyById,deleteProperty,
getPropertyByIdAdmin,editPropertyAdmin,editPropertyBroker,editProperty,getPropertiesByLocality, getPropertiesRent, getPropertiesSell, addPropertyAdmin, 
getPublicPropertyById} = require('../controllers/property.controller');
const multer = require('multer');
const protectRoute = require('../middleware/protectRoute');

// 1. Configure Multer Storage
// We use memoryStorage or a temp 'uploads' folder because we are sending to Cloudinary
const storage = multer.diskStorage({}); 

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Optional: limit 5MB per file
});

// 2. The Route
// Ensure 'photos' matches data.append("photos", ...) in your React frontend
router.post('/add-property',protectRoute, upload.array('photos', 5), addProperty);
router.get("/my-properties",protectRoute, getMyProperties);
router.get("/property/:id",  protectRoute, getPropertyById);
router.get("/propertyview/:id",  getPublicPropertyById);
router.put("/property/:id",  protectRoute, upload.array("photos", 5), editProperty);
router.delete("/property/:id", protectRoute, deleteProperty);
// Search Action (Public - Removed protectRoute)
router.get("/search/:slug", getPropertiesByLocality);
router.get("/searchtype/:slug", getPropertiesByLocality);
router.get("/rentproperty", getPropertiesRent);
router.get("/sellproperty", getPropertiesSell);
router.post('/add-property-admin',protectRoute, upload.array('photos', 5), addPropertyAdmin);
router.get("/propertyadmin/:id", protectRoute, getPropertyByIdAdmin);
router.put("/propertyadmin/:id", protectRoute, upload.array("photos", 5), editPropertyAdmin);
module.exports = router;