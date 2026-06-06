/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#15161C',
        khadi: '#EFE7D6',
        ember: '#A8421F',
        lichen: '#4A5A3E',
        lake: '#2C3D52',
      },
      fontFamily: {
        clash: ['ClashDisplay-Medium', 'sans-serif'],
        'clash-semibold': ['ClashDisplay-Semibold', 'sans-serif'],
        gambetta: ['Gambetta-Regular', 'serif'],
        'gambetta-medium': ['Gambetta-Medium', 'serif'],
        'gambetta-semibold': ['Gambetta-Semibold', 'serif'],
        'gambetta-light': ['Gambetta-Light', 'serif'],
        lore: ['Newsreader_400Regular', 'serif'],
        'lore-italic': ['Newsreader_400Regular_Italic', 'serif'],
      },
      fontSize: {
        hero: ['2.5rem', { lineHeight: '2.75rem', letterSpacing: '-0.02em' }], // 40px/44px
        h1: ['2rem', { lineHeight: '2.25rem', letterSpacing: '-0.01em' }], // 32px/36px
        h2: ['1.5rem', { lineHeight: '1.875rem', letterSpacing: '-0.01em' }], // 24px/30px
        h3: ['1.25rem', { lineHeight: '1.625rem' }], // 20px/26px
        label: ['0.8125rem', { lineHeight: '1rem', letterSpacing: '0.06em' }], // 13px/16px
        body: ['1rem', { lineHeight: '1.5rem' }], // 16px/24px
        'body-sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px/20px
        'body-md': ['0.9375rem', { lineHeight: '1.375rem' }], // 15px/22px
        caption: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }], // 12px/16px
        lore: ['1rem', { lineHeight: '1.625rem' }], // 16px/26px
      },
    },
  },
  plugins: [],
};
