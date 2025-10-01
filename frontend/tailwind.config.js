/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom manga-themed color palette
        bittersweet: {
          50: '#fff5f5',
          100: '#ffe8e6',
          200: '#ffd5d2',
          300: '#ffb3ae',
          400: '#ff8a82',
          500: '#ff6e61', // Main bittersweet
          600: '#e55a4f',
          700: '#cc4a3f',
          800: '#b33a2f',
          900: '#9a2a1f',
        },
        scampi: {
          50: '#f8f7fc',
          100: '#f1eff9',
          200: '#e2ddf3',
          300: '#d3cbee',
          400: '#c4b9e8',
          500: '#6b5b95', // Main scampi
          600: '#5f4f85',
          700: '#534375',
          800: '#473765',
          900: '#3b2b55',
        },
        cucumber: {
          50: '#f6faf0',
          100: '#edf5e1',
          200: '#dbebc3',
          300: '#c9e1a5',
          400: '#b7d787',
          500: '#87af4b', // Main chelsea cucumber
          600: '#799d43',
          700: '#6b8b3b',
          800: '#5d7933',
          900: '#4f672b',
        },
        azalea: {
          50: '#fefdfd',
          100: '#fdfbfb',
          200: '#fbf7f7',
          300: '#f9f3f3',
          400: '#f7efef',
          500: '#f7cbca', // Main azalea
          600: '#dfb7b6',
          700: '#c7a3a2',
          800: '#af8f8e',
          900: '#977b7a',
        },
        polo: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e3eaf3',
          300: '#d5deed',
          400: '#c7d2e7',
          500: '#93a9d2', // Main polo blue
          600: '#8498bd',
          700: '#7587a8',
          800: '#667693',
          900: '#57657e',
        },
        // Keep some grays for neutral elements
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
