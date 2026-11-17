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
        bg: '#09090b',
        surface: '#121215',
        'surface-2': '#1c1c21',
        'surface-3': '#25252b',
        line: 'rgba(255, 255, 255, 0.08)',
        'line-strong': 'rgba(255, 255, 255, 0.16)',
        accent: '#ccff00',
        'accent-dim': '#a8d400',
        'on-accent': '#09090b',
        text: '#fafafa',
        'text-muted': '#8e8e99',
        pr: '#eab308',
      },
      borderRadius: {
        card: '20px',
        ctl: '14px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
