/**
 * Ad Service (AdMob Integration)
 *
 * This file provides ad functionality using Google AdMob.
 *
 * To enable ads:
 * 1. Create an AdMob account at https://admob.google.com
 * 2. Create ad units (banner and interstitial)
 * 3. Install: npm install react-native-google-mobile-ads
 * 4. Configure app.json with your AdMob app ID
 * 5. Replace test IDs below with your production ad unit IDs
 */

// ============ CONFIGURATION ============
// Set to true when AdMob is configured
const ADS_ENABLED = false;

// Test ad unit IDs (replace with your production IDs)
const AD_UNITS = {
  banner: {
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
  },
  interstitial: {
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
  },
};

// Interstitial frequency (show every N plays)
const INTERSTITIAL_FREQUENCY = 5;

// ============ STATE ============
let playCount = 0;
let interstitialLoaded = false;

// ============ INITIALIZATION ============

/**
 * Initialize the ad service
 * Call this when the app starts
 */
export const initializeAds = async (): Promise<void> => {
  if (!ADS_ENABLED) {
    console.log('Ads disabled - skipping initialization');
    return;
  }

  try {
    // TODO: Initialize AdMob
    // import mobileAds from 'react-native-google-mobile-ads';
    // await mobileAds().initialize();

    // Load first interstitial
    await loadInterstitial();
  } catch (error) {
    console.error('Error initializing ads:', error);
  }
};

// ============ BANNER ADS ============

/**
 * Get banner ad unit ID for current platform
 */
export const getBannerAdUnitId = (): string => {
  // Platform.OS === 'ios' ? AD_UNITS.banner.ios : AD_UNITS.banner.android
  return AD_UNITS.banner.ios;
};

/**
 * Banner ad component props
 * Use with react-native-google-mobile-ads BannerAd component
 */
export const getBannerConfig = () => ({
  unitId: getBannerAdUnitId(),
  size: 'BANNER', // BannerAdSize.BANNER
  requestOptions: {
    requestNonPersonalizedAdsOnly: true,
  },
});

// ============ INTERSTITIAL ADS ============

/**
 * Load an interstitial ad
 */
export const loadInterstitial = async (): Promise<void> => {
  if (!ADS_ENABLED) return;

  try {
    // TODO: Load interstitial
    // import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
    // const interstitial = InterstitialAd.createForAdRequest(
    //   Platform.OS === 'ios' ? AD_UNITS.interstitial.ios : AD_UNITS.interstitial.android
    // );
    // interstitial.addAdEventListener(AdEventType.LOADED, () => {
    //   interstitialLoaded = true;
    // });
    // interstitial.load();

    interstitialLoaded = true; // Mock for testing
  } catch (error) {
    console.error('Error loading interstitial:', error);
  }
};

/**
 * Show an interstitial ad if ready
 */
export const showInterstitial = async (): Promise<boolean> => {
  if (!ADS_ENABLED || !interstitialLoaded) {
    return false;
  }

  try {
    // TODO: Show interstitial
    // await interstitial.show();

    interstitialLoaded = false;
    loadInterstitial(); // Load next one
    return true;
  } catch (error) {
    console.error('Error showing interstitial:', error);
    return false;
  }
};

/**
 * Call this when a track starts playing
 * Shows an interstitial every INTERSTITIAL_FREQUENCY plays
 */
export const onTrackPlay = async (isSubscribed: boolean): Promise<void> => {
  // Don't show ads to subscribers
  if (isSubscribed) return;

  playCount++;

  if (playCount >= INTERSTITIAL_FREQUENCY) {
    const shown = await showInterstitial();
    if (shown) {
      playCount = 0;
    }
  }
};

// ============ SETUP INSTRUCTIONS ============
/*
To enable AdMob:

1. Install the package:
   npm install react-native-google-mobile-ads

2. Add to app.json:
   {
     "expo": {
       "plugins": [
         [
           "react-native-google-mobile-ads",
           {
             "androidAppId": "ca-app-pub-xxxxxxxx~xxxxxxxx",
             "iosAppId": "ca-app-pub-xxxxxxxx~xxxxxxxx"
           }
         ]
       ]
     }
   }

3. Create ad units in AdMob console

4. Replace AD_UNITS above with your ad unit IDs

5. Set ADS_ENABLED = true

6. Use the BannerAd component in your screens:
   import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

   <BannerAd
     unitId={getBannerAdUnitId()}
     size={BannerAdSize.BANNER}
     requestOptions={{ requestNonPersonalizedAdsOnly: true }}
   />

7. Call onTrackPlay(isSubscribed) when tracks start playing

8. For production, use real ad unit IDs (not test IDs)
*/
