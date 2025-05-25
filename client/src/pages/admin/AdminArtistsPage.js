import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout.js';
import { toast } from 'react-toastify';

const API = 'http://localhost:5000/api/artists';

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState([]);
  const [fullname, setFullname] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State cho search

  // Fetch artists
  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setArtists(data);
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast.error('Cannot fetch artists at this time');
    }
    setLoading(false);
  };

  // Filter artists based on search term
  const filteredArtists = artists.filter(artist =>
    artist.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle file change với preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };

  // Handle form submission for adding/editing artists
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fullname.trim()) {
      toast.error('Enter a valid artist name');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('fullname', fullname.trim());
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API}/${editId}` : API;

    try {
      const response = await fetch(url, {
        method,
        body: formData
      });

      if (response.ok) {
        setFullname('');
        setAvatarFile(null);
        setAvatarPreview(null);
        setEditId(null);
        fetchArtists();
        
        toast.success(editId ? 'Updated artist!' : 'Added new artist!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save artist');
      }
    } catch (error) {
      console.error('Error saving artist:', error);
      toast.error('An error occurred while saving the artist');
    }
    setLoading(false);
  };

  // Handle delete artist
  const handleDelete = async (id, artistName) => {
    const confirmed = window.confirm(
      `You're about to delete "${artistName}"?\n\nThis action cannot be undone. Are you sure?`
    );
    
    if (!confirmed) return;

    setDeleteLoading(id);
    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        setArtists(prev => prev.filter(artist => artist._id !== id));
        toast.success(`Deleted "${artistName}" successfully!`);
        fetchArtists();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete artist');
      }
    } catch (error) {
      console.error('Error deleting artist:', error);
      toast.error('An error occurred while deleting the artist');
    }
    setDeleteLoading(null);
  };

  const handleEdit = (artist) => {
    const formContainer = document.querySelector('.admin-form-container');
    if (formContainer) {
      formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    setEditId(artist._id);
    setFullname(artist.fullname);
    setAvatarFile(null);
    setAvatarPreview(null);
    
    toast.info(`Editing artist: ${artist.fullname}`);
  };

  const handleCancel = () => {
    setEditId(null);
    setFullname('');
    setAvatarFile(null);
    setAvatarPreview(null);
    toast.info('Cancelled editing artist');
  };

  const removePreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    const fileInput = document.getElementById('avatar');
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
      <div className="admin-artists-page">
        {/* Header Section */}
        <div className="admin-page-header">
          <h2 className="admin-page-title">
            <i className="ri-mic-line"></i>
            Manage Artists
          </h2>
          <div className="admin-page-stats">
            <span className="stats-item">
              <i className="ri-user-line"></i>
              {artists.length} Artists
            </span>
            {searchTerm && (
              <span className="stats-item search-results">
                <i className="ri-search-line"></i>
                {filteredArtists.length} Found
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
                  Edit Artist
                </>
              ) : (
                <>
                  <i className="ri-add-line"></i>
                  Add New Artist
                </>
              )}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="fullname">
                <i className="ri-user-line"></i>
                Artist Name
              </label>
              <input
                id="fullname"
                type="text"
                placeholder="Enter artist name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="avatar">
                <i className="ri-image-line"></i>
                Avatar {editId && '(Optional)'}
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-file-input"
                disabled={loading}
              />
              
              {/* File name preview */}
              {avatarFile && (
                <div className="file-preview">
                  <i className="ri-file-image-line"></i>
                  <span>{avatarFile.name}</span>
                  <button 
                    type="button" 
                    onClick={removePreview}
                    className="remove-file-btn"
                    title="Remove file"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              )}
              
              {/* Image preview */}
              {avatarPreview && (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <img src={avatarPreview} alt="Preview" />
                    <div className="image-preview-overlay">
                      <button 
                        type="button" 
                        onClick={removePreview}
                        className="remove-image-btn"
                        title="Remove image"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                  <p className="preview-label">Preview</p>
                </div>
              )}
            </div>

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
                    Add Artist
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

        {/* Artists List Section */}
        <div className="admin-list-container">
          <div className="admin-list-header">
            <h3>
              <i className="ri-list-check"></i>
              Artists List
            </h3>
            <div className="list-actions">
              {/* Search Bar */}
              <div className="search-container">
                <div className="search-input-wrapper">
                  <i className="ri-search-line search-icon"></i>
                  <input
                    type="text"
                    placeholder="Search artists..."
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
              
              <button onClick={fetchArtists} className="btn-refresh" disabled={loading}>
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
          ) : searchTerm && filteredArtists.length === 0 ? (
            <div className="empty-state">
              <i className="ri-search-line"></i>
              <p>No artists found for "{searchTerm}"</p>
              <button onClick={clearSearch} className="btn-secondary">
                <i className="ri-close-line"></i>
                Clear Search
              </button>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="empty-state">
              <i className="ri-music-line"></i>
              <p>No artists found</p>
            </div>
          ) : (
            <div className="artists-grid">
              {filteredArtists.map((artist) => (
                <div key={artist._id} className={`artist-card ${editId === artist._id ? 'editing' : ''}`}>
                  <div className="artist-avatar">
                    <img
                      src={
                        artist.avatar
                          ? `http://localhost:5000/uploads/avatars/${artist.avatar}`
                          : 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
                      }
                      alt={artist.fullname}
                    />
                    <div className="artist-overlay">
                      <i className="ri-music-line"></i>
                    </div>
                  </div>
                  
                  <div className="artist-info_client">
                    <h4 className="artist-name">
                      {searchTerm ? (
                        <span dangerouslySetInnerHTML={{
                          __html: artist.fullname.replace(
                            new RegExp(`(${searchTerm})`, 'gi'),
                            '<mark>$1</mark>'
                          )
                        }} />
                      ) : (
                        artist.fullname
                      )}
                    </h4>
                    <p className="artist-meta">Artist</p>
                  </div>
                  
                  <div className="artist-actions">
                    <button 
                      onClick={() => handleEdit(artist)} 
                      className="btn-edit"
                      title="Edit"
                      disabled={loading || deleteLoading === artist._id}
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(artist._id, artist.fullname)} 
                      className="btn-delete"
                      title="Delete"
                      disabled={loading || deleteLoading === artist._id}
                    >
                      {deleteLoading === artist._id ? (
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