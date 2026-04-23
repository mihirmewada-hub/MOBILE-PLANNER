import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from '../src/store/useStore';
import { useTheme } from '../src/theme/useTheme';
import { colors } from '../src/theme/tokens';
import { loadSkia } from '../src/utils/skia-loader';

export default function RootLayout() {
  const hydrate = useStore((s) => s.hydrate);
  const hydrateTheme = useTheme((s) => s.hydrate);
  const mode = useTheme((s) => s.mode);
  const t = useTheme((s) => s.t);
  const [skiaReady, setSkiaReady] = useState(Platform.OS !== 'web');

  useEffect(() => {
    hydrate();
    hydrateTheme();
    if (Platform.OS === 'web') {
      loadSkia().finally(() => setSkiaReady(true));
    }
  }, [hydrate, hydrateTheme]);

  if (!skiaReady) {
    return <View style={{ flex: 1, backgroundColor: colors.bgBase }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: t.bgBase }}>
      <SafeAreaProvider>
        <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: t.bgBase },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="create"
            options={{
              presentation: 'transparentModal',
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
