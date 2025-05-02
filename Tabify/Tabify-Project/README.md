# Capstone Project - Tabify

## Overview
Tabify is a React Native-based mobile application designed to help users search for guitar tabs using audio or links from platforms like YouTube, Spotify, or Apple Music. The app integrates with the Songsterr website to display search results and offers a range of features to enhance the user experience.

# Tabify - Learn Guitar Faster

## Teammates

* Daniel Ward
* Lucas Rector

---

## 🌟 Features

* Search for a song via YouTube URL
* Identify song from recorded audio
* Display results: song name, artist, album art
* Navigate to guitar tabs or YouTube lessons
* Guitar Tabs via Songsterr
* View and manage search history
* Responsive for web and mobile (React Native Web) 
* Spotify album integration
* CORS-safe and production backend with FastAPI on Railway

---

## 🛠️ Technologies Used

* **Frontend:** React Native, Expo, React Navigation, React Native Web, Axios
* **Backend:** Python, FastAPI, Spotipy, Shazamio, YouTube Data API
* **DevOps:** Railway (backend hosting), Vercel (web hosting)
* **Other Libraries:** react-native-webview, expo-av, react-native-async-storage
* **Tools:** Shazamio for audio recognition, Spotipy for metadata lookup

---

## 🔍 Feature: YouTube URL Search

* User pastes a YouTube link
* Audio is downloaded and analyzed
* Spotify, YouTube, and tab metadata retrieved

---

## 🎤 Feature: Audio Recording Search

* 10-second in-app audio recording
* Automatically recognized via Shazam API
* Same enrichment process as YouTube URL

---

## 🎶 Feature: Results Screen

* Displays song, artist, and Spotify album art
* Navigation buttons to guitar tabs and YouTube lessons
* Shareable result options

---

## 🎻 Feature: Guitar Tabs Viewer

* Tab link embedded (Songsterr)
* Songsterr displayed natively in app version 

---

## 🎥 Feature: YouTube Lessons Viewer

* Embedded YouTube guitar lessons
* Renders top 3 videos
* Web-compatible using iframe

---

## 📅 Feature: Search History

* Stores previous searches locally (AsyncStorage)
* Timestamped with album art
* Deletable and searchable

---

## 🤔 What Did We Learn?

* How to integrate external APIs (Spotify, YouTube, Shazam)
* How to make and run a pyhton backen to handle APIs via FastAPI
* How to start and buld upon a React Native Expo App
* React Native development process and structure
* UI/UX design principles and planning
* How to develop for both IOS and Android via React Native and Expo
* How to deploy a backend via Railway
* Securely manage environment variables in Railway
* How to scrape data and prepare it for production APIs
* Using Expo's built in Android APK deployment
* Making React Native apps responsive for web (Expo Web)
* How to deploy a React Native Website via Vercel
* Navigating limitations of embedding third-party websites (Songsterr X-Frame)
* Debugging permissions and audio configurations across platforms

---

## 📆 Future Plans

* Replace Songsterr with plaintext tabs in MongoDB
* Add tab player with metronome and visual cursor
* Enhance error handling and fallback for failed audio ID
* Launch on Google Play and Apple App Store

## Project Setup and Instructions

## Web Version
1. Navigate to our website at [Tabify Guitar Learning](https://tabify-guitar-learning.vercel.app)

## If Opening Via Android APK and Android Studio

### Prerequisites
1. Install [Android Studio](https://developer.android.com/studio).
2. Ensure you have the Android SDK and necessary tools installed during the Android Studio setup.

### Steps to Open the APK
1. **Set Up a Virtual Device**:
	- Open Android Studio.
	- Navigate to `Tools > Device Manager`.
	- Click on `Create Device` and select a device profile (e.g., Pixel 4).
	- Configure the device settings and download a system image if required.
	- Finish the setup and ensure the virtual device is listed in the Device Manager.

2. **Start the Virtual Device**:
	- In the Device Manager, click the `Play` button next to the virtual device to launch it.

3. **Install the APK**:
	- Drag and drop the APK file onto the screen of the running virtual device.
	- The APK will automatically install, and the app will be available to launch.
	- Open the app Tabify
---


## If Opening Project Via Zipped Project

### Prerequisites
1. Install [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/).
2. Install [React Native CLI](https://reactnative.dev/docs/environment-setup).
3. Install [Android Studio](https://developer.android.com/studio) for Android development.
4. Ensure you have a Windows environment with the necessary dependencies for React Native.

### Steps to Run the Project

1. **Clone the Repository**:
	 ```bash
	 unzip project and put in directory named Tabify-Project
	 cd Tabify-Project
	 ```

2. **Install Dependencies**:
	 ```bash
	 npm install
	 ```

3. **Start the Metro Bundler**:
	 ```bash
	 npx react-native start
	 ```

4. **Run on Android Emulator**:
	 - Open Android Studio and start an Android Virtual Device (AVD).
	 - In a new terminal, run:
		 ```bash
		 npx react-native run-android
		 ```

5. **Run on Windows (Optional)**:
	 - Follow the [React Native Windows setup guide](https://microsoft.github.io/react-native-windows/).
	 - Run:
		 ```bash
		 npx react-native run-windows
		 ```

---

## Notes
- Ensure all dependencies are installed and up-to-date.

---
