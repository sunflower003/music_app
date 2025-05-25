const Playlist = require("../models/Playlist");

exports.getAll = async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate("userId")
      .populate({
        path: "songIds",
        populate: {
          path: "artistId",
          select: "fullname avatar"
        }
      });
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Error fetching playlists', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('📝 Create playlist request body:', req.body);
    console.log('📷 Uploaded file:', req.file);
    
    const { title, description, songIds } = req.body;
    const thumbnail = req.file?.filename || null;
    
    // ✅ Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // ✅ Xử lý songIds từ FormData
    let parsedSongIds = [];
    if (Array.isArray(songIds)) {
      parsedSongIds = songIds;
    } else if (typeof songIds === 'string') {
      parsedSongIds = [songIds];
    } else if (songIds) {
      // Nếu có songIds nhưng không phải array/string
      parsedSongIds = Array.isArray(songIds) ? songIds : [songIds];
    }
    
    if (parsedSongIds.length === 0) {
      return res.status(400).json({ message: 'At least one song is required' });
    }
    
    console.log('🎵 Parsed songIds:', parsedSongIds);
    
    // ✅ Validate songIds are valid ObjectIds
    const mongoose = require('mongoose');
    const validSongIds = parsedSongIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validSongIds.length === 0) {
      return res.status(400).json({ message: 'No valid song IDs provided' });
    }
    
    if (validSongIds.length !== parsedSongIds.length) {
      console.warn('⚠️ Some song IDs were invalid:', parsedSongIds.filter(id => !mongoose.Types.ObjectId.isValid(id)));
    }
    
    // ✅ Tạo playlist - KHÔNG cần userId nếu không có auth
    const playlistData = {
      title: title.trim(),
      description: description?.trim() || '',
      songIds: validSongIds,
      thumbnail
    };
    
    console.log('💾 Creating playlist with data:', playlistData);
    
    const playlist = new Playlist(playlistData);
    const savedPlaylist = await playlist.save();
    
    // ✅ Populate trước khi return
    const populatedPlaylist = await Playlist.findById(savedPlaylist._id)
      .populate({
        path: 'songIds',
        populate: {
          path: 'artistId',
          select: 'fullname avatar'
        }
      });
    
    console.log('✅ Playlist created successfully:', savedPlaylist._id);
    res.json({ success: true, playlist: populatedPlaylist });
    
  } catch (error) {
    console.error('❌ Error creating playlist:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error creating playlist', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, userId, songIds } = req.body;
    const thumbnail = req.file?.filename;

    const updateData = { title, description, userId, songIds };
    if (thumbnail) updateData.thumbnail = thumbnail;

    const playlist = await Playlist.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, playlist });
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ message: 'Error updating playlist', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ message: 'Error deleting playlist', error: error.message });
  }
};

// ✅ XÓA function getOne - KHÔNG DÙNG NỮA

// ✅ RENAME getPlaylistById thành getOne để consistent với routes
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    const playlist = await Playlist.findById(id).populate({
      path: 'songIds',
      populate: {
        path: 'artistId',
        select: 'fullname avatar' // ✅ Populate artist data
      }
    });
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    
    
    res.json(playlist);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ message: 'Error fetching playlist', error: error.message });
  }
};

// take 4 latest playlists
exports.getLatestPlaylists = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    
    const playlists = await Playlist.find()
      .populate({
        path: 'songIds',
        populate: {
          path: 'artistId',
          select: 'fullname avatar' // ✅ Populate artist data
        }
      })
      .sort({ createdAt: -1 }) // Mới nhất trước
      .limit(parseInt(limit));
      
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching latest playlists:', error);
    res.status(500).json({ message: 'Error fetching latest playlists', error: error.message });
  }
};