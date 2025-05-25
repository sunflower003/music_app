const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String }, // 👈 Thêm dòng này
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  songIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
