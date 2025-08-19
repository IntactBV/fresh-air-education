/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: "class",
  // if we need dynamically computed colors add them to the safelist
  safelist: [
    "bg-green-700",
  ],
}
