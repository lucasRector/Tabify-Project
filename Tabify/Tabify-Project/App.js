import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import SearchScreen from "./screens/SearchScreen";
import ResultsScreen from "./screens/ResultsScreen";
import HistoryScreen from "./screens/HistoryScreen";
import GuitarTabsScreen from "./screens/GuitarTabsScreen";
import YouTubeLessonsScreen from "./screens/YouTubeLessonsScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for Search tab
const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SearchScreen" 
      component={SearchScreen} 
      options={{ title: "Search" }} 
    />
    <Stack.Screen 
      name="Results" 
      component={ResultsScreen} 
      options={{ title: "Results" }} 
    />
  </Stack.Navigator>
);

// Stack navigator for Guitar Tabs
const GuitarTabsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="GuitarTabsScreen"
      component={GuitarTabsScreen}
      options={{ title: "Guitar Tabs" }}
    />
  </Stack.Navigator>
);

// Stack navigator for YouTube Lessons
const YouTubeLessonsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="YouTubeLessonsScreen"
      component={YouTubeLessonsScreen}
      options={{ title: "YouTube Lessons" }}
    />
  </Stack.Navigator>
);

// Stack navigator for History
const HistoryStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HistoryScreen"
      component={HistoryScreen}
      options={{ title: "History" }}
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
          // Hide the tab navigator's header to prevent double titles
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Search" 
          component={SearchStack} 
          // Remove the title here since it's set in the Stack.Screen
          options={{ tabBarLabel: "Search" }} 
        />
        <Tab.Screen 
          name="Guitar Tabs" 
          component={GuitarTabsStack} 
          options={{ tabBarLabel: "Guitar Tabs" }} 
        />
        <Tab.Screen
          name="YouTube Lessons"
          component={YouTubeLessonsStack}
          options={{ tabBarLabel: "YouTube Lessons" }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryStack} 
          options={{ tabBarLabel: "History" }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;