import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Apple } from 'lucide-react-native';
import { body, display, kicker, vynl } from '../theme';
import { IconButton, PillButton } from '../components/vynl';
import { useAppStore } from '../store/useAppStore';
import {
  signIn,
  signUp,
  friendlyAuthError,
  isAuthAvailable,
} from '../services/firebaseAuth';

type AuthMode = 'signin' | 'signup';

export const AuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const initialMode = ((route.params as any)?.mode ?? 'signin') as AuthMode;
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const enableDevOverride = useAppStore((s) => s.enableDevOverride);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const firebaseReady = isAuthAvailable();

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (!firebaseReady) {
      setError(
        'Firebase is not configured yet. Paste your config into src/config/firebaseConfig.ts, or use Dev: skip on Welcome.'
      );
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      // Auth listener (in App.tsx) will flip `isAuthed` and the root stack
      // will re-render into the authed branch. We also mark onboarding done
      // so the user doesn't bounce back to Welcome on the brief listener delay.
      completeOnboarding();
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <IconButton
          size="sm"
          variant="surface"
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 20 }}
        >
          <ChevronLeft size={18} color={vynl.ink} />
        </IconButton>

        <Text style={[display(42, { weight: 'semibold' }), styles.heading]}>
          {mode === 'signin' ? 'Welcome' : 'Create'}
          {'\n'}
          <Text style={display(42, { italic: true, weight: 'semibold' })}>
            {mode === 'signin' ? 'back.' : 'account.'}
          </Text>
        </Text>
        <Text style={[body(14), styles.sub]}>
          {mode === 'signin'
            ? 'Pick up where you left off. Your library, playlists, and play history — all synced.'
            : 'Fresh start. Your library and playlists live with your account.'}
        </Text>

        <View style={styles.toggle}>
          <Pressable
            style={[styles.togglePill, mode === 'signin' && styles.togglePillActive]}
            onPress={() => {
              setMode('signin');
              setError(null);
            }}
          >
            <Text
              style={[
                body(13, { weight: 'semibold' }),
                { color: mode === 'signin' ? vynl.bg : vynl.muted },
              ]}
            >
              Sign in
            </Text>
          </Pressable>
          <Pressable
            style={[styles.togglePill, mode === 'signup' && styles.togglePillActive]}
            onPress={() => {
              setMode('signup');
              setError(null);
            }}
          >
            <Text
              style={[
                body(13, { weight: 'semibold' }),
                { color: mode === 'signup' ? vynl.bg : vynl.muted },
              ]}
            >
              Create account
            </Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={[kicker(10), { color: vynl.muted }]}>Email</Text>
          <TextInput
            style={[body(15), styles.input]}
            placeholder="jordan@email.com"
            placeholderTextColor={vynl.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!submitting}
          />
        </View>

        <View style={styles.field}>
          <Text style={[kicker(10), { color: vynl.muted }]}>Password</Text>
          <TextInput
            style={[body(15), styles.input]}
            placeholder="••••••••••"
            placeholderTextColor={vynl.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!submitting}
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={[body(12), { color: vynl.labelAccent }]}>{error}</Text>
          </View>
        ) : null}

        {!firebaseReady ? (
          <View style={styles.warningBox}>
            <Text style={[body(11), { color: vynl.inkSoft }]}>
              Firebase isn’t configured yet. Paste your web-app config into{' '}
              <Text style={[body(11, { weight: 'semibold' }), { color: vynl.ink }]}>
                src/config/firebaseConfig.ts
              </Text>{' '}
              — or use the Dev skip button on Welcome.
            </Text>
          </View>
        ) : null}

        <PillButton
          label={submitting ? '' : mode === 'signin' ? 'Continue' : 'Create account'}
          fullWidth
          onPress={handleSubmit}
          disabled={submitting}
          leadingIcon={
            submitting ? <ActivityIndicator color={vynl.surface} /> : undefined
          }
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={[body(11), { color: vynl.muted }]}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.oauthRow}>
          <Pressable
            style={[styles.oauthButton, { opacity: 0.5 }]}
            disabled
            onPress={() => setError('OAuth providers aren’t wired yet.')}
          >
            <Apple size={18} color={vynl.ink} fill={vynl.ink} />
            <Text style={[body(14, { weight: 'semibold' }), { color: vynl.ink }]}>
              Apple
            </Text>
          </Pressable>
          <Pressable
            style={[styles.oauthButton, { opacity: 0.5 }]}
            disabled
            onPress={() => setError('OAuth providers aren’t wired yet.')}
          >
            <GoogleG />
            <Text style={[body(14, { weight: 'semibold' }), { color: vynl.ink }]}>
              Google
            </Text>
          </Pressable>
        </View>

        {__DEV__ ? (
          <Pressable
            onPress={() => enableDevOverride()}
            style={styles.devButton}
          >
            <Text style={[body(11, { weight: 'semibold' }), { color: vynl.labelAccent }]}>
              Dev: skip auth
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const GoogleG: React.FC = () => (
  <Text style={[body(16, { weight: 'semibold' }), { color: vynl.labelAccent }]}>G</Text>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vynl.bg },
  scroll: { padding: 24, gap: 14 },
  heading: { color: vynl.ink, lineHeight: 48 },
  sub: { color: vynl.inkSoft, marginBottom: 8 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: vynl.surface,
    borderRadius: 999,
    padding: 4,
    gap: 4,
    marginBottom: 4,
  },
  togglePill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 999,
  },
  togglePillActive: { backgroundColor: vynl.ink },
  field: {
    backgroundColor: vynl.surface,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  input: { color: vynl.ink, padding: 0 },
  errorBox: {
    backgroundColor: 'rgba(184,64,90,0.08)',
    borderRadius: 14,
    padding: 12,
  },
  warningBox: {
    backgroundColor: vynl.surface,
    borderRadius: 14,
    padding: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: vynl.muted,
  },
  oauthRow: { flexDirection: 'row', gap: 12 },
  oauthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: vynl.surface,
    borderRadius: 18,
    paddingVertical: 14,
  },
  devButton: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: vynl.labelAccent,
  },
});
