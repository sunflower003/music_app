const express = require('express');
const router = express.Router();
const albumCtrl = require('../controllers/album.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Tạo thư mục uploads cho album thumbnails
const uploadDir = 'uploads/albums';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer configuration cho album thumbnails
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'album-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log('📷 Uploading album thumbnail:', file.originalname, file.mimetype);
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

// ================== ALBUM ROUTES ==================
// ⚠️ QUAN TRỌNG: THỨ TỰ ROUTES RẤT QUAN TRỌNG!

// GET /api/albums - Lấy tất cả albums (có pagination & search)
router.get('/', albumCtrl.getAll);

// GET /api/albums/latest?limit=6 - Lấy albums mới nhất
router.get('/latest', albumCtrl.getLatestAlbums);

// ✅ ĐĂNG KÝ ROUTES CỤ THỂ TRƯỚC, GENERIC SAU
// GET /api/albums/artist/:artistId - Lấy tất cả albums của 1 artist
router.get('/artist/:artistId', (req, res, next) => {
  console.log('🎯 Route /artist/:artistId called with artistId:', req.params.artistId);
  next();
}, albumCtrl.getByArtist);

// GET /api/albums/:id - Lấy 1 album theo ID (ĐẶT SAU CÁC ROUTES CỤ THỂ)
router.get('/:id', (req, res, next) => {
  console.log('🎯 Route /:id called with id:', req.params.id);
  next();
}, albumCtrl.getOne);

// POST /api/albums - Tạo album mới (với thumbnail upload)
router.post('/', upload.single('thumbnail'), handleMulterError, albumCtrl.create);

// PUT /api/albums/:id - Cập nhật album (với thumbnail upload)
router.put('/:id', upload.single('thumbnail'), handleMulterError, albumCtrl.update);

// DELETE /api/albums/:id - Xóa album
router.delete('/:id', albumCtrl.remove);

// ================== SONG MANAGEMENT IN ALBUM ==================

// POST /api/albums/:albumId/songs/:songId - Thêm bài hát vào album
router.post('/:albumId/songs/:songId', albumCtrl.addSong);

// DELETE /api/albums/:albumId/songs/:songId - Xóa bài hát khỏi album
router.delete('/:albumId/songs/:songId', albumCtrl.removeSong);

module.exports = router;