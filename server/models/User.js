const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  sex: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  avatar: { type: String, default: '' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }] // 👈 thêm dòng này
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
