import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight, Zap } from 'lucide-react-native';
import { body, display, vynl } from '../theme';
import { Vinyl, PillButton } from '../components/vynl';
import { useAppStore } from '../store/useAppStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VINYL_SIZE = Math.round(SCREEN_WIDTH * 1.3);

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const enableDevOverride = useAppStore((s) => s.enableDevOverride);

  const devLogin = () => enableDevOverride();

  return (
    <View style={styles.container}>
      {/* Giant spinning vinyl bleeding off the top */}
      <View
        pointerEvents="none"
        style={[
          styles.vinylWrap,
          {
            top: -VINYL_SIZE * 0.5,
            left: -VINYL_SIZE * 0.15,
          },
        ]}
      >
        <Vinyl
          size={VINYL_SIZE}
          spinning
          spinDurationMs={30000}
          labelText="vynl"
          labelColor={vynl.labelCream}
          labelAccentColor={vynl.labelAccent}
        />
      </View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={{ flex: 1 }} />
        <View style={styles.content}>
          <Text style={styles.wordmark}>
            <Text style={display(72, { weight: 'bold' })}>vynl</Text>
            <Text
              style={[
                display(72, { italic: true, weight: 'bold' }),
                { color: vynl.labelAccent },
              ]}
            >
              .
            </Text>
          </Text>
          <Text style={[body(14), styles.tag]}>
            Rediscover music the way it was meant to be played — one record at a time.
          </Text>
          <PillButton
            label="Get started"
            fullWidth
            onPress={() => navigation.navigate('Auth', { mode: 'signup' })}
            trailingIcon={
              <View style={styles.arrowBadge}>
                <ArrowRight size={14} color={vynl.ink} strokeWidth={2.2} />
              </View>
            }
            style={{ justifyContent: 'space-between', paddingRight: 6 }}
          />
          <Pressable
            onPress={() => navigation.navigate('Auth', { mode: 'signin' })}
            style={styles.signInRow}
          >
            <Text style={[body(13), { color: vynl.inkSoft }]}>
              Already have an account?{' '}
              <Text style={[body(13, { weight: 'semibold' }), { color: vynl.ink }]}>
                Sign in
              </Text>
            </Text>
          </Pressable>

          {__DEV__ ? (
            <Pressable onPress={devLogin} style={styles.devButton}>
              <Zap size={12} color={vynl.labelAccent} fill={vynl.labelAccent} />
              <Text style={[body(11, { weight: 'semibold' }), { color: vynl.labelAccent }]}>
                Dev: skip auth
              </Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: vynl.bg,
    overflow: 'hidden',
  },
  safe: { flex: 1 },
  vinylWrap: {
    position: 'absolute',
  },
  content: {
    paddingHorizontal: 28,
    paddingBottom: 32,
    gap: 18,
  },
  wordmark: {
    color: vynl.ink,
    lineHeight: 78,
  },
  tag: {
    color: vynl.inkSoft,
    lineHeight: 22,
  },
  arrowBadge: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: vynl.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInRow: {
    alignItems: 'center',
    paddingTop: 4,
  },
  devButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: vynl.labelAccent,
  },
});
