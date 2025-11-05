/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    fontFamily: {
      Roboto: ["Roboto", "sans-serif"],
      Poppins: ["Poppins", "sans-serif"],
    },
    extend: {
      screens: {
        sm400: "400px",
        sm800: "800px",
        sm1000: "1050px",
        sm1100: "1110px",
        sm1300: "1300px",
      },
    },
  },
  plugins: [],
};
