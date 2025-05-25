import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AllAlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name, songs, artist

  useEffect(() => {
    fetchAllAlbums();
  }, []);

  const fetchAllAlbums = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/albums');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setAlbums(data);
      } else if (data.albums && Array.isArray(data.albums)) {
        // Handle paginated response
        setAlbums(data.albums);
      } else {
        console.error('Albums data is not an array:', data);
        setAlbums([]);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
      setAlbums([]);
    }
    setLoading(false);
  };

  // Filter and sort albums
  const filteredAndSortedAlbums = () => {
    let filtered = albums.filter(album =>
      album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (album.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (album.artistId?.fullname || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'artist':
        return filtered.sort((a, b) => 
          (a.artistId?.fullname || 'Unknown').localeCompare(b.artistId?.fullname || 'Unknown')
        );
      case 'release':
        return filtered.sort((a, b) => 
          new Date(b.releaseDate || b.createdAt) - new Date(a.releaseDate || a.createdAt)
        );
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

  const processedAlbums = filteredAndSortedAlbums();

  return (
    <div className="alball_all-albums-page">
      {/* Header Section */}
      <div className="alball_page-header">
        <div className="alball_header-content">
          <h1 className="alball_page-title">
            <i className="ri-album-line"></i>
            All Albums
          </h1>
          <p className="alball_page-subtitle">
            Discover all albums • {albums.length} total albums
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="alball_controls-section">
        <div className="alball_search-container">
          <div className="alball_search-wrapper">
            <i className="ri-search-line alball_search-icon"></i>
            <input
              type="text"
              placeholder="Search albums, artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="alball_search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="alball_clear-search">
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
        </div>

        <div className="alball_sort-container">
          <label htmlFor="sort-select">
            <i className="ri-sort-desc"></i>
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="alball_sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            
            <option value="name">Album Name (A-Z)</option>
            <option value="artist">Artist Name (A-Z)</option>
            <option value="songs">Most Songs</option>
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="alball_stats-bar">
        <div className="alball_stats-info">
          <span className="alball_stats-item">
            <i className="ri-album-fill"></i>
            {processedAlbums.length} albums
          </span>
          {searchTerm && (
            <span className="alball_stats-item alball_search-result">
              <i className="ri-search-line"></i>
              Found for "{searchTerm}"
            </span>
          )}
        </div>
        
        <button onClick={fetchAllAlbums} className="alball_refresh-btn" disabled={loading}>
          <i className={`ri-refresh-line ${loading ? 'alball_spinning' : ''}`}></i>
          Refresh
        </button>
      </div>

      {/* Content Section */}
      <div className="alball_content-section">
        {loading ? (
          <div className="alball_loading-state">
            <div className="alball_loading-spinner">
              <i className="ri-loader-line alball_spinning"></i>
            </div>
            <p>Loading albums...</p>
          </div>
        ) : searchTerm && processedAlbums.length === 0 ? (
          <div className="alball_empty-state">
            <i className="ri-search-line"></i>
            <h3>No albums found</h3>
            <p>No albums match your search for "{searchTerm}"</p>
            <button onClick={clearSearch} className="alball_clear-btn">
              <i className="ri-close-line"></i>
              Clear Search
            </button>
          </div>
        ) : processedAlbums.length === 0 ? (
          <div className="alball_empty-state">
            <i className="ri-album-line"></i>
            <h3>No albums available</h3>
            <p>There are no albums to display at the moment.</p>
          </div>
        ) : (
          <div className="alball_albums-grid">
            {processedAlbums.map((album) => (
              <Link 
                to={`/album/${album._id}`} 
                key={album._id} 
                className="alball_album-link"
              >
                <div className="alball_album-card">
                  <div className="alball_album-thumbnail">
                    <img
                      src={
                        album.thumbnail
                          ? `http://localhost:5000/uploads/albums/${album.thumbnail}`
                          : `https://picsum.photos/300/300?random=${album._id}`
                      }
                      alt={album.title}
                      loading="lazy"
                    />
                    <div className="alball_album-overlay">
                      <div className="alball_play-button">
                        <i className="ri-album-line"></i>
                      </div>
                    </div>
                  </div>
                  
                  <div className="alball_album-info">
                    <h3 className="alball_album-title">
                      {searchTerm ? (
                        <span dangerouslySetInnerHTML={{
                          __html: album.title.replace(
                            new RegExp(`(${searchTerm})`, 'gi'),
                            '<mark>$1</mark>'
                          )
                        }} />
                      ) : (
                        album.title
                      )}
                    </h3>
                    
                    <div className="alball_album-artist">
                      <i className="ri-user-star-line"></i>
                      <span>
                        {searchTerm && album.artistId?.fullname ? (
                          <span dangerouslySetInnerHTML={{
                            __html: album.artistId.fullname.replace(
                              new RegExp(`(${searchTerm})`, 'gi'),
                              '<mark>$1</mark>'
                            )
                          }} />
                        ) : (
                          album.artistId?.fullname || 'Unknown Artist'
                        )}
                      </span>
                    </div>
                    
                    <p className="alball_album-description">
                      {album.description || 'No description available'}
                    </p>
                    
                    <div className="alball_album-meta">
                      <span className="alball_song-count">
                        <i className="ri-music-2-line"></i>
                        {album.songIds?.length || 0} songs
                      </span>
                      <span className="alball_release-date">
                        <i className="ri-calendar-line"></i>
                        {formatDate(album.releaseDate || album.createdAt)}
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