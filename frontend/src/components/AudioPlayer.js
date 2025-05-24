import React, { useRef, useState } from "react";
import "./AudioPlayer.css";

function AudioPlayer({ song }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  if (!song) return null;
  const fullAudioUrl = `http://localhost:5000${song.audioUrl}`;

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

  return (
    <div className="custom-audio-player">
      <div className="audio-title">Now Playing: {song.title} - {song.artist}</div>
      <div className="audio-controls">
        <button className="play-pause-btn" onClick={handlePlayPause}>
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" fill="#fff"/><rect x="14" y="5" width="4" height="14" fill="#fff"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" fill="#fff"/></svg>
          )}
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
      </div>
      <audio
        ref={audioRef}
        src={fullAudioUrl}
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default AudioPlayer; 