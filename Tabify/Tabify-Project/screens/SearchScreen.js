import React, { useState } from "react";
import { 
  View, Text, TextInput, Image, ScrollView, StyleSheet, ActivityIndicator, Linking, Pressable 
} from "react-native";

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
      <Text style={styles.title}>Tabify Song Finder</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter YouTube URL"
        value={youtubeURL}
        onChangeText={setYoutubeURL}
        placeholderTextColor="#aaa"
      />

      <Pressable style={styles.button} onPress={fetchSongData}>
        <Text style={styles.buttonText}>Find Song</Text>
      </Pressable>

      {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}

      {songData && (
        <View style={styles.songContainer}>
          <Text style={styles.songTitle}>🎵 {songData.song}</Text>
          <Text style={styles.artist}>Artist: {songData.artist}</Text>
          {songData.spotify?.album_art && (
            <Image source={{ uri: songData.spotify.album_art }} style={styles.albumArt} />
          )}
          <Pressable onPress={() => Linking.openURL(songData.tabs)}>
            <Text style={styles.link}>🎸 Guitar Tabs</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(songData.youtube_lessons)}>
            <Text style={styles.link}>📺 YouTube Lessons</Text>
          </Pressable>
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
    paddingHorizontal: 20,
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 20,
    color: "#222",
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "500",
    color: "white",
  },
  loader: {
    marginVertical: 20,
  },
  songContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    width: "100%",
  },
  songTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#007AFF",
    textAlign: "center",
  },
  artist: {
    fontSize: 16,
    color: "#555",
    marginVertical: 5,
  },
  albumArt: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginVertical: 10,
  },
  link: {
    fontSize: 16,
    color: "#007AFF",
    marginVertical: 8,
    textDecorationLine: "underline",
  },
});

export default App;
