import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="admin-sidebar">
      <h3 className="admin-sidebar-title">Admin Panel</h3>
      <nav className="admin-sidebar-nav">
        <Link 
          to="/admin/artists" 
          className={`admin-sidebar-link ${location.pathname === '/admin/artists' ? 'active' : ''}`}
        >
          <i className="ri-mic-line"></i>
          Manage Artists
        </Link>
        <Link 
          to="/admin/songs" 
          className={`admin-sidebar-link ${location.pathname === '/admin/songs' ? 'active' : ''}`}
        >
          <i className="ri-music-line"></i>
          Manage Songs
        </Link>
        <Link 
          to="/admin/albums" 
          className={`admin-sidebar-link ${location.pathname === '/admin/albums' ? 'active' : ''}`}
        >
          <i className="ri-album-line"></i>
          Manage Albums
        </Link>
        <Link 
          to="/admin/playlists" 
          className={`admin-sidebar-link ${location.pathname === '/admin/playlists' ? 'active' : ''}`}
        >
          <i className="ri-play-list-line"></i>
          Manage Playlists
        </Link>
        <Link 
          to="/admin/users" 
          className={`admin-sidebar-link ${location.pathname === '/admin/users' ? 'active' : ''}`}
        >
          <i className="ri-user-settings-line"></i>
          Manage Users
        </Link>
      </nav>
    </div>
  );
}