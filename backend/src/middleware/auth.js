const { verifyAccessToken } = require("../utils/tokens");
const prisma = require("../config/db");

// Verifies the JWT access token sent as "Authorization: Bearer <token>".
// Attaches the authenticated user (without password hash) to req.user.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      return res.status(401).json({ error: "Invalid session." });
    }
    // Invalidate all outstanding access tokens issued before a logout-all
    // or password change by bumping refreshTokenVersion.
    if (user.refreshTokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ error: "Session expired, please log in again." });
    }

    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

// Optional auth: attaches req.user if a valid token is present, but does
// not block the request otherwise (used for e.g. recently-viewed tracking).
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user && user.refreshTokenVersion === payload.tokenVersion) {
      const { passwordHash, ...safeUser } = user;
      req.user = safeUser;
    }
  } catch (_) {
    /* ignore invalid token for optional auth */
  }
  next();
}

// Role-based access control — usage: requireRole("ADMIN"), requireRole("ADMIN", "STAFF")
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required." });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
