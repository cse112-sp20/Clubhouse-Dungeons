const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    login: './src/login/login.js',
    popup: './src/popup.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../../dist')
  },
  plugins: [
    new CopyPlugin(
      [
        { from: 'test/puppeteer/manifest.json', to: '' },
        { from: 'src/login/login.html', to: '' },
        { from: 'src/popup.html', to: '' },
        { from: 'src/popup.css', to: '' },
        { from: 'src/images', to: 'images' }
      ]
    )
  ]
}
