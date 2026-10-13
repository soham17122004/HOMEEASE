/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#FFFFFF',
          subtle: '#F7F8FA',
          text: '#22252B',
          muted: '#666D78',
          border: '#E6E8EC',
          primary: '#176B52',
          'primary-hover': '#135742',
          'primary-light': '#F0F7F4',
        },
        brand: {
          50: '#F0F7F4',
          100: '#E1EFEA',
          200: '#C2DFD5',
          300: '#95C7B7',
          400: '#5BA891',
          500: '#176B52', // Strict primary accent #176B52
          600: '#135742',
          700: '#0F4434',
          800: '#0C3529',
          900: '#22252B', // Strict primary dark text #22252B
          primary: '#176B52',
          dark: '#22252B',
          navy: '#22252B',
          accent: '#176B52',
        },
        surface: {
          ground: '#F7F8FA', // Secondary background
          card: '#FFFFFF',
          subtle: '#F7F8FA',
          border: '#E6E8EC', // Strict borders
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'elevated': '0 4px 12px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
