import React, { useContext, useEffect, useRef, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    currentIndex,
    setCurrentIndex,
    allSongs,
  } = useContext(PlayerContext);
  
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const barRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [favorites, setFavorites] = useState([]);

  const token = localStorage.getItem("token")?.trim();

  // bật tắt tiếng khi bấm nút 
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);


  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/users/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          return;
        }

        const data = await res.json();
        const ids = Array.isArray(data) ? data.map((song) => song._id) : [];
        setFavorites(ids);
      } catch (err) {
        console.error("Failed to fetch favorites", err);
      }
    };

    fetchFavorites();
  }, [token]);

  const isFavorite = currentSong && favorites.includes(currentSong._id);

  // Xu lý them bai hat yêu thích
  // Kiểm tra nếu currentSong và token tồn tại
  const handleToggleFavorite = async () => {
    if (!currentSong || !token) return;

    try {
      let res;
      
      if (isFavorite) {
        // ✅ NẾU ĐÃ LÀ FAVORITE - XÓA BẰNG DELETE
        res = await fetch(
          `http://localhost:5000/api/users/favorites/${currentSong._id}`,
          {
            method: "DELETE", // ✅ DÙNG DELETE thay vì POST
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
      } else {
        // ✅ NẾU CHƯA LÀ FAVORITE - THÊM BẰNG POST
        res = await fetch(
          `http://localhost:5000/api/users/favorites/${currentSong._id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
      }

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }

      if (res.ok) {
        // ✅ CẬP NHẬT STATE
        setFavorites((prev) =>
          isFavorite
            ? prev.filter((id) => id !== currentSong._id) // Remove
            : [...prev, currentSong._id] // Add
        );
        
        console.log(isFavorite ? 'Removed from favorites' : 'Added to favorites');
      } else {
        const errorData = await res.json();
        console.error('Toggle favorite failed:', errorData);
      }
    } catch (err) {
      console.error("Toggle favorite failed", err);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.play() : audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    }
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    // Tự chuyển bài
    setCurrentIndex((currentIndex + 1) % allSongs.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const bar = barRef.current;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.min(Math.max(clickX / rect.width, 0), 1);

    const audio = audioRef.current;
    if (audio && audio.duration) {
      const newTime = audio.duration * ratio;
      audio.currentTime = newTime;
      setProgress((newTime / audio.duration) * 100);
    }
  };

  const handleDragStart = () => {
    document.addEventListener("mousemove", handleDragging);
    document.addEventListener("mouseup", handleDragEnd);
  };

  const handleDragging = (e) => {
    const bar = barRef.current;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.min(Math.max(clickX / rect.width, 0), 1);

    const audio = audioRef.current;
    if (audio && audio.duration) {
      const newTime = audio.duration * ratio;
      audio.currentTime = newTime;
      setProgress((newTime / audio.duration) * 100);
    }
  };

  const handleDragEnd = () => {
    document.removeEventListener("mousemove", handleDragging);
    document.removeEventListener("mouseup", handleDragEnd);
  };

  //  Nút tua bài
  const handleNext = () => {
    if (allSongs.length > 0) {
      setCurrentIndex((currentIndex + 1) % allSongs.length);
    }
  };

  const handlePrev = () => {
    if (allSongs.length > 0) {
      setCurrentIndex(
        currentIndex === 0 ? allSongs.length - 1 : currentIndex - 1
      );
    }
  };

  if (!currentSong) return null;

  const artist = currentSong.artistId?.fullname || "Unknown Artist";
  const title = currentSong.fullname;
  const thumbnail = currentSong.thumbnail
    ? `http://localhost:5000/uploads/thumbnails/${currentSong.thumbnail}`
    : "https://via.placeholder.com/100";
  const fileUrl = `http://localhost:5000/uploads/mp3/${currentSong.fileMp3}`;

  return (
    <div className="playerbar">
      <audio
        ref={audioRef}
        src={fileUrl} // http://localhost:5000/uploads/mp3/[filename]
        onTimeUpdate={handleTimeUpdate} // Cập nhật progress bar
        onLoadedMetadata={handleLoadedMetadata} // Lấy duration
        onEnded={handleEnded} // Auto next song
      />

      <div className="playerbar-left">
        <img src={thumbnail} alt={title} />
        <div>
          <div className="pb-title">{title}</div>
          <div className="pb-artist">{artist}</div>
        </div>
      </div>

      <div className="playerbar-center">
        <div className="pb-controls">
          <button onClick={handlePrev}><i className="ri-skip-left-line"></i></button>
          <button className="pb-play" onClick={togglePlay}>
            <i className={isPlaying ? "ri-pause-fill" : "ri-play-fill"}></i>
          </button>
          <button onClick={handleNext}><i className="ri-skip-right-line"></i></button>
        </div>

        <div className="pb-progress">
          <span>{formatTime(audioRef.current?.currentTime)}</span>
          <div
            className="pb-bar"
            ref={barRef}
            onClick={handleSeek}
            onMouseDown={handleDragStart}
            style={{ cursor: "pointer" }}
          >
            <div className="pb-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="playerbar-right">
        <button onClick={handleToggleFavorite}>
          <i className={isFavorite ? "ri-heart-fill" : "ri-heart-line"}></i>
        </button>
        <button onClick={() => setIsMuted(!isMuted)}>
          <i className={isMuted ? "ri-volume-mute-line" : "ri-volume-down-line"}></i>
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          defaultValue="0.6"
          onChange={(e) => {
            audioRef.current.volume = e.target.value;
          }}
          className="pb-volume"
        />
      </div>
    </div>
  );
}


function formatTime(sec = 0) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
