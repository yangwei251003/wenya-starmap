/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'mobile': { 'max': '767px' },
        'tablet': { 'min': '768px', 'max': '1023px' },
        'desktop': { 'min': '1024px' },
      },
      colors: {
        // 嫩芽成长主题色彩
        sprout: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // 璀璨繁星主题色彩
        star: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // 深空背景色
        cosmos: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'touch': '44px',
        'mobile-screen': '100vh',
        'mobile-content': 'calc(100vh - 64px - 80px)', // 减去顶部和底部导航
      },
      maxWidth: {
        'mobile': '100vw',
        'mobile-content': 'calc(100vw - 2rem)',
      },
      animation: {
        'sprout-grow': 'sproutGrow 2s ease-out',
        'star-twinkle': 'starTwinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'mobile-slide-up': 'mobileSlideUp 0.3s ease-out',
        'mobile-slide-down': 'mobileSlideDown 0.3s ease-out',
        'mobile-fade-in': 'mobileFadeIn 0.3s ease-out',
      },
      keyframes: {
        sproutGrow: {
          '0%': { transform: 'scale(0) translateY(20px)', opacity: '0' },
          '50%': { transform: 'scale(0.8) translateY(10px)', opacity: '0.7' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        starTwinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        mobileSlideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        mobileSlideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        mobileFadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}