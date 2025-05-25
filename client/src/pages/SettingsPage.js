import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function SettingsPage() {
  const [user, setUser] = useState({
    username: '',
    sex: 'other',
    avatar: ''
  });
  const [formData, setFormData] = useState({
    username: '',
    sex: 'other',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, security

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setFormData({
        username: userData.username || '',
        sex: userData.sex || 'other',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, []);

  // Handle avatar file change
  const handleAvatarChange = (e) => {
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

  // Remove avatar preview
  const removeAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    const fileInput = document.getElementById('avatar');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const updateData = new FormData();
      
      updateData.append('username', formData.username.trim());
      updateData.append('sex', formData.sex);
      
      if (avatarFile) {
        updateData.append('avatar', avatarFile);
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: updateData
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser.user));
        
        // Update component state
        setUser(updatedUser.user);
        setAvatarFile(null);
        setAvatarPreview(null);
        
        toast.success('Profile updated successfully!');
        
        // Reload page to update header
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating profile');
    }
    
    setLoading(false);
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    
    if (!formData.newPassword) {
      toast.error('New password is required');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        toast.success('Password changed successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('An error occurred while changing password');
    }
    
    setLoading(false);
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user.avatar) {
      return user.avatar.startsWith('http') 
        ? user.avatar 
        : `http://localhost:5000/uploads/avatars/${user.avatar}`;
    }
    return 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg';
  };

  return (
    <div className="main-body">
      <div className="settings-page">
        <div className="settings-header">
          <h1 className="settings-title">
            <i className="ri-settings-2-line"></i>
            Settings
          </h1>
          <p className="settings-subtitle">Manage your account settings and preferences</p>
        </div>

        <div className="settings-container">
          {/* Tabs */}
          <div className="settings-tabs">
            <button 
              className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="ri-user-line"></i>
              Profile
            </button>
            <button 
              className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <i className="ri-lock-line"></i>
              Security
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-content">
              <div className="settings-section">
                <h2 className="section-title">
                  <i className="ri-user-settings-line"></i>
                  Profile Information
                </h2>
                
                <form onSubmit={handleProfileUpdate} className="settings-form">
                  {/* Avatar Section */}
                  <div className="avatar-section">
                    <div className="avatar-preview">
                      <img src={getAvatarUrl()} alt="Avatar" />
                      <div className="avatar-overlay">
                        <i className="ri-camera-line"></i>
                      </div>
                    </div>
                    
                    <div className="avatar-controls">
                      <label htmlFor="avatar" className="avatar-upload-btn">
                        <i className="ri-upload-line"></i>
                        Change Avatar
                      </label>
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                      />
                      
                      {avatarFile && (
                        <button 
                          type="button" 
                          onClick={removeAvatarPreview}
                          className="avatar-remove-btn"
                        >
                          <i className="ri-close-line"></i>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="form-group">
                    <label htmlFor="username">
                      <i className="ri-user-line"></i>
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sex">
                      <i className="ri-user-2-line"></i>
                      Gender
                    </label>
                    <select
                      id="sex"
                      name="sex"
                      value={formData.sex}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="ri-shield-user-line"></i>
                      Role
                    </label>
                    <div className="role-display">
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? 'Administrator' : 'User'}
                      </span>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="ri-loader-line spinning"></i>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="ri-save-line"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="settings-content">
              <div className="settings-section">
                <h2 className="section-title">
                  <i className="ri-lock-2-line"></i>
                  Change Password
                </h2>
                
                <form onSubmit={handlePasswordChange} className="settings-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">
                      <i className="ri-lock-line"></i>
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">
                      <i className="ri-lock-2-line"></i>
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      <i className="ri-lock-2-line"></i>
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      minLength="6"
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="ri-loader-line spinning"></i>
                        Changing...
                      </>
                    ) : (
                      <>
                        <i className="ri-save-line"></i>
                        Change Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}