import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SearchScreen = ({ navigation, route }) => {
  const [youtubeURL, setYoutubeURL] = useState(route.params?.youtubeURL || ""); // Pre-populate the input field
  const [songData, setSongData] = useState(route.params?.songData || null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Automatically fetch song data when the screen loads (if autoSearch is true)
  useEffect(() => {
    if (route.params?.autoSearch && youtubeURL) {
      fetchSongData();
    }
  }, [youtubeURL, route.params?.autoSearch]);

  // Update youtubeURL when route.params changes
  useEffect(() => {
    if (route.params?.youtubeURL) {
      setYoutubeURL(route.params.youtubeURL);
    }
  }, [route.params?.youtubeURL]);

  // Clear songData when youtubeURL changes (e.g., when navigating from history)
  useEffect(() => {
    if (route.params?.youtubeURL) {
      setSongData(null); // Clear the previous search result
    }
  }, [route.params?.youtubeURL]);

  // Load history from AsyncStorage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem("songHistory");
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error("Error loading history:", error);
      }
    };
    loadHistory();
  }, []);

  // Fetch song data from the backend
  const fetchSongData = async () => {
    if (!youtubeURL) {
      alert("Please enter a YouTube URL.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/find-song?yt_url=${encodeURIComponent(youtubeURL)}`
      );
      const data = await response.json();
      setSongData(data);

      // Add the new song to history
      const newHistory = [
        {
          song: data.song,
          artist: data.artist,
          tabs: data.tabs,
          youtube_lessons: data.youtube_lessons,
          spotify: data.spotify, // Ensure album_art is included
          youtubeURL: youtubeURL, // Save the YouTube URL in history
        },
        ...history,
      ];
      setHistory(newHistory);
      await AsyncStorage.setItem("songHistory", JSON.stringify(newHistory));
      console.log("Saved History:", newHistory); // Debugging
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching the song data.");
    }
    setLoading(false);
  };

  // Open a URL in the in-app browser
  const openInAppBrowser = (url) => {
    if (!url) {
      console.error("No URL provided");
      return;
    }
    console.log("Opening URL:", url); // Debugging
    navigation.navigate("WebView", { url });
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
      <TouchableOpacity style={styles.button} onPress={fetchSongData}>
        <Text style={styles.buttonText}>Find Song</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {songData && (
        <View style={styles.songContainer}>
          <Text style={styles.songTitle}>🎵 {songData.song}</Text>
          <Text style={styles.artist}>Artist: {songData.artist}</Text>
          {songData.spotify?.album_art && (
            <Image source={{ uri: songData.spotify.album_art }} style={styles.albumArt} />
          )}
          <TouchableOpacity onPress={() => openInAppBrowser(songData.tabs)}>
            <Text style={styles.link}>🎸 Guitar Tabs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openInAppBrowser(songData.youtube_lessons)}>
            <Text style={styles.link}>📺 YouTube Lessons</Text>
          </TouchableOpacity>
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
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
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

export default SearchScreen;