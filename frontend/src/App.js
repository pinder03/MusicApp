// src/App.js
import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import SongList from "./components/SongList";
import AudioPlayer from "./components/AudioPlayer";
import ListenTogether from "./components/ListenTogether";
import RecentlyPlayed from "./components/RecentlyPlayed";
import Queue from "./components/Queue";
import LikedSongs from "./components/LikedSongs";
import "./App.css";

function App() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [showQueue, setShowQueue] = useState(false);
  const [previousSongs, setPreviousSongs] = useState([]);
  const [searched, setSearched] = useState(false);
  const [activeLibrary, setActiveLibrary] = useState('home'); // 'home' or 'liked'

  const handleSearch = async (query) => {
    setSearched(true);
    // Call Flask backend API
    const res = await fetch(`http://localhost:5000/search?q=${query}`);
    const data = await res.json();
    setSongs(data.results); // Flask returns {results: [...]}
  };

  // Handler to add song to queue
  const handleAddToQueue = (song) => {
    setQueue((prev) => [...prev, song]);
  };

  // Handler to remove song from queue
  const handleRemoveFromQueue = (audioUrl) => {
    setQueue((prev) => prev.filter((s) => s.audioUrl !== audioUrl));
  };

  // Handler to like/unlike a song
  const handleLike = (song) => {
    setLikedSongs((prev) =>
      prev.some((s) => s.audioUrl === song.audioUrl)
        ? prev.filter((s) => s.audioUrl !== song.audioUrl)
        : [...prev, song]
    );
    // TODO: Sync with backend
  };

  // Handler to rate a song (scroll to player and highlight rating UI)
  const handleRate = (song) => {
    setSelectedSong(song);
    // Optionally scroll to player or open a modal
  };

  // Play next song in queue when current ends or next is pressed
  const handlePlayNextInQueue = () => {
    if (queue.length > 0) {
      setPreviousSongs((prev) => [...prev, selectedSong]);
      setSelectedSong(queue[0]);
      setQueue((prev) => prev.slice(1));
    } else {
      setSelectedSong(null);
    }
  };

  // Play previous song
  const handlePlayPrevInQueue = () => {
    if (previousSongs.length > 0) {
      setQueue((prev) => [selectedSong, ...prev]);
      setSelectedSong(previousSongs[previousSongs.length - 1]);
      setPreviousSongs((prev) => prev.slice(0, -1));
    } else {
      // No previous song, restart current song
      const audio = document.querySelector('audio');
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
    }
  };

  return (
    <div className="app-root">
      <div className="sidebar">
        <button className={`sidebar-btn${activeLibrary === 'home' ? ' active' : ''}`} onClick={() => setActiveLibrary('home')}>Home</button>
        <button className={`sidebar-btn${activeLibrary === 'liked' ? ' active' : ''}`} onClick={() => setActiveLibrary('liked')}>Liked Songs</button>
      </div>
      <div className="app-container">
        <h1>Soundify</h1>
        {activeLibrary === 'home' && (
          <>
            <SearchBar onSearch={handleSearch} />
            <RecentlyPlayed onSelect={setSelectedSong} />
            <SongList
              songs={songs}
              onSelect={setSelectedSong}
              onLike={handleLike}
              onRate={handleRate}
              onAddToQueue={handleAddToQueue}
              likedSongs={likedSongs}
              searched={searched}
            />
          </>
        )}
        {activeLibrary === 'liked' && (
          <LikedSongs songs={likedSongs} onSelect={setSelectedSong} />
        )}
        {selectedSong && (
          <>
            <AudioPlayer
              song={selectedSong}
              onEnded={handlePlayNextInQueue}
              onNext={handlePlayNextInQueue}
              onPrev={handlePlayPrevInQueue}
              onLike={handleLike}
              likedSongs={likedSongs}
            />
            <button onClick={() => setShowQueue((v) => !v)} style={{ margin: '12px 0', padding: '8px 18px', borderRadius: 8, background: '#1db954', color: '#181818', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
              {showQueue ? 'Hide Queue' : 'Show Queue'}
            </button>
            {showQueue && (
              <Queue queue={queue} onRemove={handleRemoveFromQueue} />
            )}
            <ListenTogether currentSong={selectedSong} onSongChange={setSelectedSong} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;