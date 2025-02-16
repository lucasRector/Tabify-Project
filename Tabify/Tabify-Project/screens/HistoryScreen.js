import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HistoryScreen = ({ navigation, route }) => {
  const [history, setHistory] = useState([]);

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

  // Clear history
  const clearHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your search history?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("songHistory");
              setHistory([]); // Clear the state
              console.log("History cleared."); // Debugging
            } catch (error) {
              console.error("Error clearing history:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handle clear history action from header button
  useEffect(() => {
    if (route.params?.clearHistory) {
      clearHistory();
    }
  }, [route.params?.clearHistory]);

  // Render each history item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() =>
        navigation.navigate("Search", {
          screen: "SearchScreen",
          params: { youtubeURL: item.youtubeURL, autoSearch: true }, // Add autoSearch flag
        })
      }
    >
      {/* Album Art or Placeholder */}
      <Image
        source={{
          uri: item.spotify?.album_art || "https://via.placeholder.com/50",
        }}
        style={styles.albumArt}
      />
      {/* Song and Artist Name */}
      <View style={styles.songInfo}>
        <Text style={styles.songName}>{item.song}</Text>
        <Text style={styles.artist}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {history.length > 0 ? (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <Text style={styles.emptyText}>No search history yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  artist: {
    fontSize: 14,
    color: "#555",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});

export default HistoryScreen;