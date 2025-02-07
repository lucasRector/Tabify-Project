

from fastapi import FastAPI, HTTPException
import yt_dlp
import tempfile
import os
import asyncio
from shazamio import Shazam
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Spotify API credentials from environment variables
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=SPOTIFY_CLIENT_ID,
    client_secret=SPOTIFY_CLIENT_SECRET
))

# Function to download YouTube audio
def download_audio(yt_url):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': tempfile.mktemp(suffix='.mp3'),  # Save audio as temp file
        'quiet': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(yt_url, download=True)
        audio_path = ydl.prepare_filename(info_dict)
        return audio_path

# Function to identify song using Shazam API
async def identify_song(audio_path):
    shazam = Shazam()
    with open(audio_path, 'rb') as f:
        audio = f.read()
    song_info = await shazam.recognize_song(audio)
    return song_info

# Function to search Spotify
def search_spotify(song_name, artist_name):
    query = f"track:{song_name} artist:{artist_name}"
    try:
        results = sp.search(q=query, type='track', limit=1)
        if results['tracks']['items']:
            track = results['tracks']['items'][0]
            return {
                "song": track['name'],
                "artist": ', '.join(artist['name'] for artist in track['artists']),
                "album_art": track['album']['images'][0]['url']
            }
    except Exception as e:
        return {"error": f"Spotify search failed: {str(e)}"}
    
    return {"error": "No results found on Spotify."}

# Function to search for guitar tabs
def search_tabs(song_name, artist_name):
    options = Options()
    options.add_argument("--headless")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    search_url = f"https://www.ultimate-guitar.com/search.php?search_type=title&value={song_name}+{artist_name}"
    driver.get(search_url)
    current_url = driver.current_url
    driver.quit()
    return current_url

# Function to generate YouTube lesson link
def get_youtube_guitar_lessons_link(song_name, artist_name):
    search_query = f"{song_name} {artist_name} guitar lesson"
    return f"https://www.youtube.com/results?search_query={search_query.replace(' ', '+')}&sp=EgIYAw%253D%253D"

@app.get("/find-song")
async def find_song(yt_url: str):
    if not yt_url:
        raise HTTPException(status_code=400, detail="YouTube URL is required.")

    audio_path = download_audio(yt_url)
    song_info = await identify_song(audio_path)

    if song_info:
        song_name = song_info['track']['title']
        artist_name = song_info['track']['subtitle']

        spotify_result = search_spotify(song_name, artist_name)
        tab_url = search_tabs(song_name, artist_name)
        youtube_lessons_url = get_youtube_guitar_lessons_link(song_name, artist_name)

        # Clean up temp file
        if os.path.exists(audio_path):
            os.remove(audio_path)

        return {
            "song": song_name,
            "artist": artist_name,
            "spotify": spotify_result,
            "tabs": tab_url,
            "youtube_lessons": youtube_lessons_url
        }

    raise HTTPException(status_code=404, detail="Could not identify the song.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
