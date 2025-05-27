import React, { useEffect, useState } from "react";

function RecentlyPlayed({ onSelect }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.history || []);
        setLoading(false);
      });
  }, []);

  // Fetch song details by title (since history only stores titles)
  const handleSelect = async (title) => {
    const res = await fetch(`http://localhost:5000/search?q=${encodeURIComponent(title)}`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      onSelect(data.results[0]);
    }
  };

  return (
    <div className="recently-played-container">
      <h3>Recently Played</h3>
      {loading ? (
        <p>Loading...</p>
      ) : history.length === 0 ? (
        <p>No recently played songs.</p>
      ) : (
        <ul className="recently-played-list">
          {history.map((title) => (
            <li key={title} onClick={() => handleSelect(title)} style={{ cursor: "pointer" }}>
              {title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentlyPlayed; 