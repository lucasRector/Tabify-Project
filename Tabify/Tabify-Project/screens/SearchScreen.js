import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';

const SearchScreen = () => {
  const [url, setUrl] = useState('');
  const [songData, setSongData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const apiKey = ''; 

  const handleSearch = async () => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Invalid YouTube URL');
      return; 
    }

    setLoading(true); // Start loading

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`
      );
      const data = await response.json();

      if (data.items.length === 0) {
        setError('No video found for this URL');
        setLoading(false); // Stop loading
        return;
      }

      const video = data.items[0].snippet;
      setSongData({
        song: video.title,  // Only the song title
        artist: video.channelTitle,  // Channel title as artist
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch video data');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const extractVideoId = (url) => {
    const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+\/\S+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|(?:\/|e(?:mbed)?\/v\/))?(\S+))/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for a Song</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter YouTube URL"
        value={url}
        onChangeText={setUrl}
      />
      <Button title="Get Song Info" onPress={handleSearch} />
      
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />} {/* Loading indicator */}
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      {songData && !loading && (
        <View style={styles.result}>
          <Text style={styles.songTitle}>Song: {songData.song}</Text>
          <Text>Artist: {songData.artist}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  loader: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  result: {
    marginTop: 20,
    alignItems: 'center',
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default SearchScreen;
