// tailwind.config.js
module.exports = {
  content: ["{pages,app}/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // textColor: {
      //   skin: {
      //     base: "var(--theme-900)",
      //   },
      // },
      // backgroundColor: {
      //   skin: {
      //     fill: "var(--theme-600)",
      //   },
      // },
      colors: {
        theme: {
          50: "var(--theme-600)",
          100: "var(--theme-600)",
          200: "var(--theme-600)",
          300: "var(--theme-600)",
          400: "var(--theme-600)",
          500: "var(--theme-600)",
          600: "var(--theme-600)",
          700: "var(--theme-700)",
          800: "var(--theme-800)",
          900: "var(--theme-900)",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
