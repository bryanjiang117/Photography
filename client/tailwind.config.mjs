/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bodoni: ["Bodoni", "serif"],
        tsm: ["TSM", "serif"],
        sh: ["Source Han", "serif"],
      },
    },
  },
  plugins: [],
};
