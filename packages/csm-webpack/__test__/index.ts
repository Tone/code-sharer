import webpack from 'webpack'

import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const HtmlWebpackPlugin = require(webpack-html3')

import { CSMServiceWebpackPlugin } from '../src'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const WebpackDevServer = require('webpack-dev-server')

const compiler = webpack({
  mode: 'development',
  entry: path.join(__dirname, './test_source.js'),
  output: {
    path: path.join(__dirname, './dist'), // string
    filename: 'bundle.js' // string
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new CSMServiceWebpackPlugin({
      exec: path.join(process.cwd(), '../../', 'node_modules', '@tone./csm-ui')
    })
  ]
})

const server = new WebpackDevServer(compiler, {
  open: true,
  stats: {
    colors: true
  }
})

server.listen(8080, '127.0.0.1', () => {
  console.log('Starting server on http://localhost:8080')
})
