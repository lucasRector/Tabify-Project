/**
 * GuitarTabsScreen component displays a WebView for browsing guitar tabs.
 * It includes functionality to block ads, handle navigation, and manage state.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.route - The route object containing navigation parameters.
 * @param {Object} props.route.params - The parameters passed to the route.
 * @param {string} [props.route.params.url] - The URL to load in the WebView.
 *
 * @returns {JSX.Element} The GuitarTabsScreen component.
 */
import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
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

  // JavaScript to block pop-ups and Songsterr-specific elements
  // This script is injected into the WebView to hide ads and pop-ups
  // It uses a MutationObserver to watch for changes in the DOM and hide elements that match certain criteria
  const blockAdsScript = `
  (function() {
    // Utility to hide an element
    const hideElement = (el) => {
      if (el) {
        el.setAttribute('style', 'display: none !important; visibility: hidden !important;');
      }
    };
  
    // Main function to block ads and pop-ups
    const blockAdsAndPopups = () => {
      // 1. Target known ad-related elements by href, text, or attributes
      const selectors = [
        'a[href*="play.google.com"]',
        'a[href*="apps.apple.com"]',
        'a[href*="/premium"]',
        '[class*="ad" i]',
        '[class*="banner" i]',
        '[class*="promo" i]',
        '[id*="ad" i]',
        '[id*="premium" i]',
        '[data-ad]',
        '[data-track*="ad"]',
        'div:contains("Get Songsterr Plus")',
        'div:contains("Open in app")',
        'div:contains("Try Songsterr Plus")',
        'button:contains("Upgrade")',
      ];
  
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach(hideElement);
      });
  
      // 2. Target fixed-position elements (pop-ups, modals, banners)
      document.querySelectorAll('div, section, aside, img').forEach((el) => {
        const style = window.getComputedStyle(el);
        if (
          (style.position === 'fixed' || style.position === 'sticky') &&
          (style.zIndex > 100 || style.bottom === '0px' || style.top === '0px')
        ) {
          hideElement(el);
        }
      });
  
      // 3. Target modal overlays (high z-index, centered)
      document.querySelectorAll('div').forEach((el) => {
        const style = window.getComputedStyle(el);
        if (
          style.zIndex > 1000 &&
          (style.position === 'fixed' || style.position === 'absolute') &&
          style.backgroundColor !== 'transparent'
        ) {
          hideElement(el);
        }
      });
  
      // 4. Remove inline styles or classes that show ads
      document.querySelectorAll('[class*="show-ad" i], [class*="visible" i]').forEach((el) => {
        el.classList.remove('show-ad', 'visible');
        hideElement(el);
      });
  
      // 5. Block pop-up windows and alerts
      window.open = function() { return null; };
      window.alert = function() { return null; };
      window.prompt = function() { return null; };
    };
  
    // Run immediately
    blockAdsAndPopups();
  
    // Observe DOM changes for dynamic content
    const observer = new MutationObserver((mutations) => {
      blockAdsAndPopups();
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
  
    // Run periodically for late-loaded content
    const intervalId = setInterval(blockAdsAndPopups, 2000);
  
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      observer.disconnect();
      clearInterval(intervalId);
    });
  })();
  `;

  const injectedCss = `
  [class*="ad" i], [class*="banner" i], [class*="promo" i], [id*="ad" i], [id*="premium" i] [id*="tabList" i]{
    display: none !important;
    visibility: hidden !important;
  }
  div[style*="position: fixed"], div[style*="z-index: 1000"] {
    display: none !important;
  }
`;
  // Injected JavaScript to add custom CSS and block ads
  // This script creates a style element and appends it to the document head
  const injectedJavaScript = `
  (function() {
    const style = document.createElement('style');
    style.textContent = ${JSON.stringify(injectedCss)};
    document.head.appendChild(style);
    ${blockAdsScript} // Existing script
  })();
`;


  // useFocusEffect is a hook that runs when the screen is focused
  // This is used to load the URL from AsyncStorage when the screen is focused
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

  // Function to handle navigation state changes in the WebView
  // This function updates the canGoBack and canGoForward states based on the WebView's navigation state
  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  };

  // Function to handle the back button action
  // This function checks if the WebView can go back and navigates to the previous page if possible
  const handleGoBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  // Function to handle the forward button action
  // This function checks if the WebView can go forward and navigates to the next page if possible
  const handleGoForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  // Function to handle the home button action
  // This function sets the canGoBack and canGoForward states to false and navigates to the home URL
  const handleGoHome = () => {
    if (webViewRef.current && displayUrl) {
      setCanGoBack(false);
      setCanGoForward(false);
      webViewRef.current.injectJavaScript(`window.location.href = "${displayUrl}";`);
    }
  };

  // Function to handle URL requests in the WebView
  // This function checks if the URL contains "songsterr://" and blocks it if it does
  const handleShouldStartLoadWithRequest = (request) => {
    if (request.url.includes('songsterr://')) {
      console.log("Blocked navigation to app URL:", request.url);
      return false;
    }
    return true;
  };

  // If no URL is provided and no stored URL is found, show a message indicating that there are no tabs yet
  // This is done by checking the hasContent state variable
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

  //Return the main component
  // This includes the WebView for displaying the content, and the bottom navigation bar for back, home, and forward actions
  return (
    <View style={styles.container}>
      <View style={styles.container}>
      {Platform.OS === "web" ? (
         <View style={styles.webContainer}>
         <Text style={styles.text}>Guitar tabs can't be embedded directly.</Text>
         <TouchableOpacity style={styles.openButton} onPress={() => window.open(displayUrl, '_blank')}>
           <Text style={styles.buttonText}>Open Guitar Tabs</Text>
         </TouchableOpacity>
       </View>
      ) : (
      <WebView
        ref={webViewRef}
        source={{ uri: displayUrl }}
        style={{ flex: 1 }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView error in GuitarTabsScreen:", nativeEvent);
        }}
        onNavigationStateChange={handleNavigationStateChange}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        userAgent="Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        onMessage={(event) => {
          console.log("WebView message:", event.nativeEvent.data);
        }}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
        />
      )}
    </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleGoBack}
          disabled={!canGoBack}
        >
          <Text style={[styles.buttonText, !canGoBack && styles.disabledButton]}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleGoHome}
        >
          <Text style={styles.buttonText}>⌂</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleGoForward}
          disabled={!canGoForward}
        >
          <Text style={[styles.buttonText, !canGoForward && styles.disabledButton]}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles for the GuitarTabsScreen component
// This includes styles for the container, buttons, text, and images
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2B2D42",
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
    color: "#004D99",
    opacity: 0.6,
  },
  buttonText: {
    color: "#0A84FF",
    fontSize: 25,
    fontWeight: "500",
  },
});
// Styles for the web view
if (Platform.OS === "web") {
  styles.webContainer = {
    flex: 1,
    backgroundColor: "#2b2d42",
    justifyContent: "center",
    alignItems: "center",
  };
  styles.bottomBar = {
    display: "none",
  };
}

export default GuitarTabsScreen;