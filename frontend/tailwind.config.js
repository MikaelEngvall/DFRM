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
        'primary': '#4F46E5',
        'secondary': '#4338CA',
        'accent': '#4a5568',
        'primary-dark': '#2b4c7e',
        'secondary-dark': '#3e4c61',
        'accent-dark': '#596a82',
      },
      animation: {
        blink: 'blink 1s ease-in-out infinite'
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        }
      },
    },
  },
  plugins: [],
} 