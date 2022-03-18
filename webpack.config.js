const { resolve } = require('path')

module.exports = {
  entry: './src/mtfunit.js',
  output: {
    filename: 'mtfunit.js',
    path: resolve('dist'),
    library: 'mtfUnit',
    libraryTarget: 'umd',
    globalObject: 'this',
    environment: {
      arrowFunction: false,
      bigIntLiteral: false,
      const: false,
      destructuring: false,
      dynamicImport: false,
      forOf: false,
      module: false,
    }
  },
  resolve: {
    fallback: { 'url': require.resolve('url/') }
  },
  mode: 'production',
  module: {
    rules: [{
      test: /\.js$/,
      include: resolve('src'),
      use: [
        'thread-loader',
        {
          loader: 'babel-loader?cacheDirectory',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [['@babel/plugin-transform-runtime', { corejs: 3 }], "@babel/plugin-transform-modules-umd"]
          }
        }
      ]
    }]
  }
}
