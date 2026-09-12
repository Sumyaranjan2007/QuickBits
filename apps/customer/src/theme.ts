// QuickBite Design System — Customer App (Premium Maroon + Gold Theme)
export const Colors = {
  // Primary — Deep Maroon / Wine Red
  primary: '#4A0A10',
  primaryDark: '#3A0008',
  primaryLight: '#6B1A22',
  primaryBg: '#FFF8F0',

  // Accent — Golden Yellow
  accent: '#F5A623',
  accentDark: '#D4900E',
  accentLight: '#FFD470',
  accentBg: '#FFF9EC',

  // Secondary
  secondary: '#2D3436',
  secondaryLight: '#636E72',

  // Status
  success: '#2ECC71',
  successBg: '#EAFAF1',
  warning: '#F39C12',
  warningBg: '#FEF9E7',
  error: '#E74C3C',
  errorBg: '#FDEDEC',
  info: '#3498DB',
  infoBg: '#EBF5FB',

  // Neutral
  white: '#FFFFFF',
  background: '#FDF6EE',
  surface: '#FFFFFF',
  surfaceWarm: '#FFF9F2',
  cream: '#F8EFE4',
  border: '#E8DDD0',
  borderLight: '#F2EBE2',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#A0A0A0',
  textInverse: '#FFFFFF',

  // Misc
  overlay: 'rgba(74, 10, 16, 0.6)',
  shadow: 'rgba(74, 10, 16, 0.08)',
  star: '#F5A623',
  veg: '#2ECC71',
  nonVeg: '#E74C3C',

  // Card
  cardBg: '#FFFFFF',
  cardBorder: '#F0E6DA',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 36,
};

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  extraBold: 'System',
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#4A0A10',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#4A0A10',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4A0A10',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 8,
  },
  gold: {
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
