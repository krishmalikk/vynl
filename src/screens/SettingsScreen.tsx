import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Star,
  CheckCircle,
  Moon,
  CloudUpload,
  CloudDownload,
  Trash2,
  Info,
  Copy,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { body, display, kicker, vynl, shadow, layout } from '../theme';
import { PillButton, IconButton } from '../components/vynl';
import { backupRestore } from '../services/storage';
import { useSubscriptionStore } from '../services/iap';
import { useAppStore } from '../store/useAppStore';
import { SubscriptionModal } from '../components/SubscriptionModal';

export const SettingsScreen: React.FC = () => {
  const { isSubscribed, plan } = useSubscriptionStore();
  const signOut = useAppStore((s) => s.signOut);

  const [showBackup, setShowBackup] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [restoreCode, setRestoreCode] = useState('');

  const handleCreateBackup = async () => {
    try {
      const code = await backupRestore.createBackup();
      setBackupCode(code);
      setShowBackup(true);
    } catch {
      Alert.alert('Error', 'Failed to create backup');
    }
  };

  const copyBackup = async () => {
    await Clipboard.setStringAsync(backupCode);
    Alert.alert('Copied', 'Backup code copied to clipboard');
  };

  const handleRestore = async () => {
    if (!restoreCode.trim()) {
      Alert.alert('Error', 'Please paste a backup code');
      return;
    }
    const ok = await backupRestore.restoreFromBackup(restoreCode.trim());
    if (ok) {
      Alert.alert('Restored', 'Your library has been restored');
      setShowRestore(false);
      setRestoreCode('');
    } else {
      Alert.alert('Invalid code', 'That code could not be read');
    }
  };

  const confirmClear = () => {
    Alert.alert(
      'Clear all data',
      'This deletes your library, playlists, and settings. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await backupRestore.clearAllData();
            Alert.alert('Done', 'All data cleared');
          },
        },
      ]
    );
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Sign out of vynl?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={[display(40, { weight: 'semibold' }), styles.title]}>
        Settings
        <Text
          style={[
            display(40, { italic: true, weight: 'semibold' }),
            { color: vynl.labelAccent },
          ]}
        >
          .
        </Text>
      </Text>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Section title="Subscription">
          <Row
            icon={isSubscribed ? <CheckCircle size={18} color={vynl.ink} /> : <Star size={18} color={vynl.ink} />}
            title={isSubscribed ? 'Premium active' : 'Remove ads'}
            subtitle={
              isSubscribed
                ? `${plan} subscription`
                : 'Subscribe to remove all ads'
            }
            onPress={() => setShowSubscription(true)}
          />
        </Section>

        <Section title="Appearance">
          <Row
            icon={<Moon size={18} color={vynl.muted} />}
            title="Dark mode"
            subtitle="Coming soon"
            disabled
          />
        </Section>

        <Section title="Backup & restore">
          <Row
            icon={<CloudUpload size={18} color={vynl.ink} />}
            title="Create backup"
            subtitle="Generate a code to save your library"
            onPress={handleCreateBackup}
          />
          <Row
            icon={<CloudDownload size={18} color={vynl.ink} />}
            title="Restore from backup"
            subtitle="Import your library from a backup code"
            onPress={() => setShowRestore(true)}
          />
        </Section>

        <Section title="Data">
          <Row
            icon={<Trash2 size={18} color={vynl.labelAccent} />}
            title="Clear all data"
            subtitle="Delete library, playlists, and settings"
            destructive
            onPress={confirmClear}
          />
        </Section>

        <Section title="Account">
          <Row
            icon={<LogOut size={18} color={vynl.labelAccent} />}
            title="Sign out"
            destructive
            onPress={confirmSignOut}
          />
        </Section>

        <Section title="About">
          <Row
            icon={<Info size={18} color={vynl.ink} />}
            title="Version"
            trailing={
              <Text style={[body(13), { color: vynl.muted }]}>1.0.0</Text>
            }
          />
        </Section>
      </ScrollView>

      <Modal visible={showBackup} transparent animationType="fade" onRequestClose={() => setShowBackup(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[display(20), { color: vynl.ink, textAlign: 'center' }]}>
              Your backup code
            </Text>
            <Text style={[body(12), { color: vynl.muted, textAlign: 'center' }]}>
              Save this to restore your library later.
            </Text>
            <View style={styles.codeBox}>
              <Text style={[body(11), styles.codeText]} selectable numberOfLines={4}>
                {backupCode.slice(0, 100)}…
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <PillButton
                label="Copy"
                onPress={copyBackup}
                leadingIcon={<Copy size={14} color={vynl.surface} />}
                fullWidth
                style={{ flex: 1 }}
              />
              <PillButton
                label="Close"
                variant="secondary"
                onPress={() => setShowBackup(false)}
                fullWidth
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showRestore} transparent animationType="fade" onRequestClose={() => setShowRestore(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[display(20), { color: vynl.ink, textAlign: 'center' }]}>
              Restore from backup
            </Text>
            <Text style={[body(12), { color: vynl.muted, textAlign: 'center' }]}>
              Paste your backup code below.
            </Text>
            <TextInput
              style={[body(13), styles.restoreInput]}
              placeholder="Paste backup code…"
              placeholderTextColor={vynl.muted}
              value={restoreCode}
              onChangeText={setRestoreCode}
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <PillButton
                label="Cancel"
                variant="secondary"
                onPress={() => {
                  setShowRestore(false);
                  setRestoreCode('');
                }}
                fullWidth
                style={{ flex: 1 }}
              />
              <PillButton label="Restore" onPress={handleRestore} fullWidth style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <SubscriptionModal
        visible={showSubscription}
        onClose={() => setShowSubscription(false)}
      />
    </SafeAreaView>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <>
    <Text style={[kicker(10), styles.sectionLabel]}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </>
);

const Row: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  trailing?: React.ReactNode;
}> = ({ icon, title, subtitle, onPress, disabled, destructive, trailing }) => (
  <Pressable
    style={styles.row}
    onPress={onPress}
    disabled={disabled || !onPress}
  >
    <View style={styles.rowIcon}>{icon}</View>
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text
        style={[
          body(14, { weight: 'semibold' }),
          { color: destructive ? vynl.labelAccent : vynl.ink },
          disabled && { color: vynl.muted },
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={[body(11), { color: vynl.muted, marginTop: 2 }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
    {trailing ??
      (onPress && !disabled ? <ChevronRight size={16} color={vynl.muted} /> : null)}
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vynl.bg },
  title: { color: vynl.ink, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  scroll: {
    paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20,
  },
  sectionLabel: {
    color: vynl.muted,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },
  sectionBody: {
    marginHorizontal: 16,
    backgroundColor: vynl.surface,
    borderRadius: 18,
    overflow: 'hidden',
    ...shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: vynl.bg,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: vynl.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11,11,14,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: vynl.surface,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  codeBox: {
    backgroundColor: vynl.bg,
    borderRadius: 14,
    padding: 14,
  },
  codeText: { color: vynl.ink, fontFamily: 'Geist_400Regular' },
  restoreInput: {
    backgroundColor: vynl.bg,
    borderRadius: 14,
    padding: 14,
    color: vynl.ink,
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
