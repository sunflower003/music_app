import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layout/admin/AdminLayout.js';
import { toast } from 'react-toastify';

const API = 'http://localhost:5000/api/users';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [roleLoading, setRoleLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // all, admin, user
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Cannot fetch users at this time');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Handle role change
  const handleRoleChange = async (userId, newRole, username) => {
    const confirmed = window.confirm(
      `Change ${username}'s role to ${newRole.toUpperCase()}?\n\nThis will ${newRole === 'admin' ? 'grant' : 'revoke'} admin privileges.`
    );
    
    if (!confirmed) return;

    setRoleLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
        toast.success(`${username}'s role updated to ${newRole}!`);
        fetchStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('An error occurred while updating user role');
    }
    setRoleLoading(null);
  };

  // Handle delete user
  const handleDelete = async (userId, username) => {
    const confirmed = window.confirm(
      `Delete user "${username}"?\n\nThis action cannot be undone!`
    );
    
    if (!confirmed) return;

    setDeleteLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setUsers(prev => prev.filter(user => user._id !== userId));
        toast.success(`User "${username}" deleted successfully!`);
        fetchStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('An error occurred while deleting user');
    }
    setDeleteLoading(null);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Get current user to prevent self-deletion
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <AdminLayout>
      <div className="admin-users-page">
        {/* Header Section */}
        <div className="admin-page-header">
          <h2 className="admin-page-title">
            <i className="ri-user-settings-line"></i>
            Manage Users
          </h2>
          <div className="admin-page-stats">
            <span className="stats-item">
              <i className="ri-group-line"></i>
              {stats.totalUsers} Total
            </span>
            <span className="stats-item admin-count">
              <i className="ri-admin-line"></i>
              {stats.adminUsers} Admins
            </span>
            <span className="stats-item user-count">
              <i className="ri-user-line"></i>
              {stats.regularUsers} Users
            </span>
            {searchTerm && (
              <span className="stats-item search-results">
                <i className="ri-search-line"></i>
                {filteredUsers.length} Found
              </span>
            )}
          </div>
        </div>

        {/* Users List Section */}
        <div className="admin-list-container">
          <div className="admin-list-header">
            <h3>
              <i className="ri-list-check"></i>
              Users List
            </h3>
            <div className="list-actions">
              {/* Role Filter */}
              <div className="filter-container">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Users</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="search-container">
                <div className="search-input-wrapper">
                  <i className="ri-search-line search-icon"></i>
                  <input
                    type="text"
                    placeholder="Search users..."
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
              
              <button onClick={fetchUsers} className="btn-refresh" disabled={loading}>
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
          ) : searchTerm && filteredUsers.length === 0 ? (
            <div className="empty-state">
              <i className="ri-search-line"></i>
              <p>No users found for "{searchTerm}"</p>
              <button onClick={clearSearch} className="btn-secondary">
                <i className="ri-close-line"></i>
                Clear Search
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <i className="ri-user-line"></i>
              <p>No users found</p>
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <div key={user._id} className="user-card">
                  <div className="user-avatar">
                    <img
                      src={
                        user.avatar
                          ? `http://localhost:5000/uploads/avatars/${user.avatar}`
                          : 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
                      }
                      alt={user.username}
                    />
                    <div className="user-role-badge">
                      <i className={user.role === 'admin' ? 'ri-admin-line' : 'ri-user-line'}></i>
                    </div>
                  </div>
                  
                  <div className="user-info">
                    <h4 className="user-name">
                      {searchTerm ? (
                        <span dangerouslySetInnerHTML={{
                          __html: user.username.replace(
                            new RegExp(`(${searchTerm})`, 'gi'),
                            '<mark>$1</mark>'
                          )
                        }} />
                      ) : (
                        user.username
                      )}
                      {user._id === currentUser.id && (
                        <span className="current-user-badge">(You)</span>
                      )}
                    </h4>
                    <p className={`user-role ${user.role}`}>
                      {user.role === 'admin' ? 'Administrator' : 'User'}
                    </p>
                    <p className="user-meta">
                      <i className="ri-calendar-line"></i>
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <p className="user-meta">
                      <i className="ri-heart-line"></i>
                      {user.favorites?.length || 0} favorites
                    </p>
                  </div>
                  
                  <div className="user-actions">
                    {/* Role Toggle */}
                    <button 
                      onClick={() => handleRoleChange(
                        user._id, 
                        user.role === 'admin' ? 'user' : 'admin',
                        user.username
                      )}
                      className={`btn-role ${user.role}`}
                      title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      disabled={loading || roleLoading === user._id || user._id === currentUser.id}
                    >
                      {roleLoading === user._id ? (
                        <i className="ri-loader-line spinning"></i>
                      ) : user.role === 'admin' ? (
                        <i className="ri-user-line"></i>
                      ) : (
                        <i className="ri-admin-line"></i>
                      )}
                    </button>

                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDelete(user._id, user.username)}
                      className="btn-delete"
                      title="Delete User"
                      disabled={loading || deleteLoading === user._id || user._id === currentUser.id}
                    >
                      {deleteLoading === user._id ? (
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