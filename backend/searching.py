def linear_search(songs, query):
    query = query.lower()
    return [
        song for song in songs
        if query in song['title'].lower()
        or query in song['artist'].lower()
        or query in song['genre'].lower()
    ] 