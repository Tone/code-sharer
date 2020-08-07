module.exports = {
  purge: ['components/**/*.{js,ts,jsx,tsx}', 'pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    inset: {
      '20': '20px'
    }
  },
  variants: {
    appearance: ['responsive', 'hover', 'focus']
  },
  plugins: []
}
