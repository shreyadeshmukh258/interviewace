/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#4F46E5', 50: '#EEF2FF', 100: '#E0E7FF', 600: '#4F46E5', 700: '#4338CA' },
        secondary: { DEFAULT: '#8B5CF6', 50: '#F5F3FF', 100: '#EDE9FE' },
        accent: { DEFAULT: '#06B6D4', 50: '#ECFEFF' },
        surface: '#F8FAFC',
        success: '#22C55E',
        danger: '#EF4444',
        ink: { DEFAULT: '#0F172A', soft: '#475569', mute: '#94A3B8' },
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
      borderRadius: { xl2: '20px', xl3: '24px' },
      boxShadow: {
        glass: '0 1px 2px rgba(79,70,229,.04), 0 12px 32px -12px rgba(79,70,229,.14)',
        lift: '0 1px 2px rgba(79,70,229,.06), 0 20px 40px -16px rgba(79,70,229,.28)',
      },
      keyframes: {
        drift: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(40px,-30px) scale(1.12)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: { drift: 'drift 14s ease-in-out infinite', 'drift-slow': 'drift 22s ease-in-out infinite reverse' },
    },
  },
  plugins: [],
};
