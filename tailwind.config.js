/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Aptos', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'Cambria', 'serif'],
      },
      colors: {
        ink: '#1f2933',
        paper: '#fbfaf7',
        moss: '#56705b',
        brass: '#b4893d',
      },
      boxShadow: {
        line: '0 1px 0 rgba(31, 41, 51, 0.06)',
      },
    },
  },
  plugins: [],
}
