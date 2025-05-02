/**
 * ResultsScreen component displays the search results for a song, including options to view guitar tabs,
 * YouTube lessons, and share the song details. It also adjusts styles for web platforms.
 *
 * @param {Object} props - The props passed to the component.
 * @param {Object} props.navigation - The navigation object used for navigating between screens.
 * @param {Object} props.route - The route object containing parameters passed to this screen.
 * @param {Object} props.route.params - The parameters passed to the screen.
 * @param {Object} props.route.params.songData - The song data object containing details about the song.
 * @param {string} props.route.params.songData.song - The title of the song.
 * @param {string} props.route.params.songData.artist - The artist of the song.
 * @param {Object} [props.route.params.songData.spotify] - The Spotify data for the song.
 * @param {string} [props.route.params.songData.spotify.album_art] - The URL of the album art.
 * @param {string} [props.route.params.songData.tabs] - The URL for the guitar tabs.
 * @param {string} [props.route.params.songData.youtube_lessons] - The URL for YouTube lessons.
 *
 * @returns {JSX.Element} The rendered ResultsScreen component.
 */

/**
 * Navigates to the Guitar Tabs screen with the provided URL.
 *
 * @function
 * @param {string} url - The URL for the guitar tabs.
 */

/**
 * Navigates to the YouTube Lessons screen with the provided URL.
 *
 * @function
 * @param {string} url - The URL for the YouTube lessons.
 */

/**
 * Handles sharing the song data using the Share API.
 *
 * @async
 * @function
 * @throws {Error} If an error occurs while sharing the song.
 */
import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  Dimensions,
} from "react-native";

// ResultsScreen component
const ResultsScreen = ({ navigation, route }) => {
  const { songData } = route.params;

  // Function  to open the Guitar Tabs screen
  // This function takes a URL as an argument and navigates to the Guitar Tabs screen with the provided URL as a parameter
  const openInGuitarTabsScreen = (url) => 
    url ? navigation.navigate("Guitar Tabs", { screen: "GuitarTabsScreen", params: { url } }) : null;
  
  // Function to open the YouTube Lessons screen
  // This function takes a URL as an argument and navigates to the YouTube Lessons screen with the provided URL as a parameter
  const openInYouTubeLessonsScreen = (url) => 
    url ? navigation.navigate("YouTube Lessons", { screen: "YouTubeLessonsScreen", params: { url } }) : null;

  // Function to handle sharing the song data
  // This function uses the Share API to share the song data with a message containing the song title, artist, and album art
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

// Styles for the ResultsScreen component
// This includes styles for the container, buttons, text, and images
const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    paddingHorizontal: 20, 
    backgroundColor: "#2B2D42", // Dark background
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
    color: "#0A84FF", // Accent color for back button
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
    backgroundColor: "#2B2D42", // Dark card background
    borderRadius: 15, 
    alignItems: "center", 
    width: "100%" 
  },
  songTitle: { 
    fontSize: 22, 
    fontWeight: "600", 
    color:"#0A84FF", // Accent color for song title
    textAlign: "center" 
  },
  artist: { 
    fontSize: 16, 
     // Lighter text for artist name
      color: "#fff",
      marginVertical: 5 
      },
      albumArt: { 
      width: 220, 
      height: 220, 
      borderRadius: 12, 
      marginVertical: 10 
      },
      shareButton: { 
      backgroundColor: "#0A84FF", // Match the accent color used in other tabs
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
// Adjust styles for web platform
// This includes styles for the container, buttons, text, and images
if (Platform.OS === "web") {
  const { width } = Dimensions.get("window");
  styles.container = {
    ...styles.container,
    width: width > 600 ? "50%" : "100%",
    margin: "auto",
    alignItems: "center",
  };
  styles.songContainer = {
    ...styles.songContainer,
    width: width > 600 ? "80%" : "100%",
  };
  styles.albumArt = {
    ...styles.albumArt,
    width: width > 600 ? 300 : 220,
    height: width > 600 ? 300 : 220,
  };
  styles.shareButton = {
    ...styles.shareButton,
    width: width > 600 ? "80%" : "100%",
  };
  styles.shareButtonText = {
    ...styles.shareButtonText,
    fontSize: width > 600 ? 20 : 16,
  };
  styles.songTitle = {
    ...styles.songTitle,
    fontSize: width > 600 ? 28 : 22,
  };
  styles.artist = {
    ...styles.artist,
    fontSize: width > 600 ? 20 : 16,
  };
  styles.title = {
    ...styles.title,
    fontSize: width > 600 ? 36 : 28,
  };
  styles.backButtonText = {
    ...styles.backButtonText,
    fontSize: width > 600 ? 24 : 18,
  };
  styles.backButton = {
    ...styles.backButton,
    top: width > 600 ? 20 : 10,
    left: width > 600 ? 20 : 10,
  };

}

export default ResultsScreen;