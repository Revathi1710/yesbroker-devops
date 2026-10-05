const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const AdminProtect = async (req, res, next) => {
  try {
    // Changed "admin_jwt" to "adminjwt" to match your utility
    const token = req.cookies?.adminjwt; 

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.userId).select('-password');

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = AdminProtect;