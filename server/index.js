const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route imports
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/artists', require('./routes/artist.routes')); 
app.use('/api/songs', require('./routes/song.routes'));     
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/playlists', require('./routes/playlist.routes'));
app.use('/api/albums', require('./routes/album.routes')); // ✅ THÊM album routes

// Kết nối vs MongoDB
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`)))
  .catch(err => console.error(err));
