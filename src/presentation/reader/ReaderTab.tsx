import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReaderProvider, useReader } from './ReaderContext';
import { LiveReadingScreen } from './screens/LiveReadingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ReaderConnectScreen } from './screens/ReaderConnectScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { SessionHeaderScreen } from './screens/SessionHeaderScreen';
import { common } from './theme';

export type ReaderStackParams = {
  SessionHeader: undefined;
  Connect: undefined;
  Live: undefined;
  Review: undefined;
};

const Stack = createNativeStackNavigator<ReaderStackParams>();

function ReaderNavigator() {
  const { auth } = useReader();

  if (auth === undefined) {
    return <View style={[common.screen, { justifyContent: 'center' }]}><ActivityIndicator /></View>;
  }
  if (auth === null) {
    return <LoginScreen />;
  }

  return (
    // Each screen draws its own AppHeader, like the rest of the app.
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="SessionHeader" component={SessionHeaderScreen} />
      <Stack.Screen name="Connect" component={ReaderConnectScreen} />
      <Stack.Screen name="Live" component={LiveReadingScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
    </Stack.Navigator>
  );
}

export function ReaderTab() {
  return <ReaderNavigator />;
}
