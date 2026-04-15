/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        ink: { bg: "#0f0d0b", card: "#1a1613", line: "#2a2320" },
        cream: "#f0e4cc",
        creamDim: "#b8ad98",
        teal: { DEFAULT: "#5ec8b8", soft: "#2f6b63" },
        rose: { DEFAULT: "#d26a77", soft: "#6b2f35" },
        amber: { DEFAULT: "#d9a14a", soft: "#6b4f23" },
        gold: "#c8a96e"
      },
      fontFamily: {
        serif: ["Noto Serif SC", "Songti SC", "SimSun", "serif"]
      }
    }
  },
  plugins: []
};
