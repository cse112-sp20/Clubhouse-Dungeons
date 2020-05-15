const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    login: './src/login/login.js',
    popup: './src/popup.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin(
      [
        { from: 'src/login/login.html', to: '' },
        { from: 'src/popup.html', to: '' },
        { from: 'src/popup.css', to: '' }
      ]
    )
  ]
}