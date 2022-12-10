// tailwind.config.js
module.exports = {
  content: ["{pages,src}/**/*.{js,ts,jsx,tsx}"],
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
          50: "var(--theme-50)",
          100: "var(--theme-100)",
          200: "var(--theme-200)",
          300: "var(--theme-300)",
          400: "var(--theme-400)",
          500: "var(--theme-500)",
          600: "var(--theme-600)",
          700: "var(--theme-700)",
          800: "var(--theme-800)",
          900: "var(--theme-900)",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
}
