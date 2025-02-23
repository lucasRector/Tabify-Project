import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import SearchScreen from "./screens/SearchScreen";
import HistoryScreen from "./screens/HistoryScreen";
import GuitarTabsScreen from "./screens/GuitarTabsScreen";
import YouTubeLessonsScreen from "./screens/YouTubeLessonsScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for Search tab
const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="SearchScreen" component={SearchScreen} options={{ title: "Search" }} />
  </Stack.Navigator>
);

// Stack navigator for Guitar Tabs
const GuitarTabsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="GuitarTabsScreen" // Match the component name
      component={GuitarTabsScreen}
      options={{ title: "Guitar Tabs" }}
    />
  </Stack.Navigator>
);

// Stack navigator for YouTube Lessons
const YouTubeLessonsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="YouTubeLessonsScreen" // Match the component name
      component={YouTubeLessonsScreen}
      options={{ title: "YouTube Lessons" }}
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
            } else if (route.name === "Guitar Tabs") {
              iconName = focused ? "musical-notes" : "musical-notes-outline";
            } else if (route.name === "YouTube Lessons") {
              iconName = focused ? "logo-youtube" : "logo-youtube";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Search" component={SearchStack} options={{ title: "Search" }} />
        <Tab.Screen name="Guitar Tabs" component={GuitarTabsStack} options={{ title: "Guitar Tabs" }} />
        <Tab.Screen
          name="YouTube Lessons"
          component={YouTubeLessonsStack}
          options={{ title: "YouTube Lessons" }}
        />
        <Tab.Screen name="History" component={HistoryScreen} options={{ title: "History" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;