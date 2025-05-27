import React, { useRef, useState, useEffect } from "react";
import "./AudioPlayer.css";

function AudioPlayer({ song, onEnded, onNext, onPrev, onLike, likedSongs }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(0); // in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);

  const fullAudioUrl = song ? `http://localhost:5000${song.audioUrl}` : "";

  const isLiked = likedSongs && likedSongs.some(s => s.audioUrl === song.audioUrl);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    let timerInterval;
    if (timerActive && remainingTime > 0 && isPlaying) {
      timerInterval = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    } else if (remainingTime === 0 && timerActive) {
      // Time's up, pause playback
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      setTimerActive(false);
      setSleepTimer(0);
    }
    return () => clearInterval(timerInterval);
  }, [timerActive, remainingTime, isPlaying]);

  const handleSleepTimerChange = (e) => {
    const minutes = parseInt(e.target.value, 10);
    if (minutes > 0) {
      setSleepTimer(minutes * 60);
      setRemainingTime(minutes * 60);
      setTimerActive(true);
    } else {
      setSleepTimer(0);
      setRemainingTime(0);
      setTimerActive(false);
    }
  };

  const handleCancelTimer = () => {
    setSleepTimer(0);
    setRemainingTime(0);
    setTimerActive(false);
  };

  // Add to history when song changes
  useEffect(() => {
    if (!song) return;
    fetch('http://localhost:5000/add-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songTitle: song.title })
    });
  }, [song]);

  if (!song) return null;

  return (
    <div className="custom-audio-player">
      <div className="audio-title">Now Playing: {song.title} - {song.artist}</div>
      <div className="audio-controls">
        <button className="prev-btn" onClick={onPrev} aria-label="Previous Song">
          <svg width="24" height="24" viewBox="0 0 24 24"><polygon points="16,4 8,12 16,20" fill="#fff"/></svg>
        </button>
        <button className="play-pause-btn" onClick={handlePlayPause}>
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" fill="#fff"/><rect x="14" y="5" width="4" height="14" fill="#fff"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" fill="#fff"/></svg>
          )}
        </button>
        <button className="next-btn" onClick={onNext} aria-label="Next Song">
          <svg width="24" height="24" viewBox="0 0 24 24"><polygon points="8,4 16,12 8,20" fill="#fff"/></svg>
        </button>
        <span className="audio-time">{formatTime(progress)} / {formatTime(duration)}</span>
        <input
          type="range"
          min="0"
          max={duration}
          value={progress}
          step="0.1"
          onChange={handleProgressChange}
          className="audio-progress"
        />
        <button className="volume-btn" onClick={handleMute}>
          {isMuted || volume === 0 ? (
            <svg width="22" height="22" viewBox="0 0 24 24"><path fill="#fff" d="M16.5 12c0-1.77-.77-3.37-2-4.47v8.94c1.23-1.1 2-2.7 2-4.47zm3.5 0c0 2.76-1.12 5.26-2.93 7.07l1.42 1.42C21.07 18.07 22 15.17 22 12s-.93-6.07-2.51-8.49l-1.42 1.42C18.88 6.74 20 9.24 20 12zm-6.5 8.5v-1.7c-2.89-.86-5-3.54-5-6.8s2.11-5.94 5-6.8V3.5c-4.14.91-7 4.49-7 8.5s2.86 7.59 7 8.5z"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24"><path fill="#fff" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-.77-3.37-2-4.47v8.94c1.23-1.1 2-2.7 2-4.47zm3.5 0c0 2.76-1.12 5.26-2.93 7.07l1.42 1.42C21.07 18.07 22 15.17 22 12s-.93-6.07-2.51-8.49l-1.42 1.42C18.88 6.74 20 9.24 20 12z"/></svg>
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
        {/* Sleep Timer Dropdown */}
        <select
          value={sleepTimer ? sleepTimer / 60 : ""}
          onChange={handleSleepTimerChange}
          className="sleep-timer-dropdown"
        >
          <option value="">Sleep Timer</option>
          <option value="5">5 min</option>
          <option value="10">10 min</option>
          <option value="15">15 min</option>
        </select>
        {timerActive && (
          <span className="sleep-timer-remaining">
            ⏰ {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")}
            <button onClick={handleCancelTimer} style={{ marginLeft: 8 }}>Cancel</button>
          </span>
        )}
      </div>
      {/* Like Button Below Controls */}
      <div className="like-btn-container">
        <button className="like-btn" onClick={() => onLike(song)} aria-label={isLiked ? "Unlike" : "Like"}>
          {isLiked ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#1db954"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1db954" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          )}
        </button>
      </div>
      {/* Star Rating System */}
      <div className="rating-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (hoverRating || rating) ? "filled" : ""}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{ cursor: "pointer", fontSize: "2rem", color: star <= (hoverRating || rating) ? "#FFD700" : "#ccc", transition: "color 0.2s" }}
            role="button"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </span>
        ))}
        {rating > 0 && <span className="rating-label">Your rating: {rating}</span>}
      </div>
      <div className="avg-rating-info">
        {avgRating !== null ? (
          <span>Average rating: {avgRating.toFixed(2)} ({ratingCount} rating{ratingCount !== 1 ? "s" : ""})</span>
        ) : (
          <span>No ratings yet</span>
        )}
      </div>
      <audio
        ref={audioRef}
        src={fullAudioUrl}
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (onEnded) {
            onEnded();
          } else {
            setIsPlaying(false);
          }
        }}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default AudioPlayer; 