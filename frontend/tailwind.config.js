/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#333c87',
          dark: '#252d65',
          light: '#4a54a8',
        },
        secondary: {
          DEFAULT: '#C7DBEB',
          dark: '#a8c5dd',
          light: '#d9e7f3',
        },
      },
    },
  },
  plugins: [],
}
