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
          await AsyncStorage.multiSet([
            ["currentGuitarTabsUrl", ""],
            ["currentYouTubeLessonsUrl", ""],
            ["hasActiveSearch", "false"],
          ]);
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
      let data;
      if (response.headers.get("content-type")?.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Invalid response format: Expected JSON");
      }
      if (data) {
        setSongData(data);
      }
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
      navigation.navigate("Results", { songData: data });
      setYoutubeURL(""); // Clear the input
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
  
    // 🔹 Initialize a new recording instance
    const newRecording = new Audio.Recording();
    try {
      // ✅ Prepare the recording before starting
      await newRecording.prepareToRecordAsync({
        android: {
          extension: ".mp3",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          bitRate: 128000,
          numberOfChannels: 2,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        }
      });
  
      // 🔹 Start the recording after preparation
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
          const timestamp = new Date().toISOString();
          const newHistory = [{ ...data, timestamp, source: "audio" }, ...history];
          setHistory(newHistory);
          await AsyncStorage.setItem("songHistory", JSON.stringify(newHistory));
          navigation.navigate("Results", { songData: data });
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
      <TouchableOpacity 
        style={styles.button} 
        onPress={fetchSongData} 
        disabled={loading}
      >
        <Text style={styles.buttonText}>Find Song</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, recording && styles.recordingButton]}
        onPress={startRecordingAndCountdown}
        disabled={recording !== null || loading}
        >
          <Text style={styles.buttonText}>
            {recording ? `Recording (${countdown}s)` : "Record Audio"}
          </Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
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
});

export default SearchScreen;