import { useCallback } from 'react';
import {
  useFonts as useExpoFonts,
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  Fraunces_700Bold_Italic,
} from '@expo-google-fonts/fraunces';
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
} from '@expo-google-fonts/geist';
import * as SplashScreen from 'expo-splash-screen';

/**
 * Loads the full Vynl typography stack (Fraunces + Geist).
 * Returns `fontsLoaded` plus an `onLayoutRootView` hook to hide the splash
 * once the first view has measured.
 */
export const useFonts = () => {
  const [fontsLoaded] = useExpoFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_700Bold_Italic,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return { fontsLoaded, onLayoutRootView };
};
