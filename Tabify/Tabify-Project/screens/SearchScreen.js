/**
 * SearchScreen Component
 * 
 * This React Native screen allows users to enter a YouTube URL, fetch song data,
 * and navigate to guitar tabs or YouTube lessons. It also manages search history
 * using AsyncStorage.
 */

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
  Share,
  Platform,
  PermissionsAndroid,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

const baseURL = Platform.OS === "ios" ? "http://localhost:8000" :"http://10.0.2.2:8000";
const SearchScreen = ({ navigation, route }) => {
  const [youtubeURL, setYoutubeURL] = useState(route.params?.youtubeURL || "");
  const [songData, setSongData] = useState(route.params?.songData || null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [recording, setRecording] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem("songHistory");
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        if (!songData) {
          await AsyncStorage.multiSet([
            ["currentGuitarTabsUrl", ""],
            ["currentYouTubeLessonsUrl", ""],
            ["hasActiveSearch", "false"],
          ]);
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (route.params?.autoSearch && youtubeURL) fetchSongData();
  }, [youtubeURL, route.params?.autoSearch]);

  useEffect(() => {
    if (route.params?.youtubeURL) {
      setYoutubeURL(route.params.youtubeURL);
      setSongData(null);
    }
  }, [route.params?.youtubeURL]);

  const fetchSongData = async () => {
    if (!youtubeURL) {
      Alert.alert("Error", "Please enter a YouTube URL.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${baseURL}/find-song?yt_url=${encodeURIComponent(youtubeURL)}`
      );
      const data = await response.json();
      setSongData(data);
      const timestamp = new Date().toISOString();
      const newHistory = [
        { song: data.song, artist: data.artist, tabs: data.tabs, youtube_lessons: data.youtube_lessons, spotify: data.spotify, youtubeURL, timestamp },
        ...history,
      ];
      setHistory(newHistory);
      await AsyncStorage.multiSet([
        ["songHistory", JSON.stringify(newHistory)],
        ["currentGuitarTabsUrl", data.tabs || ""],
        ["currentYouTubeLessonsUrl", data.youtube_lessons || ""],
        ["hasActiveSearch", "true"],
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "An error occurred while fetching the song data.");
    }
    setLoading(false);
  };

  const requestMicPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const { granted } = await Audio.requestPermissionsAsync();
        console.log("Audio permission granted:", granted);
        if (!granted) {
          const rationale = {
            title: "Microphone Permission",
            message: "This app needs access to your microphone to record audio.",
            buttonPositive: "OK",
          };
          const permissionResult = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale);
          return permissionResult === PermissionsAndroid.RESULTS.GRANTED;
        }
        return granted;
      } else if (Platform.OS === "ios") {
        const { status } = await Audio.requestPermissionsAsync();
        return status === "granted";
      }
    } catch (error) {
      console.error("Permission error:", error.message || error);
      Alert.alert("Error", "An error occurred while requesting microphone permission.");
      return false;
    }
  };

  const startRecordingAndCountdown = async () => {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Microphone permission is required to record audio.");
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error("Error setting audio mode:", error);
      Alert.alert("Error", "Failed to set audio mode.");
      return;
    }

    const newRecording = new Audio.Recording();
    try {
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      console.log("Recording started successfully");
    } catch (error) {
      console.error("Recording start error:", error);
      Alert.alert("Error", "Failed to start recording: " + error.message);
      return;
    }

    setCountdown(10);

    let count = 10;
    const countdownInterval = setInterval(async () => {
      count--;
      setCountdown(count);

      if (count === 5) {
        try {
          await newRecording.stopAndUnloadAsync();
          console.log("Recording stopped");
          const uri = newRecording.getURI();
          console.log("Recording URI:", uri);
          setRecording(null);

          const formData = new FormData();
          formData.append("file", {
            uri,
            type: Platform.OS === "ios" ? "audio/x-m4a" : Platform.OS === "android" ? "audio/mpeg" : "audio/wav",
            name: `recording.${Platform.OS === "ios" ? "m4a" : Platform.OS === "android" ? "mp3" : "wav"}`,
          });
          
          const response = await fetch(`${baseURL}/identify-audio`, {
            method: "POST",
            body: formData,
            headers: { "Content-Type": "multipart/form-data" },
          });
          const data = await response.json();
          console.log("Backend response from /identify-audio:", data);
          setSongData(data);
          const timestamp = new Date().toISOString();
          const newHistory = [{ ...data, timestamp, source: "audio" }, ...history];
          setHistory(newHistory);
          await AsyncStorage.setItem("songHistory", JSON.stringify(newHistory));
        } catch (error) {
          console.error("Error identifying audio:", error);
          Alert.alert("Error", "Failed to identify song from audio: " + error.message);
        }
      }

      if (count === 0) {
        clearInterval(countdownInterval);
        setRecording(null);
        setCountdown(null);
      }
    }, 1000);
  };

  const openInGuitarTabsScreen = (url) => (url ? navigation.navigate("Guitar Tabs", { screen: "GuitarTabsScreen", params: { url } }) : null);
  const openInYouTubeLessonsScreen = (url) => (url ? navigation.navigate("YouTube Lessons", { screen: "YouTubeLessonsScreen", params: { url } }) : null);
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
      <Text style={styles.title}>Tabify Song Finder</Text>
      <TextInput style={styles.input} placeholder="Enter YouTube URL" value={youtubeURL} onChangeText={setYoutubeURL} placeholderTextColor="#aaa" />
      <TouchableOpacity style={styles.button} onPress={fetchSongData} disabled={loading}>
        <Text style={styles.buttonText}>Find Song</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, recording && styles.recordingButton]}
        onPress={startRecordingAndCountdown}
        disabled={recording !== null || loading} // Ensure this is a boolean
      >
        <Text style={styles.buttonText}>{recording ? `Recording (${countdown}s)` : "Record Audio"}</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {songData && (
        <View style={styles.songContainer}>
          <Text style={styles.songTitle}>🎵 {songData.song}</Text>
          <Text style={styles.artist}>Artist: {songData.artist}</Text>
          {songData.spotify?.album_art && <Image source={{ uri: songData.spotify.album_art }} style={styles.albumArt} />}
          <TouchableOpacity style={styles.shareButton} onPress={() => openInGuitarTabsScreen(songData.tabs)}>
            <Text style={styles.shareButtonText}>🎸 Guitar Tabs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={() => openInYouTubeLessonsScreen(songData.youtube_lessons)}>
            <Text style={styles.shareButtonText}>📺 YouTube Lessons</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>📤 Share</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, backgroundColor: "#FAFAFA" },
  title: { fontSize: 28, fontWeight: "600", marginBottom: 20, color: "#222", textAlign: "center" },
  input: { width: "100%", borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: "white", marginBottom: 15 },
  button: { backgroundColor: "#007AFF", paddingVertical: 12, borderRadius: 10, alignItems: "center", width: "100%", marginBottom: 15 },
  recordingButton: { backgroundColor: "#FF3B30" },
  buttonText: { fontSize: 18, fontWeight: "500", color: "white" },
  loader: { marginVertical: 20 },
  songContainer: { marginTop: 20, padding: 20, backgroundColor: "white", borderRadius: 15, alignItems: "center", width: "100%" },
  songTitle: { fontSize: 22, fontWeight: "600", color: "#007AFF", textAlign: "center" },
  artist: { fontSize: 16, color: "#555", marginVertical: 5 },
  albumArt: { width: 220, height: 220, borderRadius: 12, marginVertical: 10 },
  shareButton: { backgroundColor: "#34C759", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, marginTop: 10, width: "100%", alignItems: "center" },
  shareButtonText: { fontSize: 16, fontWeight: "500", color: "white" },
});

export default SearchScreen;