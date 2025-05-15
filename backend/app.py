from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__, static_folder='static')
CORS(app)

# Load songs from JSON file
with open('songs.json', 'r') as f:
    songs = json.load(f)

@app.route('/search')
def search():
    query = request.args.get('q', '').lower()
    results = []
    for song in songs:
        if query in song['title'].lower() or query in song['artist'].lower():
            results.append(song)
    return jsonify({'results': results})

if __name__ == '__main__':
    app.run(debug=True)
