/**
 * YouTubeLessonsScreen component displays a list of YouTube lesson videos based on the song and artist information.
 * It fetches video data from a backend API and manages state using React hooks.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.route - The navigation route object.
 * @param {Object} [props.route.params] - The route parameters.
 * @param {string} [props.route.params.url] - The URL passed from the navigation route.
 *
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <YouTubeLessonsScreen route={{ params: { url: "https://example.com" } }} />
 *
 * @description
 * - Uses `useFocusEffect` to load video data when the screen is focused.
 * - Fetches video IDs from a backend API based on the song and artist name.
 * - Stores and retrieves data from AsyncStorage to maintain state across app sessions.
 * - Displays a list of YouTube videos using `FlatList` or an empty state message if no videos are available.
 *
 * @function fetchVideosFromBackend
 * Fetches video IDs from the backend API based on the song and artist name.
 * 
 * @param {string} song - The name of the song.
 * @param {string} artist - The name of the artist.
 * @returns {Promise<void>} Resolves when the video data is fetched and state is updated.
 *
 * @function renderVideo
 * Renders a single video item in the list.
 * 
 * @param {Object} item - The video item data.
 * @param {string} item.item - The video ID.
 * @param {number} item.index - The index of the video in the list.
 * @returns {JSX.Element} The rendered video item.
 *
 * @constant {Object} styles - The styles for the component.
 */
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Platform, Dimensions} from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

// YouTubeLessonsScreen component
// This component displays YouTube lessons based on the song and artist name passed through navigation or stored in AsyncStorage.
const YouTubeLessonsScreen = ({ route }) => {
  const { url } = route.params || {};
  const [videoIds, setVideoIds] = useState([]);
  const [hasContent, setHasContent] = useState(false);

  const API_URL = "https://web-production-7ba9.up.railway.app";
  const BACKEND_URL = `${API_URL}`;

  // useFocusEffect to load videos when the screen is focused
  // This effect runs when the component is focused and checks for active searches or stored data.
  useFocusEffect(
    useCallback(() => {
      const loadVideos = async () => {
        try {
          console.log("Route params received:", route.params);
          const hasActiveSearch = await AsyncStorage.getItem("hasActiveSearch");
          const storedUrl = await AsyncStorage.getItem("currentYouTubeLessonsUrl");
          const storedSongHistory = await AsyncStorage.getItem("songHistory");

          let songName, artistName;

          if (storedSongHistory) {
            const history = JSON.parse(storedSongHistory);
            if (history.length > 0) {
              songName = history[0].song;
              artistName = history[0].artist;
            }
          }

          console.log("AsyncStorage values:", { hasActiveSearch, storedUrl, songName, artistName });

          if (url && songName && artistName) {
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

  // Function to fetch video IDs from the backend API
  // This function takes the song and artist name as parameters and fetches the video IDs from the backend API.
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

  // Function to render each video item in the FlatList
  // This function takes the video ID and index as parameters and returns a JSX element for the video item.
  const renderVideo = ({ item, index }) => (
    <View style={styles.videoContainer}>
      <Text style={styles.videoTitle}>YouTube Lesson #{index + 1}</Text>
      {Platform.OS === "web" ? (
        <iframe
          src={`https://www.youtube.com/embed/${item}?rel=0`}
          style={{ width: "100%", height: 200, border: 0 }}
          title={`YouTube Video ${index + 1}`}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        />
      ) : (
        <WebView
          source={{ uri: `https://www.youtube.com/embed/${item}?rel=0` }}
          style={styles.video}
          allowsFullscreenVideo
          javaScriptEnabled
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView error for video", item, ":", nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("HTTP error for video", item, ":", nativeEvent);
          }}
        />
      )}
    </View>
  );

  // Render the FlatList of videos or an empty state message if no videos are available
  // The FlatList component is used to efficiently render a list of items.
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

  // Render the FlatList of videos
  // The FlatList component is used to efficiently render a list of items.
  return (
    <FlatList
      data={videoIds}
      renderItem={renderVideo}
      keyExtractor={(item) => item}
      contentContainerStyle={styles.container}
    />
  );
};

// Styles for the component
// The styles are defined using StyleSheet.create for better performance and organization.
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "2B2D42",
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  videoContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    borderWidth: 2,
    width: "100%",
    borderColor: "#0A84FF",
    marginVertical: 16,
    padding: 10,
  },
  videoTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  video: {
    height: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#AAAAAA",
    textAlign: "center",
    lineHeight: 22,
  },
});

// Adjust styles for web platform
// This section checks if the platform is web and adjusts styles accordingly.
if (Platform.OS === "web") {
  const { width } = Dimensions.get("window"); // Get the width of the window for responsive design
  // Adjust styles based on the width of the window
  // This allows for a responsive design that adapts to different screen sizes.
  styles.container = {
    ...styles.container,
    width: width > 600 ? "90%" : "100%",
    margin: "auto",
    alignItems: "center",
  };
  styles.videoContainer = {
    ...styles.videoContainer,
    width: width > 600 ? "100%" : "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#0A84FF",
  };
  styles.video = {
    ...styles.video,
    width: width > 600 ? "100%" : "100%",
  };
  styles.emptyContainer = {
    ...styles.emptyContainer,
    width: width > 600 ? "100%" : "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: "#0A84FF",
  };
  styles.emptyTitle = {
    ...styles.emptyTitle,
    fontSize: width > 600 ? 28 : 24,
  };
  styles.emptyMessage = {
    ...styles.emptyMessage,
    fontSize: width > 600 ? 20 : 16,
  };
  styles.videoTitle = {
    ...styles.videoTitle,
    fontSize: width > 600 ? 24 : 18,
  };

}

export default YouTubeLessonsScreen;