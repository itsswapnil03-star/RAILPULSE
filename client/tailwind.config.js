/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        rail: {
          950: "#071422",
          900: "#0b1f33",
          800: "#12304c",
          700: "#1a4468",
          600: "#1f5f8a",
          500: "#2a7ab0",
        },
        amberled: "#f5c542",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Segoe UI", "sans-serif"],
        display: ["IBM Plex Sans", "Segoe UI", "sans-serif"],
        led: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
