const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    default: '',
    trim: true
  },
  thumbnail: { 
    type: String, 
    default: null 
  },
  artistId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Artist',
    required: true
  },
  songIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Song'
  }],
  releaseDate: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// ✅ Index cho tìm kiếm nhanh
albumSchema.index({ artistId: 1 });
albumSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Album', albumSchema);
