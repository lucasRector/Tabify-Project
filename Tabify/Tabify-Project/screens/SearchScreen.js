import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, ScrollView, StyleSheet, ActivityIndicator, Linking } from "react-native";

const App = () => {
  const [youtubeURL, setYoutubeURL] = useState("");
  const [songData, setSongData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSongData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/find-song?yt_url=${encodeURIComponent(youtubeURL)}`);
      const data = await response.json();
      setSongData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>YouTube Song Finder</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter YouTube URL"
        value={youtubeURL}
        onChangeText={setYoutubeURL}
      />
      <Button title="Find Song" onPress={fetchSongData} color="#1E90FF" />
      
      {loading && <ActivityIndicator size="large" color="#1E90FF" style={styles.loader} />}

      {songData && (
        <View style={styles.songContainer}>
          <Text style={styles.songTitle}>🎵 {songData.song}</Text>
          <Text style={styles.artist}>Artist: {songData.artist}</Text>
          {songData.spotify?.album_art && (
            <Image source={{ uri: songData.spotify.album_art }} style={styles.albumArt} />
          )}
          <Text style={styles.link} onPress={() => Linking.openURL(songData.tabs)}>🎸 Guitar Tabs</Text>
          <Text style={styles.link} onPress={() => Linking.openURL(songData.youtube_lessons)}>📺 YouTube Lessons</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "white",
    marginBottom: 10,
  },
  loader: {
    marginVertical: 20,
  },
  songContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: "100%",
  },
  songTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E90FF",
    textAlign: "center",
  },
  artist: {
    fontSize: 16,
    color: "#666",
    marginVertical: 5,
  },
  albumArt: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  link: {
    fontSize: 16,
    color: "#1E90FF",
    marginVertical: 5,
    textDecorationLine: "underline",
  },
});

export default App;
