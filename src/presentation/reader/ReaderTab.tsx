import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReaderProvider, useReader } from './ReaderContext';
import { LiveReadingScreen } from './screens/LiveReadingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ReaderConnectScreen } from './screens/ReaderConnectScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { SessionHeaderScreen } from './screens/SessionHeaderScreen';
import { colors, common } from './theme';

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
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primaryDark },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="SessionHeader" component={SessionHeaderScreen} options={{ title: 'Nueva sesión' }} />
      <Stack.Screen name="Connect" component={ReaderConnectScreen} options={{ title: 'Lector' }} />
      <Stack.Screen name="Live" component={LiveReadingScreen} options={{ title: 'Lectura en manga' }} />
      <Stack.Screen name="Review" component={ReviewScreen} options={{ title: 'Revisión' }} />
    </Stack.Navigator>
  );
}

export function ReaderTab() {
  return <ReaderNavigator />;
}
