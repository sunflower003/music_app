import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout.js';
import { toast } from 'react-toastify';

const API = 'http://localhost:5000/api/songs';
const ARTIST_API = 'http://localhost:5000/api/artists';

export default function AdminSongsPage() {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [fullname, setFullname] = useState('');
  const [artistId, setArtistId] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [mp3File, setMp3File] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSongs();
    fetchArtists();
  }, []);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setSongs(data);
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast.error('Cannot fetch songs at this time');
    }
    setLoading(false);
  };

  const fetchArtists = async () => {
    try {
      const res = await fetch(ARTIST_API);
      const data = await res.json();
      setArtists(data);
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast.error('Cannot fetch artists list');
    }
  };

  // Filter songs based on search term
  const filteredSongs = songs.filter(song =>
    song.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (song.artistId?.fullname || '').toLowerCase().includes(searchTerm.toLowerCase())
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

  // Handle MP3 file change
  const handleMp3Change = (e) => {
    const file = e.target.files[0];
    setMp3File(file);
  };

  // Handle form submission for adding/editing songs
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fullname.trim()) {
      toast.error('Enter a valid song name');
      return;
    }

    if (!artistId) {
      toast.error('Please select an artist');
      return;
    }

    // Kiểm tra MP3 file - bắt buộc cho cả thêm mới và edit
    if (!mp3File) {
      toast.error('Please select an MP3 file');
      return;
    }

    // Kiểm tra thumbnail - bắt buộc cho cả thêm mới và edit
    if (!thumbnailFile) {
      toast.error('Please select a thumbnail image');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('fullname', fullname.trim());
    formData.append('artistId', artistId);
    formData.append('thumbnail', thumbnailFile); // Luôn gửi thumbnail
    formData.append('fileMp3', mp3File); // Luôn gửi mp3

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API}/${editId}` : API;

    try {
      const response = await fetch(url, {
        method,
        body: formData
      });

      if (response.ok) {
        // Reset form
        setFullname('');
        setArtistId('');
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setMp3File(null);
        setEditId(null);
        fetchSongs();
        
        toast.success(editId ? 'Updated song!' : 'Added new song!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save song');
      }
    } catch (error) {
      console.error('Error saving song:', error);
      toast.error('An error occurred while saving the song');
    }
    setLoading(false);
  };

  // Handle delete song
  const handleDelete = async (id, songName) => {
    const confirmed = window.confirm(
      `You're about to delete "${songName}"?\n\nThis action cannot be undone. Are you sure?`
    );
    
    if (!confirmed) return;

    setDeleteLoading(id);
    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        setSongs(prev => prev.filter(song => song._id !== id));
        toast.success(`Deleted "${songName}" successfully!`);
        fetchSongs();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete song');
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      toast.error('An error occurred while deleting the song');
    }
    setDeleteLoading(null);
  };

  const handleEdit = (song) => {
    const formContainer = document.querySelector('.admin-form-container');
    if (formContainer) {
      formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    setEditId(song._id);
    setFullname(song.fullname);
    setArtistId(song.artistId?._id || '');
    
    // Reset files - user phải chọn lại cả thumbnail và mp3
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setMp3File(null);
    
    toast.info(`Editing song: ${song.fullname} - Please select new thumbnail and MP3 file`);
  };

  const handleCancel = () => {
    setEditId(null);
    setFullname('');
    setArtistId('');
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setMp3File(null);
    toast.info('Cancelled editing song');
  };

  const removeThumbnailPreview = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    const fileInput = document.getElementById('thumbnail');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const removeMp3File = () => {
    setMp3File(null);
    const fileInput = document.getElementById('mp3');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <AdminLayout>
      <div className="admin-songs-page">
        {/* Header Section */}
        <div className="admin-page-header">
          <h2 className="admin-page-title">
            <i className="ri-music-line"></i>
            Manage Songs
          </h2>
          <div className="admin-page-stats">
            <span className="stats-item">
              <i className="ri-music-2-line"></i>
              {songs.length} Songs
            </span>
            {searchTerm && (
              <span className="stats-item search-results">
                <i className="ri-search-line"></i>
                {filteredSongs.length} Found
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
                  Edit Song
                </>
              ) : (
                <>
                  <i className="ri-add-line"></i>
                  Add New Song
                </>
              )}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="fullname">
                <i className="ri-music-2-line"></i>
                Song Name
              </label>
              <input
                id="fullname"
                type="text"
                placeholder="Enter song name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="artistId">
                <i className="ri-user-line"></i>
                Artist
              </label>
              <select
                id="artistId"
                value={artistId}
                onChange={(e) => setArtistId(e.target.value)}
                required
                className="form-select"
                disabled={loading}
              >
                <option value="">Select an artist</option>
                {artists.map((artist) => (
                  <option key={artist._id} value={artist._id}>
                    {artist.fullname}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="thumbnail">
                <i className="ri-image-line"></i>
                Thumbnail <span className="required-field">*</span>
              </label>
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="form-file-input"
                disabled={loading}
                required
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

            <div className="form-group">
              <label htmlFor="mp3">
                <i className="ri-file-music-line"></i>
                MP3 File <span className="required-field">*</span>
              </label>
              <input
                id="mp3"
                type="file"
                accept="audio/*"
                onChange={handleMp3Change}
                className="form-file-input"
                disabled={loading}
                required
              />
              
              {/* MP3 file preview */}
              {mp3File && (
                <div className="file-preview mp3-preview">
                  <i className="ri-file-music-line"></i>
                  <span>{mp3File.name}</span>
                  <span className="file-size">
                    ({(mp3File.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                  <button 
                    type="button" 
                    onClick={removeMp3File}
                    className="remove-file-btn"
                    title="Remove file"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              )}
            </div>

            {editId && (
              <div className="edit-notice">
                <i className="ri-information-line"></i>
                <span>When editing, you must select new thumbnail and MP3 files to replace the current ones.</span>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
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
                    Add Song
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

        {/* Songs List Section */}
        <div className="admin-list-container">
          <div className="admin-list-header">
            <h3>
              <i className="ri-list-check"></i>
              Songs List
            </h3>
            <div className="list-actions">
              {/* Search Bar */}
              <div className="search-container">
                <div className="search-input-wrapper">
                  <i className="ri-search-line search-icon"></i>
                  <input
                    type="text"
                    placeholder="Search songs or artists..."
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
              
              <button onClick={fetchSongs} className="btn-refresh" disabled={loading}>
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
          ) : searchTerm && filteredSongs.length === 0 ? (
            <div className="empty-state">
              <i className="ri-search-line"></i>
              <p>No songs found for "{searchTerm}"</p>
              <button onClick={clearSearch} className="btn-secondary">
                <i className="ri-close-line"></i>
                Clear Search
              </button>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="empty-state">
              <i className="ri-music-line"></i>
              <p>No songs found</p>
            </div>
          ) : (
            <div className="songs-grid">
              {filteredSongs.map((song) => (
                <div key={song._id} className={`song-card ${editId === song._id ? 'editing' : ''}`}>
                  <div className="song-thumbnail">
                    <img
                      src={
                        song.thumbnail
                          ? `http://localhost:5000/uploads/thumbnails/${song.thumbnail}`
                          : 'https://via.placeholder.com/150x150/4CAF50/white?text=♪'
                      }
                      alt={song.fullname}
                    />
                    <div className="song-overlay">
                      <i className="ri-play-line"></i>
                    </div>
                  </div>
                  
                  <div className="song-info">
                    <h4 className="song-name">
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
                    <p className="song-artist">
                      {searchTerm ? (
                        <span dangerouslySetInnerHTML={{
                          __html: (song.artistId?.fullname || 'Unknown Artist').replace(
                            new RegExp(`(${searchTerm})`, 'gi'),
                            '<mark>$1</mark>'
                          )
                        }} />
                      ) : (
                        song.artistId?.fullname || 'Unknown Artist'
                      )}
                    </p>
                    <p className="song-meta">Song</p>
                  </div>
                  
                  <div className="song-actions">
                    <button 
                      onClick={() => handleEdit(song)} 
                      className="btn-edit"
                      title="Edit"
                      disabled={loading || deleteLoading === song._id}
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(song._id, song.fullname)} 
                      className="btn-delete"
                      title="Delete"
                      disabled={loading || deleteLoading === song._id}
                    >
                      {deleteLoading === song._id ? (
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