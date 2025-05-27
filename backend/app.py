from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import uuid
from datetime import datetime
import threading

from searching import linear_search
from sorting import merge_sort

app = Flask(__name__, static_folder='static')
CORS(app)

SONGS_PATH = os.path.join(os.path.dirname(__file__), 'models', 'songs.json')
RATINGS_PATH = os.path.join(os.path.dirname(__file__), 'models', 'ratings.json')
ratings_lock = threading.Lock()
HISTORY_PATH = os.path.join(os.path.dirname(__file__), 'models', 'history.json')
history_lock = threading.Lock()

# Store active rooms and their participants
rooms = {}

# Load songs from JSON file
def load_songs():
    with open(SONGS_PATH, 'r') as f:
        return json.load(f)

def load_ratings():
    if not os.path.exists(RATINGS_PATH):
        return {}
    with open(RATINGS_PATH, 'r') as f:
        return json.load(f)

def save_ratings(ratings):
    with ratings_lock:
        with open(RATINGS_PATH, 'w') as f:
            json.dump(ratings, f)

def load_history():
    if not os.path.exists(HISTORY_PATH):
        return {}
    with open(HISTORY_PATH, 'r') as f:
        return json.load(f)

def save_history(history):
    with history_lock:
        with open(HISTORY_PATH, 'w') as f:
            json.dump(history, f)

@app.route('/search')
def search():
    query = request.args.get('q', '')
    songs = load_songs()
    results = linear_search(songs, query)
    sorted_results = merge_sort(results, 'title')
    return jsonify({'results': sorted_results})

@app.route('/sort')
def sort():
    by = request.args.get('by', 'title')
    songs = load_songs()
    reverse = by in ['year', 'popularity']
    sorted_songs = merge_sort(songs, by, reverse)
    return jsonify({'results': sorted_songs})

# Listening Room Endpoints
@app.route('/create-room', methods=['POST'])
def create_room():
    data = request.json
    room_id = str(uuid.uuid4())[:8]  # Generate a short room ID
    rooms[room_id] = {
        'host': request.remote_addr,
        'participants': [request.remote_addr],
        'current_song': data.get('songId'),
        'reactions': {},  # Store reactions for each participant
        'created_at': datetime.now().isoformat()
    }
    return jsonify({'roomId': room_id})

@app.route('/join-room/<room_id>', methods=['POST'])
def join_room(room_id):
    if room_id not in rooms:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    user_ip = request.remote_addr
    if user_ip not in rooms[room_id]['participants']:
        rooms[room_id]['participants'].append(user_ip)
        rooms[room_id]['reactions'][user_ip] = None  # Initialize reactions for new participant
    
    return jsonify({
        'success': True,
        'currentSong': rooms[room_id]['current_song'],
        'participants': len(rooms[room_id]['participants'])
    })

@app.route('/leave-room/<room_id>', methods=['POST'])
def leave_room(room_id):
    if room_id not in rooms:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    user_ip = request.remote_addr
    if user_ip in rooms[room_id]['participants']:
        rooms[room_id]['participants'].remove(user_ip)
        if user_ip in rooms[room_id]['reactions']:
            del rooms[room_id]['reactions'][user_ip]
        
        # If host leaves, assign a new host or delete the room
        if user_ip == rooms[room_id]['host']:
            if rooms[room_id]['participants']:
                rooms[room_id]['host'] = rooms[room_id]['participants'][0]
            else:
                del rooms[room_id]
    
    return jsonify({'success': True})

@app.route('/react/<room_id>', methods=['POST'])
def react(room_id):
    if room_id not in rooms:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    data = request.json
    user_ip = request.remote_addr
    emoji = data.get('emoji')
    
    if user_ip in rooms[room_id]['participants']:
        rooms[room_id]['reactions'][user_ip] = emoji
    
    return jsonify({'success': True})

@app.route('/get-room-info/<room_id>')
def get_room_info(room_id):
    if room_id not in rooms:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    room = rooms[room_id]
    return jsonify({
        'participants': len(room['participants']),
        'currentSong': room['current_song'],
        'reactions': room['reactions']
    })

# Serve audio files from static directory
@app.route('/static/<path:filename>')
def serve_audio(filename):
    return send_from_directory(app.static_folder, filename)

@app.route('/rate-song', methods=['POST'])
def rate_song():
    data = request.json
    song_title = data.get('songTitle')
    rating = data.get('rating')
    if not song_title or not isinstance(rating, int) or not (1 <= rating <= 5):
        return jsonify({'success': False, 'error': 'Invalid data'}), 400
    ratings = load_ratings()
    if song_title not in ratings:
        ratings[song_title] = []
    ratings[song_title].append(rating)
    save_ratings(ratings)
    return jsonify({'success': True})

@app.route('/song-rating')
def song_rating():
    song_title = request.args.get('title')
    if not song_title:
        return jsonify({'success': False, 'error': 'No title provided'}), 400
    ratings = load_ratings()
    song_ratings = ratings.get(song_title, [])
    if not song_ratings:
        return jsonify({'average': None, 'count': 0})
    avg = sum(song_ratings) / len(song_ratings)
    return jsonify({'average': avg, 'count': len(song_ratings)})

@app.route('/add-history', methods=['POST'])
def add_history():
    data = request.json
    song_title = data.get('songTitle')
    if not song_title:
        return jsonify({'success': False, 'error': 'No song title provided'}), 400
    user_ip = request.remote_addr
    history = load_history()
    user_history = history.get(user_ip, [])
    if song_title in user_history:
        user_history.remove(song_title)
    user_history.insert(0, song_title)
    user_history = user_history[:5]
    history[user_ip] = user_history
    save_history(history)
    return jsonify({'success': True})

@app.route('/history')
def get_history():
    user_ip = request.remote_addr
    history = load_history()
    user_history = history.get(user_ip, [])
    return jsonify({'history': user_history})

if __name__ == '__main__':
    app.run(debug=True) 