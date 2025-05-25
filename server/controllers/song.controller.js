const Song = require('../models/Song');

// GET all songs
exports.getAllSongs = async (req, res) => {
  const songs = await Song.find()
    .populate('artistId')
    .sort({ createdAt: -1 });
  res.json(songs);
};

// POST create new song
exports.createSong = async (req, res) => {
  const { fullname, artistId, albumId } = req.body;
  const thumbnail = req.files?.thumbnail?.[0]?.filename || null;
  const fileMp3 = req.files?.fileMp3?.[0]?.filename || null;

  const song = new Song({
    fullname,
    artistId,
    albumId: albumId || null,
    thumbnail,
    fileMp3,
  });

  await song.save();
  res.json(song);
};

// DELETE song
exports.deleteSong = async (req, res) => {
  await Song.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
};


exports.getSongsByArtist = async (req, res) => {
  try {
    const songs = await Song.find({ artistId: req.params.id }).populate("artistId");
    res.json(songs);
  } catch (err) {
    console.error("Error fetching songs by artist:", err);
    res.status(500).json({ error: "Server error" });
  }
};






// UPDATE Song
exports.updateSong = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, artistId } = req.body;
    
    // Tìm song hiện tại
    const existingSong = await Song.findById(id);
    if (!existingSong) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Prepare update data
    const updateData = {
      fullname,
      artistId
    };

    // Nếu có thumbnail mới
    if (req.files && req.files.thumbnail) {
      updateData.thumbnail = req.files.thumbnail[0].filename;
    }

    // Nếu có MP3 mới  
    if (req.files && req.files.fileMp3) {
      updateData.fileMp3 = req.files.fileMp3[0].filename;
    }

    // Update song
    const updatedSong = await Song.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).populate('artistId');

    res.json(updatedSong);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ message: 'Error updating song', error: error.message });
  }
};

exports.getLatestSongs = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    
    const songs = await Song.find()
      .populate('artistId')
      .sort({ createdAt: -1 }) // Mới nhất trước
      .limit(parseInt(limit));
      
    res.json(songs);
  } catch (error) {
    console.error('Error fetching latest songs:', error);
    res.status(500).json({ message: 'Error fetching latest songs', error: error.message });
  }
};

