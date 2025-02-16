import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import SearchScreen from "./screens/SearchScreen"; // Ensure this import is correct
import HistoryScreen from "./screens/HistoryScreen";
import WebViewScreen from "./screens/WebViewScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create a stack navigator for the Search tab
const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="SearchScreen" // Ensure this matches the name used in navigation
      component={SearchScreen}
      options={{ title: "Search" }}
    />
    <Stack.Screen
      name="WebView"
      component={WebViewScreen}
      options={{ title: "WebView" }}
    />
  </Stack.Navigator>
);

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Search") {
              iconName = focused ? "search" : "search-outline";
            } else if (route.name === "History") {
              iconName = focused ? "time" : "time-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen
          name="Search"
          component={SearchStack} // Use the SearchStack instead of SearchScreen
          options={{ title: "Search" }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: "History" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;