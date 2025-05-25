import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout.js';
import { toast } from 'react-toastify';

const ALBUM_API = 'http://localhost:5000/api/albums';
const SONGS_API = 'http://localhost:5000/api/songs';
const ARTISTS_API = 'http://localhost:5000/api/artists';

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [artistId, setArtistId] = useState('');
  const [songIds, setSongIds] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [songSearchTerm, setSongSearchTerm] = useState('');

  useEffect(() => {
    fetchAlbums();
    fetchSongs();
    fetchArtists();
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await fetch(ALBUM_API);
      const data = await res.json();
      setAlbums(data.albums || data); // Handle both paginated and direct response
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast.error('Cannot fetch albums at this time');
    }
    setLoading(false);
  };

  const fetchSongs = async () => {
    try {
      const res = await fetch(SONGS_API);
      const data = await res.json();
      setSongs(data);
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast.error('Cannot fetch songs list');
    }
  };

  const fetchArtists = async () => {
    try {
      const res = await fetch(ARTISTS_API);
      const data = await res.json();
      setArtists(data);
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast.error('Cannot fetch artists list');
    }
  };

  // Filter albums based on search term
  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (album.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (album.artistId?.fullname || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter songs for selection (only songs by selected artist)
  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.fullname.toLowerCase().includes(songSearchTerm.toLowerCase()) ||
                         (song.artistId?.fullname || '').toLowerCase().includes(songSearchTerm.toLowerCase());
    
    // If artist is selected, only show songs by that artist
    if (artistId) {
      return matchesSearch && song.artistId?._id === artistId;
    }
    
    return matchesSearch;
  });

  // Handle thumbnail file change with preview
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnailFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  };

  // Handle artist change - reset selected songs when artist changes
  const handleArtistChange = (newArtistId) => {
    setArtistId(newArtistId);
    setSongIds([]); // Reset selected songs when artist changes
  };

  // Handle form submission for adding/editing albums
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Enter a valid album title');
      return;
    }

    if (!artistId) {
      toast.error('Please select an artist');
      return;
    }

    if (!thumbnailFile && !editId) {
      toast.error('Please select a thumbnail image');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('artistId', artistId);
    
    // Append song IDs
    songIds.forEach(id => {
      formData.append('songIds', id);
    });
    
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${ALBUM_API}/${editId}` : ALBUM_API;

    try {
      const response = await fetch(url, {
        method,
        body: formData
      });

      const responseData = await response.json();
      console.log('📥 Server response:', responseData);

      if (response.ok) {
        // Reset form
        setTitle('');
        setDescription('');
        setArtistId('');
        setSongIds([]);
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setEditId(null);
        setSongSearchTerm('');
        fetchAlbums();
        
        toast.success(editId ? 'Updated album!' : 'Added new album!');
      } else {
        console.error('❌ Server error:', responseData);
        toast.error(responseData.message || 'Failed to save album');
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      toast.error('An error occurred while saving the album');
    }
    setLoading(false);
  };

  // Handle delete album
  const handleDelete = async (id, albumTitle) => {
    const confirmed = window.confirm(
      `You're about to delete "${albumTitle}"?\n\nThis action cannot be undone. Are you sure?`
    );
    
    if (!confirmed) return;

    setDeleteLoading(id);
    try {
      const response = await fetch(`${ALBUM_API}/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        setAlbums(prev => prev.filter(album => album._id !== id));
        toast.success(`Deleted "${albumTitle}" successfully!`);
        fetchAlbums();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete album');
      }
    } catch (error) {
      console.error('Error deleting album:', error);
      toast.error('An error occurred while deleting the album');
    }
    setDeleteLoading(null);
  };

  // Handle edit album
  const handleEdit = (album) => {
    const formContainer = document.querySelector('.admin-form-container');
    if (formContainer) {
      formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    setEditId(album._id);
    setTitle(album.title);
    setDescription(album.description || '');
    setArtistId(album.artistId?._id || '');
    setSongIds(album.songIds?.map(s => s._id) || []);
    
    // Reset thumbnail - user can choose to update or keep existing
    setThumbnailFile(null);
    setThumbnailPreview(null);
    
    toast.info(`Editing album: ${album.title}`);
  };

  const handleCancel = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setArtistId('');
    setSongIds([]);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setSongSearchTerm('');
    toast.info('Cancelled editing album');
  };

  const removeThumbnailPreview = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    const fileInput = document.getElementById('thumbnail');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle checkbox change for song selection
  const handleCheckboxChange = (songId) => {
    setSongIds(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearSongSearch = () => {
    setSongSearchTerm('');
  };

  return (
    <AdminLayout>
      <div className="adle_admin-albums-page">
        {/* Header Section */}
        <div className="admin-page-header">
          <h2 className="admin-page-title">
            <i className="ri-album-line"></i>
            Manage Albums
          </h2>
          <div className="admin-page-stats">
            <span className="stats-item">
              <i className="ri-album-fill"></i>
              {albums.length} Albums
            </span>
            {searchTerm && (
              <span className="stats-item search-results">
                <i className="ri-search-line"></i>
                {filteredAlbums.length} Found
              </span>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="admin-form-container">
          <div className="admin-form-header">
            <h3>
              {editId ? (
                <>
                  <i className="ri-edit-line"></i>
                  Edit Album
                </>
              ) : (
                <>
                  <i className="ri-add-line"></i>
                  Add New Album
                </>
              )}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="title">
                <i className="ri-album-line"></i>
                Album Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter album title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="artistId">
                <i className="ri-user-star-line"></i>
                Artist <span className="required-field">*</span>
              </label>
              <select
                id="artistId"
                value={artistId}
                onChange={(e) => handleArtistChange(e.target.value)}
                required
                className="form-select"
                disabled={loading}
              >
                <option value="">Select an artist</option>
                {artists.map(artist => (
                  <option key={artist._id} value={artist._id}>
                    {artist.fullname}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <i className="ri-file-text-line"></i>
                Description
              </label>
              <textarea
                id="description"
                placeholder="Enter album description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="adle_form-textarea" 
                disabled={loading}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="thumbnail">
                <i className="ri-image-line"></i>
                Thumbnail {!editId && <span className="required-field">*</span>}
              </label>
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="form-file-input"
                disabled={loading}
                required={!editId}
              />
              
              {/* Thumbnail file preview */}
              {thumbnailFile && (
                <div className="file-preview">
                  <i className="ri-file-image-line"></i>
                  <span>{thumbnailFile.name}</span>
                  <button 
                    type="button" 
                    onClick={removeThumbnailPreview}
                    className="remove-file-btn"
                    title="Remove file"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              )}
              
              {/* Thumbnail image preview */}
              {thumbnailPreview && (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <img src={thumbnailPreview} alt="Preview" />
                    <div className="image-preview-overlay">
                      <button 
                        type="button" 
                        onClick={removeThumbnailPreview}
                        className="remove-image-btn"
                        title="Remove image"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                  <p className="preview-label">Thumbnail Preview</p>
                </div>
              )}
            </div>

            {/* Song Selection */}
            <div className="form-group">
              <label>
                <i className="ri-music-2-line"></i>
                Select Songs (Optional)
                <span className="adle_selected-count">({songIds.length} selected)</span>
              </label>
              
              {artistId && (
                <>
                  {/* Song Search */}
                  <div className="adle_song-search-container">
                    <div className="search-input-wrapper">
                      <i className="ri-search-line search-icon"></i>
                      <input
                        type="text"
                        placeholder={`Search songs by ${artists.find(a => a._id === artistId)?.fullname || 'selected artist'}...`}
                        value={songSearchTerm}
                        onChange={(e) => setSongSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      {songSearchTerm && (
                        <button
                          type="button"
                          onClick={clearSongSearch}
                          className="clear-search-btn"
                          title="Clear search"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Songs List */}
                  <div className="adle_songs-selection-container">
                    {filteredSongs.length === 0 ? (
                      <div className="adle_empty-songs-state">
                        <i className="ri-music-line"></i>
                        <p>No songs available for this artist</p>
                      </div>
                    ) : (
                      <div className="adle_songs-checkbox-list">
                        {filteredSongs.map(song => (
                          <label key={song._id} className="adle_song-checkbox-item">
                            <input
                              type="checkbox"
                              checked={songIds.includes(song._id)}
                              onChange={() => handleCheckboxChange(song._id)}
                              className="adle_song-checkbox"
                            />
                            <div className="adle_song-item-info">
                              <img
                                src={
                                  song.thumbnail
                                    ? `http://localhost:5000/uploads/thumbnails/${song.thumbnail}`
                                    : 'https://via.placeholder.com/40x40/4CAF50/white?text=♪'
                                }
                                alt={song.fullname}
                                className="adle_song-item-thumbnail"
                              />
                              <div className="adle_song-item-details">
                                <span className="adle_song-item-name">{song.fullname}</span>
                                <span className="adle_song-item-artist">{song.artistId?.fullname || 'Unknown Artist'}</span>
                              </div>
                            </div>
                            <div className="adle_checkbox-indicator">
                              <i className="ri-check-line"></i>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {!artistId && (
                <div className="adle_empty-songs-state">
                  <i className="ri-user-star-line"></i>
                  <p>Please select an artist first to choose songs</p>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || !title.trim() || !artistId || (!thumbnailFile && !editId)}
              >
                {loading ? (
                  <>
                    <i className="ri-loader-line spinning"></i>
                    Loading...
                  </>
                ) : editId ? (
                  <>
                    <i className="ri-save-line"></i>
                    Update Album
                  </>
                ) : (
                  <>
                    <i className="ri-add-line"></i>
                    Add Album
                  </>
                )}
              </button>
              
              {editId && (
                <button type="button" onClick={handleCancel} className="btn-secondary" disabled={loading}>
                  <i className="ri-close-line"></i>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Albums List Section */}
        <div className="admin-list-container">
          <div className="admin-list-header">
            <h3>
              <i className="ri-list-check"></i>
              Albums List
            </h3>
            <div className="list-actions">
              {/* Search Bar */}
              <div className="search-container">
                <div className="search-input-wrapper">
                  <i className="ri-search-line search-icon"></i>
                  <input
                    type="text"
                    placeholder="Search albums..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="clear-search-btn"
                      title="Clear search"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  )}
                </div>
              </div>
              
              <button onClick={fetchAlbums} className="btn-refresh" disabled={loading}>
                <i className={`ri-refresh-line ${loading ? 'spinning' : ''}`}></i>
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <i className="ri-loader-line spinning"></i>
              Loading albums...
            </div>
          ) : searchTerm && filteredAlbums.length === 0 ? (
            <div className="empty-state">
              <i className="ri-search-line"></i>
              <p>No albums found for "{searchTerm}"</p>
              <button onClick={clearSearch} className="btn-secondary">
                <i className="ri-close-line"></i>
                Clear Search
              </button>
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div className="empty-state">
              <i className="ri-album-line"></i>
              <p>No albums found</p>
            </div>
          ) : (
            <div className="adle_albums-grid">
              {filteredAlbums.map((album) => (
                <div key={album._id} className={`adle_album-card ${editId === album._id ? 'adle_editing' : ''}`}>
                  <div className="adle_album-thumbnail">
                    <img
                      src={
                        album.thumbnail
                          ? `http://localhost:5000/uploads/albums/${album.thumbnail}`
                          : 'https://via.placeholder.com/200x200/E91E63/white?text=♪'
                      }
                      alt={album.title}
                    />
                    <div className="adle_album-overlay">
                      <i className="ri-album-line"></i>
                    </div>
                  </div>
                  
                  <div className="adle_album-info">
                    <h4 className="adle_album-title">
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
                    </h4>
                    <p className="adle_album-artist">
                      <i className="ri-user-star-line"></i>
                      {album.artistId?.fullname || 'Unknown Artist'}
                    </p>
                    <p className="adle_album-description">
                      {album.description || 'No description'}
                    </p>
                    <div className="adle_album-meta">
                      <span>
                        <i className="ri-music-2-line"></i>
                        {album.songIds?.length || 0} songs
                      </span>
                      <span>
                        <i className="ri-calendar-line"></i>
                        {new Date(album.releaseDate || album.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="adle_album-actions">
                    <button 
                      onClick={() => handleEdit(album)} 
                      className="btn-edit"
                      title="Edit"
                      disabled={loading || deleteLoading === album._id}
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(album._id, album.title)} 
                      className="btn-delete"
                      title="Delete"
                      disabled={loading || deleteLoading === album._id}
                    >
                      {deleteLoading === album._id ? (
                        <i className="ri-loader-line spinning"></i>
                      ) : (
                        <i className="ri-delete-bin-line"></i>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}