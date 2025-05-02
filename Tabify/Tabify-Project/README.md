# Capstone Project - Tabify

## Overview
Tabify is a React Native-based mobile application designed to help users search for guitar tabs using audio or links from platforms like YouTube, Spotify, or Apple Music. The app integrates with the Songsterr website to display search results and offers a range of features to enhance the user experience.

### Features by Development Levels

#### Base Level Features:
- Shazam-like search using audio or music platform links.
- Display search results as guitar tabs using the Songsterr website within a built-in browser.
- Basic UI design with a search tab and results tab.
- Built using React Native.

#### Second Level Features:
- Display YouTube video tutorials based on Shazam search results using a built-in browser.
- Improved UI design with loading screens, logos, and transitions.

#### Third Level Features:
- Display search results directly within the app instead of using a browser pop-up.
- Add metronome, timing, and other quality-of-life features.
- Optimize previously implemented features.

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