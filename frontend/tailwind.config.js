/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#070b16",
          900: "#0c1424",
          800: "#12203a",
          700: "#1a2f52",
          600: "#243e68",
        },
        steel: {
          500: "#5b6b7a",
          400: "#8b9aab",
          300: "#c5d0dc",
        },
        amber: {
          500: "#e8a317",
          400: "#f0b429",
          300: "#f6d07a",
        },
        signal: {
          green: "#3dcc8a",
          yellow: "#f0b429",
          red: "#e85d4c",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Segoe UI", "system-ui", "sans-serif"],
        display: ["IBM Plex Sans Condensed", "IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 12px 40px rgba(7, 11, 22, 0.45)",
      },
    },
  },
  plugins: [],
};
