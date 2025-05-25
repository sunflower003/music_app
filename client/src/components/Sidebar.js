import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="icon-menu"><i className="ri-menu-2-line"></i></span>
      </div>
      <nav>
        <ul className="nav-main">
          <li className="nav-main-link" onClick={() => navigate("/home")}>
            <i className="ri-home-line"></i>Main
          </li>
          <li className="nav-main-link" onClick={() => navigate("/albums")}>
            <i className="ri-album-line"></i>Albums
          </li>
          <li className="nav-main-link" onClick={() => navigate("/playlists")}>
            <i className="ri-play-list-line"></i>Playlist
          </li>
          <li className="nav-main-link" onClick={() => navigate("/favorites")}>
            <i className="ri-heart-3-line"></i>Favorites
          </li>
        </ul>
        
        <ul className="nav-bottom">
          <li onClick={() => navigate("/settings")} style={{ cursor: 'pointer' }}>
            <i className="ri-settings-2-line"></i>Settings
          </li>
          <li onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <i className="ri-logout-box-line"></i>Log out
          </li>
        </ul>
      </nav>  
    </aside>
  );
}
