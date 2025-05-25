const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.register = async (req, res) => {
  try {
    const { username, password, sex } = req.body;
    
    // ✅ Validation
    if (!username || !password) {
      return res.status(400).json({ msg: 'Missing username or password' });
    }

    // ✅ Check if username exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: 'Username already exists' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user
    const user = new User({
      username,
      password: hashedPassword,
      role: 'user',
      sex: sex || 'other', // ✅ Default value
      favorites: [] // ✅ Initialize empty favorites array
    });

    await user.save();

    res.json({ msg: 'Register successful' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // ✅ Validation
    if (!username || !password) {
      return res.status(400).json({ msg: 'Missing username or password' });
    }

    // ✅ Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // ✅ Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid password' });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Return token and user info
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar || null,
        role: user.role,
        sex: user.sex || null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// UPDATE profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, sex } = req.body;
    const userId = req.user.id;
    
    // Check if username already exists (except current user)
    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    const updateData = {
      username: username.trim(),
      sex
    };
    
    // Handle avatar upload
    if (req.file) {
      updateData.avatar = req.file.filename;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');
    
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// CHANGE password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Find user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await User.findByIdAndUpdate(userId, { 
      password: hashedNewPassword 
    });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};
