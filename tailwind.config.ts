import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 自定义暗色主题颜色
        dark: {
          bg: '#0f1419',
          card: '#1a1f26',
          border: '#2d333b',
          text: '#c9d1d9',
          muted: '#8b949e',
        }
      },
    },
  },
  plugins: [],
}

export default config
