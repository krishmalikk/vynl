import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronDown,
  MoreHorizontal,
  Shuffle,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat,
  Repeat1,
  List,
  Heart,
  Share2,
  Radio,
} from 'lucide-react-native';
import { body, display, kicker, vynl, shadow } from '../theme';
import { Vinyl, IconButton } from '../components/vynl';
import { useNowPlaying, usePlaybackControls } from '../hooks/useTrackPlayer';
import { useLibrary } from '../hooks/useLibrary';
import { useThemeStore } from '../store/useThemeStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TABLE_SIZE = Math.min(SCREEN_WIDTH - 64, 300);
const DISC_INSET = 22;
const DISC_SIZE = TABLE_SIZE - DISC_INSET * 2;

export const NowPlayingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    currentTrack,
    isPlaying,
    isLoading,
    progress,
    duration,
    position,
    positionFormatted,
    durationFormatted,
    repeatMode,
    shuffleEnabled,
  } = useNowPlaying();
  const {
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    toggleShuffle,
    cycleRepeatMode,
  } = usePlaybackControls();
  const { tracks: library, addTrack, removeTrack, isInLibrary } = useLibrary();

  const progressBarRef = useRef<View>(null);
  const [progressBarWidth, setProgressBarWidth] = React.useState(0);

  const handleSeek = (e: GestureResponderEvent) => {
    if (!progressBarWidth || !duration) return;
    const x = Math.max(0, Math.min(progressBarWidth, e.nativeEvent.locationX));
    const ratio = x / progressBarWidth;
    seekTo(ratio * duration);
  };

  if (!currentTrack) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Radio size={40} color={vynl.muted} />
        <Text style={[display(20), { color: vynl.ink, marginTop: 16 }]}>
          Nothing playing
        </Text>
      </SafeAreaView>
    );
  }

  const liked = isInLibrary(currentTrack.id);
  const remaining = Math.max(0, duration - position);
  const remainingFormatted = `-${formatTime(remaining)}`;

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton size="sm" variant="ghost" onPress={() => navigation.goBack()}>
          <ChevronDown size={22} color={vynl.ink} />
        </IconButton>
        <View style={styles.crumb}>
          <Text style={[kicker(9), { color: vynl.muted }]}>Playing from</Text>
          <Text style={[body(12, { weight: 'semibold' }), { color: vynl.ink }]}>
            Your queue
          </Text>
        </View>
        <IconButton size="sm" variant="ghost">
          <MoreHorizontal size={20} color={vynl.ink} />
        </IconButton>
      </View>

      {/* Turntable */}
      <View style={styles.turntableWrap}>
        <View style={styles.turntableBase}>
          <View style={styles.discHole}>
            <Vinyl
              size={DISC_SIZE}
              spinning={isPlaying}
              spinDurationMs={10000}
              labelColor={vynl.labelCream}
              labelAccentColor={vynl.labelAccent}
            />
          </View>
          <Tonearm playing={isPlaying} />
        </View>
      </View>

      {/* Track info */}
      <View style={styles.info}>
        <Text
          style={[display(24, { weight: 'semibold' }), styles.title]}
          numberOfLines={1}
        >
          {cleanTitle(currentTrack.title)}
        </Text>
        <Pressable
          onPress={() =>
            navigation.navigate('ArtistDetail', { artistName: currentTrack.artist })
          }
        >
          <Text style={[body(13), { color: vynl.inkSoft, marginTop: 4 }]} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </Pressable>
      </View>

      {/* Progress */}
      <View style={styles.progressWrap}>
        <View
          ref={progressBarRef}
          onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
          style={styles.progressTrack}
          onStartShouldSetResponder={() => true}
          onResponderRelease={handleSeek}
        >
          <View
            style={[styles.progressFill, { width: `${Math.max(0, progress * 100)}%` }]}
          />
          <View style={[styles.progressKnob, { left: `${Math.max(0, progress * 100)}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={[body(11), styles.timeText]}>{positionFormatted}</Text>
          <Text style={[body(11), styles.timeText]}>{remainingFormatted || `-${durationFormatted}`}</Text>
        </View>
      </View>

      {/* Transport */}
      <View style={styles.transport}>
        <Pressable onPress={toggleShuffle} style={styles.ghostControl}>
          <Shuffle
            size={20}
            color={shuffleEnabled ? vynl.ink : vynl.muted}
            strokeWidth={shuffleEnabled ? 2.6 : 2}
          />
        </Pressable>
        <Pressable onPress={skipToPrevious} style={styles.ghostControl}>
          <SkipBack size={26} color={vynl.ink} fill={vynl.ink} />
        </Pressable>
        <Pressable onPress={togglePlayPause} style={styles.playBtn} disabled={isLoading}>
          {isPlaying ? (
            <Pause size={24} color={vynl.surface} fill={vynl.surface} />
          ) : (
            <Play size={24} color={vynl.surface} fill={vynl.surface} style={{ marginLeft: 3 }} />
          )}
        </Pressable>
        <Pressable onPress={skipToNext} style={styles.ghostControl}>
          <SkipForward size={26} color={vynl.ink} fill={vynl.ink} />
        </Pressable>
        <Pressable onPress={cycleRepeatMode} style={styles.ghostControl}>
          <RepeatIcon
            size={20}
            color={repeatMode !== 'off' ? vynl.ink : vynl.muted}
            strokeWidth={repeatMode !== 'off' ? 2.6 : 2}
          />
        </Pressable>
      </View>

      {/* Utility row */}
      <View style={styles.utilityRow}>
        <Pressable
          style={styles.utilityBtn}
          onPress={() => navigation.navigate('Queue')}
        >
          <List size={20} color={vynl.inkSoft} />
        </Pressable>
        <Pressable
          style={styles.utilityBtn}
          onPress={() => {
            if (liked) removeTrack(currentTrack.id);
            else addTrack(currentTrack);
          }}
        >
          <Heart
            size={20}
            color={liked ? vynl.labelAccent : vynl.inkSoft}
            fill={liked ? vynl.labelAccent : 'transparent'}
          />
        </Pressable>
        <Pressable style={styles.utilityBtn}>
          <Share2 size={20} color={vynl.inkSoft} />
        </Pressable>
        <Pressable style={styles.utilityBtn}>
          <Radio size={20} color={vynl.inkSoft} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const Tonearm: React.FC<{ playing: boolean }> = ({ playing }) => {
  return (
    <View style={styles.tonearmContainer} pointerEvents="none">
      <View style={styles.tonearmPivot} />
      <View
        style={[
          styles.tonearmBar,
          { transform: [{ rotate: playing ? '30deg' : '10deg' }] },
        ]}
      />
    </View>
  );
};

const cleanTitle = (s: string) => s.split(' - ')[0].split('(')[0].trim();
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vynl.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  crumb: { alignItems: 'center' },
  turntableWrap: { alignItems: 'center', paddingVertical: 24 },
  turntableBase: {
    width: TABLE_SIZE,
    height: TABLE_SIZE,
    borderRadius: 28,
    backgroundColor: vynl.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  discHole: { width: DISC_SIZE, height: DISC_SIZE },
  tonearmContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'flex-end',
    width: 110,
  },
  tonearmPivot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: vynl.ink2,
    borderWidth: 2,
    borderColor: vynl.bg,
    zIndex: 2,
    alignSelf: 'flex-end',
  },
  tonearmBar: {
    position: 'absolute',
    top: 9,
    right: 6,
    width: 90,
    height: 4,
    borderRadius: 2,
    backgroundColor: vynl.ink2,
    transformOrigin: 'right center',
  },
  info: { paddingHorizontal: 32, alignItems: 'center' },
  title: { color: vynl.ink, textAlign: 'center' },
  progressWrap: { paddingHorizontal: 32, paddingTop: 20 },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(11,11,14,0.12)',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    backgroundColor: vynl.ink,
    borderRadius: 2,
  },
  progressKnob: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: vynl.ink,
    marginLeft: -5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    color: vynl.inkSoft,
    fontVariant: ['tabular-nums'],
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  ghostControl: { padding: 10 },
  playBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: vynl.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 'auto',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  utilityBtn: { padding: 12 },
});
