import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";

export default function ArtistDetail() {
  const { id } = useParams();
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]); // ✅ Thêm state cho albums
  const [artist, setArtist] = useState(null);
  const [albumsLoading, setAlbumsLoading] = useState(true); // ✅ Loading state cho albums

  const { setCurrentSong, setIsPlaying, setCurrentIndex, setAllSongs, currentSong, isPlaying } = useContext(PlayerContext);

  // Fetch artist songs
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:5000/api/songs/artist/${id}`);
      const data = await res.json();
      setSongs(data);
      if (data.length > 0) setArtist(data[0].artistId);
    };
    fetchData();
  }, [id]);

  // ✅ Fetch artist albums
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setAlbumsLoading(true);
        
        console.log('🔍 Fetching albums for artist ID:', id);
        
        const res = await fetch(`http://localhost:5000/api/albums/artist/${id}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('💿 Albums data:', data);
        
        // ✅ XỬ LÝ RESPONSE FORMAT ĐÚNG
        if (data.albums && Array.isArray(data.albums)) {
          console.log('💿 Found albums:', data.albums.length);
          setAlbums(data.albums);
        } else if (Array.isArray(data)) {
          console.log('💿 Found albums (direct array):', data.length);
          setAlbums(data);
        } else {
          console.log('💿 No albums found');
          setAlbums([]);
        }
        
      } catch (error) {
        console.error('❌ Error fetching albums:', error);
        setAlbums([]);
      } finally {
        setAlbumsLoading(false);
      }
    };
    
    fetchAlbums();
  }, [id]);

  // Handle song play
  const handlePlaySong = (song, index) => {
    setAllSongs(songs);
    setCurrentSong(song);
    setCurrentIndex(index); // ✅ Fix index
    setIsPlaying(true);
  };

  // play all songs of artist
  const handlePlayAll = () => {
    if (songs.length === 0) return;
    setAllSongs(songs);
    setCurrentIndex(0);
    setCurrentSong(songs[0]);
    setIsPlaying(true);
  };

  // Change tabs
  useEffect(() => {
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");

    const handleTabClick = (tab) => {
      const target = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(target)?.classList.add("active");
    };

    // ✅ Cleanup để tránh memory leak
    const tabClickHandlers = [];
    
    tabs.forEach((tab) => {
      const handler = () => handleTabClick(tab);
      tab.addEventListener("click", handler);
      tabClickHandlers.push({ tab, handler });
    });

    const trackItems = document.querySelectorAll(".track-item");
    trackItems.forEach((item) => {
      item.addEventListener("mouseenter", () => item.style.transform = "translateX(10px)");
      item.addEventListener("mouseleave", () => item.style.transform = "translateX(0)");
    });

    const albumCards = document.querySelectorAll(".album-card");
    albumCards.forEach((card) => {
      card.addEventListener("mouseenter", () => card.style.transform = "translateY(-10px) scale(1.03)");
      card.addEventListener("mouseleave", () => card.style.transform = "translateY(0) scale(1)");
    });

    // Cleanup
    return () => {
      tabClickHandlers.forEach(({ tab, handler }) => {
        tab.removeEventListener("click", handler);
      });
    };
  }, [songs, albums]); // ✅ Add dependencies

  // Format time
  useEffect(() => {
    const fetchDurations = async () => {
      const updatedSongs = await Promise.all(songs.map(song => {
        return new Promise((resolve) => {
          const audio = new Audio(`http://localhost:5000/uploads/mp3/${song.fileMp3}`);
          audio.addEventListener("loadedmetadata", () => {
            resolve({ ...song, duration: audio.duration });
          });
          audio.addEventListener("error", () => {
            resolve({ ...song, duration: 0 });
          });
        });
      }));
      setSongs(updatedSongs);
    };

    if (songs.length > 0 && !songs[0].duration) {
      fetchDurations();
    }
  }, [songs]);

  return (
    <div className="main-body">
      <div className="artist-header_client">
        <div className="artist-image">
          <img
            src={
              artist?.avatar
                ? `http://localhost:5000/uploads/avatars/${artist.avatar}`
                : "https://picsum.photos/200/200?text=Artist" // ✅ Thay via.placeholder
            }
            alt={artist?.fullname}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
          />
        </div>
        <div className="artist-info_client">
          <div className="verified-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>Verified Artist</span>
          </div>
          <h1>{artist?.fullname || "Artist"}</h1>
          
          {/* ✅ Artist Stats */}
          
          
          <div className="action-buttons">
            <button className="play-btn" onClick={handlePlayAll} disabled={songs.length === 0}>
              <svg className="play-icon" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="tabs">
        <div className="tab active" data-tab="music">
          Songs ({songs.length})
        </div>
        <div className="tab" data-tab="albums">
          Albums ({albums.length})
        </div>
      </div>

      {/* ✅ Songs Tab */}
      <div id="music" className="tab-content active">
        <div className="popular-section">
          <h2>All Songs</h2>
          {songs.length === 0 ? (
            <div className="empty-songs">
              <i className="ri-music-line"></i>
              <h3>No songs found</h3>
              <p>This artist hasn't released any songs yet.</p>
            </div>
          ) : (
            <ul className="track-list">
              {songs.map((song, i) => (
                <li 
                  key={song._id} 
                  className={`track-item ${currentSong?._id === song._id ? 'playing' : ''}`}
                  onClick={() => handlePlaySong(song, i)}
                >
                  <div className="track-number">
                    {currentSong?._id === song._id && isPlaying ? (
                      <div className="playing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <div className="track-info">
                    <div className="track-cover">
                      <img 
                        src={
                          song.thumbnail 
                            ? `http://localhost:5000/uploads/thumbnails/${song.thumbnail}` 
                            : "https://picsum.photos/40/40?text=Song" // ✅ Thay via.placeholder
                        } 
                        alt={song.fullname} 
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "cover", 
                          overflow: "hidden", 
                          borderRadius: "4px" 
                        }} 
                      />
                    </div>
                    <div className="track-details">
                      <h3>{song.fullname}</h3>
                      <p>{song.artistId?.fullname || "Unknown"}</p>
                    </div>
                  </div>
                  <div className="track-duration">{formatTime(song.duration)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ✅ Albums Tab - CẬP NHẬT VỚI DỮ LIỆU THỰC */}
      <div id="albums" className="tab-content">
        <div className="popular-section">
          <h2>Albums & Singles</h2>
          {albumsLoading ? (
            <div className="loading-albums">
              <i className="ri-loader-line spinning"></i>
              <p>Loading albums...</p>
            </div>
          ) : albums.length === 0 ? (
            <div className="empty-albums">
              <i className="ri-album-line"></i>
              <h3>No albums found</h3>
              <p>This artist hasn't released any albums yet.</p>
            </div>
          ) : (
            <div className="album-grid">
              {albums.map((album) => (
                <Link 
                  to={`/album/${album._id}`} 
                  key={album._id} 
                  className="album-card-link"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="album-card">
                    <div className="album-cover">
                      <img
                        src={
                          album.thumbnail
                            ? `http://localhost:5000/uploads/albums/${album.thumbnail}`
                            : `https://picsum.photos/200/200?random=${album._id}`
                        }
                        alt={album.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px"
                        }}
                      />
                      <div className="album-overlay">
                        <div className="album-play-btn">
                          <i className="ri-play-line"></i>
                        </div>
                      </div>
                    </div>
                    <div className="album-info">
                      <h3 title={album.title}>{album.title}</h3>
                      <p>
                        {album.releaseDate ? new Date(album.releaseDate).getFullYear() : new Date(album.createdAt).getFullYear()} 
                        • {album.songIds?.length || 0} songs
                      </p>
                      {album.description && (
                        <p className="album-description" title={album.description}>
                          {album.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(sec = 0) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}