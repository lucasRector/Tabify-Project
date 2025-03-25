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

  // Updated JavaScript to inject into WebView to block Ultimate Guitar pop-ups and app prompts
  const blockAdsScript = `
    (function() {
      console.log("BlockAdsScript: Starting ad and pop-up blocking...");

      // Block "Open With" pop-up by overriding window.open, confirm, and other redirect methods
      window.open = function(url) {
        console.log("BlockAdsScript: Blocked window.open with URL:", url);
        return null; // Prevent opening app links
      };
      window.confirm = function(message) {
        console.log("BlockAdsScript: Auto-accepting confirm dialog:", message);
        return true; // Auto-accept confirm dialogs
      };
      window.alert = function(message) {
        console.log("BlockAdsScript: Suppressing alert:", message);
        return; // Suppress alert dialogs
      };
      // Block location redirects to app
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        get: function() { return originalLocation; },
        set: function(value) {
          if (value.includes('ultimate-guitar://')) {
            console.log("BlockAdsScript: Blocked location redirect to:", value);
            return;
          }
          originalLocation.href = value;
        }
      });

      // Function to hide "OPEN IN APP" buttons and their surrounding containers
      const hideElements = () => {
        // Search all elements in the DOM
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          // Check for elements linking to App Store or Google Play Store
          const href = el.getAttribute('href') || '';
          if (href.includes('play.google.com') || href.includes('apps.apple.com') || href.includes('ultimate-guitar')) {
            console.log("BlockAdsScript: Found element linking to App Store/Play Store:", el, "Href:", href);

            // Find the parent container (go up more levels to find a meaningful container)
            let parent = el;
            for (let i = 0; i < 5 && parent && parent.parentNode; i++) {
              parent = parent.parentNode;
              if (parent && parent.tagName !== 'BODY' && parent.tagName !== 'HTML' && parent.tagName !== 'MAIN') {
                if (parent.tagName === 'DIV' || parent.tagName === 'SECTION' || parent.tagName === 'SPAN') {
                  break;
                }
              }
            }

            // Log the parent for debugging
            console.log("BlockAdsScript: Parent container of App Store link:", parent);

            // Hide/remove the parent container
            if (parent && parent.tagName !== 'BODY' && parent.tagName !== 'HTML') {
              console.log("BlockAdsScript: Hiding parent container of App Store link:", parent);
              parent.style.display = 'none !important';
              parent.style.visibility = 'hidden !important';
              parent.style.backgroundColor = 'transparent !important';
              parent.style.border = 'none !important';
              if (parent.parentNode) {
                parent.parentNode.removeChild(parent);
              }
            } else {
              // Fallback: hide the element itself
              console.log("BlockAdsScript: No suitable parent found, hiding App Store link element directly:", el);
              el.style.display = 'none !important';
              el.style.visibility = 'hidden !important';
              el.style.backgroundColor = 'transparent !important';
              el.style.border = 'none !important';
              el.removeAttribute('href');
              el.removeAttribute('onclick');
              el.setAttribute('disabled', 'true');
              if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
            }
            return; // Skip further checks for this element
          }

          // Check for "OPEN IN APP" text (broadened to handle whitespace and nested elements)
          const textContent = el.innerText || el.textContent || '';
          const normalizedText = textContent.replace(/\s+/g, ' ').trim();
          if (normalizedText === 'OPEN IN APP') {
            console.log("BlockAdsScript: Found 'OPEN IN APP' element:", el, "Normalized Text:", normalizedText);

            // Find the parent container (go up more levels to find a meaningful container)
            let parent = el;
            for (let i = 0; i < 5 && parent && parent.parentNode; i++) {
              parent = parent.parentNode;
              if (parent && parent.tagName !== 'BODY' && parent.tagName !== 'HTML' && parent.tagName !== 'MAIN') {
                if (parent.tagName === 'DIV' || parent.tagName === 'SECTION' || parent.tagName === 'SPAN') {
                  break;
                }
              }
            }

            // Log the parent for debugging
            console.log("BlockAdsScript: Parent container of 'OPEN IN APP':", parent);

            // Hide/remove the parent container
            if (parent && parent.tagName !== 'BODY' && parent.tagName !== 'HTML') {
              console.log("BlockAdsScript: Hiding parent container of 'OPEN IN APP':", parent);
              parent.style.display = 'none !important';
              parent.style.visibility = 'hidden !important';
              parent.style.backgroundColor = 'transparent !important';
              parent.style.border = 'none !important';
              if (parent.parentNode) {
                parent.parentNode.removeChild(parent);
              }
            } else {
              // Fallback: hide the element itself
              console.log("BlockAdsScript: No suitable parent found, hiding 'OPEN IN APP' element directly:", el);
              el.style.display = 'none !important';
              el.style.visibility = 'hidden !important';
              el.style.backgroundColor = 'transparent !important';
              el.style.border = 'none !important';
              el.removeAttribute('href');
              el.removeAttribute('onclick');
              el.setAttribute('disabled', 'true');
              if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
            }
          }
        });
      };

      // Run initially
      hideElements();

      // Run on DOM changes (for dynamically loaded elements)
      const observer = new MutationObserver((mutations) => {
        console.log("BlockAdsScript: DOM changed, re-running hideElements...");
        hideElements();
      });
      observer.observe(document.body, { childList: true, subtree: true });

      // Run periodically to catch late-loaded elements
      setInterval(() => {
        console.log("BlockAdsScript: Periodic check for 'OPEN IN APP' buttons...");
        hideElements();
      }, 1000); // Check every second

      // Prevent app redirect by intercepting click events on app links
      document.addEventListener('click', (event) => {
        const target = event.target.closest('a[href*="ultimate-guitar://"]');
        if (target) {
          console.log("BlockAdsScript: Blocked click on app link:", target.href);
          event.preventDefault();
          event.stopPropagation();
        }
      }, true);

      // Prevent any script-based redirects to the app
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = function(callback, delay, ...args) {
        if (typeof callback === 'function') {
          const originalCallback = callback;
          callback = function() {
            try {
              originalCallback(...args);
            } catch (e) {
              if (e.message.includes('ultimate-guitar://')) {
                console.log("BlockAdsScript: Blocked setTimeout redirect to app");
                return;
              }
              throw e;
            }
          };
        }
        return originalSetTimeout(callback, delay, ...args);
      };
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
            console.log("GuitarTabsScreen - Set URL from navigation:", url);
          } else if (hasActiveSearch === "true" && storedUrl) {
            setDisplayUrl(storedUrl);
            setHasContent(true);
            console.log("GuitarTabsScreen - Set URL from AsyncStorage:", storedUrl);
          } else {
            setDisplayUrl(null);
            setHasContent(false);
            console.log("GuitarTabsScreen - No active search or URL, showing empty state.");
          }
          console.log(
            "GuitarTabsScreen - Final state - hasActiveSearch:",
            hasActiveSearch,
            "storedUrl:",
            storedUrl,
            "hasContent:",
            hasContent
          );
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

  // Handle navigation requests to block deep links
  const handleShouldStartLoadWithRequest = (request) => {
    if (request.url.includes('ultimate-guitar://')) {
      console.log("Blocked navigation to app URL:", request.url);
      return false; // Prevent navigation to app
    }
    return true; // Allow other navigations
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