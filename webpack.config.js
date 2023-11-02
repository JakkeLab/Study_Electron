const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/browser/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '/output'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      { //https://webpack.js.org/loaders/css-loader/
        test: /\.css$/, 
        loader: "css-loader",
        options: {
            url: false,
        }
      } 
    ],
  },
  
  plugins: [new webpack.ProgressPlugin(), new CleanWebpackPlugin()],
};