import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const GuitarTabsScreen = ({ route }) => {
  const { url } = route.params || {};
  const [displayUrl, setDisplayUrl] = useState(null);
  const [hasContent, setHasContent] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = useRef(null);

  // JavaScript to block pop-ups and premium elements
  const blockAdsScript = `
    (function() {
      // Block pop-ups
      window.open = function(url) { return null; };
      window.confirm = function() { return true; };
      window.alert = function() { return; };

      // Hide premium locked content and "Open In App"
      const hideElements = () => {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const href = el.getAttribute('href') || '';
          if (href.includes('play.google.com') || href.includes('apps.apple.com') || href.includes('ultimate-guitar')) {
            let parent = el;
            for (let i = 0; i < 5 && parent && parent.parentNode; i++) {
              parent = parent.parentNode;
              if (parent.tagName === 'DIV' || parent.tagName === 'SPAN') break;
            }
            if (parent) {
              parent.style.display = 'none !important';
            } else {
              el.style.display = 'none !important';
            }
          }
          const textContent = el.innerText || el.textContent || '';
          if (textContent.trim() === 'OPEN IN APP') {
            let parent = el;
            for (let i = 0; i < 5 && parent && parent.parentNode; i++) {
              parent = parent.parentNode;
              if (parent.tagName === 'DIV' || parent.tagName === 'SPAN') break;
            }
            if (parent) {
              parent.style.display = 'none !important';
            } else {
              el.style.display = 'none !important';
            }
          }
        });
      };
      hideElements();

      const observer = new MutationObserver(hideElements);
      observer.observe(document.body, { childList: true, subtree: true });
      setInterval(hideElements, 1000);
    })();
  `;

  useFocusEffect(
    React.useCallback(() => {
      const loadUrl = async () => {
        try {
          const hasActiveSearch = await AsyncStorage.getItem("hasActiveSearch");
          const storedUrl = await AsyncStorage.getItem("currentGuitarTabsUrl");

          if (url) {
            setDisplayUrl(url);
            await AsyncStorage.setItem("currentGuitarTabsUrl", url);
            setHasContent(true);
          } else if (hasActiveSearch === "true" && storedUrl) {
            setDisplayUrl(storedUrl);
            setHasContent(true);
          } else {
            setDisplayUrl(null);
            setHasContent(false);
          }
        } catch (error) {
          console.error("Error loading URL from storage:", error);
          setDisplayUrl(null);
          setHasContent(false);
        }
      };
      loadUrl();
    }, [url])
  );

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  };

  const handleGoBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const handleGoHome = () => {
    if (webViewRef.current && displayUrl) {
      setCanGoBack(false);
      setCanGoForward(false);
      webViewRef.current.injectJavaScript(`window.location.href = "${displayUrl}";`);
    }
  };

  const handleShouldStartLoadWithRequest = (request) => {
    if (request.url.includes('ultimate-guitar://')) {
      console.log("Blocked navigation to app URL:", request.url);
      return false; 
    }
    return true; 
  };

  if (!hasContent) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Tabs Yet</Text>
        <Text style={styles.emptyMessage}>
          Search for a song in the Search tab to view guitar tabs here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: displayUrl }}
        style={{ flex: 1 }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView error in GuitarTabsScreen:", nativeEvent);
        }}
        onNavigationStateChange={handleNavigationStateChange}
        injectedJavaScript={blockAdsScript}
        javaScriptEnabled={true}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        userAgent="Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        onMessage={(event) => {
          console.log("WebView message:", event.nativeEvent.data);
        }}
      />
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navButton, !canGoBack && styles.disabledButton]}
          onPress={handleGoBack}
          disabled={!canGoBack}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleGoHome}
        >
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, !canGoForward && styles.disabledButton]}
          onPress={handleGoForward}
          disabled={!canGoForward}
        >
          <Text style={styles.buttonText}>Forward</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#222",
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#333",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#444",
  },
  navButton: {
    backgroundColor: "#555",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: "#888",
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default GuitarTabsScreen;
