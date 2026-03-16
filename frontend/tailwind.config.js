/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        head: ['Syne', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#080a10',
          2: '#0f1118',
          3: '#161924',
        },
        surface: {
          DEFAULT: '#1c2030',
          2: '#222840',
        },
        accent: {
          DEFAULT: '#7c6aff',
          2: '#a78bfa',
          3: '#c4b5fd',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          2: 'rgba(255,255,255,0.12)',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease',
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        wave: {
          '0%, 100%': { height: '6px', opacity: '0.4' },
          '50%': { height: '28px', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
