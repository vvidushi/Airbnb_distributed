/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF385C',
        secondary: '#00A699',
        dark: '#222222',
        gray: {
          light: '#F7F7F7',
          DEFAULT: '#EBEBEB',
          dark: '#717171'
        }
      }
    },
  },
  plugins: [],
}

