const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  avatar: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Artist', artistSchema);
