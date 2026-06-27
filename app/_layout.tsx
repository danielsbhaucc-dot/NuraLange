import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { colors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function RootLayout() {
  const [ready, setReady] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      setReady(true);
    };

    const timeout = setTimeout(finish, 1500);

    if (useAppStore.persist.hasHydrated()) {
      clearTimeout(timeout);
      finish();
      return;
    }

    const unsubscribe = useAppStore.persist.onFinishHydration(() => {
      clearTimeout(timeout);
      finish();
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const content = !ready ? (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  ) : (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="conversation"
        options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
      />
      <Stack.Screen name="score" options={{ animation: 'fade' }} />
      <Stack.Screen name="pricing" options={{ presentation: 'modal' }} />
    </Stack>
  );

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        {content}
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
