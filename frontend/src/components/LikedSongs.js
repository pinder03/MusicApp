import React from "react";

function LikedSongs({ songs, onSelect }) {
  return (
    <div className="liked-songs-container">
      <h3>Liked Songs</h3>
      {songs.length === 0 ? (
        <p>No liked songs yet.</p>
      ) : (
        <ul className="liked-songs-list">
          {songs.map((song) => (
            <li key={song.audioUrl} onClick={() => onSelect(song)} style={{ cursor: "pointer" }}>
              {song.title} - {song.artist}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LikedSongs; 