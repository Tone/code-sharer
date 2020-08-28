module.exports = {
  purge: [
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    inset: {
      0: 0,
      auto: 'auto',
      '20': '20px',
      '10': '10px',
      '1/2': '50%'
    }
  },
  variants: {
    display: ['responsive', 'group-hover'],
    opacity: ['responsive', 'group-hover']
  },
  plugins: []
}
