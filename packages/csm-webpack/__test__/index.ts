import webpack from 'webpack'

import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

import CSMServiceWebpackPlugin from '../src'

const compiler = webpack({
  mode: 'development',
  entry: path.join(__dirname, './test_source.js'),
  output: {
    path: path.join(__dirname, './dist'), // string
    filename: 'bundle.js' // string
  },
  plugins: [
    new CSMServiceWebpackPlugin({
      exec: path.join(process.cwd(), '../../', 'node_modules', '@tone./csm-ui')
    }),
    new HtmlWebpackPlugin()
  ]
})

compiler.watch({
  // Example watchOptions
  aggregateTimeout: 300,
  poll: undefined
}, () => { // Stats Object
})
