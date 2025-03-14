/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
      },
      colors: {
        'primary': '#1a365d',
        'secondary': '#2d3748',
        'accent': '#4a5568',
        'primary-dark': '#2b4c7e',
        'secondary-dark': '#3e4c61',
        'accent-dark': '#596a82',
      },
    },
  },
  plugins: [],
} 