const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, tokenVersion: user.refreshTokenVersion },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, tokenVersion: user.refreshTokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "30d" }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

// Random URL-safe token for email verification / password reset links.
// We store only the SHA-256 hash in the DB so a leaked DB row can't be
// replayed as a valid token.
function generateRawToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateRawToken,
  hashToken,
};
