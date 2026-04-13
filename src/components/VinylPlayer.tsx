import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useThemeStore } from '../store/useThemeStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VINYL_SIZE = SCREEN_WIDTH * 0.55;
const LABEL_SIZE = VINYL_SIZE * 0.38;

interface VinylPlayerProps {
  artworkUrl?: string;
  isPlaying: boolean;
}

export const VinylPlayer: React.FC<VinylPlayerProps> = ({
  artworkUrl,
  isPlaying,
}) => {
  const { colors } = useThemeStore();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isPlaying) {
      // Continuous rotation at approximately 33 1/3 RPM
      rotation.value = withRepeat(
        withTiming(rotation.value + 360, {
          duration: 1800,
          easing: Easing.linear,
        }),
        -1, // Infinite
        false // Don't reverse
      );
    } else {
      // Stop at current position
      cancelAnimation(rotation);
    }
  }, [isPlaying, rotation]);

  const animatedVinylStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Generate groove lines
  const grooves = Array.from({ length: 12 }, (_, i) => i);

  return (
    <View style={styles.container}>
      {/* Turntable base */}
      <View style={[styles.turntableBase, { backgroundColor: colors.surfaceLight || '#FFFFFF' }]}>
        {/* Vinyl record */}
        <Animated.View style={[styles.vinyl, animatedVinylStyle]}>
          {/* Outer ring (black vinyl) */}
          <View style={styles.vinylOuter}>
            {/* Grooves effect */}
            <View style={styles.groovesContainer}>
              {grooves.map((i) => (
                <View
                  key={i}
                  style={[
                    styles.groove,
                    {
                      width: VINYL_SIZE - i * 16,
                      height: VINYL_SIZE - i * 16,
                      borderRadius: (VINYL_SIZE - i * 16) / 2,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Center label with artwork */}
            <View style={[styles.label, { backgroundColor: colors.background }]}>
              {artworkUrl ? (
                <Image
                  source={{ uri: artworkUrl }}
                  style={styles.artwork}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.artworkPlaceholder, { backgroundColor: colors.textMuted }]} />
              )}
              {/* Center spindle hole */}
              <View style={[styles.hole, { backgroundColor: colors.background }]} />
            </View>
          </View>
        </Animated.View>

        {/* Tonearm */}
        <View style={styles.tonearmContainer}>
          <View style={[styles.tonearmBase, { backgroundColor: colors.textSecondary }]} />
          <View
            style={[
              styles.tonearm,
              {
                backgroundColor: colors.textSecondary,
                transform: [{ rotate: isPlaying ? '25deg' : '10deg' }],
              },
            ]}
          >
            <View style={[styles.tonearmHead, { backgroundColor: colors.text }]} />
          </View>
        </View>

        {/* Control buttons decoration */}
        <View style={styles.controlsDecoration}>
          <View style={[styles.controlDot, { borderColor: colors.textMuted }]} />
          <View style={[styles.controlDot, { borderColor: colors.textMuted }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  turntableBase: {
    width: VINYL_SIZE + 32,
    height: VINYL_SIZE + 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    // Neumorphic shadow
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  vinyl: {
    width: VINYL_SIZE,
    height: VINYL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylOuter: {
    width: VINYL_SIZE,
    height: VINYL_SIZE,
    borderRadius: VINYL_SIZE / 2,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    // Vinyl shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  groovesContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groove: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: 'rgba(60, 60, 60, 0.6)',
  },
  label: {
    width: LABEL_SIZE,
    height: LABEL_SIZE,
    borderRadius: LABEL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artwork: {
    width: LABEL_SIZE,
    height: LABEL_SIZE,
    borderRadius: LABEL_SIZE / 2,
  },
  artworkPlaceholder: {
    width: LABEL_SIZE,
    height: LABEL_SIZE,
    borderRadius: LABEL_SIZE / 2,
  },
  hole: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tonearmContainer: {
    position: 'absolute',
    top: 20,
    right: 15,
    alignItems: 'center',
  },
  tonearmBase: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: -8,
    zIndex: 1,
  },
  tonearm: {
    width: 80,
    height: 4,
    borderRadius: 2,
    transformOrigin: 'left center',
  },
  tonearmHead: {
    position: 'absolute',
    right: -2,
    top: -6,
    width: 6,
    height: 16,
    borderRadius: 2,
  },
  controlsDecoration: {
    position: 'absolute',
    bottom: 12,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  controlDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
});
