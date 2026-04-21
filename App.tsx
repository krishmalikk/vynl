import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { PlaylistDetailScreen } from './src/screens/PlaylistDetailScreen';
import { NowPlayingScreen } from './src/screens/NowPlayingScreen';
import { QueueScreen } from './src/screens/QueueScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { ArtistDetailScreen } from './src/screens/ArtistDetailScreen';
import { MiniPlayer } from './src/components/MiniPlayer';
import { useThemeStore } from './src/store/useThemeStore';
import { usePlayerStore } from './src/store/usePlayerStore';
import { useAppStore } from './src/store/useAppStore';
import { useTrackPlayerSync, usePlaybackErrorHandler } from './src/hooks/useTrackPlayer';
import { setupPlayer } from './src/services/player';
import { useFonts } from './src/theme/useFonts';
import { vynl } from './src/theme';
import { subscribeToAuth } from './src/services/firebaseAuth';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

// Mini player wrapper component with navigation
function MiniPlayerWrapper() {
  const navigation = useNavigation<any>();
  const { currentTrack } = usePlayerStore();

  if (!currentTrack) return null;

  return <MiniPlayer onPress={() => navigation.navigate('NowPlaying')} />;
}

// Main tabs with mini player - 3 icon navigation
function TabNavigator() {
  const { colors } = useThemeStore();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Explore':
                iconName = focused ? 'planet' : 'planet-outline';
                break;
              case 'Library':
                iconName = focused ? 'bookmark' : 'bookmark-outline';
                break;
              default:
                iconName = 'help';
            }

            return <Ionicons name={iconName} size={24} color={color} />;
          },
          tabBarActiveTintColor: vynl.ink,
          tabBarInactiveTintColor: vynl.muted,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'rgba(246, 244, 250, 0.95)',
            borderTopWidth: 0,
            height: 80,
            paddingBottom: 25,
            paddingTop: 12,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: vynl.ink,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 10,
            overflow: 'hidden',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Library" component={LibraryScreen} />
      </Tab.Navigator>

      <MiniPlayerWrapper />
    </View>
  );
}

// Track player sync component
function TrackPlayerSync() {
  useTrackPlayerSync();
  usePlaybackErrorHandler();
  return null;
}

export default function App() {
  const { colors, theme } = useThemeStore();
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const { fontsLoaded } = useFonts();
  const isAuthed = useAppStore((s) => s.isAuthed);
  const authReady = useAppStore((s) => s.authReady);
  const setAuthState = useAppStore((s) => s.setAuthState);
  const markAuthReady = useAppStore((s) => s.markAuthReady);

  useEffect(() => {
    const initPlayer = async () => {
      const ready = await setupPlayer();
      setIsPlayerReady(ready);
    };

    initPlayer();
  }, []);

  // Subscribe to Firebase auth state. Fires immediately with null if Firebase
  // isn't configured yet, so `authReady` flips fast in both cases.
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setAuthState(user);
      markAuthReady();
    });
    return unsubscribe;
  }, [setAuthState, markAuthReady]);

  // Hide splash once everything is ready
  useEffect(() => {
    if (fontsLoaded && isPlayerReady && authReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, isPlayerReady, authReady]);

  if (!fontsLoaded || !isPlayerReady || !authReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: vynl.bg }]}>
        <ActivityIndicator size="large" color={vynl.ink} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <NavigationContainer
          theme={{
            dark: false,
            colors: {
              primary: vynl.ink,
              background: vynl.bg,
              card: vynl.surface,
              text: vynl.ink,
              border: 'transparent',
              notification: vynl.labelAccent,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '800' },
            },
          }}
        >
          <TrackPlayerSync />
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthed ? (
              <>
                <RootStack.Screen name="Main" component={TabNavigator} />
                <RootStack.Screen
                  name="NowPlaying"
                  component={NowPlayingScreen}
                  options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <RootStack.Screen
                  name="Queue"
                  component={QueueScreen}
                  options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <RootStack.Screen
                  name="PlaylistDetail"
                  component={PlaylistDetailScreen}
                  options={{ animation: 'slide_from_right' }}
                />
                <RootStack.Screen
                  name="ArtistDetail"
                  component={ArtistDetailScreen}
                  options={{ animation: 'slide_from_right' }}
                />
                <RootStack.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
              </>
            ) : (
              <>
                <RootStack.Screen
                  name="Welcome"
                  component={WelcomeScreen}
                  options={{ animation: 'fade' }}
                />
                <RootStack.Screen
                  name="Auth"
                  component={AuthScreen}
                  options={{ animation: 'slide_from_right' }}
                />
              </>
            )}
          </RootStack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
