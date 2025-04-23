import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import { View, Text, Image, StyleSheet } from "react-native";

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
          <Text style={styles.title}>{props.children}</Text>
          <Image source={require("./assets/tabify-logo.png")} style={styles.logo} />
          <Text style={styles.tabify}>Tabify</Text>
        </View>
      ),
    }}
  >
    <Stack.Screen name="SearchScreen" component={SearchScreen} options={{ title: "Search" }} />
    <Stack.Screen name="Results" component={ResultsScreen} options={{ title: "Results" }} />
  </Stack.Navigator>
);

const GuitarTabsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#2B2D42" },
      headerTintColor: "#FFFFFF",
      headerTitle: (props) => (
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{props.children}</Text>
          <Image source={require("./assets/tabify-logo.png")} style={styles.logo} />
          <Text style={styles.tabify}>Tabify</Text>
        </View>
      ),
    }}
  >
    <Stack.Screen name="GuitarTabsScreen" component={GuitarTabsScreen} options={{ title: "Guitar Tabs" }} />
  </Stack.Navigator>
);

const YouTubeLessonsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#2B2D42" },
      headerTintColor: "#FFFFFF",
      headerTitle: (props) => (
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{props.children}</Text>
          <Image source={require("./assets/tabify-logo.png")} style={styles.logo} />
          <Text style={styles.tabify}>Tabify</Text>
        </View>
      ),
    }}
  >
    <Stack.Screen name="YouTubeLessonsScreen" component={YouTubeLessonsScreen} options={{ title: "YouTube Lessons" }} />
  </Stack.Navigator>
);

const HistoryStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#2B2D42" },
      headerTintColor: "#FFFFFF",
      headerTitle: (props) => (
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{props.children}</Text>
          <Image source={require("./assets/tabify-logo.png")} style={styles.logo} />
          <Text style={styles.tabify}>Tabify</Text>
        </View>
      ),
    }}
  >
    <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{ title: "History" }} />
  </Stack.Navigator>
);

const App = () => {
  return (
    <NavigationContainer theme={AppTheme}>
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
  title: {
    fontSize: 20,
    color: "#FFFFFF",
    flex: 1, // Keeps it aligned left
  },
  logo: {
    width: 50, // Increased size for better visibility
    height: 50,
    resizeMode: "contain",
    flex: 3, // Keeps it aligned center
  },
  tabify: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3399FF",
  },
});

export default App;
