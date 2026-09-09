/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0f2942',
          blue: '#1d4ed8',
          light: '#f0f6fc',
          accent: '#ea580c',
          green: '#15803d',
          darkgreen: '#166534',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      boxShadow: {
        'trust': '0 4px 20px -2px rgba(15, 41, 66, 0.08), 0 2px 6px -1px rgba(15, 41, 66, 0.04)',
        'hero': '0 10px 30px -5px rgba(29, 78, 216, 0.15)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
