// src/components/MainLayout.js
import React from "react";
import Sidebar from "../components/Sidebar";
import NowPlaying from "../components/NowPlaying";
import PlayerBar from "../components/PlayerBar";
import MainHeader from "../components/MainHeader";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
export default function MainLayout() {

    const { allSongs, currentIndex, setCurrentIndex } = useContext(PlayerContext);
  return (
    <div className="app-bg">
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <MainHeader />
          <Outlet />
        </main>
        <NowPlaying 
          allSongs={allSongs}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        />
      </div>
      <PlayerBar />
    </div>
  );
}
