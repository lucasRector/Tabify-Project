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
  Dimensions,
  Linking,
  useWindowDimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

const API_URL = "https://web-production-7ba9.up.railway.app";
const baseURL = `${API_URL}`;
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

      const response = await fetch(`${baseURL}/find-song?yt_url=${encodeURIComponent(youtubeURL)}`);
      let data;
      if (response.headers.get("content-type")?.includes("application/json")) {
        data = await response.json();
        console.log("✅ DATA RECEIVED:", data);
      } else {
        throw new Error("Invalid response format: Expected JSON");
      }

      if (data) {
        navigation.navigate("Results", { songData: data }); // ✅ Safe to navigate now
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
      console.log("✅ DATA RECEIVED:", data);
      navigation.navigate({
        name: "Results",
        key: `Results-${Date.now()}`,
        params: { songData: data }
      });
      
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
      else if (Platform.OS === "web") {
        return true;
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
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        allowsRecordingAndroid: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log("Audio mode configured successfully");
    } catch (error) {
      console.error("Error setting audio mode:", error);
      Alert.alert("Error", "Failed to set audio mode: " + error.message);
      return;
    }
  
    // Initialize recording
    const newRecording = new Audio.Recording();
    try {
      await newRecording.prepareToRecordAsync({
        android: {
          extension: ".mp3",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
        },
        web: {
          extension: ".mp3",    
          outputFormat: Audio.RECORDING_OPTION_WEB_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_WEB_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          bitRate: 128000,
          numberOfChannels: 2,
        },
      });
  

      // Start recording
      await newRecording.startAsync();
      setRecording(newRecording);
      console.log("Recording started successfully");
  
      // Set countdown for 10 seconds
      setCountdown(10);
      let count = 10;

      const getBlobFromUri = async (blobUri) => {
        const response = await fetch(blobUri);
        const blob = await response.blob();
        return blob;
      };
  
      const countdownInterval = setInterval(async () => {
        count--;
        setCountdown(count);
  
        if (count === 0) {
          clearInterval(countdownInterval);
          try {
            // Stop and unload recording
            await newRecording.stopAndUnloadAsync();
            const uri = newRecording.getURI();
            console.log("Recording stopped, URI:", uri);
          
            let fileToUpload;
          
            if (Platform.OS === "web") {
              const audioBlob = await getBlobFromUri(uri);
              fileToUpload = new File([audioBlob], "recording.mp3", { type: "audio/mpeg" });
            } else {
              fileToUpload = {
                uri,
                type: "audio/mpeg",
                name: "recording.mp3",
              };
            }
          
            const formData = new FormData();
            formData.append("file", fileToUpload);
          
            const response = await fetch(`${baseURL}/identify-audio`, {
              method: "POST",
              body: formData,
            });
          
            if (!response.ok) {
              console.error("❌ Upload failed with status", response.status);
              throw new Error(`Upload failed with status ${response.status}`);
            }
          
            const data = await response.json();  // <-- Only happens if upload succeeds!
            console.log("✅ Backend response from /identify-audio:", data);
  
            // Update history
            const timestamp = new Date().toISOString();
            const newHistory = [{ ...data, timestamp, source: "audio" }, ...history];
            setHistory(newHistory);
            await AsyncStorage.setItem("songHistory", JSON.stringify(newHistory));
  
            console.log("✅ DATA RECEIVED:", data);
            // Navigate to results
            navigation.navigate({
              name: "Results",
              key: `Results-${Date.now()}`,
              params: { songData: data }
            });
            
          } catch (error) {
            console.error("Error processing recording:", error);
            Alert.alert("Error", "Failed to identify song from audio: " + error.message);
          } finally {
            setRecording(null);
            setCountdown(null);
          }
        }
      }, 1000);
    } catch (error) {
      console.error("Recording setup error:", error);
      Alert.alert("Error", "Failed to start recording: " + error.message);
      setRecording(null);
      setCountdown(null);
      // Attempt to unload recording in case of partial setup
      try {
        await newRecording.stopAndUnloadAsync();
      } catch (e) {
        console.warn("Failed to unload recording:", e);
      }
    }
  };
  const handlePress = () => {
    Linking.openURL("https://expo.dev/artifacts/eas/3vKduySijtA8ZYnofAo3Rt.apk");
  };
  const windowDimensions = useWindowDimensions();

  // Always fallback just in case
  const width = windowDimensions?.width || 1024; // safe default for desktop
  
  const isMobileWeb = Platform.OS === "web" && width < 768;
  return (
    <>
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
     
      <View 
        id="qrCode" 
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#2B2D42",
          alignItems: "center",
          width: 200,
          height: 200,
          display: (!isMobileWeb) ? "flex" : "none", // <-- hide if not web
        }}
      > 
      <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 10, textAlign: "center", color: "0A84FF", backgroundColor: "#7f7f7f" }}>
          Scan or tap to download
      </Text>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <Image
            source={{ uri: "https://qrcodeveloper.com/qr/images/image_AlLxLOE.jpg" }}
            style={{
              width: 175,
              height: 175,
              backgroundColor: "#2B2D42",
            }}
          />
        </TouchableOpacity>
      </View>
      <View
        alignItems="center"
        height={200}
        width={200}
        style = {{display: (isMobileWeb) ? "flex" : "none", 
          justifyContent: "center",
          alignItems: "center",}}
      >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 10,
            textAlign: "center",
            color: "#0A84FF", // Corrected text color
            backgroundColor: "#f0f0f0", // Slightly lighter background for contrast
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add shadow for subtle effect
          }}
        >
          Tap To Download Android App
        </Text>
      </TouchableOpacity>
      </View>
    </>
  );
};



const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#2B2D42",
    alignItems: "center",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 15,
    borderColor: "#0A84FF",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#0A84FF",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  recordingButton: {
    backgroundColor: "#003366",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loader: { marginVertical: 20 }
});

if (Platform.OS === "web") {
  const { width } = Dimensions.get("window");
  styles.container = {
    ...styles.container,
    width: width > 600 ? "50%" : "100%",
    margin: "auto",
  };
  styles.input = {
    ...styles.input,
    width: "100%",
    maxWidth: 400,
  };
  styles.button = {
    ...styles.button,
    width: "100%",
    maxWidth: 400,
  };
  styles.recordingButton = {
    ...styles.recordingButton,
    width: "100%",
    maxWidth: 400,
  };
  styles.loader = {
    ...styles.loader,
    marginVertical: 20,
  };
  styles.title = {
    ...styles.title,
    fontSize: 24,
  };
  styles.buttonText = {
    ...styles.buttonText,
    fontSize: 16,
  };
  styles.input.placeholderTextColor = "#FFFFFF"; // Adjust placeholder color for web
  styles.input.borderColor = "#0A84FF"; // Adjust border color for web
  styles.input.backgroundColor = "#1e1e1e"; // Adjust background color for web
  styles.input.color = "#fff"; // Adjust text color for web
}

export default SearchScreen;