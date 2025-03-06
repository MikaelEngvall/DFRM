/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
      },
      colors: {
        'primary': '#1a365d',
        'secondary': '#2d3748',
        'accent': '#4a5568',
      },
    },
  },
  plugins: [],
} 