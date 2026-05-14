import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutNav() {
  const { isSignedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const currentRootSegment = segments[0];
    const isPublicRoute =
      currentRootSegment === undefined ||
      currentRootSegment === 'index' ||
      currentRootSegment === 'login';

    if (!isSignedIn && !isPublicRoute) {
      // Allow only Home and Login when signed out.
      router.replace('/login');
    }
  }, [isSignedIn, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          contentStyle: { backgroundColor: '#F5F8FC' },
        }}>
        {isSignedIn ? (
          <>
            <Stack.Screen name="index" options={{ title: 'Home' }} />
            <Stack.Screen name="matches" options={{ title: 'Matches' }} />
            <Stack.Screen name="match-details" options={{ title: 'Match Details' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="login" options={{ headerShown: false }} />
          </>
        )}
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
