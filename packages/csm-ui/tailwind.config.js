module.exports = {
  purge: ['components/**/*.{js,ts,jsx,tsx}', 'pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    inset: {
      0: 0,
      auto: 'auto',
      '20': '20px',
      '1/2': '50%'
    }
  },
  variants: {
    display: ['responsive', 'group-hover'],
    opacity: ['responsive', 'group-hover']
  },
  plugins: []
}
