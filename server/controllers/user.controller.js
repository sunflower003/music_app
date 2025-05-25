const User = require('../models/User');
const Song = require('../models/Song');

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      populate: { 
        path: 'artistId',
        select: 'fullname avatar' // ✅ Select specific fields
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // ✅ Filter out null favorites và log để debug
    const validFavorites = user.favorites.filter(fav => fav !== null);
    
    
    res.json(validFavorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  const user = await User.findById(req.user.id);
  const songId = req.params.songId;

  const exists = user.favorites.includes(songId);
  if (exists) {
    user.favorites.pull(songId);
  } else {
    user.favorites.push(songId);
  }

  await user.save();
  res.json({ favorites: user.favorites });
};




exports.addFavorite = async (req, res) => {
  try {
    const { songId } = req.params;
    await User.findByIdAndUpdate(req.user.id, {
      //toan tu mongodb them bai hat vao mang favorites chi khi no chua co trong day
      $addToSet: { favorites: songId }
    });
    res.json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding favorite', error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { songId } = req.params;
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { favorites: songId }
    });
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing favorite', error: error.message });
  }
};

// GET all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password') // Không trả về password
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// UPDATE user role (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

// DELETE user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Không cho phép xóa chính mình
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// GET user stats (Admin only)
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      totalUsers,
      adminUsers,
      regularUsers,
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
};