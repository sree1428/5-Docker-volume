const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// ============================================================
// 👇👇👇 THIS IS THE FOLDER WE'LL MOUNT A VOLUME TO 👇👇👇
// ============================================================
const PHOTO_FOLDER = '/app/photos';

// Make sure the folder exists
if (!fs.existsSync(PHOTO_FOLDER)) {
  fs.mkdirSync(PHOTO_FOLDER, { recursive: true });
}

// ============================================================
// MULTER CONFIG — where and how to save uploaded files
// ============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PHOTO_FOLDER);            // 👈 saves to /app/photos
  },
  filename: (req, file, cb) => {
    // Prefix with timestamp to avoid name clashes
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

// Only accept image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// ============================================================
// SERVE STATIC FRONTEND
// ============================================================
app.use(express.static('public'));

// ============================================================
// UPLOAD A PHOTO (multipart/form-data)
// ============================================================
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    message: 'Photo uploaded!',
    filename: req.file.filename,
    size: req.file.size,
    path: `/photos/${req.file.filename}`,
  });
});

// ============================================================
// LIST ALL PHOTOS
// ============================================================
app.get('/photos', (req, res) => {
  const files = fs.readdirSync(PHOTO_FOLDER);
  const photos = files.map((file) => ({
    filename: file,
    url: `/photos/${file}`,
    size: fs.statSync(path.join(PHOTO_FOLDER, file)).size,
  }));
  res.json({ count: photos.length, photos });
});

// ============================================================
// SERVE A SINGLE PHOTO (so you can view it in browser)
// ============================================================
app.get('/photos/:filename', (req, res) => {
  const filePath = path.join(PHOTO_FOLDER, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Photo not found' });
  }
  res.sendFile(filePath);
});

// ============================================================
// DELETE A PHOTO
// ============================================================
app.delete('/photos/:filename', (req, res) => {
  const filePath = path.join(PHOTO_FOLDER, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: 'Deleted' });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// ============================================================
// START SERVER
// ============================================================
app.listen(3000, () => {
  console.log('📸 Photo Gallery running on port 3000');
  console.log(`📁 Saving photos to: ${PHOTO_FOLDER}`);
});
