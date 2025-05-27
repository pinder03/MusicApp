import React, { useState } from "react";

function SongList({ songs, onSelect, onLike, onRate, onAddToQueue, likedSongs, searched }) {
  const [openMenu, setOpenMenu] = useState(null);

  if (!songs.length) return searched ? <p>No songs found.</p> : null;

  return (
    <ul className="song-list">
      {songs.map((song) => (
        <li key={song.audioUrl} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span onClick={() => onSelect(song)} style={{ cursor: 'pointer', flex: 1 }}>
            {song.title} - {song.artist}
          </span>
          <button
            className="song-options-btn"
            onClick={() => setOpenMenu(openMenu === song.audioUrl ? null : song.audioUrl)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', marginLeft: 8 }}
            aria-label="Song options"
          >
            &#8942;
          </button>
          {openMenu === song.audioUrl && (
            <div className="song-options-menu" style={{ position: 'absolute', right: 0, top: '2.2em', background: '#232323', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 10, minWidth: 160 }}>
              <button onClick={() => { onLike(song); setOpenMenu(null); }} className="song-options-item">
                {likedSongs && likedSongs.some(s => s.audioUrl === song.audioUrl) ? 'Unlike' : 'Like'}
              </button>
              <button onClick={() => { onLike(song); setOpenMenu(null); }} className="song-options-item">
                Add to Liked Songs
              </button>
              <button onClick={() => { onRate(song); setOpenMenu(null); }} className="song-options-item">
                Rate Song
              </button>
              <button onClick={() => { onAddToQueue(song); setOpenMenu(null); }} className="song-options-item">
                Add to Queue
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default SongList; 