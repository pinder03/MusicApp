from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os

from searching import linear_search
from sorting import merge_sort

app = Flask(__name__, static_folder='static')
CORS(app)

SONGS_PATH = os.path.join(os.path.dirname(__file__), 'models', 'songs.json')

# Load songs from JSON file
def load_songs():
    with open(SONGS_PATH, 'r') as f:
        return json.load(f)

@app.route('/search')
def search():
    query = request.args.get('q', '')
    songs = load_songs()
    results = linear_search(songs, query)
    # Sort the filtered results by title using merge_sort
    sorted_results = merge_sort(results, 'title')
    return jsonify({'results': sorted_results})

@app.route('/sort')
def sort():
    by = request.args.get('by', 'title')
    songs = load_songs()
    reverse = by in ['year', 'popularity']
    sorted_songs = merge_sort(songs, by, reverse)
    return jsonify({'results': sorted_songs})

# Serve audio files from static directory
@app.route('/static/<path:filename>')
def serve_audio(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    app.run(debug=True) 