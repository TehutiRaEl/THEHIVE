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
          neon: '#00e5ff',
          dim: 'rgba(34, 211, 238, 0.35)',
        },
        gold: {
          DEFAULT: '#e8c15a',
          neon: '#ffd166',
          dim: 'rgba(232, 193, 90, 0.35)',
        },
        violet: {
          neon: '#8b5cf6',
          bright: '#a78bfa',
          dim: 'rgba(139, 92, 246, 0.35)',
        },
        electric: {
          blue: '#3b82f6',
          green: '#34d399',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Exo 2', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(34, 211, 238, 0.25)',
        'glow-gold': '0 0 24px rgba(232, 193, 90, 0.3)',
        'neon-cyan': '0 0 8px rgba(0, 229, 255, 0.6), 0 0 28px rgba(0, 229, 255, 0.25)',
        'neon-violet': '0 0 8px rgba(139, 92, 246, 0.6), 0 0 28px rgba(139, 92, 246, 0.25)',
        'neon-gold': '0 0 8px rgba(255, 209, 102, 0.55), 0 0 28px rgba(255, 209, 102, 0.22)',
        'panel-neon': 'inset 0 0 0 1px rgba(34, 211, 238, 0.12), 0 0 20px rgba(59, 130, 246, 0.08)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideIn: 'slideIn 0.15s ease-out',
      },
    },
  },
  plugins: [],
}
