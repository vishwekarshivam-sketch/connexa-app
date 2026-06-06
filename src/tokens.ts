import { Easing } from 'react-native-reanimated';

export const colors = {
  ink:          '#15161C',
  inkSoft:      '#2A2B33',
  inkMute:      '#5A5A66',
  inkWhisper:   '#8B8B92',
  khadi:        '#EFE7D6',
  khadiLight:   '#F5EFE0',
  khadiDeep:    '#E6DCC7',
  khadiLt:      '#F5EFE0',
  khadiDk:      '#E6DCC7',
  ember:        '#A8421F',
  emberDeep:    '#8B3416',
  lichen:       '#4A5A3E',
  lichenDeep:   '#353F2C',
  lake:         '#2C3D52',
  lakeDeep:     '#1F2C3C',
  hairline:     '#C9C1AC',
  hairlineSoft: '#D9D2BE',
} as const;

export const fonts = {
  // Legacy aliases (kept for compatibility with existing codebase)
  serif: 'Gambetta-Regular',
  serifLight: 'Gambetta-Light',
  body: 'Gambetta-Regular',
  bodyItalic: 'Newsreader_400Regular_Italic', // Or keep as Newsreader
  label: 'ClashDisplay-Medium',
  title: 'Gambetta-Regular',
  display: {
    regular: 'Gambetta-Regular',
    medium: 'Gambetta-Medium',
    semibold: 'Gambetta-Semibold',
  },
  lore: {
    regular: 'Newsreader_400Regular',
    italic: 'Newsreader_400Regular_Italic',
  },

  // Named type scale tokens (for new/refactored code)
  hero: {
    family: 'ClashDisplay-Semibold',
    size: 40,
    lineHeight: 44,
    letterSpacing: -0.8, // -0.02em * 40
  },
  h1: {
    family: 'ClashDisplay-Semibold',
    size: 32,
    lineHeight: 36,
    letterSpacing: -0.32, // -0.01em * 32
  },
  h2: {
    family: 'ClashDisplay-Semibold',
    size: 24,
    lineHeight: 30,
    letterSpacing: -0.24, // -0.01em * 24
  },
  h3: {
    family: 'ClashDisplay-Medium',
    size: 20,
    lineHeight: 26,
    letterSpacing: 0,
  },
  scaleLabel: {
    family: 'ClashDisplay-Semibold',
    size: 13,
    lineHeight: 16,
    letterSpacing: 0.78, // 0.06em * 13
  },
  scaleBody: {
    family: 'Gambetta-Regular',
    size: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  scaleBodySm: {
    family: 'Gambetta-Regular',
    size: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  scaleBodyMd: {
    family: 'Gambetta-Medium',
    size: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  scaleCaption: {
    family: 'Gambetta-Regular',
    size: 12,
    lineHeight: 16,
    letterSpacing: 0.24, // 0.02em * 12
  },
  scaleLore: {
    family: 'Newsreader_400Regular',
    size: 16,
    lineHeight: 26,
    letterSpacing: 0,
  },
  scaleLoreItalic: {
    family: 'Newsreader_400Regular_Italic',
    size: 16,
    lineHeight: 26,
    letterSpacing: 0,
  },
  mono: {
    family: 'SpaceMono_400Regular', // Standard Expo mono
    size: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },
} as const;

export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
  sigil: 28,
  'sigil-lg': 64,
  'sigil-xl': 120,
} as const;

export const duration = {
  instant:   80,
  quick:    150,
  standard:  250,
  deliberate: 400,
  slow:      600,
  ceremony:  1200,
} as const;

export const timing = {
  base: duration.standard,
  slow: duration.slow,
} as const;

export const ease = {
  out:    Easing.bezier(0.0, 0.0, 0.2, 1),
  inOut:  Easing.bezier(0.4, 0.0, 0.2, 1),
} as const;

// House accent colors keyed by house id
export const houseColors: Record<string, string> = {
  tinkerers:  colors.lake,
  wanderers:  colors.lichen,
  strategists: colors.ember,
  mavericks:  colors.ink,
};
