import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { body, display, vynl, shadow } from '../../theme';
import { Vinyl } from './Vinyl';
import { EqBars } from './EqBars';
import { Track } from '../../types';

interface TrackRowBaseProps {
  track: Track;
  onPress?: () => void;
  onMorePress?: () => void;
  trailing?: React.ReactNode;
}

type TrackRowProps =
  | ({ variant?: 'default' } & TrackRowBaseProps)
  | ({ variant: 'playing' } & TrackRowBaseProps)
  | ({ variant: 'numbered'; number: number } & TrackRowBaseProps);

const formatDuration = (seconds: number): string => {
  if (!seconds || Number.isNaN(seconds)) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const cleanTitle = (title: string) =>
  title.split(' - ')[0].split('(')[0].trim();

export const TrackRow: React.FC<TrackRowProps> = (props) => {
  const { track, onPress, onMorePress, trailing, variant = 'default' } = props;
  const duration = formatDuration(track.duration);

  const isPlaying = variant === 'playing';
  const isNumbered = variant === 'numbered';

  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, isPlaying && styles.playingRow]}
    >
      {/* Leading */}
      {isNumbered ? (
        <Text style={[display(18, { italic: true }), styles.number]}>
          {String((props as any).number).padStart(2, '0')}
        </Text>
      ) : isPlaying ? (
        <View style={styles.eqWrap}>
          <EqBars />
        </View>
      ) : null}

      <Vinyl size="xs" />

      {/* Info */}
      <View style={styles.info}>
        <Text
          style={[
            body(14, { weight: 'semibold' }),
            { color: isPlaying ? vynl.ink : vynl.ink },
          ]}
          numberOfLines={1}
        >
          {cleanTitle(track.title)}
        </Text>
        <Text
          style={[body(11), { color: vynl.muted, marginTop: 2 }]}
          numberOfLines={1}
        >
          {track.artist}
        </Text>
      </View>

      {/* Trailing */}
      {trailing ??
        (duration ? (
          <Text style={[body(12), { color: vynl.muted }]}>{duration}</Text>
        ) : null)}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 12,
  },
  playingRow: {
    backgroundColor: vynl.surface,
    borderRadius: 16,
    paddingVertical: 10,
    ...shadow.sm,
  },
  number: {
    width: 24,
    textAlign: 'center',
    color: vynl.inkSoft,
  },
  eqWrap: {
    width: 24,
    alignItems: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
});
