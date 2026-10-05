const jwt = require('jsonwebtoken');
const Broker = require('../models/Broker');

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - Please log in" });
    }

    // Wrap in a try-catch to differentiate between JWT errors and Server errors
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }

    // Use the ID from your generateToken utility (ensure names match: userId vs brokerId)
    const user = await Broker.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Attach the full broker object to the request
    req.user = user;
    
    next();

  } catch (error) {
    console.error("protectRoute Middleware Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = protectRoute;