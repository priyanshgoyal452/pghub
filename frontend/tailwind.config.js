/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#d8232a", // MagicBricks Red
        accent: "#f6b21b",  // MagicBricks Yellow
        secondary: "#303030", // Dark gray for text
        light: "#f9f9f9"
      }
    },
  },
  plugins: [],
}
