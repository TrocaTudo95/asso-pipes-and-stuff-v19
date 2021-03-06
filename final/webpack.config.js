const path = require('path');

module.exports = {
  entry: {
    './modules/conversion/index': './src/modules/conversion/index.ts',
    './modules/arithmetic-logic/index': './src/modules/arithmetic-logic/index.ts',
    './modules/text/index': './src/modules/text/index.ts',
    './modules/hashing-encryption/index': './src/modules/hashing-encryption/index.ts'
  },
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
};
