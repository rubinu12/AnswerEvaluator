import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme' // Import the default theme

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // [FIX] Add the new 'xs' breakpoint here
      screens: {
        'xs': '375px',
        // This keeps all of the other default breakpoints like sm, md, lg, etc.
        ...defaultTheme.screens,
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/typography'),
  ],
}
export default config;