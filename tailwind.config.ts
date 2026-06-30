import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vigil: {
          ink: '#0F172A',
          blue: '#2563EB',
          'blue-light': '#EFF6FF',
          cloud: '#F8FAFC',
          muted: '#64748B',
        },
        status: {
          missing: '#DC2626',
          'missing-bg': '#FEF2F2',
          alive: '#16A34A',
          'alive-bg': '#F0FDF4',
          deceased: '#475569',
          'deceased-bg': '#F1F5F9',
          unverified: '#D97706',
          'unverified-bg': '#FFFBEB',
        },
        seismic: {
          minor: '#22C55E',
          light: '#F59E0B',
          moderate: '#F97316',
          strong: '#EF4444',
          major: '#7C3AED',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-geist-sans)', 'Geist', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Geist Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        badge: '100px',
      },
    },
  },
  plugins: [],
}
export default config
