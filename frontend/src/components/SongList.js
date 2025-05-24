import React from "react";

function SongList({ songs, onSelect }) {
  if (!songs.length) return <p>No songs found.</p>;

  return (
    <ul className="song-list">
      {songs.map((song) => (
        <li key={song.audioUrl} onClick={() => onSelect(song)} style={{ cursor: 'pointer' }}>
          {song.title} - {song.artist}
        </li>
      ))}
    </ul>
  );
}

export default SongList; 