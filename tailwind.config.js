/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          "0%": { transform: "translateY(100vh) scale(1)" },
          "50%": { transform: "translateY(50vh) scale(1.05)" },
          "100%": { transform: "translateY(-10vh) scale(1)" },
        },
      },
      animation: {
        float: "float 10s linear infinite",
      },
    },
  },
  plugins: [],
}
