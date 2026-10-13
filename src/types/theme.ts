export type ThemeId = 'midnight-pulse' | 'clean-light' | 'graphite-ember' | 'warm-sand';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgElevated: string;
  accentPrimary: string;
  accentSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  accentContrast: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  mode: ThemeMode;
  colors: ThemeColors;
}

export interface AccentPreset {
  id: string;
  name: string;
  color: string;
  contrastColor: string;
}
