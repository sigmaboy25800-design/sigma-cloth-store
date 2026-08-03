require("dotenv").config();
const app = require("./app");
const prisma = require("./config/db");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Sigma Cloth Store API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

// Graceful shutdown — closes DB connections and stops accepting new
// requests before exiting, so in-flight requests aren't dropped.
async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
