import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ScannerScreen } from './src/presentation/screens/ScannerScreen';
import { HistoryScreen } from './src/presentation/screens/HistoryScreen';
import { Camera, List } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: 'white', height: 60, paddingBottom: 8 },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            headerShown: false,
          }}
        >
          <Tab.Screen 
            name="Escáner" 
            component={ScannerScreen} 
            options={{
              tabBarIcon: ({ color, size }) => <Camera color={color} size={size} />,
            }}
          />
          <Tab.Screen 
            name="Historial" 
            component={HistoryScreen} 
            options={{
              tabBarIcon: ({ color, size }) => <List color={color} size={size} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
