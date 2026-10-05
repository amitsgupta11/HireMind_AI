// File storage abstraction for resume uploads.
//
// If Cloudinary credentials are present in the environment, files go to
// the real Cloudinary account (as "raw" resources, since resumes are
// PDFs, not images). If not, this falls back to local disk storage under
// backend/uploads/ and serves it via a static route — clearly logged as a
// DEV FALLBACK, never presented to the user as if it were Cloudinary.
//
// IMPORTANT for deployment: the local-disk fallback only works when the
// API and the resume worker share the same filesystem (i.e. both running
// on one machine in local dev). On Render, the "web" and "worker" are
// separate services with separate disks — so Cloudinary MUST be
// configured before deploying, or the worker will fail to read files the
// API saved locally. See README "Deployment" section.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { backendUrl } = require("../config/env");

const CLOUDINARY_CONFIGURED = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function safeFileName(originalName) {
  const ext = path.extname(originalName).toLowerCase() || ".pdf";
  return `${crypto.randomUUID()}${ext}`;
}

function getCloudinary() {
  // Lazy-required so the SDK only initializes when actually configured —
  // keeps local dev fast when nobody has Cloudinary credentials set up yet.
  const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

async function uploadToCloudinary({ buffer, fileName, keyPrefix }) {
  const cloudinary = getCloudinary();
  const publicId = `${keyPrefix}/${safeFileName(fileName)}`;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", public_id: publicId, overwrite: false },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(buffer);
  });

  return { key: result.public_id, url: result.secure_url, storedLocally: false };
}

async function uploadToLocalDisk({ buffer, fileName, keyPrefix }) {
  ensureUploadDir();
  const targetName = safeFileName(fileName);
  const targetDir = path.join(UPLOAD_DIR, keyPrefix);
  fs.mkdirSync(targetDir, { recursive: true });
  const fullPath = path.join(targetDir, targetName);

  fs.writeFileSync(fullPath, buffer);

  const key = path.posix.join(keyPrefix, targetName);
  const url = `${backendUrl}/uploads/${key}`;

  console.log(
    `[storage.service][DEV FALLBACK — no Cloudinary credentials configured] Saved file to local disk: ${fullPath}`
  );

  return { key, url, storedLocally: true };
}

async function uploadFile({ buffer, fileName, keyPrefix }) {
  if (CLOUDINARY_CONFIGURED) {
    return uploadToCloudinary({ buffer, fileName, keyPrefix });
  }
  return uploadToLocalDisk({ buffer, fileName, keyPrefix });
}

// Used by the resume worker to fetch the file's bytes back for parsing —
// works symmetrically with whichever path uploadFile took.
async function downloadFile({ key, url, storedLocally }) {
  if (storedLocally) {
    const fullPath = path.join(UPLOAD_DIR, key);
    return fs.readFileSync(fullPath);
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download file from storage: HTTP ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

module.exports = { uploadFile, downloadFile, CLOUDINARY_CONFIGURED, UPLOAD_DIR };
