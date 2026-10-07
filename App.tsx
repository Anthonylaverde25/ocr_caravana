import React, { useCallback, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DefaultTheme, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, LayoutGrid, Bluetooth, List, FileText } from 'lucide-react-native';
import { ReaderProvider, useReader } from './src/presentation/reader/ReaderContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MenuScreen } from './src/presentation/screens/MenuScreen';
import { LoginScreen } from './src/presentation/reader/screens/LoginScreen';
import { ReaderTab } from './src/presentation/reader/ReaderTab';
import { HomeScreen } from './src/presentation/screens/HomeScreen';
import { OperationsScreen } from './src/presentation/screens/OperationsScreen';
import { DteScreen } from './src/presentation/screens/DteScreen';
import { ReceiveWithCaravansScreen } from './src/presentation/screens/ReceiveWithCaravansScreen';
import { HistoryScreen } from './src/presentation/screens/HistoryScreen';
import { WorkTemplateScanScreen } from './src/presentation/screens/WorkTemplateScanScreen';
import { SplashView } from './src/presentation/components/SplashView';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { colors, fonts, radius, shadow } from './src/presentation/reader/theme';

const RootStack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background, primary: colors.primary },
};
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 0,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          ...shadow.raised,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtle,
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuScreen}
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

  // While the session is restored the splash covers the screen (see App).
  if (auth === undefined) {
    return null;
  }

  if (auth === null) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="OperationsScreen"
          component={OperationsScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <RootStack.Screen
          name="DteScreen"
          component={DteScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <RootStack.Screen
          name="ReceiveWithCaravansScreen"
          component={ReceiveWithCaravansScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

/** The app under the splash: it stays until the session and fonts are ready, then fades out. A font error falls back to the system font. */
function AppWithSplash() {
  const { auth } = useReader();
  const [fontsLoaded, fontError] = useFonts({ Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold });
  const [splashDone, setSplashDone] = useState(false);
  const finishSplash = useCallback(() => setSplashDone(true), []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.emeraldDeep }}>
      <AppNavigation />
      {!splashDone && <SplashView ready={auth !== undefined && (fontsLoaded || !!fontError)} onFinish={finishSplash} />}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReaderProvider>
        <AppWithSplash />
      </ReaderProvider>
    </GestureHandlerRootView>
  );
}

