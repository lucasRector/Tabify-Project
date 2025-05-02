/**
 * App.js
 * 
 * This file defines the main application structure for the Tabify project, 
 * including navigation, theming, and screen configurations.
 * 
 * Components:
 * - NavigationContainer: Wraps the entire app to provide navigation context.
 * - BottomTabNavigator: Provides a tab-based navigation structure.
 * - StackNavigator: Used for managing screen transitions within each tab.
 * 
 * Screens:
 * - SearchScreen: The main search interface.
 * - ResultsScreen: Displays search results.
 * - HistoryScreen: Shows the user's search history.
 * - GuitarTabsScreen: Displays guitar tabs.
 * - YouTubeLessonsScreen: Provides YouTube guitar lessons.
 * 
 * Linking:
 * - Configures deep linking for the app with specific URL prefixes and screen mappings.
 * 
 * Theme:
 * - Customizes the app's appearance with a dark theme and accent colors.
 * 
 * Styles:
 * - headerContainer: Styles for the header, including logo and title alignment.
 * - logo: Styles for the Tabify logo in the header.
 * - tabify: Styles for the Tabify title in the header.
 * 
 * Navigation Structure:
 * - Tab Navigator:
 *   - Search: Contains a stack navigator with SearchScreen and ResultsScreen.
 *   - Guitar Tabs: Contains a stack navigator with GuitarTabsScreen.
 *   - YouTube Lessons: Contains a stack navigator with YouTubeLessonsScreen.
 *   - History: Contains a stack navigator with HistoryScreen.
 * 
 * Tab Bar Icons:
 * - Dynamically changes based on the active tab using Ionicons.
 * - Colors and icons vary depending on the focused state.
 * 
 * Linking Configuration:
 * - Supports deep linking with prefixes and screen paths for web and local environments.
 * 
 * @file App.js
 * @module Tabify
 * @requires react
 * @requires @react-navigation/native
 * @requires @react-navigation/bottom-tabs
 * @requires @react-navigation/stack
 * @requires @expo/vector-icons
 * @requires react-native
 * @requires ./screens/SearchScreen
 * @requires ./screens/ResultsScreen
 * @requires ./screens/HistoryScreen
 * @requires ./screens/GuitarTabsScreen
 * @requires ./screens/YouTubeLessonsScreen
 */
import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Image, StyleSheet,Platform } from "react-native";

// Screens 
// Importing screens for the app
// These screens will be used in the stack navigators for each tab
import SearchScreen from "./screens/SearchScreen";
import ResultsScreen from "./screens/ResultsScreen";
import HistoryScreen from "./screens/HistoryScreen";
import GuitarTabsScreen from "./screens/GuitarTabsScreen";
import YouTubeLessonsScreen from "./screens/YouTubeLessonsScreen";

// Theme colors
// Defining a custom theme for the app using React Navigation's DefaultTheme
// This theme will be applied to the NavigationContainer to customize the appearance of the app
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#2B2D42", // Deep Blue
    card: "#1E1E2E",       // Slightly darker background for nav bar
    text: "#FFFFFF",
    border: "#2B2D42",
    primary: "#EF233C",    // Accent
  },
};

const Tab = createBottomTabNavigator(); // Creating a bottom tab navigator for the app
const Stack = createStackNavigator(); // Creating a stack navigator for managing screen transitions

// Stack navigators for each tab
// Each stack navigator contains a screen or multiple screens that can be navigated to
const SearchStack = () => (
  <Stack.Navigator
    screenOptions={{
      ...TransitionPresets.SlideFromRightIOS, // iOS-like slide transition for stack screens
      headerStyle: { backgroundColor: "#2B2D42" },
      headerTintColor: "#FFFFFF",
      headerTitle: (props) => (
        <View style={styles.headerContainer}>
          <Text style={styles.tabify}>Tabify</Text>
          <Image source={require("./assets/tabify-logo.png")} style={styles.logo} />
        </View>
      ),
    }}
  >
    <Stack.Screen name="SearchScreen" component={SearchScreen}/> 
    <Stack.Screen name="Results" component={ResultsScreen}/>
  </Stack.Navigator> //Search screen and Results screen are part of the SearchStack
);


// Guitar Tabs and YouTube Lessons stacks are similar to SearchStack
// They contain a single screen each, but can be expanded in the future if needed
const GuitarTabsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#2B2D42" },
      headerTintColor: "#FFFFFF",
      headerTitle: (props) => (
        <View style={styles.headerContainer}>
          <Text style={styles.tabify}>Tabify</Text>
          <Image source={require("./assets/tabify-logo.png")} style={styles.logo} />
        </View>
      ),
    }}
  >
    <Stack.Screen name="GuitarTabsScreen" component={GuitarTabsScreen}/>
  </Stack.Navigator>
);

const YouTubeLessonsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#2B2D42" },
      headerTintColor: "#FFFFFF",
      headerTitle: (props) => (
        <View style={styles.headerContainer}>
          <Text style={styles.tabify}>Tabify</Text>
          <Image source={require("./assets/tabify-logo.png")} style={styles.logo} />
        </View>
      ),
    }}
  >
    <Stack.Screen name="YouTubeLessonsScreen" component={YouTubeLessonsScreen}/>
  </Stack.Navigator>
);

// History stack is similar to the others, but it contains the HistoryScreen
// This screen shows the user's search history and can be expanded in the future
const HistoryStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#2B2D42" },
      headerTintColor: "#FFFFFF",
      headerTitle: (props) => (
        <View style={styles.headerContainer}>
          <Text style={styles.tabify}>Tabify</Text>
          <Image source={require("./assets/tabify-logo.png")} style={styles.logo} />
        </View>
      ),
    }}
  >
    <Stack.Screen name="HistoryScreen" component={HistoryScreen}/>
  </Stack.Navigator>
);

// Main App component
// This component wraps the entire app in a NavigationContainer and sets up the tab navigator
const App = () => {
  const linking = {
    prefixes: ['http://localhost:8081', 'http://tabify-guitar-learning.vercel.app'],
    config: {
      screens: {
        Search: {
          screens: {
            Search: '',
            Results: 'results',
          }
        },
        'Guitar Tabs': {
          screens: {
            GuitarTabs: 'guitar-tabs',
          }
        },
        'YouTube Lessons': {
          screens: {
            YouTubeLessons: 'youtube-lessons',
          }
        },
        History: {
          screens: {
            History: 'history',
          }
        }
      }
    }
  };
  
  // The linking configuration allows the app to respond to deep links and URLs
  // This is useful for opening specific screens directly from a URL
  // For example, a URL like 'http://localhost:8081/results' would open the Results screen directly
  // The prefixes define the base URLs that the app will respond to
  return (
    <NavigationContainer linking={linking} theme={AppTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#1E1E2E",
            borderTopColor: "#2B2D42",
          },
          tabBarActiveTintColor: "gray",
          tabBarInactiveTintColor: "white",
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Search") {
              iconName = focused ? "search" : "search-outline";
              color = focused ? "#004D99" : "#0A84FF";
            } else if (route.name === "History") {
              iconName = focused ? "time" : "time-outline";
              color = focused ? "#004D99" : "#0A84FF";
            } else if (route.name === "Guitar Tabs") {
              iconName = focused ? "musical-notes" : "musical-notes-outline";
              color = focused ? "#004D99" : "#0A84FF";
            } else if (route.name === "YouTube Lessons") {
              iconName = focused ? "logo-youtube" : "logo-youtube";
              color = focused ? "#004D99" : "#0A84FF";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          
        })}
      >
        <Tab.Screen name="Search" component={SearchStack} options={{ tabBarLabel: "Search" }} />
        <Tab.Screen name="Guitar Tabs" component={GuitarTabsStack} options={{ tabBarLabel: "Guitar Tabs" }} />
        <Tab.Screen name="YouTube Lessons" component={YouTubeLessonsStack} options={{ tabBarLabel: "YouTube Lessons" }} />
        <Tab.Screen name="History" component={HistoryStack} options={{ tabBarLabel: "History" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Styles for the app
// These styles are used for the header, logo, and title in the navigation bar
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row", //
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  logo: {
    width: 50, // Increased size for better visibility
    height: 50,
    borderRadius: 25, // Make it circular
  },
  tabify: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#3399FF",
    flex:5,
    textAlign: "center",
    marginLeft: 50,
    marginRight: 10,
  },
});

export default App;
