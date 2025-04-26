import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Image, StyleSheet,Platform } from "react-native";

// Screens
import SearchScreen from "./screens/SearchScreen";
import ResultsScreen from "./screens/ResultsScreen";
import HistoryScreen from "./screens/HistoryScreen";
import GuitarTabsScreen from "./screens/GuitarTabsScreen";
import YouTubeLessonsScreen from "./screens/YouTubeLessonsScreen";

// Theme colors
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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const SearchStack = () => (
  <Stack.Navigator
    screenOptions={{
      ...TransitionPresets.SlideFromRightIOS,
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
  </Stack.Navigator>
);

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

const App = () => {
  const linking = {
    prefixes: ['http://localhost:8081'],
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

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
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
