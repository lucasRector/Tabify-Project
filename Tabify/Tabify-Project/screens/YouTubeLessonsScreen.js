import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList,  Platform,} from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const YouTubeLessonsScreen = ({ route }) => {
  const { url } = route.params || {};
  const [videoIds, setVideoIds] = useState([]);
  const [hasContent, setHasContent] = useState(false);

  const BACKEND_URL =  Platform.OS === "ios" ? "http://localhost:8000" :"http://10.0.2.2:8000"; // Replace with your actual backend URL

  useFocusEffect(
    useCallback(() => {
      const loadVideos = async () => {
        try {
          console.log("Route params received:", route.params);
          const hasActiveSearch = await AsyncStorage.getItem("hasActiveSearch");
          const storedUrl = await AsyncStorage.getItem("currentYouTubeLessonsUrl");
          const storedSongHistory = await AsyncStorage.getItem("songHistory");

          let songName, artistName;

          // If songHistory exists, get the latest song and artist
          if (storedSongHistory) {
            const history = JSON.parse(storedSongHistory);
            if (history.length > 0) {
              songName = history[0].song;
              artistName = history[0].artist;
            }
          }

          console.log("AsyncStorage values:", {
            hasActiveSearch,
            storedUrl,
            songName,
            artistName,
          });

          if (url && songName && artistName) {
            // Direct navigation with URL and inferred song/artist from history
            await fetchVideosFromBackend(songName, artistName);
            await AsyncStorage.multiSet([
              ["currentYouTubeLessonsUrl", url],
              ["currentSongName", songName],
              ["currentArtistName", artistName],
              ["hasActiveSearch", "true"],
            ]);
            setHasContent(true);
            console.log("Loaded videos from navigation with history:", { url, songName, artistName });
          } else if (hasActiveSearch === "true" && storedUrl && songName && artistName) {
            // Tab navigation with stored data
            await fetchVideosFromBackend(songName, artistName);
            setHasContent(true);
            console.log("Loaded videos from AsyncStorage:", { storedUrl, songName, artistName });
          } else {
            setVideoIds([]);
            setHasContent(false);
            console.log("No active search or required data, showing empty state.");
          }
        } catch (error) {
          console.error("Error loading videos:", error);
          setVideoIds([]);
          setHasContent(false);
        }
      };

      loadVideos();
    }, [url, route.params])
  );

  const fetchVideosFromBackend = async (song, artist) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/youtube-lessons-videos?song_name=${encodeURIComponent(song)}&artist_name=${encodeURIComponent(artist)}`
      );
      if (!response.ok) {
        throw new Error(`Backend responded with status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Backend response:", data);
      setVideoIds(data.video_ids || []);
    } catch (error) {
      console.error("Error fetching videos from backend:", error);
      setVideoIds([]);
    }
  };

  const renderVideo = ({ item }) => (
    <WebView
      source={{ uri: `https://www.youtube.com/embed/${item}?rel=0` }}
      style={styles.video}
      allowsFullscreenVideo
      javaScriptEnabled
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error("WebView error for video", item, ":", nativeEvent);
      }}
    />
  );

  if (!hasContent || videoIds.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Lessons Yet</Text>
        <Text style={styles.emptyMessage}>
          Search for a song in the Search tab to view YouTube lessons here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videoIds}
      renderItem={renderVideo}
      keyExtractor={(item) => item}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 10,
  },
  video: {
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#222",
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default YouTubeLessonsScreen;