import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withDelay,
  cancelAnimation,
} from 'react-native-reanimated';
import { vynl } from '../../theme';

interface EqBarsProps {
  color?: string;
  active?: boolean;
}

export const EqBars: React.FC<EqBarsProps> = ({
  color = vynl.labelAccent,
  active = true,
}) => {
  return (
    <View style={styles.container}>
      <Bar color={color} delay={0} active={active} />
      <Bar color={color} delay={200} active={active} />
      <Bar color={color} delay={400} active={active} />
    </View>
  );
};

const Bar: React.FC<{ color: string; delay: number; active: boolean }> = ({
  color,
  delay,
  active,
}) => {
  const h = useSharedValue(0.3);

  useEffect(() => {
    if (!active) {
      cancelAnimation(h);
      h.value = 0.3;
      return;
    }
    h.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
    return () => cancelAnimation(h);
  }, [active, delay, h]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: h.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 3,
          height: 14,
          borderRadius: 1.5,
          backgroundColor: color,
          transformOrigin: 'bottom',
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 14,
  },
});
