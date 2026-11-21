import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg, #08080a)',
        surface: 'var(--color-surface, #111115)',
        'surface-2': 'var(--color-surface-2, #191920)',
        'surface-3': 'var(--color-surface-3, #24242e)',
        'card-bg': 'var(--color-card-bg, rgba(19, 19, 28, 0.95))',
        'accent-veil': 'var(--color-accent-veil, rgba(147, 27, 38, 0.06))',
        'card-border': 'var(--color-card-border, rgba(255, 255, 255, 0.12))',
        line: 'var(--color-line, rgba(255, 255, 255, 0.08))',
        'line-strong': 'var(--color-line-strong, rgba(255, 255, 255, 0.16))',
        accent: 'var(--color-accent, #931b26)',
        'accent-dim': 'var(--color-accent-dim, #68131b)',
        'accent-bright': 'var(--color-accent-bright, #b32230)',
        'accent-glow': 'var(--color-accent-glow, rgba(147, 27, 38, 0.45))',
        'accent-subtle': 'var(--color-accent-subtle, rgba(147, 27, 38, 0.15))',
        'on-accent': '#ffffff',
        text: 'var(--color-text, #fafafa)',
        'text-muted': 'var(--color-text-muted, #8e8e99)',
        pr: 'var(--color-pr, #eab308)',
      },
      boxShadow: {
        card: '0 8px 32px var(--color-card-shadow, rgba(0, 0, 0, 0.4))',
      },
      borderRadius: {
        card: '20px',
        sheet: '28px',
        ctl: '12px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.08)', opacity: '0.85' },
        },
        'subtle-float': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -4px, 0)' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'radar': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'shimmer': {
          '0%': { transform: 'translate3d(-100%, 0, 0)' },
          '100%': { transform: 'translate3d(200%, 0, 0)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s infinite ease-in-out',
        'subtle-float': 'subtle-float 4s infinite ease-in-out',
        'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'radar': 'radar 8s linear infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      }
    },
  },
  plugins: [
    tailwindcssAnimate,
  ],
}
