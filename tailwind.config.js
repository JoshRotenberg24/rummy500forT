/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          purple: '#a855f7',
          blue: '#3b82f6',
          pink: '#ec4899',
          red: '#f87171',
          teal: '#34d399',
        },
        card: {
          face: '#1e1b4b',
          bg: '#0a0a1a',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      boxShadow: {
        'neon-purple': '0 0 8px rgba(168, 85, 247, 0.6), 0 0 20px rgba(168, 85, 247, 0.3)',
        'neon-blue': '0 0 8px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.3)',
        'neon-red': '0 0 8px rgba(248, 113, 113, 0.8), 0 0 20px rgba(248, 113, 113, 0.4)',
        'neon-teal': '0 0 8px rgba(52, 211, 153, 0.8), 0 0 20px rgba(52, 211, 153, 0.4)',
      },
    },
  },
  plugins: [],
}
