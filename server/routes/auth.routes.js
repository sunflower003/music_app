const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');

// Multer config for avatar upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Existing routes
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

// ✅ NEW routes for profile management
router.put('/profile', authMiddleware, upload.single('avatar'), authCtrl.updateProfile);
router.put('/change-password', authMiddleware, authCtrl.changePassword);

module.exports = router;
