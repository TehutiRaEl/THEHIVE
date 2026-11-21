/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Every colour is a CSS variable (src/styles/theme.css) holding "R G B",
        // so one set of class names serves BOTH themes: the dark values are the
        // original Kai EL OS palette (matte black / Yale blue / electric cyan /
        // gold), the light values are defined next to them. Gold is reserved for
        // Town Hall, Kai EL, and governance surfaces only.
        void: {
          black: 'rgb(var(--c-void-black) / <alpha-value>)',
          900: 'rgb(var(--c-void-900) / <alpha-value>)',
          800: 'rgb(var(--c-void-800) / <alpha-value>)',
          700: 'rgb(var(--c-void-700) / <alpha-value>)',
        },
        yale: {
          DEFAULT: 'rgb(var(--c-yale) / <alpha-value>)',
          light: 'rgb(var(--c-yale-light) / <alpha-value>)',
          glow: 'rgb(var(--c-yale) / 0.35)',
        },
        cyan: {
          glow: 'rgb(var(--c-cyan-glow) / <alpha-value>)',
          neon: 'rgb(var(--c-cyan-neon) / <alpha-value>)',
          dim: 'rgb(var(--c-cyan-glow) / 0.35)',
          100: 'rgb(var(--c-cyan-100) / <alpha-value>)',
          300: 'rgb(var(--c-cyan-300) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--c-gold) / <alpha-value>)',
          neon: 'rgb(var(--c-gold-neon) / <alpha-value>)',
          dim: 'rgb(var(--c-gold) / 0.35)',
        },
        violet: {
          neon: 'rgb(var(--c-violet-neon) / <alpha-value>)',
          bright: 'rgb(var(--c-violet-bright) / <alpha-value>)',
          dim: 'rgb(var(--c-violet-neon) / 0.35)',
        },
        electric: {
          blue: 'rgb(var(--c-electric-blue) / <alpha-value>)',
          green: 'rgb(var(--c-electric-green) / <alpha-value>)',
        },
        // "white" is the ink of borders, hairlines and soft fills on the surface:
        // white-on-dark in the dark theme, near-black-on-light in the light theme.
        white: 'rgb(var(--c-white) / <alpha-value>)',
        // Tailwind's slate scale, mirrored in the light theme (slate-200 text
        // becomes a dark slate), so existing text classes stay readable.
        slate: {
          50: 'rgb(var(--c-slate-50) / <alpha-value>)',
          100: 'rgb(var(--c-slate-100) / <alpha-value>)',
          200: 'rgb(var(--c-slate-200) / <alpha-value>)',
          300: 'rgb(var(--c-slate-300) / <alpha-value>)',
          400: 'rgb(var(--c-slate-400) / <alpha-value>)',
          500: 'rgb(var(--c-slate-500) / <alpha-value>)',
          600: 'rgb(var(--c-slate-600) / <alpha-value>)',
          700: 'rgb(var(--c-slate-700) / <alpha-value>)',
          800: 'rgb(var(--c-slate-800) / <alpha-value>)',
          900: 'rgb(var(--c-slate-900) / <alpha-value>)',
          950: 'rgb(var(--c-slate-950) / <alpha-value>)',
        },
        // Status colours the screens use as text: lightened for dark, deepened for light.
        emerald: { 300: 'rgb(var(--c-ok-300) / <alpha-value>)', 400: 'rgb(var(--c-ok-400) / <alpha-value>)' },
        amber: { 300: 'rgb(var(--c-warn-300) / <alpha-value>)', 400: 'rgb(var(--c-warn-400) / <alpha-value>)' },
        red: { 300: 'rgb(var(--c-bad-300) / <alpha-value>)', 400: 'rgb(var(--c-bad-400) / <alpha-value>)' },
        purple: { 200: 'rgb(var(--c-purple-200) / <alpha-value>)', 300: 'rgb(var(--c-purple-300) / <alpha-value>)', 400: 'rgb(var(--c-purple-400) / <alpha-value>)' },
        orange: { 300: 'rgb(var(--c-orange-300) / <alpha-value>)', 400: 'rgb(var(--c-orange-400) / <alpha-value>)' },
        yellow: { 400: 'rgb(var(--c-warn-400) / <alpha-value>)' },
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
