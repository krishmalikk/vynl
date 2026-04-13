import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, getThemeColors, ThemeColors } from '../theme';

interface ThemeStore {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      colors: getThemeColors('light'),

      setTheme: (theme) => set({
        theme,
        colors: getThemeColors(theme),
      }),

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({
          theme: newTheme,
          colors: getThemeColors(newTheme),
        });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.colors = getThemeColors(state.theme);
        }
      },
    }
  )
);
