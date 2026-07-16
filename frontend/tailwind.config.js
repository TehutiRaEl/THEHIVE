/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Kai EL OS palette — matte black / Yale blue / electric cyan / gold.
        // Gold is reserved for Town Hall, Kai EL, and governance surfaces only.
        void: {
          black: '#0a0a0d',
          900: '#0d0e12',
          800: '#14161c',
          700: '#1c1f28',
        },
        yale: {
          DEFAULT: '#0f3d6e',
          light: '#1a5490',
          glow: 'rgba(15, 61, 110, 0.35)',
        },
        cyan: {
          glow: '#22d3ee',
          dim: 'rgba(34, 211, 238, 0.35)',
        },
        gold: {
          DEFAULT: '#e8c15a',
          dim: 'rgba(232, 193, 90, 0.35)',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Exo 2', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(34, 211, 238, 0.25)',
        'glow-gold': '0 0 24px rgba(232, 193, 90, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
