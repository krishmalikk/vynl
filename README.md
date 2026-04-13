# MusicApp

A React Native music player app with playlist management, background playback, and more.

## Features

- **Search & Discovery**: Search for tracks and browse trending music
- **Library**: Save tracks to your personal library
- **Playlists**: Create, edit, and organize playlists with drag-to-reorder
- **Now Playing**: Full-screen player with progress, controls, shuffle, repeat
- **Queue Management**: Play Next, Add to Queue, reorder queue
- **Background Playback**: Listen with screen off, lock screen controls
- **Playlist Sharing**: Share playlists via deep links
- **Monetization**: AdMob ads + subscription to remove ads
- **Dark Mode**: Beautiful dark theme by default

## Prerequisites

- Node.js 18+
- Xcode 15+ (for iOS)
- iOS Simulator or physical device

## Installation

```bash
cd MusicApp
npm install
```

## Running the App

```bash
# Start Expo development server
npm start

# Run on iOS Simulator
npm run ios
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── MiniPlayer.tsx
│   ├── TrackItem.tsx
│   ├── PlaylistCard.tsx
│   ├── ActionSheet.tsx
│   └── SubscriptionModal.tsx
├── screens/          # Screen components
│   ├── SearchScreen.tsx
│   ├── LibraryScreen.tsx
│   ├── PlaylistsScreen.tsx
│   ├── PlaylistDetailScreen.tsx
│   ├── NowPlayingScreen.tsx
│   ├── QueueScreen.tsx
│   └── SettingsScreen.tsx
├── services/         # Business logic
│   ├── player.ts     # Track player setup
│   ├── storage.ts    # Local data persistence
│   ├── search.ts     # Search API (YOU IMPLEMENT)
│   ├── firebase.ts   # Playlist sharing
│   ├── ads.ts        # AdMob integration
│   └── iap.ts        # In-app purchases
├── store/            # State management
│   ├── usePlayerStore.ts
│   └── useThemeStore.ts
├── hooks/            # Custom React hooks
│   ├── useTrackPlayer.ts
│   ├── useLibrary.ts
│   └── usePlaylists.ts
├── types/            # TypeScript types
│   └── index.ts
└── theme/            # Theme configuration
    └── index.ts
```

## Implementing Your Audio Source

Edit `src/services/search.ts` to connect your audio source:

```typescript
interface Track {
  id: string;
  sourceId: string;      // Your source's ID
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: number;      // seconds
  audioUrl: string;      // Direct audio URL for playback
}

// Implement these functions:
export const searchTracks = async (query: string): Promise<SearchResult>
export const getTrendingTracks = async (): Promise<Track[]>
export const getNewReleases = async (): Promise<Track[]>
```

The app will call your implementation and play the `audioUrl` you provide.

## Enabling Features

### Firebase Playlist Sharing

1. Create a Firebase project
2. Install `@react-native-firebase/app` and `@react-native-firebase/firestore`
3. Add config files (GoogleService-Info.plist / google-services.json)
4. Set `FIREBASE_ENABLED = true` in `src/services/firebase.ts`

### AdMob Ads

1. Install `react-native-google-mobile-ads`
2. Add your AdMob app ID to `app.json`
3. Replace test ad unit IDs in `src/services/ads.ts`
4. Set `ADS_ENABLED = true`

### In-App Purchases

1. Install `react-native-iap`
2. Configure products in App Store Connect / Google Play Console
3. Update product IDs in `src/services/iap.ts`
4. Set `IAP_ENABLED = true`

## Building for Production

```bash
# Build iOS
npx expo run:ios --configuration Release

# Or use EAS Build
npx eas build --platform ios
```

## Configuration Files

- `app.json` - Expo configuration
- `babel.config.js` - Babel with reanimated plugin
- `tsconfig.json` - TypeScript configuration

## Dependencies

- `react-native-track-player` - Audio playback with background support
- `@react-navigation/native` - Navigation
- `zustand` - State management
- `react-native-gesture-handler` - Gesture support
- `react-native-reanimated` - Animations
- `react-native-draggable-flatlist` - Drag-to-reorder lists

## License

MIT
