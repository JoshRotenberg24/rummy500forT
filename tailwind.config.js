/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Balatro-inspired warm, vibrant color palette
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#f97316',  // Main gold accent
          600: '#ea580c',
          700: '#dc2626',
          800: '#b91c1c',
          900: '#7c2d12',
        },
        gameAccent: {
          gold: '#D4AF37',      // Primary gold/amber
          purple: '#7C3AED',     // Royal purple
          green: '#10B981',      // Vibrant success green
          orange: '#F97316',     // Bright warning orange
        },
        gameBg: {
          dark: '#0F172A',       // Deep navy background
          card: '#1E293B',       // Card/light background
          warm: '#FFFBEB',       // Warm off-white
        },
        // Keep old neon colors for backward compatibility
        neon: {
          purple: '#7C3AED',
          blue: '#3b82f6',
          pink: '#ec4899',
          red: '#F97316',
          teal: '#10B981',
        },
        card: {
          face: '#1E293B',
          bg: '#0F172A',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      boxShadow: {
        // Gold glow effects
        'glow-gold': '0 0 8px rgba(212, 175, 55, 0.6), 0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-gold-strong': '0 0 12px rgba(212, 175, 55, 0.8), 0 0 30px rgba(212, 175, 55, 0.5)',
        // Purple accent
        'glow-purple': '0 0 8px rgba(124, 58, 237, 0.6), 0 0 20px rgba(124, 58, 237, 0.3)',
        // Green success
        'glow-green': '0 0 8px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.4)',
        // Orange warning
        'glow-orange': '0 0 8px rgba(249, 115, 22, 0.8), 0 0 20px rgba(249, 115, 22, 0.4)',
        // Neon shadows for backward compatibility
        'neon-purple': '0 0 8px rgba(124, 58, 237, 0.6), 0 0 20px rgba(124, 58, 237, 0.3)',
        'neon-blue': '0 0 8px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.3)',
        'neon-red': '0 0 8px rgba(249, 115, 22, 0.8), 0 0 20px rgba(249, 115, 22, 0.4)',
        'neon-teal': '0 0 8px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.4)',
      },
    },
  },
  plugins: [],
}
