import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name, artist
  const [songDurations, setSongDurations] = useState({}); // ✅ THÊM state cho durations
  const { setCurrentSong, setIsPlaying, currentSong, isPlaying } = useContext(PlayerContext);

  useEffect(() => {
    fetchFavorites();
  }, []);

  // ✅ THÊM useEffect để tính duration từ audio files
  useEffect(() => {
    if (favorites.length > 0) {
      calculateDurations();
    }
  });

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setFavorites(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch favorites');
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    }
    setLoading(false);
  };

  // ✅ THÊM function để tính duration từ audio files
  const calculateDurations = () => {
    const newDurations = {};
    
    favorites.forEach((song) => {
      if (song.fileMp3 && !songDurations[song._id]) {
        const audio = new Audio(`http://localhost:5000/uploads/mp3/${song.fileMp3}`);
        
        audio.addEventListener('loadedmetadata', () => {
          if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
            newDurations[song._id] = Math.floor(audio.duration);
            setSongDurations(prev => ({ ...prev, [song._id]: Math.floor(audio.duration) }));
          }
        });

        audio.addEventListener('error', () => {
          console.warn(`Could not load audio duration for song: ${song.fullname}`);
        });
      }
    });
  };

  const removeFavorite = async (songId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/favorites/${songId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setFavorites(favorites.filter(song => song._id !== songId));
        // ✅ Xóa duration data khi remove favorite
        setSongDurations(prev => {
          const newDurations = { ...prev };
          delete newDurations[songId];
          return newDurations;
        });
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  // Filter and sort favorites
  const filteredAndSortedFavorites = () => {
    let filtered = favorites.filter(song =>
      song.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.artistId?.fullname || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort based on selected option
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'name':
        return filtered.sort((a, b) => a.fullname.localeCompare(b.fullname));
      case 'artist':
        return filtered.sort((a, b) => 
          (a.artistId?.fullname || '').localeCompare(b.artistId?.fullname || '')
        );
      case 'duration': // ✅ THÊM sort by duration
        return filtered.sort((a, b) => {
          const durationA = songDurations[a._id] || 0;
          const durationB = songDurations[b._id] || 0;
          return durationB - durationA;
        });
      default:
        return filtered;
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handlePlaySong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handlePlayAll = () => {
    if (processedFavorites.length > 0) {
      setCurrentSong(processedFavorites[0]);
      setIsPlaying(true);
    }
  };

  // ✅ SỬ DỤNG function formatTime từ PlaylistDetail
  function formatTime(sec = 0) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // ✅ Helper function để get duration
  const getSongDuration = (songId) => {
    return songDurations[songId] || 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const processedFavorites = filteredAndSortedFavorites();

  return (
    <div className="fvr_favorites-page">
      {/* Header Section */}
      <div className="fvr_page-header">
        <div className="fvr_header-content">
          <div className="fvr_header-icon">
            <i className="ri-heart-3-fill"></i>
          </div>
          <div className="fvr_header-text">
            <h1 className="fvr_page-title">Favorites</h1>
            <p className="fvr_page-subtitle">
              Your liked songs • {favorites.length} songs
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="fvr_header-actions">
          <button 
            onClick={handlePlayAll} 
            className="fvr_play-all-btn"
            disabled={processedFavorites.length === 0}
          >
            <i className="ri-play-fill"></i>
            Play All
          </button>
          
          
        </div>
      </div>

      {/* Controls Section */}
      <div className="fvr_controls-section">
        {/* Search Bar */}
        <div className="fvr_search-container">
          <div className="fvr_search-wrapper">
            <i className="ri-search-line fvr_search-icon"></i>
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="fvr_search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="fvr_clear-search">
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
        </div>

        {/* Sort Options */}
        <div className="fvr_sort-container">
          <label htmlFor="fvr-sort-select">
            <i className="ri-sort-desc"></i>
            Sort by:
          </label>
          <select
            id="fvr-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="fvr_sort-select"
          >
            <option value="newest">Recently Added</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Song Name (A-Z)</option>
            <option value="artist">Artist Name (A-Z)</option>
            <option value="duration">Duration (Long to Short)</option> {/* ✅ THÊM option */}
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="fvr_stats-bar">
        <div className="fvr_stats-info">
          <span className="fvr_stats-item">
            <i className="ri-music-2-line"></i>
            {processedFavorites.length} songs
          </span>
          {searchTerm && (
            <span className="fvr_stats-item fvr_search-result">
              <i className="ri-search-line"></i>
              Found for "{searchTerm}"
            </span>
          )}
          {/* ✅ THÊM total duration */}
          {processedFavorites.length > 0 && (
            <span className="fvr_stats-item">
              <i className="ri-time-line"></i>
              Total: {formatTime(
                processedFavorites.reduce((total, song) => 
                  total + getSongDuration(song._id), 0
                )
              )}
            </span>
          )}
        </div>
        
        <button onClick={fetchFavorites} className="fvr_refresh-btn" disabled={loading}>
          <i className={`ri-refresh-line ${loading ? 'fvr_spinning' : ''}`}></i>
          Refresh
        </button>
      </div>

      {/* Content Section */}
      <div className="fvr_content-section">
        {loading ? (
          <div className="fvr_loading-state">
            <div className="fvr_loading-spinner">
              <i className="ri-loader-line fvr_spinning"></i>
            </div>
            <p>Loading your favorites...</p>
          </div>
        ) : searchTerm && processedFavorites.length === 0 ? (
          <div className="fvr_empty-state">
            <i className="ri-search-line"></i>
            <h3>No songs found</h3>
            <p>No favorites match your search for "{searchTerm}"</p>
            <button onClick={clearSearch} className="fvr_clear-btn">
              <i className="ri-close-line"></i>
              Clear Search
            </button>
          </div>
        ) : processedFavorites.length === 0 ? (
          <div className="fvr_empty-state">
            <i className="ri-heart-line"></i>
            <h3>No favorites yet</h3>
            <p>Start liking songs to build your favorites collection!</p>
            <Link to="/home" className="fvr_explore-btn">
              <i className="ri-music-line"></i>
              Explore Music
            </Link>
          </div>
        ) : (
          <div className="fvr_songs-list">
            {/* List Header */}
            <div className="fvr_list-header">
              <div className="fvr_header-index">#</div>
              <div className="fvr_header-song">Song</div>
              <div className="fvr_header-artist">Artist</div>
              <div className="fvr_header-date">Date Added</div>
              <div className="fvr_header-duration">Duration</div>
              <div className="fvr_header-actions">Actions</div>
            </div>

            {/* Songs List */}
            <div className="fvr_songs-container">
              {processedFavorites.map((song, index) => (
                <div 
                  key={song._id} 
                  className={`fvr_song-item ${currentSong?._id === song._id ? 'fvr_playing' : ''}`}
                >
                  <div className="fvr_song-index">
                    {currentSong?._id === song._id && isPlaying ? (
                      <div className="fvr_playing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      <span className="fvr_index-number">{index + 1}</span>
                    )}
                  </div>

                  <div className="fvr_song-info" onClick={() => handlePlaySong(song)}>
                    <div className="fvr_song-thumbnail">
                      <img
                        src={
                          song.thumbnail
                            ? `http://localhost:5000/uploads/thumbnails/${song.thumbnail}`
                            : `https://picsum.photos/50/50?random=${song._id}`
                        }
                        alt={song.fullname}
                        loading="lazy"
                      />
                      <div className="fvr_play-overlay">
                        <i className="ri-play-fill"></i>
                      </div>
                    </div>
                    <div className="fvr_song-details">
                      <h4 className="fvr_song-name">
                        {searchTerm ? (
                          <span dangerouslySetInnerHTML={{
                            __html: song.fullname.replace(
                              new RegExp(`(${searchTerm})`, 'gi'),
                              '<mark>$1</mark>'
                            )
                          }} />
                        ) : (
                          song.fullname
                        )}
                      </h4>
                    </div>
                  </div>

                  <div className="fvr_song-artist">
                    <Link 
                      to={`/artist/${song.artistId?._id || '#'}`} 
                      className="fvr_artist-link"
                      onClick={(e) => {
                        if (!song.artistId?._id) {
                          e.preventDefault(); // ✅ Prevent navigation if no artist ID
                        }
                      }}
                    >
                      {(() => {
                        // ✅ Improved artist name logic
                        const artistName = song.artistId?.fullname || 
                                          song.artist?.fullname || 
                                          song.artistName || 
                                          'Unknown Artist';
                        
                        return searchTerm ? (
                          <span dangerouslySetInnerHTML={{
                            __html: artistName.replace(
                              new RegExp(`(${searchTerm})`, 'gi'),
                              '<mark>$1</mark>'
                            )
                          }} />
                        ) : (
                          <span title={artistName}>{artistName}</span> // ✅ Add tooltip
                        );
                      })()}
                    </Link>
                  </div>

                  <div className="fvr_song-date">
                    {formatDate(song.createdAt)}
                  </div>

                  <div className="fvr_song-duration">
                    {/* ✅ SỬ DỤNG formatTime và songDurations */}
                    {getSongDuration(song._id) > 0 ? (
                      formatTime(getSongDuration(song._id))
                    ) : (
                      <span className="fvr_loading-duration">
                        <i className="ri-loader-4-line fvr_spinning"></i>
                      </span>
                    )}
                  </div>

                  <div className="fvr_song-actions">
                    <button 
                      onClick={() => handlePlaySong(song)}
                      className="fvr_action-btn fvr_play-btn"
                      title="Play song"
                    >
                      <i className="ri-play-line"></i>
                    </button>
                    
                    <button 
                      onClick={() => removeFavorite(song._id)}
                      className="fvr_action-btn fvr_remove-btn"
                      title="Remove from favorites"
                    >
                      <i className="ri-heart-fill"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}