/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        bahnschrift: ['Bahnschrift', 'sans-serif'],
        bahnschrift_bold:['Bahnschrift-bold', 'sans-serif'],
        bank: ['"Bank Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 