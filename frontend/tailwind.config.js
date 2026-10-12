/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        espresso: {
          50: '#FBF9F7',
          100: '#F5EFEB',
          200: '#E6DACF',
          300: '#D2BEAF',
          400: '#B49781',
          500: '#947259',
          600: '#75543D',
          700: '#5A3D2A',
          750: '#462E1F',
          800: '#342116',
          850: '#26170F',
          900: '#1A0E08',
          950: '#0F0804',
        },
        coffee: {
          50: '#FAF7F4',
          100: '#F3EBE4',
          200: '#E4D3C5',
          300: '#CBB29E',
          400: '#A6836B',
          500: '#835F47',
          600: '#644431',
          700: '#4A3123',
          800: '#322117',
          900: '#1F140E',
          950: '#120B07',
        },
        roast: {
          gold: '#C5A880',
          bronze: '#9E7246',
          crema: '#DFC4A2',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
