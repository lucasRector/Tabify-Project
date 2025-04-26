import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem("songHistory");
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          setHistory(parsedHistory);
          setFilteredHistory(parsedHistory);
        }
      } catch (error) {
        console.error("Error loading history:", error);
      }
    };
    loadHistory();
  }, []);

  const toggleSelectionMode = () => {
    setIsSelecting(!isSelecting);
    setSelectedItems([]);
  };

  const toggleItemSelection = (index) => {
    const actualIndex = history.findIndex(
      (item) => item.youtubeURL === filteredHistory[index].youtubeURL
    );
    if (selectedItems.includes(actualIndex)) {
      setSelectedItems(selectedItems.filter((i) => i !== actualIndex));
    } else {
      setSelectedItems([...selectedItems, actualIndex]);
    }
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) return;

    const newHistory = history.filter((_, i) => !selectedItems.includes(i));
    try {
      await AsyncStorage.setItem("songHistory", JSON.stringify(newHistory));
      setHistory(newHistory);
      setFilteredHistory(newHistory);
      setIsSelecting(false);
      setSelectedItems([]);
    } catch (error) {
      console.error("Error deleting items:", error);
    }
  };

  const clearAllHistory = async () => {
    try {
      await AsyncStorage.removeItem("songHistory");
      setHistory([]);
      setFilteredHistory([]);
      setIsSelecting(false);
      setSelectedItems([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  const renderItem = ({ item, index }) => {
    const actualIndex = history.findIndex(
      (h) => h.youtubeURL === item.youtubeURL
    );
    const date = item.timestamp ? new Date(item.timestamp) : null;
    const formattedTimestamp = date
      ? `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : "Unknown date";

    return (
      <TouchableOpacity
        style={[
          styles.historyItem,
          selectedItems.includes(actualIndex) && styles.selectedItem,
        ]}
        onPress={() => {
          if (isSelecting) {
            toggleItemSelection(index);
          } else {
            navigation.navigate("Search", {
              screen: "Results",
              params: { songData: item },
            });
          }
        }}
      >
        <Image
          source={{
            uri: item.spotify?.album_art || "https://via.placeholder.com/50",
          }}
          style={styles.albumArt}
        />
        <View style={styles.songInfo}>
          <Text style={styles.songName}>{item.song}</Text>
          <Text style={styles.artist}>{item.artist}</Text>
          <Text style={styles.timestamp}>{formattedTimestamp}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isSelecting ? (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={toggleSelectionMode}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={deleteSelectedItems}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.clearAllButton} onPress={clearAllHistory}>
              <Text style={styles.buttonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={toggleSelectionMode}>
              <Text style={styles.buttonText}>Select</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search history..."
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false} // ✅ Hides scrollbar nicely
        />
      ) : (
        <Text style={styles.emptyText}>
          {searchQuery ? "No matches found." : "No search history yet."}
        </Text>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2B2D42",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#666",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: "#FF453A",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  clearAllButton: {
    backgroundColor: "#CC5500",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  selectButton: {
    backgroundColor: "#0A84FF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  disabledButtonText: {
    color: "#777",
  },
  searchInput: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#fff",
    borderColor: "#333",
    borderWidth: 1,
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderColor: "#2e2e2e",
    borderWidth: 1,
  },
  selectedItem: {
    backgroundColor: "#0A84FF33",
    borderColor: "#0A84FF",
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
    color: "#fff",
  },
  artist: {
    fontSize: 14,
    color: "#ccc",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#0A84FF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});

if (Platform.OS === "web") {
  const { width } = Dimensions.get("window");
  const isWideScreen = width > 600;

  styles.container = {
    ...styles.container,
    width: isWideScreen ? "75%" : "100%",
    margin: "auto",
    alignItems: isWideScreen ? "center" : "stretch",
  };
  styles.historyItem = {
    ...styles.historyItem,
    width: "100%",
    padding: isWideScreen ? 20 : 14,
    marginBottom: isWideScreen ? 20 : 12,
    borderRadius: isWideScreen ? 20 : 14,
  };
  styles.albumArt = {
    ...styles.albumArt,
    width: isWideScreen ? 70 : 50,
    height: isWideScreen ? 70 : 50,
    borderRadius: isWideScreen ? 12 : 8,
    marginRight: isWideScreen ? 20 : 15,
  };
  styles.songInfo = {
    ...styles.songInfo,
    width: "100%",
  };
  styles.songName = {
    ...styles.songName,
    fontSize: isWideScreen ? 20 : 16,
  };
  styles.artist = {
    ...styles.artist,
    fontSize: isWideScreen ? 18 : 14,
  };
  styles.timestamp = {
    ...styles.timestamp,
    fontSize: isWideScreen ? 14 : 12,
  };
  styles.searchInput = {
    ...styles.searchInput,
    width: isWideScreen ? "80%" : "100%",
    fontSize: isWideScreen ? 18 : 16,
  };
  styles.buttonText = {
    ...styles.buttonText,
    fontSize: isWideScreen ? 18 : 15,
  };
  styles.cancelButton = {
    ...styles.cancelButton,
    width: isWideScreen ? "40%" : "48%",
  };
  styles.deleteButton = {
    ...styles.deleteButton,
    width: isWideScreen ? "40%" : "48%",
  };
  styles.clearAllButton = {
    ...styles.clearAllButton,
    width: isWideScreen ? "40%" : "48%",
  };
  styles.selectButton = {
    ...styles.selectButton,
    width: isWideScreen ? "40%" : "48%",
  };
  styles.disabledButtonText = {
    ...styles.disabledButtonText,
    fontSize: isWideScreen ? 18 : 15,
  };
  styles.emptyText = {
    ...styles.emptyText,
    fontSize: isWideScreen ? 18 : 16,
  };
  styles.header = {
    ...styles.header,
    width: isWideScreen ? "80%" : "100%",
    flexDirection: isWideScreen ? "row" : "column",
    alignItems: isWideScreen ? "center" : "stretch",
    justifyContent: isWideScreen ? "space-between" : "center",
  };
  styles.actionButton = {
    ...styles.actionButton,
    width: isWideScreen ? "40%" : "48%",
    marginBottom: isWideScreen ? 0 : 10,
  };
  styles.actionButtonText = {
    ...styles.actionButtonText,
    fontSize: isWideScreen ? 18 : 15,
  };
}

export default HistoryScreen;
