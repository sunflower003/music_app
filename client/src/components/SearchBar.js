import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function SearchBar({ allSongs, setCurrentSong, setCurrentIndex, setIsPlaying }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ songs: [], artists: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ songs: [], artists: [] });
      return;
    }

    const lower = query.trim().toLowerCase();

    // Tìm bài hát
    const matchedSongs = allSongs.filter((song) =>
      song.fullname.toLowerCase().includes(lower)
    );

    // Tìm ca sĩ duy nhất (dựa trên artistId)
    const matchedArtistsMap = new Map();
    allSongs.forEach((song) => {
      const artist = song.artistId;
      if (
        artist?.fullname?.toLowerCase().includes(lower) &&
        !matchedArtistsMap.has(artist._id)
      ) {
        matchedArtistsMap.set(artist._id, artist);
      }
    });

    setResults({
      songs: matchedSongs.slice(0, 8),
      artists: Array.from(matchedArtistsMap.values()).slice(0, 5),
    });
  }, [query, allSongs]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSong = (song) => {
    setCurrentSong(song);
    const idx = allSongs.findIndex((s) => s._id === song._id);
    setCurrentIndex(idx);
    setIsPlaying(true);
    setQuery("");
    setShowDropdown(false);
  };

  const handleSelectArtist = (artistId) => {
    navigate(`/artist/${artistId}`);
  };

  return (
    <div className="searchbar" ref={inputRef} style={{ position: "relative", width: 300 }}>
      <input
        type="text"
        placeholder="Search songs, artists..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        className="searchbar-input"
      />

      {showDropdown && (results.songs.length > 0 || results.artists.length > 0) && (
        <ul className="searchbar-dropdown"
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            width: "100%",
            borderRadius: 6,
            boxShadow: "0 6px 20px rgba(0,0,0,.08)",
            zIndex: 999,
            maxHeight: 300,
            overflowY: "auto",
            margin: 0,
            padding: 0,
            listStyle: "none",
            
          }}
        >
          {/* Artist Results */}
          {results.artists.length > 0 && (
            <>
              <li style={{ fontWeight: "bold", padding: "6px 12px", color: "#666" }}>Artists</li>
              {results.artists.map((artist) => (
                <li
                className="searchbar-item"
                  key={`artist-${artist._id}`}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                  onClick={() => handleSelectArtist(artist._id)}
                >
                   <img
                    src={
                      artist.avatar
                        ? `http://localhost:5000/uploads/avatars/${artist.avatar}`
                        : "https://via.placeholder.com/40"
                    }
                    alt=""
                    style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 5 }}
                  />{artist.fullname}
                </li>
              ))}
            </>
          )}

          {/* Song Results */}
          {results.songs.length > 0 && (
            <>
              <li style={{ fontWeight: "bold", padding: "6px 12px", color: "#666" }}>Songs</li>
              {results.songs.map((song) => (
                <li
                  className="searchbar-item"
                  key={song._id}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                  onClick={() => handleSelectSong(song)}
                  tabIndex={0}
                >
                  <img
                    src={
                      song.thumbnail
                        ? `http://localhost:5000/uploads/thumbnails/${song.thumbnail}`
                        : "https://via.placeholder.com/40"
                    }
                    alt=""
                    style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 5 }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>{song.fullname}</div>
                    <div style={{ fontSize: 13, color: "#888" }}>
                      {song.artistId?.fullname || "Unknown Artist"}
                    </div>
                  </div>
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
