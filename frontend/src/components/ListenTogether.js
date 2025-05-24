import React, { useState, useEffect } from 'react';
import './ListenTogether.css';

const EMOJIS = ['❤️', '👍', '🎵', '🎸', '🎹', '🎤', '🎧', '🎼', '🎶', '🎷'];

const ListenTogether = ({ currentSong, onSongChange }) => {
  const [roomId, setRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [reactions, setReactions] = useState({});
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  useEffect(() => {
    let interval;
    if (isInRoom) {
      interval = setInterval(fetchRoomInfo, 2000);
    }
    return () => clearInterval(interval);
  }, [isInRoom, roomId]);

  const fetchRoomInfo = async () => {
    try {
      const response = await fetch(`http://localhost:5000/get-room-info/${roomId}`);
      const data = await response.json();
      if (data.success !== false) {
        setReactions(data.reactions);
        setParticipants(Object.keys(data.reactions).length);
      }
    } catch (error) {
      console.error('Error fetching room info:', error);
    }
  };

  const createRoom = async () => {
    try {
      const response = await fetch('http://localhost:5000/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId: currentSong.id }),
      });
      const data = await response.json();
      setRoomId(data.roomId);
      setIsHost(true);
      setIsInRoom(true);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const joinRoom = async (roomIdToJoin) => {
    try {
      const response = await fetch(`http://localhost:5000/join-room/${roomIdToJoin}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setRoomId(roomIdToJoin);
        setIsInRoom(true);
        if (data.currentSong) {
          onSongChange(data.currentSong);
        }
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const leaveRoom = async () => {
    try {
      await fetch(`http://localhost:5000/leave-room/${roomId}`, {
        method: 'POST',
      });
      setIsInRoom(false);
      setRoomId('');
      setIsHost(false);
      setParticipants([]);
      setReactions({});
      setSelectedEmoji(null);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const sendReaction = async (emoji) => {
    try {
      await fetch(`http://localhost:5000/react/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      });
      setSelectedEmoji(emoji);
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };

  return (
    <div className="listen-together-container">
      {!isInRoom ? (
        <div className="room-actions">
          <button className="create-room-btn" onClick={createRoom}>
            Create Listening Room
          </button>
          <div className="join-room">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button onClick={() => joinRoom(roomId)}>Join Room</button>
          </div>
        </div>
      ) : (
        <div className="room-content">
          <div className="room-header">
            <h3>Listening Room: {roomId}</h3>
            <button className="leave-room-btn" onClick={leaveRoom}>
              Leave Room
            </button>
          </div>
          
          <div className="room-info">
            <p>Participants: {participants}</p>
            {isHost && <p className="host-badge">You are the host</p>}
          </div>

          <div className="reactions-container">
            <div className="reactions-display">
              {Object.entries(reactions).map(([participant, emoji]) => (
                emoji && <span key={participant} className="reaction">{emoji}</span>
              ))}
            </div>
            {!isHost && (
              <div className="emoji-picker">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    className={`emoji-btn ${selectedEmoji === emoji ? 'selected' : ''}`}
                    onClick={() => sendReaction(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListenTogether; 