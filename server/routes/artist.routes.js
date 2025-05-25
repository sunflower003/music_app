const express = require('express');
const router = express.Router();
const artistCtrl = require('../controllers/artist.controller');
const multer = require('multer');
const path = require('path');

// multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ROUTES
router.get('/', artistCtrl.getAllArtists);
router.post('/', upload.single('avatar'), artistCtrl.createArtist);
router.put('/:id', upload.single('avatar'), artistCtrl.updateArtist);
router.delete('/:id', artistCtrl.deleteArtist);

module.exports = router;
