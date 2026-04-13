import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useThemeStore } from '../store/useThemeStore';
import { backupRestore } from '../services/storage';
import { useSubscriptionStore } from '../services/iap';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { spacing, borderRadius, typography, layout } from '../theme';

export const SettingsScreen: React.FC = () => {
  const { colors, theme, toggleTheme } = useThemeStore();
  const { isSubscribed, plan } = useSubscriptionStore();

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [restoreCode, setRestoreCode] = useState('');

  const handleCreateBackup = async () => {
    try {
      const code = await backupRestore.createBackup();
      setBackupCode(code);
      setShowBackupModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to create backup');
    }
  };

  const handleCopyBackup = async () => {
    await Clipboard.setStringAsync(backupCode);
    Alert.alert('Copied', 'Backup code copied to clipboard');
  };

  const handleRestore = async () => {
    if (!restoreCode.trim()) {
      Alert.alert('Error', 'Please enter a backup code');
      return;
    }

    const success = await backupRestore.restoreFromBackup(restoreCode.trim());
    if (success) {
      Alert.alert('Success', 'Your library and playlists have been restored');
      setShowRestoreModal(false);
      setRestoreCode('');
    } else {
      Alert.alert('Error', 'Invalid backup code');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete your library, playlists, and all settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await backupRestore.clearAllData();
            Alert.alert('Done', 'All data has been cleared');
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    destructive,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    destructive?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.surfaceLight }]}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? colors.error : colors.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            { color: destructive ? colors.error : colors.text },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (
        onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        )
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Subscription */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          Subscription
        </Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingItem
            icon={isSubscribed ? 'checkmark-circle' : 'star'}
            title={isSubscribed ? 'Premium Active' : 'Remove Ads'}
            subtitle={isSubscribed ? `${plan} subscription` : 'Subscribe to remove all ads'}
            onPress={() => setShowSubscriptionModal(true)}
          />
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          Appearance
        </Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle={theme === 'dark' ? 'On' : 'Off'}
            rightElement={
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Backup & Restore */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          Backup & Restore
        </Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingItem
            icon="cloud-upload"
            title="Create Backup"
            subtitle="Generate a code to save your library"
            onPress={handleCreateBackup}
          />
          <SettingItem
            icon="cloud-download"
            title="Restore from Backup"
            subtitle="Import your library from a backup code"
            onPress={() => setShowRestoreModal(true)}
          />
        </View>

        {/* Data */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          Data
        </Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingItem
            icon="trash"
            title="Clear All Data"
            subtitle="Delete library, playlists, and settings"
            onPress={handleClearData}
            destructive
          />
        </View>

        {/* About */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          About
        </Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingItem
            icon="information-circle"
            title="Version"
            rightElement={
              <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                1.0.0
              </Text>
            }
          />
        </View>
      </ScrollView>

      {/* Backup Modal */}
      <Modal
        visible={showBackupModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBackupModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Your Backup Code
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Save this code to restore your library later
            </Text>
            <View style={[styles.codeContainer, { backgroundColor: colors.surfaceLight }]}>
              <Text
                style={[styles.codeText, { color: colors.text }]}
                selectable
                numberOfLines={4}
              >
                {backupCode.substring(0, 100)}...
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCopyBackup}
              >
                <Ionicons name="copy" size={20} color="#fff" />
                <Text style={styles.modalButtonText}>Copy Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surfaceLight }]}
                onPress={() => setShowBackupModal(false)}
              >
                <Text style={[styles.modalButtonTextDark, { color: colors.text }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Restore Modal */}
      <Modal
        visible={showRestoreModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRestoreModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Restore from Backup
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Paste your backup code below
            </Text>
            <TextInput
              style={[
                styles.restoreInput,
                { backgroundColor: colors.surfaceLight, color: colors.text },
              ]}
              placeholder="Paste backup code here..."
              placeholderTextColor={colors.textMuted}
              value={restoreCode}
              onChangeText={setRestoreCode}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surfaceLight }]}
                onPress={() => {
                  setShowRestoreModal(false);
                  setRestoreCode('');
                }}
              >
                <Text style={[styles.modalButtonTextDark, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleRestore}
              >
                <Text style={styles.modalButtonText}>Restore</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...typography.h1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  scrollContent: {
    paddingBottom: layout.miniPlayerHeight + layout.tabBarHeight + spacing.xl,
  },
  sectionHeader: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  section: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingTitle: {
    ...typography.body,
  },
  settingSubtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  versionText: {
    ...typography.body,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  modalTitle: {
    ...typography.h3,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  codeContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  codeText: {
    ...typography.caption,
    fontFamily: 'monospace',
  },
  restoreInput: {
    ...typography.body,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  modalButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#fff',
  },
  modalButtonTextDark: {
    ...typography.body,
    fontWeight: '600',
  },
});
