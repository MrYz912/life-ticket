export const colors = {
  background: '#FAF9F6',
  accent: '#8B0000',
  accentLight: '#A52A2A',
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: {
    100: '#F5F5F5',
    200: '#E8E8E8',
    300: '#D0D0D0',
    400: '#A0A0A0',
    500: '#707070',
    600: '#505050',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#505050',
    light: '#FAF9F6',
  },
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};
