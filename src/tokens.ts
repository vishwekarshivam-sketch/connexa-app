export const colors = {
  ink:          '#15161C',
  inkSoft:      '#2A2B33',
  inkMute:      '#5A5A66',
  inkWhisper:   '#8B8B92',
  khadi:        '#EFE7D6',
  khadiLight:   '#F5EFE0',
  khadiDeep:    '#E6DCC7',
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
  serif: 'Gambetta_400Regular',
  serifLight: 'Gambetta_300Light',
  body: 'Newsreader_400Regular',
  bodyItalic: 'Newsreader_400Regular_Italic',
  label: 'ClashDisplay_500Medium',
} as const;

export const timing = {
  quick: 200,
  base: 320,
  slow: 520,
  page: 680,
} as const;

// House accent colors keyed by house id
export const houseColors: Record<string, string> = {
  tinkerers:  colors.lake,
  wanderers:  colors.lichen,
  strategists: colors.ember,
  mavericks:  colors.ink,
};
