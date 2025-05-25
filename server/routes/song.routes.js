const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const songCtrl = require('../controllers/song.controller');

// multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = file.mimetype.startsWith('image') ? 'uploads/thumbnails' : 'uploads/mp3';
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ROUTES
router.get('/', songCtrl.getAllSongs);
router.get('/latest', songCtrl.getLatestSongs);
router.post('/', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'fileMp3', maxCount: 1 }
]), songCtrl.createSong);
router.delete('/:id', songCtrl.deleteSong);

router.get("/artist/:id", songCtrl.getSongsByArtist);
// ✅ THÊM ROUTE PUT ĐỂ UPDATE SONG
router.put('/:id', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'fileMp3', maxCount: 1 }
]), songCtrl.updateSong);

module.exports = router;
