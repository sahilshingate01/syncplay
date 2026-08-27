/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F6F7FB',
        sidebar: '#FFFFFF',
        card: '#FFFFFF',
        borderSubtle: 'rgba(20, 20, 30, 0.06)',
        borderHover: 'rgba(20, 20, 30, 0.12)',
        primaryText: '#181826',
        secondaryText: '#64748B',
        mutedText: '#94A3B8',
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        pastel: {
          peach: '#FFF1EC',
          peachBorder: '#FED7C9',
          lavender: '#F1EFFE',
          lavenderBorder: '#DDD7FE',
          mint: '#ECFDF5',
          mintBorder: '#A7F3D0',
          blue: '#EFF6FF',
          blueBorder: '#BFDBFE',
          amber: '#FFFBEB',
          amberBorder: '#FDE68A',
        }
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(28, 25, 43, 0.04), 0 2px 6px -1px rgba(28, 25, 43, 0.02)',
        'soft-md': '0 8px 30px -4px rgba(28, 25, 43, 0.06), 0 4px 12px -2px rgba(28, 25, 43, 0.03)',
        'soft-lg': '0 16px 40px -6px rgba(28, 25, 43, 0.08), 0 6px 16px -2px rgba(28, 25, 43, 0.04)',
        'glow-purple': '0 0 25px rgba(139, 92, 246, 0.35)',
        'glow-mint': '0 0 20px rgba(16, 185, 129, 0.25)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
