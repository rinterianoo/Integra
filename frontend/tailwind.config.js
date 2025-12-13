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
          DEFAULT: '#3D6599',
          dark: '#2d4a70',
          light: '#4d7ab3',
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
