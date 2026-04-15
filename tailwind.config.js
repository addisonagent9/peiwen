/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          bg: "var(--c-bg)",
          card: "var(--c-card)",
          line: "var(--c-line)"
        },
        cream: "var(--c-text)",
        creamDim: "var(--c-text-dim)",
        teal: { DEFAULT: "var(--c-teal)", soft: "var(--c-teal-soft)" },
        rose: { DEFAULT: "var(--c-rose)", soft: "var(--c-rose-soft)" },
        amber: { DEFAULT: "var(--c-amber)", soft: "var(--c-amber-soft)" },
        gold: "var(--c-gold)"
      },
      fontFamily: {
        serif: ["Noto Serif SC", "Songti SC", "SimSun", "serif"],
        sans: ["Noto Sans SC", "sans-serif"]
      }
    }
  },
  plugins: []
};
