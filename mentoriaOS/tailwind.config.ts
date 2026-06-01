import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#3b82f6',
        'accent-light': '#60a5fa',
        // Accent dinâmico white-label — injetado via --ck-accent no wrapper do dashboard
        'ck-accent': 'var(--ck-accent, #00d68f)',
        'ck-accent-2': 'var(--ck-accent-2, #4c9aff)',
        // Paleta CKlareza (espelha utils/theme.ts para uso em classes Tailwind)
        ck: {
          bg: '#0c1c2c',
          card: '#0f2540',
          card2: '#112a4a',
          input: '#0a1628',
          border: '#1e3a5f',
          muted: '#4d7fa8',
          green: '#00d68f',
          blue: '#4c9aff',
          amber: '#f59e0b',
          red: '#f05252',
          violet: '#a78bfa',
          gold: '#d4af37',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInLeft: {
          'from': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        scaleIn: {
          'from': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        glow: {
          '0%, 100%': {
            'box-shadow': '0 0 20px rgba(59, 130, 246, 0.5)',
          },
          '50%': {
            'box-shadow': '0 0 40px rgba(59, 130, 246, 0.8)',
          },
        },
        'pulse-slow': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.7',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
      },
    },
  },
  plugins: [],
}
export default config
