const { Queue } = require("bullmq");
const { redisConnection } = require("../config/redis");

// One real queue, one real job name — the worker (src/workers/resume.worker.js)
// is the only thing that ever changes a resume's status past "QUEUED".
const resumeQueue = new Queue("resume-processing", { connection: redisConnection });

module.exports = resumeQueue;
