const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

// GET danh sách yêu thích
router.get('/favorites', authMiddleware, userCtrl.getFavorites);
router.post('/favorites/:songId', authMiddleware, userCtrl.addFavorite);
router.delete('/favorites/:songId', authMiddleware, userCtrl.removeFavorite);

// ✅ ADMIN USER MANAGEMENT ROUTES (chỉ cần authMiddleware)
router.get('/', authMiddleware, userCtrl.getAllUsers);
router.get('/stats', authMiddleware, userCtrl.getUserStats);
router.put('/:id/role', authMiddleware, userCtrl.updateUserRole);
router.delete('/:id', authMiddleware, userCtrl.deleteUser);

module.exports = router;
