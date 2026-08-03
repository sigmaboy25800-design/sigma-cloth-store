const { PrismaClient } = require("@prisma/client");

// Single shared Prisma client instance (avoids exhausting DB connections
// in dev with hot-reload, and keeps a connection pool in production).
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

module.exports = prisma;
