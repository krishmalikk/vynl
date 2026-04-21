import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import { Vinyl } from './vynl';
import { body, vynl, layout, shadow } from '../theme';
import { useNowPlaying, usePlaybackControls } from '../hooks/useTrackPlayer';

interface MiniPlayerProps {
  onPress: () => void;
}

const cleanTitle = (s: string) => s.split(' - ')[0].split('(')[0].trim();

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onPress }) => {
  const { currentTrack, isPlaying, isLoading, progress } = useNowPlaying();
  const { togglePlayPause, skipToNext } = usePlaybackControls();

  if (!currentTrack) return null;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, shadow.md]}
    >
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(2, progress * 100)}%` }]} />
      </View>
      <View style={styles.content}>
        <Vinyl size={44} spinning={isPlaying} />
        <View style={styles.info}>
          <Text
            style={[body(13, { weight: 'semibold' }), { color: vynl.ink }]}
            numberOfLines={1}
          >
            {cleanTitle(currentTrack.title)}
          </Text>
          <Text style={[body(11), { color: vynl.muted, marginTop: 2 }]} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        <Pressable
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          disabled={isLoading}
          style={styles.playBtn}
        >
          {isPlaying ? (
            <Pause size={18} color={vynl.surface} fill={vynl.surface} />
          ) : (
            <Play size={18} color={vynl.surface} fill={vynl.surface} style={{ marginLeft: 2 }} />
          )}
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            skipToNext();
          }}
          style={styles.control}
        >
          <SkipForward size={18} color={vynl.ink} fill={vynl.ink} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: layout.tabBarHeight,
    left: 12,
    right: 12,
    height: 68,
    borderRadius: 22,
    backgroundColor: vynl.surface,
    overflow: 'hidden',
  },
  progressTrack: {
    height: 2,
    width: '100%',
    backgroundColor: vynl.bg,
  },
  progressFill: { height: '100%', backgroundColor: vynl.ink },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  info: { flex: 1, minWidth: 0 },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: vynl.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  control: { padding: 6 },
});
