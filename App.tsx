import React from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, LayoutGrid, Bluetooth, List, FileText } from 'lucide-react-native';
import { ReaderProvider, useReader } from './src/presentation/reader/ReaderContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FullScreenNavMenuScreen } from './src/presentation/components/menu/FullScreenNavMenuScreen';
import { LoginScreen } from './src/presentation/reader/screens/LoginScreen';
import { ReaderTab } from './src/presentation/reader/ReaderTab';
import { HomeScreen } from './src/presentation/screens/HomeScreen';
import { OperationsScreen } from './src/presentation/screens/OperationsScreen';
import { HistoryScreen } from './src/presentation/screens/HistoryScreen';
import { WorkTemplateScanScreen } from './src/presentation/screens/WorkTemplateScanScreen';
import { colors, common } from './src/presentation/reader/theme';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'white',
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Operaciones"
        component={OperationsScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('MenuModal');
          },
        })}
        options={{
          tabBarLabel: 'Menú',
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Lector"
        component={ReaderTab}
        options={{
          tabBarLabel: 'Lector',
          tabBarIcon: ({ color, size }) => <Bluetooth color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Planillas"
        component={WorkTemplateScanScreen}
        options={{
          tabBarLabel: 'Planillas',
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Historial"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigation() {
  const { auth } = useReader();
  const navigationRef = useNavigationContainerRef();

  if (auth === undefined) {
    return (
      <View style={[common.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (auth === null) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="MenuModal"
          component={FullScreenNavMenuScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReaderProvider>
        <AppNavigation />
      </ReaderProvider>
    </GestureHandlerRootView>
  );
}

