const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads/products";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Store the raw upload in memory; we re-encode + compress with sharp
// before writing to disk, so we never trust the client's file as-is.
const storage = multer.memoryStorage();

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 8) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, or WebP images are allowed."));
    }
    cb(null, true);
  },
});

// Compresses & converts to WebP, and writes a resized thumbnail too.
// Returns the public-facing relative URLs to store on the product.
async function processAndSaveImage(fileBuffer) {
  const filename = `${uuidv4()}.webp`;
  const fullPath = path.join(UPLOAD_DIR, filename);
  const thumbName = `${uuidv4()}-thumb.webp`;
  const thumbPath = path.join(UPLOAD_DIR, thumbName);

  await sharp(fileBuffer)
    .rotate() // respect EXIF orientation
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(fullPath);

  await sharp(fileBuffer)
    .rotate()
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(thumbPath);

  return {
    url: `/uploads/products/${filename}`,
    thumbUrl: `/uploads/products/${thumbName}`,
  };
}

module.exports = { upload, processAndSaveImage };
