import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TrackPlayer from 'react-native-track-player';

import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { PlaylistsScreen } from './src/screens/PlaylistsScreen';
import { PlaylistDetailScreen } from './src/screens/PlaylistDetailScreen';
import { NowPlayingScreen } from './src/screens/NowPlayingScreen';
import { QueueScreen } from './src/screens/QueueScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { MiniPlayer } from './src/components/MiniPlayer';
import { useThemeStore } from './src/store/useThemeStore';
import { usePlayerStore } from './src/store/usePlayerStore';
import { useTrackPlayerSync, usePlaybackErrorHandler } from './src/hooks/useTrackPlayer';
import { setupPlayer } from './src/services/player';
import { layout } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

// Playlists stack navigator
function PlaylistsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlaylistsList" component={PlaylistsScreen} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
    </Stack.Navigator>
  );
}

// Mini player wrapper component with navigation
function MiniPlayerWrapper() {
  const navigation = useNavigation<any>();
  const { currentTrack } = usePlayerStore();

  if (!currentTrack) return null;

  return (
    <MiniPlayer onPress={() => navigation.navigate('NowPlaying')} />
  );
}

// Main tabs with mini player - 3 icon navigation
function TabNavigator() {
  const { colors } = useThemeStore();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Discover':
                // Planet/Saturn icon for Discover
                iconName = focused ? 'planet' : 'planet-outline';
                break;
              case 'Library':
                iconName = focused ? 'bookmark' : 'bookmark-outline';
                break;
              default:
                iconName = 'help';
            }

            // Thin line icons, 24px for better visibility
            return <Ionicons name={iconName} size={24} color={color} />;
          },
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarShowLabel: false, // Hide labels for minimal design
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'rgba(245, 245, 245, 0.95)',
            borderTopWidth: 0,
            height: 80,
            paddingBottom: 25,
            paddingTop: 12,
            marginHorizontal: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 10,
            overflow: 'hidden',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Discover" component={SearchScreen} />
        <Tab.Screen name="Library" component={LibraryScreen} />
      </Tab.Navigator>

      <MiniPlayerWrapper />
    </View>
  );
}

// Root navigator with modals
function RootNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Main" component={TabNavigator} />
      <RootStack.Screen
        name="NowPlaying"
        component={NowPlayingScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <RootStack.Screen
        name="Queue"
        component={QueueScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </RootStack.Navigator>
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

  useEffect(() => {
    const initPlayer = async () => {
      const ready = await setupPlayer();
      setIsPlayerReady(ready);
    };

    initPlayer();
  }, []);

  if (!isPlayerReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
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
            dark: theme === 'dark',
            colors: {
              primary: colors.primary,
              background: colors.background,
              card: colors.surface,
              text: colors.text,
              border: colors.border,
              notification: colors.primary,
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
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
