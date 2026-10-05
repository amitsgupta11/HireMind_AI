const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { frontendUrl, nodeEnv } = require("./config/env");
const { UPLOAD_DIR } = require("./services/storage.service");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(nodeEnv === "development" ? "dev" : "combined"));

// Basic global rate limit — tighter limits are applied per-route in later phases
// (e.g. login attempts, resume uploads).
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Serves files saved by the storage service's DEV FALLBACK (local disk)
// so uploaded resumes are viewable in development without AWS configured.
// Real deployments with S3 configured never write here — this route just
// sits idle in that case.
app.use(
  "/uploads",
  (req, res, next) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(UPLOAD_DIR)
);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
