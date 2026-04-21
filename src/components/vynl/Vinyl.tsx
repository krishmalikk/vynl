import React, { useEffect, memo } from 'react';
import { Pressable, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { vynl as tokens } from '../../theme';

export type VinylSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<VinylSize, number> = {
  xs: 36,
  sm: 78,
  md: 108,
  lg: 280,
  xl: 520,
};

interface VinylProps {
  size?: VinylSize | number;
  spinning?: boolean;
  spinDurationMs?: number;
  labelText?: string;
  labelColor?: string;
  labelAccentColor?: string;
  labelTextColor?: string;
  showTonearm?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const VinylInner: React.FC<VinylProps> = ({
  size = 'md',
  spinning = false,
  spinDurationMs = 8000,
  labelText,
  labelColor = tokens.labelCream,
  labelAccentColor = tokens.labelAccent,
  labelTextColor = tokens.ink,
  showTonearm = false,
  onPress,
  style,
}) => {
  const dimension = typeof size === 'number' ? size : SIZE_MAP[size];
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (spinning) {
      rotation.value = withRepeat(
        withTiming(rotation.value + 360, {
          duration: spinDurationMs,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
    }
    return () => cancelAnimation(rotation);
  }, [spinning, spinDurationMs, rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Proportional measurements (viewBox is 100×100)
  const labelRadius = 20;
  const spindleRadius = 1.8;
  // Groove rings between the label edge (r=20) and disc edge (r=50)
  const grooves = [24, 28, 32, 36, 40, 44, 48];

  // Font size scales with disc size
  const labelFontSize = dimension >= 200 ? 7 : dimension >= 90 ? 8 : 0;

  const Content = (
    <View style={[{ width: dimension, height: dimension }, style]}>
      <Animated.View
        style={[{ width: dimension, height: dimension }, spinStyle]}
      >
        <Svg width={dimension} height={dimension} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="labelGradient" cx="30%" cy="30%" r="70%">
              <Stop offset="0%" stopColor={labelColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={labelAccentColor} stopOpacity="1" />
            </RadialGradient>
          </Defs>
          {/* Vinyl base */}
          <Circle cx={50} cy={50} r={50} fill={tokens.vinyl} />
          {/* Groove rings */}
          {grooves.map((r) => (
            <Circle
              key={r}
              cx={50}
              cy={50}
              r={r}
              stroke={tokens.vinylShine}
              strokeWidth={0.3}
              fill="none"
              opacity={0.6}
            />
          ))}
          {/* Shine mark to show rotation */}
          <Circle
            cx={32}
            cy={32}
            r={1.5}
            fill="rgba(255,255,255,0.15)"
          />
          {/* Center label */}
          <Circle cx={50} cy={50} r={labelRadius} fill="url(#labelGradient)" />
          {labelText && labelFontSize > 0 ? (
            <SvgText
              x={50}
              y={50 + labelFontSize * 0.3}
              fontSize={labelFontSize}
              fontStyle="italic"
              fontFamily="Fraunces_400Regular_Italic"
              fill={labelTextColor}
              textAnchor="middle"
            >
              {labelText.length > 14 ? labelText.slice(0, 13) + '…' : labelText}
            </SvgText>
          ) : null}
          {/* Spindle hole */}
          <Circle cx={50} cy={50} r={spindleRadius} fill={tokens.vinyl} />
        </Svg>
      </Animated.View>
      {showTonearm ? <Tonearm diameter={dimension} /> : null}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{Content}</Pressable>;
  }
  return Content;
};

const Tonearm: React.FC<{ diameter: number }> = ({ diameter }) => {
  const pivotSize = Math.round(diameter * 0.085);
  const armLength = Math.round(diameter * 0.42);
  const armThickness = Math.max(3, Math.round(diameter * 0.03));
  return (
    <View
      pointerEvents="none"
      style={[
        styles.tonearmContainer,
        {
          top: -pivotSize * 0.3,
          right: -pivotSize * 0.3,
        },
      ]}
    >
      <View
        style={{
          width: pivotSize,
          height: pivotSize,
          borderRadius: pivotSize / 2,
          backgroundColor: tokens.ink2,
          borderWidth: 2,
          borderColor: tokens.surface,
          zIndex: 2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: pivotSize * 0.35,
          right: pivotSize * 0.4,
          width: armLength,
          height: armThickness,
          backgroundColor: tokens.ink2,
          borderRadius: armThickness / 2,
          transform: [{ rotate: '30deg' }],
          transformOrigin: 'right center',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tonearmContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
});

export const Vinyl = memo(VinylInner);
