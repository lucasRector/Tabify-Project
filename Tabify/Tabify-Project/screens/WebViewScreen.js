/**
 * WebViewScreen component renders a web view or iframe based on the platform.
 * It displays the content of a given URL passed through the route parameters.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {Object} props.route - The route object containing navigation parameters.
 * @param {Object} props.route.params - The parameters passed to the route.
 * @param {string} props.route.params.url - The URL to be displayed in the WebView or iframe.
 *
 * @returns {JSX.Element} A SafeAreaView containing a WebView (for mobile) or iframe (for web).
 */
import React from "react";
import { SafeAreaView, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";

const WebViewScreen = ({ route }) => {
  const { url } = route.params;

  console.log("WebView URL:", url);

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === "web" ? (
        <iframe
          src={url}
          style={styles.webview}
          allow="fullscreen"
          title="WebView Content"
        />
      ) : (
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          allowsFullscreenVideo={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    width: "100%",
    height: "100%",
    border: 0,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },  
  tabify: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#3399FF",
  },
});
if (Platform.OS === "web") {
  styles.webview.height = "100vh"; // Full height for web
  styles.webview.width = "100vw"; // Full width for web 
}

export default WebViewScreen;
