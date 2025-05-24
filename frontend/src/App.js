// src/App.js
import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import SongList from "./components/SongList";
import AudioPlayer from "./components/AudioPlayer";
import ListenTogether from "./components/ListenTogether";
import "./App.css";

function App() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  const handleSearch = async (query) => {
    // Call Flask backend API
    const res = await fetch(`http://localhost:5000/search?q=${query}`);
    const data = await res.json();
    setSongs(data.results); // Flask returns {results: [...]}
  };

  return (
    <div className="app-container">
      <h1>Soundify</h1>
      <SearchBar onSearch={handleSearch} />
      <SongList songs={songs} onSelect={setSelectedSong} />
      {selectedSong && (
        <>
          <AudioPlayer song={selectedSong} />
          <ListenTogether currentSong={selectedSong} onSongChange={setSelectedSong} />
        </>
      )}
    </div>
  );
}

export default App;