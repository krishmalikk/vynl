import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { spacing, borderRadius, typography } from '../theme';

export interface ActionSheetOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  options: ActionSheetOption[];
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  options,
}) => {
  const { colors } = useThemeStore();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <SafeAreaView
              style={[styles.container, { backgroundColor: colors.surface }]}
            >
              {/* Header */}
              {(title || subtitle) && (
                <View style={styles.header}>
                  {title && (
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                      {title}
                    </Text>
                  )}
                  {subtitle && (
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  )}
                </View>
              )}

              {/* Options */}
              <View style={styles.options}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.option,
                      { borderBottomColor: colors.border },
                      index === options.length - 1 && styles.lastOption,
                    ]}
                    onPress={() => {
                      onClose();
                      option.onPress();
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={option.destructive ? colors.error : colors.text}
                    />
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: option.destructive ? colors.error : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.surfaceLight }]}
                onPress={onClose}
              >
                <Text style={[styles.cancelText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  options: {
    paddingHorizontal: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionLabel: {
    ...typography.body,
    marginLeft: spacing.md,
  },
  cancelButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.body,
    fontWeight: '600',
  },
});
