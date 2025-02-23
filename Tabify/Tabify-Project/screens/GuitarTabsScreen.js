import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const GuitarTabsScreen = ({ route }) => {
  const { url } = route.params || {};
  const [displayUrl, setDisplayUrl] = useState(null);
  const [hasContent, setHasContent] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadUrl = async () => {
        try {
          const hasActiveSearch = await AsyncStorage.getItem("hasActiveSearch");
          const storedUrl = await AsyncStorage.getItem("currentGuitarTabsUrl");

          if (url) {
            // Direct link navigation
            setDisplayUrl(url);
            await AsyncStorage.setItem("currentGuitarTabsUrl", url);
            setHasContent(true);
            console.log("GuitarTabsScreen - Set URL from navigation:", url);
          } else if (hasActiveSearch === "true" && storedUrl) {
            // Tab navigation - always use latest stored URL
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
    }, [url]) // Re-run on url change (direct link) or focus (tab navigation)
  );

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
    <WebView
      source={{ uri: displayUrl }}
      style={{ flex: 1 }}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error("WebView error in GuitarTabsScreen:", nativeEvent);
      }}
    />
  );
};

const styles = StyleSheet.create({
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
});

export default GuitarTabsScreen;