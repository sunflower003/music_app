const Album = require('../models/Album');
const Artist = require('../models/Artist');
const Song = require('../models/Song');

// ✅ Helper function để populate albums với artist và songs
const populateAlbumData = {
  path: 'artistId',
  select: 'fullname avatar'
};

const populateSongData = {
  path: 'songIds',
  populate: {
    path: 'artistId',
    select: 'fullname avatar'
  }
};

// GET all albums
exports.getAll = async (req, res) => {
  try {
    const { limit = 20, page = 1, artistId, search } = req.query;
    
    let query = {};
    
    // Filter by artist nếu có
    if (artistId) {
      query.artistId = artistId;
    }
    
    // Search by title/description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const albums = await Album.find(query)
      .populate(populateAlbumData)
      .populate(populateSongData)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Album.countDocuments(query);
    
    res.json({
      albums,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: albums.length,
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ message: 'Error fetching albums', error: error.message });
  }
};

// GET single album by ID
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    const album = await Album.findById(id)
      .populate(populateAlbumData)
      .populate(populateSongData);
    
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }
    
    // ✅ Debug log
    console.log('🎵 Album found:', album.title);
    console.log('🎵 Artist:', album.artistId?.fullname);
    console.log('🎵 Songs count:', album.songIds.length);
    
    res.json(album);
  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(500).json({ message: 'Error fetching album', error: error.message });
  }
};

// GET albums by artist
exports.getByArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const { limit = 10 } = req.query;
    
    // Check if artist exists
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    const albums = await Album.find({ artistId })
      .populate(populateAlbumData)
      .populate(populateSongData)
      .sort({ releaseDate: -1 })
      .limit(parseInt(limit));
    
    res.json({
      artist: {
        _id: artist._id,
        fullname: artist.fullname,
        avatar: artist.avatar
      },
      albums,
      count: albums.length
    });
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    res.status(500).json({ message: 'Error fetching artist albums', error: error.message });
  }
};

// CREATE new album
exports.create = async (req, res) => {
  try {
    console.log('📝 Create album request body:', req.body);
    console.log('📷 Uploaded file:', req.file);
    
    const { title, description, artistId, songIds, releaseDate } = req.body; // ✅ Bỏ genre
    const thumbnail = req.file?.filename || null;
    
    // ✅ Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Album title is required' });
    }
    
    if (!artistId) {
      return res.status(400).json({ message: 'Artist is required' });
    }
    
    // Check if artist exists
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(400).json({ message: 'Artist not found' });
    }
    
    // ✅ Xử lý songIds từ FormData (có thể rỗng)
    let parsedSongIds = [];
    if (songIds) {
      if (Array.isArray(songIds)) {
        parsedSongIds = songIds;
      } else if (typeof songIds === 'string') {
        parsedSongIds = [songIds];
      }
    }
    
    // ✅ Validate songIds are valid ObjectIds
    const mongoose = require('mongoose');
    const validSongIds = parsedSongIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    console.log('🎵 Valid songIds:', validSongIds);
    
    // ✅ Tạo album (bỏ genre)
    const albumData = {
      title: title.trim(),
      description: description?.trim() || '',
      artistId,
      songIds: validSongIds,
      thumbnail,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date()
    };
    
    console.log('💾 Creating album with data:', albumData);
    
    const album = new Album(albumData);
    const savedAlbum = await album.save();
    
    // ✅ Populate trước khi return
    const populatedAlbum = await Album.findById(savedAlbum._id)
      .populate(populateAlbumData)
      .populate(populateSongData);
    
    console.log('✅ Album created successfully:', savedAlbum._id);
    res.json({ success: true, album: populatedAlbum });
    
  } catch (error) {
    console.error('❌ Error creating album:', error);
    res.status(500).json({ 
      message: 'Error creating album', 
      error: error.message
    });
  }
};

// UPDATE album
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, artistId, songIds, releaseDate } = req.body; // ✅ Bỏ genre
    const thumbnail = req.file?.filename;
    
    // Check if album exists
    const existingAlbum = await Album.findById(id);
    if (!existingAlbum) {
      return res.status(404).json({ message: 'Album not found' });
    }
    
    // ✅ Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Album title is required' });
    }
    
    if (artistId) {
      const artist = await Artist.findById(artistId);
      if (!artist) {
        return res.status(400).json({ message: 'Artist not found' });
      }
    }
    
    // ✅ Xử lý songIds
    let parsedSongIds = [];
    if (songIds) {
      if (Array.isArray(songIds)) {
        parsedSongIds = songIds;
      } else if (typeof songIds === 'string') {
        parsedSongIds = [songIds];
      }
    }
    
    const mongoose = require('mongoose');
    const validSongIds = parsedSongIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    const updateData = {
      title: title.trim(),
      description: description?.trim() || '',
      songIds: validSongIds
    };
    
    if (artistId) updateData.artistId = artistId;
    if (thumbnail) updateData.thumbnail = thumbnail;
    if (releaseDate) updateData.releaseDate = new Date(releaseDate);
    
    const updatedAlbum = await Album.findByIdAndUpdate(id, updateData, { new: true })
      .populate(populateAlbumData)
      .populate(populateSongData);
    
    console.log('✅ Album updated successfully:', id);
    res.json({ success: true, album: updatedAlbum });
    
  } catch (error) {
    console.error('❌ Error updating album:', error);
    res.status(500).json({ 
      message: 'Error updating album', 
      error: error.message
    });
  }
};

// DELETE album
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }
    
    await Album.findByIdAndDelete(id);
    
    console.log('✅ Album deleted successfully:', id);
    res.json({ success: true, message: 'Album deleted successfully' });
    
  } catch (error) {
    console.error('❌ Error deleting album:', error);
    res.status(500).json({ 
      message: 'Error deleting album', 
      error: error.message
    });
  }
};

// GET latest albums
exports.getLatestAlbums = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const albums = await Album.find()
      .populate(populateAlbumData)
      .populate(populateSongData)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(albums);
  } catch (error) {
    console.error('Error fetching latest albums:', error);
    res.status(500).json({ message: 'Error fetching latest albums', error: error.message });
  }
};

// ADD song to album
exports.addSong = async (req, res) => {
  try {
    const { albumId, songId } = req.params;
    
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }
    
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    // Check if song already in album
    if (album.songIds.includes(songId)) {
      return res.status(400).json({ message: 'Song already in album' });
    }
    
    album.songIds.push(songId);
    await album.save();
    
    res.json({ success: true, message: 'Song added to album' });
  } catch (error) {
    console.error('Error adding song to album:', error);
    res.status(500).json({ message: 'Error adding song to album', error: error.message });
  }
};

// REMOVE song from album
exports.removeSong = async (req, res) => {
  try {
    const { albumId, songId } = req.params;
    
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }
    
    album.songIds = album.songIds.filter(id => id.toString() !== songId);
    await album.save();
    
    res.json({ success: true, message: 'Song removed from album' });
  } catch (error) {
    console.error('Error removing song from album:', error);
    res.status(500).json({ message: 'Error removing song from album', error: error.message });
  }
};