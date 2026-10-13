/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mp: {
          bg: '#111311',
          'bg-secondary': '#151713',
          card: '#1A1D19',
          elevated: '#22251F',
          lime: '#C6FF3D',
          orange: '#FF7138',
          'text-primary': '#F3F0E8',
          'text-secondary': '#A5A89F',
          'text-muted': '#777C72',
          border: '#353830',
          grid: '#292D27',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'lime-glow': '0 0 20px -3px rgba(198, 255, 61, 0.22)',
        'orange-glow': '0 0 20px -3px rgba(255, 113, 56, 0.22)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.6)',
        'modal': '0 10px 40px -5px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
}
