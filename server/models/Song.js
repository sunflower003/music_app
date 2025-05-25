const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  thumbnail: { type: String },
  fileMp3: { type: String },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);
