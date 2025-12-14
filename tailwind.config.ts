import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Satoshi', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#0A0C0D',
        surface: '#111416',
        accent: {
          DEFAULT: '#00F5D4',
          soft: '#4BE5D2',
          glow: '#00FFC8',
        },
        text: {
          primary: '#E8E8E8',
          secondary: '#A0A0A0',
          disabled: '#585858',
        },
        tf: {
          bg: '#07090a',
          surface: '#0f1112',
          teal: '#00ffc8',
          cyan: '#00d2ff',
          neon: '#00ffea',
          red: '#ff004c',
          text: '#e8f9f9',
          muted: '#8a9b9c',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(0,245,212,0.30)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'wave-animation': {
          '0%, 100%': { height: '4px' },
          '50%': { height: '20px' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 100%' },
          '50%': { backgroundPosition: '100% 0%' },
        },
        rimSweep: {
          '0%': { boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
          '50%': { boxShadow: '0 0 48px 2px rgba(0,255,200,0.25)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s infinite',
        'wave-animation': 'wave-animation 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        gradientShift: 'gradientShift 8s ease-in-out infinite',
        rimSweep: 'rimSweep 10s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
