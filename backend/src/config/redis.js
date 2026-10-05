const IORedis = require("ioredis");
const { redisUrl } = require("./env");

// BullMQ's recommended ioredis settings — without these, jobs can silently
// stop processing against hosted providers (e.g. Upstash) that behave
// differently from a bare local Redis instance. Shared by the Queue
// (API side) and the Worker (background process) so both talk to Redis
// the same way whether it's local Docker Redis or a hosted rediss:// URL.
const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on("error", (err) => {
  console.error("[redis] connection error:", err.message);
});

module.exports = { redisConnection };
