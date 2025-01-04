/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'bg': "url('/assets/bg.png')",
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: []
  },
}

