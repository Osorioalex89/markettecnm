/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Dark Luxury — Orange & Amber palette
        background: '#0A0A0A',
        surface: '#141414',
        'surface-2': '#1E1E1E',
        border: '#2E2E2E',
        primary: '#FF6B2B',
        'primary-dark': '#E05520',
        accent: '#FFB830',
        'text-primary': '#F5F5F5',
        'text-secondary': '#999999',
        error: '#FF4D6D',
        success: '#4DFFA6',
        warning: '#FFB830',
      },
    },
  },
  plugins: [],
};
