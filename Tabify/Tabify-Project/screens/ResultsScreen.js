import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
} from "react-native";

const ResultsScreen = ({ navigation, route }) => {
  const { songData } = route.params;

  const openInGuitarTabsScreen = (url) => 
    url ? navigation.navigate("Guitar Tabs", { screen: "GuitarTabsScreen", params: { url } }) : null;
  
  const openInYouTubeLessonsScreen = (url) => 
    url ? navigation.navigate("YouTube Lessons", { screen: "YouTubeLessonsScreen", params: { url } }) : null;

  const handleShare = async () => {
    if (!songData) return;
    const message = `Hey! I'm learning "${songData.song}" by ${songData.artist} on guitar using Tabify. Check out the album art: ${songData.spotify?.album_art || "No album art available"}!`;
    try {
      const result = await Share.share({ message });
      if (result.action === Share.sharedAction) console.log("Song shared successfully!");
    } catch (error) {
      console.error("Error sharing song:", error);
      Alert.alert("Error", "An error occurred while sharing.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Search Results</Text>
      <View style={styles.songContainer}>
        <Text style={styles.songTitle}>🎵 {songData.song}</Text>
        <Text style={styles.artist}>Artist: {songData.artist}</Text>
        {songData.spotify?.album_art && (
          <Image source={{ uri: songData.spotify?.album_art }} style={styles.albumArt} />
        )}
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={() => openInGuitarTabsScreen(songData.tabs)}
        >
          <Text style={styles.shareButtonText}>🎸 Guitar Tabs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={() => openInYouTubeLessonsScreen(songData.youtube_lessons)}
        >
          <Text style={styles.shareButtonText}>📺 YouTube Lessons</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={handleShare}
        >
          <Text style={styles.shareButtonText}>📤 Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    paddingHorizontal: 20, 
    backgroundColor: "#121212", // Dark background
    paddingTop: 40 
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: "#007AFF", // Accent color for back button
    fontWeight: "500",
  },
  title: { 
    fontSize: 28, 
    fontWeight: "600", 
    marginBottom: 20, 
    color: "#fff", // White text for title
    textAlign: "center" 
  },
  songContainer: { 
    marginTop: 20, 
    padding: 20, 
    backgroundColor: "#333", // Dark card background
    borderRadius: 15, 
    alignItems: "center", 
    width: "100%" 
  },
  songTitle: { 
    fontSize: 22, 
    fontWeight: "600", 
    color: "#007AFF", // Accent color for song title
    textAlign: "center" 
  },
  artist: { 
    fontSize: 16, 
     // Lighter text for artist name
      marginVertical: 5 
      },
      albumArt: { 
      width: 220, 
      height: 220, 
      borderRadius: 12, 
      marginVertical: 10 
      },
      shareButton: { 
      backgroundColor: "#007AFF", // Match the accent color used in other tabs
      paddingVertical: 12, 
      paddingHorizontal: 25, 
      borderRadius: 8, 
      marginTop: 10, 
      width: "100%", 
      alignItems: "center" 
      },
      shareButtonText: { 
      fontSize: 16, 
      fontWeight: "600", 
      color: "#fff" // White text for buttons
  },
});

export default ResultsScreen;