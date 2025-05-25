import { createContext, useState, useEffect } from "react";

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [allSongs, setAllSongs] = useState([]); // Toàn bộ playlist
  const [currentIndex, setCurrentIndex] = useState(0); // Vị trí bài hiện tại
  const [currentSong, setCurrentSong] = useState(null);// Bài đang phát
  const [isPlaying, setIsPlaying] = useState(false);// Trạng thái play/pause

  // Load tất cả bài hát từ backend
  useEffect(() => {
    fetch("http://localhost:5000/api/songs")
      .then((res) => res.json())
      .then((data) => {
        setAllSongs(data);
        setCurrentSong(data[0] || null); // phát bài đầu tiên
      });
  }, []);

  // Cập nhật currentSong khi currentIndex đổi
  useEffect(() => {
    if (allSongs.length > 0 && allSongs[currentIndex]) {
      setCurrentSong(allSongs[currentIndex]);
    }
  }, [currentIndex, allSongs]);

  return (
    <PlayerContext.Provider
      value={{
        allSongs,
        setAllSongs,
        currentIndex,
        setCurrentIndex,
        currentSong,
        setCurrentSong,
        isPlaying,
        setIsPlaying,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
