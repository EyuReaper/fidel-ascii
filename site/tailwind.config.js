/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          black: "#050505",
          green: "#33ff00",
          amber: "#ffb000",
        },
        ethiopian: {
          red: "#ff2a2a",
          yellow: "#ffe600",
          green: "#00ff2a",
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', "monospace"],
        ethiopic: ['"Noto Sans Ethiopic"', "sans-serif"],
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
