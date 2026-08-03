// Wraps async route handlers so rejected promises reach the error handler
// instead of crashing the process or hanging the request.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
}

// Centralized error handler. Never leaks stack traces or internal details
// to the client in production.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Prisma known request errors (unique constraint, FK violation, etc.)
  if (err.code === "P2002") {
    return res.status(409).json({ error: `A record with this ${err.meta?.target?.[0] || "value"} already exists.` });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  }

  const status = err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again later."
      : err.message || "Internal server error.";

  res.status(status).json({ error: message });
}

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { asyncHandler, notFound, errorHandler, ApiError };
