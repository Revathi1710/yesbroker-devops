const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────
// 🔐 Generate Broker Token
// ─────────────────────────────────────────────
const generateToken = (userId, res) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "3650d" } // 10 years
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production
    sameSite: "lax", // ✅ IMPORTANT (fixes your login issue)
    maxAge: 3650 * 24 * 60 * 60 * 1000
  });

  return token;
};

// ─────────────────────────────────────────────
// 🔐 Generate Admin Token
// ─────────────────────────────────────────────
const adminGenerateToken = (userId, res) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "3650d" }
  );

  res.cookie("adminjwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3650 * 24 * 60 * 60 * 1000
  });

  return token;
};

// ✅ CORRECT EXPORT
module.exports = { generateToken, adminGenerateToken };