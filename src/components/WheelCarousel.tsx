import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Track } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ITEM_HEIGHT = 72;
const ALBUM_SIZE = 44;
const VINYL_RADIUS = SCREEN_HEIGHT * 0.55; // Radius of the vinyl

interface WheelCarouselProps {
  tracks: Track[];
  onTrackSelect: (track: Track) => void;
  onPlayTrack: (track: Track) => void;
  isPlaying?: boolean;
}

interface CarouselItemProps {
  track: Track;
  index: number;
  scrollY: SharedValue<number>;
  onPress: () => void;
  onPlayPress: () => void;
}

const CarouselItem: React.FC<CarouselItemProps> = ({
  track,
  index,
  scrollY,
  onPress,
  onPlayPress,
}) => {
  const inputRange = [
    (index - 3) * ITEM_HEIGHT,
    (index - 2) * ITEM_HEIGHT,
    (index - 1) * ITEM_HEIGHT,
    index * ITEM_HEIGHT,
    (index + 1) * ITEM_HEIGHT,
    (index + 2) * ITEM_HEIGHT,
    (index + 3) * ITEM_HEIGHT,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.72, 0.80, 0.90, 1, 0.90, 0.80, 0.72],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.3, 0.5, 0.8, 1, 0.8, 0.5, 0.3],
      Extrapolation.CLAMP
    );

    // Arc positioning - items curve along the vinyl surface
    // Center item is leftmost, items above/below curve to the right
    // Bottom items (positive) curve less to stay more visible
    const angleOffset = interpolate(
      scrollY.value,
      inputRange,
      [-50, -33, -16, 0, 12, 25, 40],
      Extrapolation.CLAMP
    );

    // Convert angle to X position - parabolic curve for natural arc
    // Items curve more strongly as they move away from center
    const translateX = (angleOffset * angleOffset) / 5;

    // Rotate items tangent to the vinyl curve
    const rotate = angleOffset * 0.35;

    return {
      transform: [
        { translateX },
        { scale },
        { rotate: `${rotate}deg` },
      ],
      opacity,
    };
  });

  const pillStyle = useAnimatedStyle(() => {
    const pillOpacity = interpolate(
      scrollY.value,
      [
        (index - 0.5) * ITEM_HEIGHT,
        index * ITEM_HEIGHT,
        (index + 0.5) * ITEM_HEIGHT,
      ],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity: pillOpacity,
    };
  });

  // Inverse pill for inactive tracks - visible when main pill is hidden
  const inactivePillStyle = useAnimatedStyle(() => {
    const inactiveOpacity = interpolate(
      scrollY.value,
      [
        (index - 0.5) * ITEM_HEIGHT,
        index * ITEM_HEIGHT,
        (index + 0.5) * ITEM_HEIGHT,
      ],
      [1, 0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity: inactiveOpacity,
    };
  });

  return (
    <Animated.View style={[styles.itemContainer, animatedStyle]}>
      <Pressable onPress={onPress} style={styles.itemPressable}>
        {/* Pill background for focused item */}
        <Animated.View style={[styles.pillBackground, pillStyle]} />

        {/* Dark backing for inactive track text */}
        <Animated.View style={[styles.inactiveTextBacking, inactivePillStyle]} />

        {/* Album art with vinyl ring */}
        <View style={styles.vinylRing}>
          <View style={styles.albumContainer}>
            <Image
              source={{ uri: track.thumbnailUrl }}
              style={styles.albumArt}
              resizeMode="cover"
            />
            <View style={styles.vinylHole} />
          </View>
        </View>

        {/* Track info - light text for vinyl, dark text when focused */}
        <View style={styles.textContainer}>
          {/* Light text (visible on vinyl) */}
          <Animated.View style={[styles.textLayer, { opacity: 1 }]}>
            <Text style={styles.titleLight} numberOfLines={1}>
              {track.title.split(' - ')[0].split('(')[0].trim()}
            </Text>
            <Text style={styles.artistLight} numberOfLines={1}>
              {track.artist}
            </Text>
          </Animated.View>
          {/* Dark text (visible on pill) */}
          <Animated.View style={[styles.textLayer, styles.textLayerAbsolute, pillStyle]}>
            <Text style={styles.titleDark} numberOfLines={1}>
              {track.title.split(' - ')[0].split('(')[0].trim()}
            </Text>
            <Text style={styles.artistDark} numberOfLines={1}>
              {track.artist}
            </Text>
          </Animated.View>
        </View>

        {/* Play button */}
        <Animated.View style={[styles.playButtonWrapper, pillStyle]}>
          <Pressable onPress={onPlayPress} style={styles.playButton}>
            <Text style={styles.playButtonText}>Play</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export const WheelCarousel: React.FC<WheelCarouselProps> = ({
  tracks,
  onTrackSelect: _onTrackSelect,
  onPlayTrack,
  isPlaying = false,
}) => {
  const scrollY = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const continuousRotation = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Continuous vinyl spin when music is playing
  useEffect(() => {
    if (isPlaying) {
      continuousRotation.value = withRepeat(
        withTiming(continuousRotation.value + 360, {
          duration: 8000, // 8 seconds per revolution
          easing: Easing.linear,
        }),
        -1, // Infinite repeat
        false
      );
    } else {
      cancelAnimation(continuousRotation);
    }
  }, [isPlaying]);

  // Combined vinyl rotation: scroll + continuous play spin
  const vinylRotationStyle = useAnimatedStyle(() => {
    const scrollRotation = scrollY.value * -0.5;
    const totalRotation = scrollRotation + continuousRotation.value;
    return {
      transform: [{ rotate: `${totalRotation}deg` }],
    };
  });

  const handleItemPress = useCallback((_track: Track, index: number) => {
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  }, []);

  // Position focused item in center-lower area of screen
  const topPadding = SCREEN_HEIGHT * 0.28;
  const bottomPadding = SCREEN_HEIGHT * 0.30;

  return (
    <View style={styles.outerContainer}>
      {/* Large vinyl record on the right side - spins on scroll */}
      <View style={styles.vinylBackground}>
        <Animated.View style={[styles.vinylOuter, vinylRotationStyle]}>
          {/* Multiple grooves for realistic vinyl texture */}
          <View style={styles.vinylGroove1} />
          <View style={styles.vinylGroove2} />
          <View style={styles.vinylGroove3} />
          <View style={styles.vinylGroove4} />
          <View style={styles.vinylGroove5} />
          <View style={styles.vinylGroove6} />
          {/* Shine/reflection marks to show rotation */}
          <View style={styles.vinylShine1} />
          <View style={styles.vinylShine2} />
          <View style={styles.vinylShine3} />
          {/* Center label */}
          <View style={styles.vinylCenter}>
            <View style={styles.vinylLabelDot} />
          </View>
        </Animated.View>
      </View>

      {/* Scrollable track list */}
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={{
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {tracks.slice(0, 20).map((track, index) => (
          <CarouselItem
            key={track.id}
            track={track}
            index={index}
            scrollY={scrollY}
            onPress={() => handleItemPress(track, index)}
            onPlayPress={() => onPlayTrack(track)}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Large vinyl record - center visible on right side
  vinylBackground: {
    position: 'absolute',
    left: SCREEN_WIDTH * 0.0001,
    top: SCREEN_HEIGHT * 0.001,
    width: VINYL_RADIUS * 2,
    height: VINYL_RADIUS * 2,
    zIndex: 0,
  },
  vinylOuter: {
    width: '100%',
    height: '100%',
    borderRadius: VINYL_RADIUS,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylGroove1: {
    position: 'absolute',
    width: VINYL_RADIUS * 1.7,
    height: VINYL_RADIUS * 1.7,
    borderRadius: VINYL_RADIUS * 0.85,
    borderWidth: 1,
    borderColor: '#333',
  },
  vinylGroove2: {
    position: 'absolute',
    width: VINYL_RADIUS * 1.3,
    height: VINYL_RADIUS * 1.3,
    borderRadius: VINYL_RADIUS * 0.65,
    borderWidth: 1,
    borderColor: '#333',
  },
  vinylGroove3: {
    position: 'absolute',
    width: VINYL_RADIUS * 0.9,
    height: VINYL_RADIUS * 0.9,
    borderRadius: VINYL_RADIUS * 0.45,
    borderWidth: 1,
    borderColor: '#333',
  },
  vinylGroove4: {
    position: 'absolute',
    width: VINYL_RADIUS * 1.5,
    height: VINYL_RADIUS * 1.5,
    borderRadius: VINYL_RADIUS * 0.75,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  vinylGroove5: {
    position: 'absolute',
    width: VINYL_RADIUS * 1.1,
    height: VINYL_RADIUS * 1.1,
    borderRadius: VINYL_RADIUS * 0.55,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  vinylGroove6: {
    position: 'absolute',
    width: VINYL_RADIUS * 0.7,
    height: VINYL_RADIUS * 0.7,
    borderRadius: VINYL_RADIUS * 0.35,
    borderWidth: 1,
    borderColor: '#383838',
  },
  vinylCenter: {
    width: VINYL_RADIUS * 0.18,
    height: VINYL_RADIUS * 0.18,
    borderRadius: VINYL_RADIUS * 0.09,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylLabelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    position: 'absolute',
    top: '25%',
    left: '25%',
  },
  vinylShine1: {
    position: 'absolute',
    width: VINYL_RADIUS * 0.6,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    top: '35%',
    left: '20%',
    transform: [{ rotate: '-30deg' }],
  },
  vinylShine2: {
    position: 'absolute',
    width: VINYL_RADIUS * 0.4,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 1,
    bottom: '30%',
    right: '25%',
    transform: [{ rotate: '45deg' }],
  },
  vinylShine3: {
    position: 'absolute',
    width: VINYL_RADIUS * 0.3,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 1,
    top: '55%',
    left: '30%',
    transform: [{ rotate: '15deg' }],
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    marginLeft: 10,
    marginRight: 10,
    marginVertical: 4,
    justifyContent: 'center',
  },
  itemPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    paddingHorizontal: 6,
  },
  pillBackground: {
    position: 'absolute',
    left: -3,
    right: -3,
    top: -2,
    bottom: -2,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  inactiveTextBacking: {
    position: 'absolute',
    left: ALBUM_SIZE + 14,
    right: 4,
    top: 6,
    bottom: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 14,
  },
  vinylRing: {
    width: ALBUM_SIZE + 8,
    height: ALBUM_SIZE + 8,
    borderRadius: (ALBUM_SIZE + 8) / 2,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#444',
  },
  albumContainer: {
    width: ALBUM_SIZE,
    height: ALBUM_SIZE,
    borderRadius: ALBUM_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#555',
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  vinylHole: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 8,
    height: 8,
    marginTop: -4,
    marginLeft: -4,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
    zIndex: 1,
  },
  textLayer: {
    justifyContent: 'center',
  },
  textLayerAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  titleLight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  artistLight: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '400',
  },
  titleDark: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  artistDark: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '400',
  },
  playButtonWrapper: {
    zIndex: 1,
  },
  playButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  playButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
