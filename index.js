import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';

import App from './App';
import { PlaybackService } from './src/services/player';

// Register the app
registerRootComponent(App);

// Register the playback service
TrackPlayer.registerPlaybackService(() => PlaybackService);
