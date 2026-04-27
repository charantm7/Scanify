
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sans: ["DM Sans", "sans-serif"],
        serif: ["DM Serif Display", "serif"],
        career: ["'DM Sans', 'Helvetica Neue', sans-serif"],
        blog: ["'Instrument Sans', 'Helvetica Neue', sans-serif"],
        help: ["'Geist', 'Inter', system-ui, sans-serif"]
      },
      colors: {
        accent: {
          DEFAULT: '#2d6a4f',
          dark: '#52b788',
          hover: '#1b4332',
          'hover-dark': '#74c69d',
          lt: '#d8f3dc',
          'lt-dark': '#1b3a2d',
        },
      },
      animation: {
        pulse2: 'pulse2 2s infinite',
        reveal: 'reveal 0.6s ease forwards',
      },
      keyframes: {
        pulse2: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(0.8)' },
        },
        reveal: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        nav: '16px',
      },
    },
  },
  plugins: [],
}

