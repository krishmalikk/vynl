/**
 * In-App Purchase Service
 *
 * This file provides subscription functionality using react-native-iap.
 *
 * To enable IAP:
 * 1. Set up App Store Connect (iOS) and Google Play Console (Android)
 * 2. Create subscription products with the IDs below
 * 3. Install: npm install react-native-iap
 * 4. Follow platform-specific setup for react-native-iap
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionState } from '../types';

// ============ CONFIGURATION ============
// Set to true when IAP is configured
const IAP_ENABLED = false;

// Product IDs (must match App Store Connect / Google Play Console)
const PRODUCT_IDS = {
  monthlySubscription: 'music_app_monthly_299',
  yearlySubscription: 'music_app_yearly_999',
};

// ============ SUBSCRIPTION STORE ============
interface SubscriptionStore extends SubscriptionState {
  setSubscribed: (isSubscribed: boolean, plan?: 'monthly' | 'yearly', expiresAt?: number) => void;
  clearSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      isSubscribed: false,
      expiresAt: undefined,
      plan: undefined,

      setSubscribed: (isSubscribed, plan, expiresAt) =>
        set({ isSubscribed, plan, expiresAt }),

      clearSubscription: () =>
        set({ isSubscribed: false, plan: undefined, expiresAt: undefined }),
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============ IAP FUNCTIONS ============

/**
 * Initialize IAP connection
 * Call this when the app starts
 */
export const initializeIAP = async (): Promise<void> => {
  if (!IAP_ENABLED) {
    console.log('IAP disabled - skipping initialization');
    return;
  }

  try {
    // TODO: Initialize IAP
    // import { initConnection, getSubscriptions } from 'react-native-iap';
    // await initConnection();
    // const products = await getSubscriptions({
    //   skus: Object.values(PRODUCT_IDS),
    // });

    // Check for existing subscription
    await restorePurchases();
  } catch (error) {
    console.error('Error initializing IAP:', error);
  }
};

/**
 * Get available subscription products
 */
export const getProducts = async () => {
  if (!IAP_ENABLED) {
    // Return mock products for UI testing
    return [
      {
        productId: PRODUCT_IDS.monthlySubscription,
        title: 'Monthly Subscription',
        description: 'Remove all ads',
        localizedPrice: '$2.99',
        price: '2.99',
        currency: 'USD',
      },
      {
        productId: PRODUCT_IDS.yearlySubscription,
        title: 'Yearly Subscription',
        description: 'Remove all ads - Save 72%!',
        localizedPrice: '$9.99',
        price: '9.99',
        currency: 'USD',
      },
    ];
  }

  try {
    // TODO: Get real products
    // import { getSubscriptions } from 'react-native-iap';
    // return await getSubscriptions({ skus: Object.values(PRODUCT_IDS) });
    return [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

/**
 * Purchase a subscription
 */
export const purchaseSubscription = async (
  productId: string
): Promise<boolean> => {
  if (!IAP_ENABLED) {
    console.log('IAP disabled - mock purchase');
    // Mock successful purchase for testing
    const plan = productId === PRODUCT_IDS.monthlySubscription ? 'monthly' : 'yearly';
    const expiresAt = Date.now() + (plan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000;
    useSubscriptionStore.getState().setSubscribed(true, plan, expiresAt);
    return true;
  }

  try {
    // TODO: Process purchase
    // import { requestSubscription } from 'react-native-iap';
    // await requestSubscription({ sku: productId });

    // The purchase listener will handle the result
    return true;
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    return false;
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<boolean> => {
  if (!IAP_ENABLED) {
    console.log('IAP disabled - skipping restore');
    return false;
  }

  try {
    // TODO: Restore purchases
    // import { getAvailablePurchases } from 'react-native-iap';
    // const purchases = await getAvailablePurchases();
    //
    // for (const purchase of purchases) {
    //   if (Object.values(PRODUCT_IDS).includes(purchase.productId)) {
    //     const plan = purchase.productId === PRODUCT_IDS.monthlySubscription ? 'monthly' : 'yearly';
    //     useSubscriptionStore.getState().setSubscribed(true, plan);
    //     return true;
    //   }
    // }

    return false;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return false;
  }
};

/**
 * Check if subscription is valid
 */
export const checkSubscriptionStatus = (): boolean => {
  const { isSubscribed, expiresAt } = useSubscriptionStore.getState();

  if (!isSubscribed) return false;

  // Check if expired
  if (expiresAt && expiresAt < Date.now()) {
    useSubscriptionStore.getState().clearSubscription();
    return false;
  }

  return true;
};

// ============ PURCHASE LISTENER ============

/**
 * Set up purchase listener
 * Call this when the app starts
 */
export const setupPurchaseListener = () => {
  if (!IAP_ENABLED) return;

  // TODO: Set up purchase listener
  // import { purchaseUpdatedListener, purchaseErrorListener, finishTransaction } from 'react-native-iap';
  //
  // purchaseUpdatedListener(async (purchase) => {
  //   const receipt = purchase.transactionReceipt;
  //   if (receipt) {
  //     // Validate receipt with your server if needed
  //     await finishTransaction({ purchase, isConsumable: false });
  //
  //     const plan = purchase.productId === PRODUCT_IDS.monthlySubscription ? 'monthly' : 'yearly';
  //     useSubscriptionStore.getState().setSubscribed(true, plan);
  //   }
  // });
  //
  // purchaseErrorListener((error) => {
  //   console.error('Purchase error:', error);
  // });
};

// ============ SETUP INSTRUCTIONS ============
/*
To enable In-App Purchases:

1. Install the package:
   npm install react-native-iap

2. iOS Setup (App Store Connect):
   - Create subscription products matching PRODUCT_IDS above
   - Configure subscription groups
   - Add Shared Secret for receipt validation

3. Android Setup (Google Play Console):
   - Create subscription products matching PRODUCT_IDS above
   - Configure subscription base plans

4. Add to app.json for Expo:
   {
     "expo": {
       "plugins": ["react-native-iap"]
     }
   }

5. Set IAP_ENABLED = true above

6. Call initializeIAP() and setupPurchaseListener() on app start

7. Use in your subscription screen:
   const products = await getProducts();
   await purchaseSubscription(products[0].productId);
   await restorePurchases();

8. Check subscription status:
   const isSubscribed = checkSubscriptionStatus();
*/
