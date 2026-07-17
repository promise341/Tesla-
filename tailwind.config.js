/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#FDECEE',
          100: '#FAD7DB',
          200: '#F5B0B8',
          300: '#EF8894',
          400: '#E85F70',
          500: '#E31937',
          600: '#C9142F',
          700: '#A51026',
          800: '#7E0C1D',
          900: '#590713',
        },
        red: {
          50: '#FDECEE',
          100: '#FAD7DB',
          200: '#F5B0B8',
          300: '#EF8894',
          400: '#E85F70',
          500: '#E31937',
          600: '#C9142F',
          700: '#A51026',
          800: '#7E0C1D',
          900: '#590713',
        },
        gray: {
          50: '#FFFFFF',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#0F0F0F',
        },
        'glass': 'rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
