import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [latestSong, setLatestSong] = useState(null);
  const [latestSongs, setLatestSongs] = useState([]);
  const { setCurrentSong, setIsPlaying } = useContext(PlayerContext);
  const [latestPlaylists, setLatestPlaylists] = useState([]);
  const [latestAlbums, setLatestAlbums] = useState([]); // ✅ Thêm state cho albums

  useEffect(() => {
    fetchLatestSong();
    fetchLatestSongs();
    fetchLatestPlaylists();
    fetchLatestAlbums(); // ✅ Thêm call fetch albums
  }, []);

  // Giữ nguyên cho banner (lấy 1 bài mới nhất)
  const fetchLatestSong = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/songs/latest?limit=1");
      const data = await res.json();
      if (data.length > 0) {
        setLatestSong(data[0]);
      }
    } catch (error) {
      console.error('Error fetching latest song:', error);
    }
  };

  // Function để lấy 4 bài hát
  const fetchLatestSongs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/songs/latest?limit=4");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setLatestSongs(data);
      } else {
        console.error('Songs data is not an array:', data);
        setLatestSongs([]);
      }
    } catch (error) {
      console.error('Error fetching latest songs:', error);
      setLatestSongs([]);
    }
  };

  // Function playlists
  const fetchLatestPlaylists = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/playlists/latest?limit=4");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setLatestPlaylists(data);
      } else {
        console.error('Playlists data is not an array:', data);
        setLatestPlaylists([]);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setLatestPlaylists([]);
    }
  };

  // ✅ THÊM: Function để lấy 4 albums mới nhất
  const fetchLatestAlbums = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/albums/latest?limit=4");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setLatestAlbums(data);
      } else {
        console.error('Albums data is not an array:', data);
        setLatestAlbums([]);
      }
    } catch (error) {
      console.error('Error fetching latest albums:', error);
      setLatestAlbums([]);
    }
  };

  return (
    <div className="main-body">
      <h1 className="main-title">Main</h1>
      <h2 className="section-title">Latest Song</h2>

      {/* Banner - giữ nguyên */}
      {latestSong && (
        <div className="highlight-banner">
          <div className="highlight-content">
            <div className="highlight-info">
              <div className="highlight-artist">
                {latestSong.artistId?.fullname || "Unknown Artist"}
              </div>  
              <div className="highlight-song">{latestSong.fullname}</div>
              <button
                className="btn-listen"
                onClick={() => {
                  setCurrentSong(latestSong);
                  setIsPlaying(true);
                }}
              >
                <i className="ri-play-fill"></i> Listen now
              </button>
            </div>
            <div className="highlight-art">
              <img
                src={
                  latestSong.thumbnail
                    ? `http://localhost:5000/uploads/thumbnails/${latestSong.thumbnail}`
                    : "https://via.placeholder.com/150"
                }
                alt={latestSong.fullname}
              />
            </div>
          </div>
        </div>
      )}

      {/* Playlists section - giữ nguyên */}
      <div className="section-flex">
        <h2 className="section-title">New Playlists for you</h2>
        <Link to="/playlists" className="viewall-btn">
          View all
        </Link>
      </div>
      <div className="playlist-row">
        {latestPlaylists && latestPlaylists.length > 0 ? (
          latestPlaylists.map((pl) => (
            <Link to={`/playlist/${pl._id}`} key={pl._id} style={{ textDecoration: "none" }}>
              <div
                className="playlist-card"
                style={{
                  backgroundImage: `url(${pl.thumbnail ? `http://localhost:5000/uploads/thumbnails/${pl.thumbnail}` : `https://picsum.photos/400?random=${pl._id}`})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "12px",
                  overflow: "hidden",
                  position: "relative",
                  color: "#fff",
                  minHeight: "160px",
                  padding: "16px",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.15)"
                }}
              >
                <div className="playlist-info" style={{ zIndex: 100, borderRadius: "8px", padding: "8px 14px" }}>
                  {pl.title}<br />
                  <span>{pl.songIds?.length || 0} tracks</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-playlists">
            <p>No playlists available</p>
          </div>
        )}
      </div>

      {/* New Songs section */}
      <div className="section-flex">
        <h2 className="section-title">New Songs for you</h2>
        <Link to="/songs" className="viewall-btn">
          View all
        </Link>
      </div>
      <div className="playlist-row">
        {latestSongs && latestSongs.length > 0 ? (
          latestSongs.map((song) => (
            <div
              key={song._id}
              className="playlist-card"
              style={{
                backgroundImage: `url(${song.thumbnail ? `http://localhost:5000/uploads/thumbnails/${song.thumbnail}` : `https://picsum.photos/400?random=${song._id}`})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "12px",
                overflow: "hidden",
                position: "relative",
                color: "#fff",
                minHeight: "160px",
                padding: "16px",
                boxShadow: "0 4px 18px rgba(0,0,0,0.15)",
                cursor: "pointer"
              }}
              onClick={() => {
                setCurrentSong(song);
                setIsPlaying(true);
              }}
            >
              <div className="playlist-info" style={{ zIndex: 100, borderRadius: "8px", padding: "8px 14px" }}>
                {song.fullname}<br />
                <span>{song.artistId?.fullname || "Unknown Artist"}</span>
              </div>
              {/* Play button overlay */}
              <div className="play-overlay" style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0,
                transition: "opacity 0.3s ease",
                fontSize: "2rem",
                color: "#fff",
                textShadow: "0 0 10px rgba(0,0,0,0.5)"
              }}>
                <i className="ri-play-circle-fill"></i>
              </div>
            </div>
          ))
        ) : (
          <div className="no-songs">
            <p>No songs available</p>
          </div>
        )}
      </div>
      
      {/* ✅ Albums section - CẬP NHẬT */}
      <div className="section-flex">
        <h2 className="section-title">New Albums for you</h2>
        <Link to="/albums" className="viewall-btn">
          View all
        </Link>
      </div>
      <div className="playlist-row">
        {latestAlbums && latestAlbums.length > 0 ? (
          latestAlbums.map((album) => (
            <Link to={`/album/${album._id}`} key={album._id} style={{ textDecoration: "none" }}>
              <div
                className="playlist-card"
                style={{
                  backgroundImage: `url(${album.thumbnail ? `http://localhost:5000/uploads/albums/${album.thumbnail}` : `https://picsum.photos/400?random=${album._id}`})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "12px",
                  overflow: "hidden",
                  position: "relative",
                  color: "#fff",
                  minHeight: "160px",
                  padding: "16px",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.15)"
                }}
              >
                <div className="playlist-info" style={{ zIndex: 100, borderRadius: "8px", padding: "8px 14px" }}>
                  {album.title}<br />
                  <span>
                    <i className="ri-user-star-line"></i> {album.artistId?.fullname || "Unknown Artist"}<br />
                    <span>{album.songIds?.length || 0} tracks</span>
                  </span>
                </div>
                {/* ✅ Album icon overlay */}
                <div className="album-overlay" style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                  fontSize: "2rem",
                  color: "#fff",
                  textShadow: "0 0 10px rgba(0,0,0,0.5)"
                }}>
                  <i className="ri-album-line"></i>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-albums">
            <p>No albums available</p>
          </div>
        )}
      </div>
    </div>
  );
}


