import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AllPlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name, songs

  useEffect(() => {
    fetchAllPlaylists();
  }, []);

  const fetchAllPlaylists = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/playlists');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setPlaylists(data);
      } else {
        console.error('Playlists data is not an array:', data);
        setPlaylists([]);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setPlaylists([]);
    }
    setLoading(false);
  };

  // Filter and sort playlists
  const filteredAndSortedPlaylists = () => {
    let filtered = playlists.filter(playlist =>
      playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (playlist.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort based on selected option
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'name':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'songs':
        return filtered.sort((a, b) => (b.songIds?.length || 0) - (a.songIds?.length || 0));
      default:
        return filtered;
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const processedPlaylists = filteredAndSortedPlaylists();

  return (
    <div className="plall_all-playlists-page">
      {/* Header Section */}
      <div className="plall_page-header">
        <div className="plall_header-content">
          <h1 className="plall_page-title">
            <i className="ri-play-list-2-line"></i>
            All Playlists
          </h1>
          <p className="plall_page-subtitle">
            Discover all playlists • {playlists.length} total playlists
          </p>
        </div>
        
       
      </div>

      {/* Controls Section */}
      <div className="plall_controls-section">
        <div className="plall_search-container">
          <div className="plall_search-wrapper">
            <i className="ri-search-line plall_search-icon"></i>
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="plall_search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="plall_clear-search">
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
        </div>

        <div className="plall_sort-container">
          <label htmlFor="sort-select">
            <i className="ri-sort-desc"></i>
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="plall_sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="songs">Most Songs</option>
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="plall_stats-bar">
        <div className="plall_stats-info">
          <span className="plall_stats-item">
            <i className="ri-play-list-line"></i>
            {processedPlaylists.length} playlists
          </span>
          {searchTerm && (
            <span className="plall_stats-item plall_search-result">
              <i className="ri-search-line"></i>
              Found for "{searchTerm}"
            </span>
          )}
        </div>
        
        <button onClick={fetchAllPlaylists} className="plall_refresh-btn" disabled={loading}>
          <i className={`ri-refresh-line ${loading ? 'plall_spinning' : ''}`}></i>
          Refresh
        </button>
      </div>

      {/* Content Section */}
      <div className="plall_content-section">
        {loading ? (
          <div className="plall_loading-state">
            <div className="plall_loading-spinner">
              <i className="ri-loader-line plall_spinning"></i>
            </div>
            <p>Loading playlists...</p>
          </div>
        ) : searchTerm && processedPlaylists.length === 0 ? (
          <div className="plall_empty-state">
            <i className="ri-search-line"></i>
            <h3>No playlists found</h3>
            <p>No playlists match your search for "{searchTerm}"</p>
            <button onClick={clearSearch} className="plall_clear-btn">
              <i className="ri-close-line"></i>
              Clear Search
            </button>
          </div>
        ) : processedPlaylists.length === 0 ? (
          <div className="plall_empty-state">
            <i className="ri-play-list-line"></i>
            <h3>No playlists available</h3>
            <p>There are no playlists to display at the moment.</p>
          </div>
        ) : (
          <div className="plall_playlists-grid">
            {processedPlaylists.map((playlist) => (
              <Link 
                to={`/playlist/${playlist._id}`} 
                key={playlist._id} 
                className="plall_playlist-link"
              >
                <div className="plall_playlist-card">
                  <div className="plall_playlist-thumbnail">
                    <img
                      src={
                        playlist.thumbnail
                          ? `http://localhost:5000/uploads/thumbnails/${playlist.thumbnail}`
                          : `https://picsum.photos/300/300?random=${playlist._id}`
                      }
                      alt={playlist.title}
                      loading="lazy"
                    />
                    <div className="plall_playlist-overlay">
                      <div className="plall_play-button">
                        <i className="ri-play-fill"></i>
                      </div>
                    </div>
                  </div>
                  
                  <div className="plall_playlist-info">
                    <h3 className="plall_playlist-title">
                      {searchTerm ? (
                        <span dangerouslySetInnerHTML={{
                          __html: playlist.title.replace(
                            new RegExp(`(${searchTerm})`, 'gi'),
                            '<mark>$1</mark>'
                          )
                        }} />
                      ) : (
                        playlist.title
                      )}
                    </h3>
                    
                    <p className="plall_playlist-description">
                      {playlist.description || 'No description available'}
                    </p>
                    
                    <div className="plall_playlist-meta">
                      <span className="plall_song-count">
                        <i className="ri-music-2-line"></i>
                        {playlist.songIds?.length || 0} songs
                      </span>
                      <span className="plall_created-date">
                        <i className="ri-time-line"></i>
                        {formatDate(playlist.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}