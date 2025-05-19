def linear_search(songs, query):
    query = query.lower()
    results = []
    
    for song in songs:
        if (query in song['title'].lower() or 
            query in song['artist'].lower() or 
            query in song['genre'].lower()):
            results.append(song)
            
    return results 