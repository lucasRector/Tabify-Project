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
  const injectedJavaScript = `
  (function() {
    const style = document.createElement('style');
    style.textContent = ${JSON.stringify(injectedCss)};
    document.head.appendChild(style);
    ${blockAdsScript} // Existing script
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
    if (request.url.includes('songsterr://')) {
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