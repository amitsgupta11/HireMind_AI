const { PrismaClient } = require("@prisma/client");

// Reuse a single PrismaClient instance across the app (and across
// nodemon hot-reloads in dev) to avoid exhausting DB connections.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__hiremindPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__hiremindPrisma = prisma;
}

module.exports = prisma;
