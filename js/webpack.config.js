var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    'babel-polyfill',
    './src/render_svg.js'
  ],
  output: {
    filename: 'bundle.js',
    publicPath: path.resolve(__dirname),
    path: path.resolve(__dirname, 'public', 'dist')
  },
  devtool: 'source-map',
  devServer: {
    contentBase: path.resolve(__dirname, 'public')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        enforce: "post",
        loader: "jshint-loader"
      }
    ],
    loaders: [
      {
        loader: "babel-loader",

        // Skip any files outside of your project's `src` directory
        include: [
          path.resolve(__dirname, "src"),
        ],
        exclude: [
            path.resolve(__dirname, "node_modules"),
        ],
        // Only run `.js` and `.jsx` files through Babel
        test: /\.jsx?$/,

        // Options to configure babel with
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015'],
        }
      }
    ]
  }
};
