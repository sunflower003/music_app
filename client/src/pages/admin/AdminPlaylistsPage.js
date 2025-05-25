import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout.js';
import { toast } from 'react-toastify';

const PLAYLIST_API = 'http://localhost:5000/api/playlists';
const SONGS_API = 'http://localhost:5000/api/songs';

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [songIds, setSongIds] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [songSearchTerm, setSongSearchTerm] = useState('');

  useEffect(() => {
    fetchPlaylists();
    fetchSongs();
  }, []);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const res = await fetch(PLAYLIST_API);
      const data = await res.json();
      setPlaylists(data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Cannot fetch playlists at this time');
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

  // Filter playlists based on search term
  const filteredPlaylists = playlists.filter(playlist =>
    playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (playlist.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter songs for selection
  const filteredSongs = songs.filter(song =>
    song.fullname.toLowerCase().includes(songSearchTerm.toLowerCase()) ||
    (song.artistId?.fullname || '').toLowerCase().includes(songSearchTerm.toLowerCase())
  );

  // Handle thumbnail file change với preview
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

  // Handle form submission for adding/editing playlists
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Enter a valid playlist title');
      return;
    }

    if (songIds.length === 0) {
      toast.error('Please select at least one song');
      return;
    }

    if (!thumbnailFile) {
      toast.error('Please select a thumbnail image');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    
    
    songIds.forEach(id => {
      formData.append('songIds', id);
    });
    
    formData.append('thumbnail', thumbnailFile);


    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${PLAYLIST_API}/${editId}` : PLAYLIST_API;

    try {
      const response = await fetch(url, {
        method,
        body: formData
      });

      const responseData = await response.json(); // ✅ Parse response để xem error
      console.log('📥 Server response:', responseData);

      if (response.ok) {
        // Reset form
        setTitle('');
        setDescription('');
        setSongIds([]);
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setEditId(null);
        setSongSearchTerm('');
        fetchPlaylists();
        
        toast.success(editId ? 'Updated playlist!' : 'Added new playlist!');
      } else {
        console.error('❌ Server error:', responseData);
        toast.error(responseData.message || 'Failed to save playlist');
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      toast.error('An error occurred while saving the playlist');
    }
    setLoading(false);
  };

  // Handle delete playlist
  const handleDelete = async (id, playlistTitle) => {
    const confirmed = window.confirm(
      `You're about to delete "${playlistTitle}"?\n\nThis action cannot be undone. Are you sure?`
    );
    
    if (!confirmed) return;

    setDeleteLoading(id);
    try {
      const response = await fetch(`${PLAYLIST_API}/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        setPlaylists(prev => prev.filter(playlist => playlist._id !== id));
        toast.success(`Deleted "${playlistTitle}" successfully!`);
        fetchPlaylists();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete playlist');
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('An error occurred while deleting the playlist');
    }
    setDeleteLoading(null);
  };

  // ✅ SỬAG handleEdit để reset thumbnail khi edit
  const handleEdit = (playlist) => {
    const formContainer = document.querySelector('.admin-form-container');
    if (formContainer) {
      formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    setEditId(playlist._id);
    setTitle(playlist.title);
    setDescription(playlist.description || '');
    setSongIds(playlist.songIds.map(s => s._id));
    
    // ✅ Reset files - user phải chọn lại thumbnail
    setThumbnailFile(null);
    setThumbnailPreview(null);
    
    toast.info(`Editing playlist: ${playlist.title} - Please select a new thumbnail`);
  };

  const handleCancel = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setSongIds([]);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setSongSearchTerm('');
    toast.info('Cancelled editing playlist');
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
      <div className="adle_admin-playlists-page">
        {/* Header Section - giữ nguyên vì dùng chung */}
        <div className="admin-page-header">
          <h2 className="admin-page-title">
            <i className="ri-play-list-line"></i>
            Manage Playlists
          </h2>
          <div className="admin-page-stats">
            <span className="stats-item">
              <i className="ri-play-list-2-line"></i>
              {playlists.length} Playlists
            </span>
            {searchTerm && (
              <span className="stats-item search-results">
                <i className="ri-search-line"></i>
                {filteredPlaylists.length} Found
              </span>
            )}
          </div>
        </div>

        {/* Form Section - giữ nguyên vì dùng chung */}
        <div className="admin-form-container">
          <div className="admin-form-header">
            <h3>
              {editId ? (
                <>
                  <i className="ri-edit-line"></i>
                  Edit Playlist
                </>
              ) : (
                <>
                  <i className="ri-add-line"></i>
                  Add New Playlist
                </>
              )}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="title">
                <i className="ri-play-list-line"></i>
                Playlist Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter playlist title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <i className="ri-file-text-line"></i>
                Description
              </label>
              <textarea
                id="description"
                placeholder="Enter playlist description (optional)"
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
                Thumbnail <span className="required-field">*</span> {/* ✅ THAY ĐỔI: required */}
              </label>
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="form-file-input"
                disabled={loading}
                required // ✅ THÊM: required attribute
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
                Select Songs <span className="required-field">*</span>
                <span className="adle_selected-count">({songIds.length} selected)</span> {/* Thêm prefix */}
              </label>
              
              {/* Song Search */}
              <div className="adle_song-search-container"> {/* Thêm prefix */}
                <div className="search-input-wrapper">
                  <i className="ri-search-line search-icon"></i>
                  <input
                    type="text"
                    placeholder="Search songs to add..."
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
              <div className="adle_songs-selection-container"> {/* Thêm prefix */}
                {filteredSongs.length === 0 ? (
                  <div className="adle_empty-songs-state"> {/* Thêm prefix */}
                    <i className="ri-music-line"></i>
                    <p>No songs available</p>
                  </div>
                ) : (
                  <div className="adle_songs-checkbox-list"> {/* Thêm prefix */}
                    {filteredSongs.map(song => (
                      <label key={song._id} className="adle_song-checkbox-item"> {/* Thêm prefix */}
                        <input
                          type="checkbox"
                          checked={songIds.includes(song._id)}
                          onChange={() => handleCheckboxChange(song._id)}
                          className="adle_song-checkbox" /* Thêm prefix */
                        />
                        <div className="adle_song-item-info"> {/* Thêm prefix */}
                          <img
                            src={
                              song.thumbnail
                                ? `http://localhost:5000/uploads/thumbnails/${song.thumbnail}`
                                : 'https://via.placeholder.com/40x40/4CAF50/white?text=♪'
                            }
                            alt={song.fullname}
                            className="adle_song-item-thumbnail" /* Thêm prefix */
                          />
                          <div className="adle_song-item-details"> {/* Thêm prefix */}
                            <span className="adle_song-item-name">{song.fullname}</span> {/* Thêm prefix */}
                            <span className="adle_song-item-artist">{song.artistId?.fullname || 'Unknown Artist'}</span> {/* Thêm prefix */}
                          </div>
                        </div>
                        <div className="adle_checkbox-indicator"> {/* Thêm prefix */}
                          <i className="ri-check-line"></i>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ✅ THÊM: Notice khi edit */}
            {editId && (
              <div className="edit-notice">
                <i className="ri-information-line"></i>
                <span>When editing, you must select a new thumbnail image.</span>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || songIds.length === 0 || !thumbnailFile} // ✅ THÊM: disable nếu không có thumbnail
              >
                {loading ? (
                  <>
                    <i className="ri-loader-line spinning"></i>
                    Loading...
                  </>
                ) : editId ? (
                  <>
                    <i className="ri-save-line"></i>
                    Update
                  </>
                ) : (
                  <>
                    <i className="ri-add-line"></i>
                    Add Playlist
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

        {/* Playlists List Section */}
        <div className="admin-list-container">
          <div className="admin-list-header">
            <h3>
              <i className="ri-list-check"></i>
              Playlists List
            </h3>
            <div className="list-actions">
              {/* Search Bar */}
              <div className="search-container">
                <div className="search-input-wrapper">
                  <i className="ri-search-line search-icon"></i>
                  <input
                    type="text"
                    placeholder="Search playlists..."
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
              
              <button onClick={fetchPlaylists} className="btn-refresh" disabled={loading}>
                <i className={`ri-refresh-line ${loading ? 'spinning' : ''}`}></i>
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <i className="ri-loader-line spinning"></i>
              Loading...
            </div>
          ) : searchTerm && filteredPlaylists.length === 0 ? (
            <div className="empty-state">
              <i className="ri-search-line"></i>
              <p>No playlists found for "{searchTerm}"</p>
              <button onClick={clearSearch} className="btn-secondary">
                <i className="ri-close-line"></i>
                Clear Search
              </button>
            </div>
          ) : filteredPlaylists.length === 0 ? (
            <div className="empty-state">
              <i className="ri-play-list-line"></i>
              <p>No playlists found</p>
            </div>
          ) : (
            <div className="adle_playlists-grid"> {/* Thêm prefix */}
              {filteredPlaylists.map((playlist) => (
                <div key={playlist._id} className={`adle_playlist-card ${editId === playlist._id ? 'adle_editing' : ''}`}> {/* Thêm prefix */}
                  <div className="adle_playlist-thumbnail"> {/* Thêm prefix */}
                    <img
                      src={
                        playlist.thumbnail
                          ? `http://localhost:5000/uploads/thumbnails/${playlist.thumbnail}`
                          : 'https://via.placeholder.com/200x200/673AB7/white?text=♪'
                      }
                      alt={playlist.title}
                    />
                    <div className="adle_playlist-overlay"> {/* Thêm prefix */}
                      <i className="ri-play-list-line"></i>
                    </div>
                  </div>
                  
                  <div className="adle_playlist-info"> {/* Thêm prefix */}
                    <h4 className="adle_playlist-title"> {/* Thêm prefix */}
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
                    </h4>
                    <p className="adle_playlist-description"> {/* Thêm prefix */}
                      {playlist.description || 'No description'}
                    </p>
                    <p className="adle_playlist-meta"> {/* Thêm prefix */}
                      {playlist.songIds?.length || 0} songs
                    </p>
                  </div>
                  
                  <div className="adle_playlist-actions"> {/* Thêm prefix */}
                    <button 
                      onClick={() => handleEdit(playlist)} 
                      className="btn-edit"
                      title="Edit"
                      disabled={loading || deleteLoading === playlist._id}
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(playlist._id, playlist.title)} 
                      className="btn-delete"
                      title="Delete"
                      disabled={loading || deleteLoading === playlist._id}
                    >
                      {deleteLoading === playlist._id ? (
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