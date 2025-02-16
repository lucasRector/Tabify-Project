import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import SearchScreen from './screens/SearchScreen.js';
import ResultsScreen from './screens/ResultsScreen.js';
import Mic from './screens/mic.js'; // Make sure path is correct!

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Results" component={ResultsScreen} />
        <Tab.Screen name="Mic" component={Mic} /> 
      </Tab.Navigator>
    </NavigationContainer>
  );
}
