/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        bone: "#F5F3EE",
        stone: "#C9C2B4",
        sigma: {
          DEFAULT: "#7A1128", // signature accent — deep, editorial burgundy (not the generic terracotta)
          light: "#9A2438",
          dark: "#500B1A",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
    },
  },
  plugins: [],
};
