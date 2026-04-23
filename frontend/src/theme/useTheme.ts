import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  mode: ThemeMode;
  // Backgrounds (gradient stops)
  bgTop: string;
  bgMid: string;
  bgBottom: string;
  bgBase: string;
  // Text
  text: string;
  textDim: string;
  textFaint: string;
  // Surfaces
  glass: string;
  glassStrong: string;
  glassBorder: string;
  glassBorderStrong: string;
  cardBg: string; // solid card background for task cards
  // Brand (same in both modes but slightly different accent weights)
  crimson: string;
  crimsonGlow: string;
  roseGold: string;
  // Tab bar
  tabBg: string;
  tabBorder: string;
}

const dark: ThemeColors = {
  mode: 'dark',
  bgTop: '#0a0000',
  bgMid: '#1a0505',
  bgBottom: '#0d0000',
  bgBase: '#050000',
  text: '#FFFFFF',
  textDim: 'rgba(255,255,255,0.6)',
  textFaint: 'rgba(255,255,255,0.35)',
  glass: 'rgba(255,255,255,0.03)',
  glassStrong: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,82,82,0.08)',
  glassBorderStrong: 'rgba(255,82,82,0.18)',
  cardBg: '#140505',
  crimson: '#E53935',
  crimsonGlow: '#FF5252',
  roseGold: '#FF8A80',
  tabBg: 'rgba(10,0,0,0.92)',
  tabBorder: 'rgba(229,57,53,0.14)',
};

// Light mode: airy, colorful, pastel with vibrant crimson accents
const light: ThemeColors = {
  mode: 'light',
  bgTop: '#FFF4F1',
  bgMid: '#FFEAE4',
  bgBottom: '#FFE0D6',
  bgBase: '#FFF4F1',
  text: '#1A0A0A',
  textDim: 'rgba(26,10,10,0.65)',
  textFaint: 'rgba(26,10,10,0.38)',
  glass: 'rgba(255,255,255,0.65)',
  glassStrong: 'rgba(255,255,255,0.85)',
  glassBorder: 'rgba(229,57,53,0.2)',
  glassBorderStrong: 'rgba(229,57,53,0.35)',
  cardBg: '#FFFFFF',
  crimson: '#E53935',
  crimsonGlow: '#FF5252',
  roseGold: '#FF6B8A',
  tabBg: 'rgba(255,244,241,0.96)',
  tabBorder: 'rgba(229,57,53,0.22)',
};

const STORAGE_KEY = '@theme_mode_v1';

interface ThemeState {
  mode: ThemeMode;
  t: ThemeColors;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
  hydrate: () => Promise<void>;
}

export const useTheme = create<ThemeState>((set, get) => ({
  mode: 'dark',
  t: dark,
  setMode: (m) => {
    const t = m === 'light' ? light : dark;
    set({ mode: m, t });
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  },
  toggle: () => get().setMode(get().mode === 'dark' ? 'light' : 'dark'),
  hydrate: async () => {
    try {
      const v = await AsyncStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark') {
        const t = v === 'light' ? light : dark;
        set({ mode: v, t });
      }
    } catch {}
  },
}));

// Helper to grab a plain palette (for styles that can't re-render easily)
export const themes = { dark, light };
