import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeId, ThemeDefinition, AccentPreset } from '../types/theme';
import { setDynamicFavicon } from '../lib/favicon';

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  'midnight-pulse': {
    id: 'midnight-pulse',
    name: 'Midnight Pulse',
    tagline: 'Dark charcoal with electric lime & burnt orange',
    mode: 'dark',
    colors: {
      bgPrimary: '#111311',
      bgSecondary: '#151713',
      bgCard: '#1A1D19',
      bgElevated: '#22251F',
      accentPrimary: '#C6FF3D',
      accentSecondary: '#FF7138',
      textPrimary: '#F3F0E8',
      textSecondary: '#A5A89F',
      textMuted: '#777C72',
      border: '#353830',
      borderSubtle: '#292D27',
      accentContrast: '#111311',
    },
  },
  'clean-light': {
    id: 'clean-light',
    name: 'Clean Light',
    tagline: 'Warm off-white with forest green accents',
    mode: 'light',
    colors: {
      bgPrimary: '#F8F7F4',
      bgSecondary: '#EFECE6',
      bgCard: '#FFFFFF',
      bgElevated: '#F2EFEB',
      accentPrimary: '#1E5E2E',
      accentSecondary: '#C25E2E',
      textPrimary: '#181A17',
      textSecondary: '#494D45',
      textMuted: '#767B71',
      border: '#D8D4CA',
      borderSubtle: '#E6E2D8',
      accentContrast: '#FFFFFF',
    },
  },
  'graphite-ember': {
    id: 'graphite-ember',
    name: 'Graphite Ember',
    tagline: 'Deep graphite with ember orange accents',
    mode: 'dark',
    colors: {
      bgPrimary: '#161719',
      bgSecondary: '#1D1F23',
      bgCard: '#23252B',
      bgElevated: '#2B2E35',
      accentPrimary: '#FF6B35',
      accentSecondary: '#E5A93C',
      textPrimary: '#F5F5F7',
      textSecondary: '#A3A7AF',
      textMuted: '#6E737D',
      border: '#383B44',
      borderSubtle: '#2C2F37',
      accentContrast: '#FFFFFF',
    },
  },
  'warm-sand': {
    id: 'warm-sand',
    name: 'Warm Sand',
    tagline: 'Beige stone with rich terracotta accents',
    mode: 'light',
    colors: {
      bgPrimary: '#F2EDE4',
      bgSecondary: '#E6DFCF',
      bgCard: '#FAF7F2',
      bgElevated: '#DCD4C4',
      accentPrimary: '#B34B28',
      accentSecondary: '#A8652B',
      textPrimary: '#221E1A',
      textSecondary: '#58514A',
      textMuted: '#887F75',
      border: '#D2C8B6',
      borderSubtle: '#DED5C5',
      accentContrast: '#FFFFFF',
    },
  },
};

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: 'lime', name: 'Electric Lime', color: '#C6FF3D', contrastColor: '#111311' },
  { id: 'forest', name: 'Forest Green', color: '#1E5E2E', contrastColor: '#FFFFFF' },
  { id: 'ember', name: 'Ember Orange', color: '#FF6B35', contrastColor: '#FFFFFF' },
  { id: 'terracotta', name: 'Terracotta', color: '#B34B28', contrastColor: '#FFFFFF' },
  { id: 'amber', name: 'Amber Gold', color: '#E5A93C', contrastColor: '#111311' },
  { id: 'coral', name: 'Crimson Coral', color: '#E04838', contrastColor: '#FFFFFF' },
  { id: 'sage', name: 'Olive Sage', color: '#6E8B3D', contrastColor: '#FFFFFF' },
];

function getContrastColor(hexColor: string): string {
  const cleanHex = hexColor.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#111311' : '#FFFFFF';
}

interface ThemeContextType {
  theme: ThemeId;
  currentTheme: ThemeDefinition;
  setTheme: (id: ThemeId) => void;
  customAccent: string | null;
  setCustomAccent: (color: string | null) => void;
  resetTheme: () => void;
  themes: ThemeDefinition[];
  accentPresets: AccentPreset[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'mycampus_theme';
const ACCENT_STORAGE_KEY = 'mycampus_custom_accent';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
      if (stored && THEMES[stored]) {
        return stored;
      }
    } catch {
      // localStorage unavailable or restricted
    }
    return 'midnight-pulse';
  });

  const [customAccent, setCustomAccentState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACCENT_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const currentTheme = useMemo(() => THEMES[theme] || THEMES['midnight-pulse'], [theme]);

  // Apply theme attributes and CSS variables immediately on root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', currentTheme.mode);

    // Apply custom accent if specified
    if (customAccent) {
      root.style.setProperty('--theme-accent-primary', customAccent);
      root.style.setProperty('--theme-accent-contrast', getContrastColor(customAccent));
    } else {
      root.style.removeProperty('--theme-accent-primary');
      root.style.removeProperty('--theme-accent-contrast');
    }

    // Dynamically update browser tab favicon to reflect the theme
    const primaryAccent = customAccent || currentTheme.colors.accentPrimary;
    const secondaryAccent = currentTheme.colors.accentSecondary;
    const textColor = currentTheme.colors.textPrimary;
    const bgColor = currentTheme.colors.bgPrimary;
    setDynamicFavicon(primaryAccent, secondaryAccent, textColor, bgColor);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      if (customAccent) {
        localStorage.setItem(ACCENT_STORAGE_KEY, customAccent);
      } else {
        localStorage.removeItem(ACCENT_STORAGE_KEY);
      }
    } catch {
      // Storage error
    }
  }, [theme, currentTheme, customAccent]);

  const setTheme = useCallback((id: ThemeId) => {
    if (THEMES[id]) {
      setThemeState(id);
    }
  }, []);

  const setCustomAccent = useCallback((color: string | null) => {
    setCustomAccentState(color);
  }, []);

  const resetTheme = useCallback(() => {
    setThemeState('midnight-pulse');
    setCustomAccentState(null);
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
      localStorage.removeItem(ACCENT_STORAGE_KEY);
    } catch {
      // Storage error
    }
  }, []);

  const themes = useMemo(() => Object.values(THEMES), []);

  const value = useMemo(
    () => ({
      theme,
      currentTheme,
      setTheme,
      customAccent,
      setCustomAccent,
      resetTheme,
      themes,
      accentPresets: ACCENT_PRESETS,
    }),
    [theme, currentTheme, setTheme, customAccent, setCustomAccent, resetTheme, themes]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
