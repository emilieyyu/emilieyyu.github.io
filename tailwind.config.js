/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f4f6f7",
        accent: "#2b6cb0",
        'off-white': "#1b2430",
        'muted-gray': "#dde3e6",
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
