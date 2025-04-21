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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter(
        (item) =>
          item.song.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistory(filtered);
    }
    setSelectedItems([]);
  }, [searchQuery, history]);

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
    if (selectedItems.length === 0) {
      Alert.alert("No Items Selected", "Please select items to delete.");
      return;
    }

    Alert.alert(
      "Delete Selected",
      `Are you sure you want to delete ${selectedItems.length} item(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const newHistory = history.filter(
              (_, i) => !selectedItems.includes(i)
            );
            setHistory(newHistory);
            setFilteredHistory(
              newHistory.filter(
                (item) =>
                  item.song.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.artist.toLowerCase().includes(searchQuery.toLowerCase())
              )
            );
            setIsSelecting(false);
            setSelectedItems([]);
            try {
              await AsyncStorage.setItem("songHistory", JSON.stringify(newHistory));
            } catch (error) {
              Alert.alert("Error", "Failed to delete items.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const clearAllHistory = async () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to clear your entire search history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("songHistory");
              setHistory([]);
              setFilteredHistory([]);
              setIsSelecting(false);
              setSelectedItems([]);
            } catch (error) {
              Alert.alert("Error", "Failed to clear history.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    const actualIndex = history.findIndex((h) => h.youtubeURL === item.youtubeURL);
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
            <TouchableOpacity style={styles.cancelButton} onPress={() => toggleSelectionMode()}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={deleteSelectedItems}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={history.length > 0 ? clearAllHistory : null}
              disabled={history.length === 0}
            >
              <Text
                style={[
                  styles.buttonText,
                  history.length === 0 && styles.disabledButtonText,
                ]}
              >
                Clear All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={history.length > 0 ? toggleSelectionMode : null}
              disabled={history.length === 0}
            >
              <Text
                style={[
                  styles.buttonText,
                  history.length === 0 && styles.disabledButtonText,
                ]}
              >
                Select
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search history..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#aaa"
      />

      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
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
    backgroundColor: "#121212",
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
    backgroundColor: "#FF453A",
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
});

export default HistoryScreen;
