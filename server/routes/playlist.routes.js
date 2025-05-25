const express = require('express');
const router = express.Router();
const playlistCtrl = require('../controllers/playlist.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Tạo thư mục uploads nếu chưa có
const uploadDir = 'uploads/thumbnails';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'playlist-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log('📷 Uploading file:', file.originalname, file.mimetype);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ✅ Error handling middleware cho multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// ROUTES với multer middleware
router.get('/', playlistCtrl.getAll);
router.get('/latest', playlistCtrl.getLatestPlaylists);
router.get('/:id', playlistCtrl.getOne);
router.post('/', upload.single('thumbnail'), handleMulterError, playlistCtrl.create); // ✅ THÊM multer
router.put('/:id', upload.single('thumbnail'), handleMulterError, playlistCtrl.update); // ✅ THÊM multer
router.delete('/:id', playlistCtrl.remove);

module.exports = router;
