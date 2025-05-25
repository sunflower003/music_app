// src/components/MainHeader.js
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import SearchBar from "../components/SearchBar";
export default function MainHeader() {
  const {
    allSongs,
    setCurrentSong,
    setCurrentIndex,
    setIsPlaying,
  } = useContext(PlayerContext); 
  const [username, setUsername] = useState("User");
  const [avatar, setAvatar] = useState(null);
  const [role, setRole] = useState(null); // 👈 thêm state role

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username);
      setAvatar(user.avatar);
      setRole(user.role); // 👈 gán role
    }
  }, []);

  const avatarUrl = avatar
    ? avatar.startsWith("http")
      ? avatar // nếu là đường dẫn online
      : `http://localhost:5000/uploads/avatars/${avatar}` // nếu là tên file trên server
    : "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"; // ảnh mặc định
  
    
   return (
    <div className="main-header" >
      <SearchBar
        allSongs={allSongs}
        setCurrentSong={setCurrentSong}
        setCurrentIndex={setCurrentIndex}
        setIsPlaying={setIsPlaying}
      />
      <div className="profile">
        <span className="profile-name">{username}</span>
        <img
         className="profile-avatar"
          src={avatarUrl}
          alt="avatar"
        />
        {/* 👇 Chỉ hiển thị nếu role là admin */}
        {role === "admin" && (
          <Link to="/admin/artists" className="go-admin-link" target="_blank" style={{
            marginLeft: '12px',
            textDecoration: 'none',
            background: '#111',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            Admin
          </Link>
        )}
      </div>
    </div>
  );
}
