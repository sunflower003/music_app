import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentSong, setIsPlaying, setCurrentIndex, setAllSongs, currentSong, isPlaying } = useContext(PlayerContext);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/albums/${id}`);
        const data = await res.json();
     
        
        setAlbum(data);
        setSongs(data.songIds || []);
      } catch (error) {
        console.error('Error fetching album:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  // ✅ Cải thiện việc lấy duration từ audio
  useEffect(() => {
    const fetchDurations = async () => {
      if (!songs.length || songs[0]?.duration) return; // Skip if already has duration
      
      const updatedSongs = [];
      
      for (const song of songs) {
        try {
          const duration = await new Promise((resolve, reject) => {
            const audio = new Audio(`http://localhost:5000/uploads/mp3/${song.fileMp3}`);
            
            const timeout = setTimeout(() => {
              reject(new Error('Timeout'));
            }, 5000); // 5 second timeout
            
            audio.addEventListener("loadedmetadata", () => {
              clearTimeout(timeout);
              resolve(audio.duration || 0);
            });
            
            audio.addEventListener("error", () => {
              clearTimeout(timeout);
              resolve(0);
            });
          });
          
          updatedSongs.push({ ...song, duration });
        } catch (error) {
          console.warn(`Failed to load duration for ${song.fullname}:`, error);
          updatedSongs.push({ ...song, duration: 0 });
        }
      }
      
      setSongs(updatedSongs);
    };

    fetchDurations();
  }); // ✅ Dependency on songs.length instead of songs

  const handlePlaySong = (song, index) => {
    setAllSongs(songs); // ✅ Set all songs for album context
    setCurrentSong(song);
    setCurrentIndex(index); // ✅ Set correct index
    setIsPlaying(true);
  };

  const handlePlayAll = () => {
    if (!songs.length) return;
    setAllSongs(songs);
    setCurrentIndex(0);
    setCurrentSong(songs[0]);
    setIsPlaying(true);
  };

  // ✅ Helper function để get artist info
  const getArtistName = (song) => {
    return song.artistId?.fullname || 
           song.artist?.fullname || 
           song.artistName || 
           'Unknown Artist';
  };

  const getArtistId = (song) => {
    return song.artistId?._id || 
           song.artist?._id || 
           null;
  };

  // ✅ Calculate total duration
  const totalDuration = songs.reduce((total, song) => total + (song.duration || 0), 0);

  if (loading) {
    return (
      <div className="main-body">
        <div className="loading-state">
          <div className="loading-spinner">
            <i className="ri-loader-line spinning"></i>
          </div>
          <p>Loading album...</p>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="main-body">
        <div className="error-state">
          <i className="ri-error-warning-line"></i>
          <h3>Album not found</h3>
          <p>The album you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-body">
      <div className="artist-header_client">
        <div className="artist-image">
          <img
            src={
              album.thumbnail
                ? `http://localhost:5000/uploads/albums/${album.thumbnail}`
                : "https://via.placeholder.com/200?text=Album"
            }
            alt={album.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
          />
        </div>
        <div className="artist-info_client">
          <div className="verified-badge">
            <i className="ri-album-line"></i>
            <span>Album</span>
          </div>
          <h1>{album.title}</h1>
          
          {/* ✅ Artist info với link */}
          <div className="album-artist">
            {album.artistId?._id ? (
              <Link to={`/artist/${album.artistId._id}`} className="album-artist-link">
                <img 
                  src={
                    album.artistId.avatar 
                      ? `http://localhost:5000/uploads/avatars/${album.artistId.avatar}`
                      : "https://via.placeholder.com/30?text=A"
                  }
                  alt={album.artistId.fullname}
                  className="artist-avatar-small"
                />
                <span>{album.artistId.fullname}</span>
              </Link>
            ) : (
              <span className="unknown-artist">Unknown Artist</span>
            )}
          </div>

          {/* ✅ Album metadata */}
          <div className="album-metadata">
            <span className="album-year">
              {album.releaseDate ? new Date(album.releaseDate).getFullYear() : new Date(album.createdAt).getFullYear()}
            </span>
            <span className="separator">•</span>
            <span className="album-tracks">{songs.length} songs</span>
            {totalDuration > 0 && (
              <>
                <span className="separator">•</span>
                <span className="album-duration">{formatTime(totalDuration)}</span>
              </>
            )}
          </div>

          {/* ✅ Album description */}
          {album.description && (
            <div className="album-description">
              <p>{album.description}</p>
            </div>
          )}

          <div className="action-buttons">
            <button 
              className="play-btn" 
              onClick={handlePlayAll}
              disabled={songs.length === 0}
            >
              <svg className="play-icon" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="popular-section">
        <h2>Album Tracks</h2>
        {songs.length === 0 ? (
          <div className="empty-album">
            <i className="ri-album-line"></i>
            <h3>No songs in this album</h3>
            <p>This album is empty.</p>
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
                          : `https://picsum.photos/40/40?random=${song._id}`
                      }
                      alt={song.fullname}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }}
                    />
                  </div>
                  
                  <div className="track-details">
                    <h3 title={song.fullname}>{song.fullname}</h3>
                    {/* ✅ Artist link (có thể khác với album artist) */}
                    {getArtistId(song) ? (
                      <Link 
                        to={`/artist/${getArtistId(song)}`} 
                        className="artist-link"
                        onClick={(e) => e.stopPropagation()} // Prevent song play when clicking artist
                      >
                        {getArtistName(song)}
                      </Link>
                    ) : (
                      <p className="artist-name">{getArtistName(song)}</p>
                    )}
                  </div>
                </div>
                
                <div className="track-duration">
                  {song.duration > 0 ? (
                    formatTime(song.duration)
                  ) : (
                    <span className="loading-duration">
                      <i className="ri-loader-4-line spinning"></i>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ Album info section */}
      <div className="album-info-section">
        <h3>About this album</h3>
        <div className="album-details">
          <div className="detail-item">
            <span className="detail-label">Release Date:</span>
            <span className="detail-value">
              {album.releaseDate 
                ? new Date(album.releaseDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : new Date(album.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
              }
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total Duration:</span>
            <span className="detail-value">
              {totalDuration > 0 ? formatTime(totalDuration) : 'Calculating...'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Number of Tracks:</span>
            <span className="detail-value">{songs.length}</span>
          </div>
          {album.artistId?.fullname && (
            <div className="detail-item">
              <span className="detail-label">Artist:</span>
              <span className="detail-value">
                {album.artistId._id ? (
                  <Link to={`/artist/${album.artistId._id}`} className="artist-detail-link">
                    {album.artistId.fullname}
                  </Link>
                ) : (
                  album.artistId.fullname
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(sec = 0) {
  if (!sec || sec === 0) return '0:00'; // ✅ Handle zero/null values
  
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}