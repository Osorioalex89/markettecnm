import { useThemeStore } from '../store/themeStore';

const DARK = {
  bg: '#0A0A0A', surface: '#141414', surface2: '#1E1E1E',
  text: '#F5F5F5', textSecondary: '#999', textMuted: '#888',
  border: '#1A2E27', accent: '#10B981', accentAlt: '#059669',
  gradientHero: ['#022C22', '#0A0A0A'] as [string, string],
  headerBg: ['#141414', '#0A0A0A'] as [string, string],
};

const LIGHT = {
  bg: '#FFFFFF', surface: '#FFFFFF', surface2: '#ECFDF5',
  text: '#052E16', textSecondary: '#374151', textMuted: '#6B7280',
  border: '#D1FAE5', accent: '#10B981', accentAlt: '#059669',
  gradientHero: ['#059669', '#10B981'] as [string, string],
  headerBg: ['#FFFFFF', '#FFFFFF'] as [string, string],
};

export type ThemeTokens = typeof DARK;

export function useTheme(): ThemeTokens {
  const isDark = useThemeStore((s) => s.isDark);
  return isDark ? DARK : LIGHT;
}
