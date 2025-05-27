import React from "react";

function Queue({ queue, onRemove }) {
  return (
    <div className="queue-container">
      <h3>Queue</h3>
      {queue.length === 0 ? (
        <p>No songs in queue.</p>
      ) : (
        <ul className="queue-list">
          {queue.map((song) => (
            <li key={song.audioUrl} className="queue-item">
              <span>{song.title} - {song.artist}</span>
              <button onClick={() => onRemove(song.audioUrl)} className="queue-remove-btn">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Queue; 