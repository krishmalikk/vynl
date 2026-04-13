import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import {
  useSubscriptionStore,
  getProducts,
  purchaseSubscription,
  restorePurchases,
} from '../services/iap';
import { spacing, borderRadius, typography } from '../theme';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Product {
  productId: string;
  title: string;
  description: string;
  localizedPrice: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useThemeStore();
  const { isSubscribed, plan } = useSubscriptionStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadProducts();
    }
  }, [visible]);

  const loadProducts = async () => {
    setIsLoading(true);
    const availableProducts = await getProducts();
    setProducts(availableProducts as Product[]);
    setIsLoading(false);
  };

  const handlePurchase = async (productId: string) => {
    setIsPurchasing(true);
    await purchaseSubscription(productId);
    setIsPurchasing(false);
    onClose();
  };

  const handleRestore = async () => {
    setIsPurchasing(true);
    await restorePurchases();
    setIsPurchasing(false);
  };

  if (isSubscribed) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.content, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark-circle" size={48} color="#fff" />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              You're a Subscriber!
            </Text>

            <Text style={[styles.description, { color: colors.textSecondary }]}>
              You have an active {plan} subscription. Enjoy ad-free listening!
            </Text>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="musical-notes" size={32} color="#fff" />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Remove Ads
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Subscribe to enjoy uninterrupted music without any advertisements.
          </Text>

          {/* Products */}
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <View style={styles.products}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.productId}
                  style={[
                    styles.productCard,
                    { backgroundColor: colors.surfaceLight, borderColor: colors.border },
                  ]}
                  onPress={() => handlePurchase(product.productId)}
                  disabled={isPurchasing}
                >
                  <View style={styles.productInfo}>
                    <Text style={[styles.productTitle, { color: colors.text }]}>
                      {product.title}
                    </Text>
                    <Text style={[styles.productDescription, { color: colors.textSecondary }]}>
                      {product.description}
                    </Text>
                  </View>
                  <Text style={[styles.productPrice, { color: colors.primary }]}>
                    {product.localizedPrice}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Restore */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isPurchasing}
          >
            <Text style={[styles.restoreText, { color: colors.primary }]}>
              Restore Purchases
            </Text>
          </TouchableOpacity>

          {/* Loading overlay */}
          {isPurchasing && (
            <View style={[styles.loadingOverlay, { backgroundColor: colors.overlay }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  products: {
    width: '100%',
    gap: spacing.md,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  productDescription: {
    ...typography.caption,
    marginTop: 2,
  },
  productPrice: {
    ...typography.h3,
    fontWeight: '700',
  },
  restoreButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  restoreText: {
    ...typography.body,
    fontWeight: '500',
  },
  closeButton: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
