var webpack = require("webpack");

var webpackProduction = new webpack.DefinePlugin({
  "process.env": {
    // This has effect on the react lib size
    "NODE_ENV": JSON.stringify("production")
  }
});
var webpackDeDupe = new webpack.optimize.DedupePlugin();
var webpackMinify = new webpack.optimize.UglifyJsPlugin();

module.exports.getConfig = function (type) {

  var isDev = type === 'development';

  var config = {
    entry: __dirname + '/app/scripts/app.js',
    output: {
      path: __dirname,
      filename: 'app.js'
    },
    debug: isDev,
    module: {
      loaders: [{
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }]
    },
    plugins: []
  };

  if (isDev) { // Development build
    config.devtool = 'eval';
  } else { // Production build
    config.devtool = 'cheap-module-source-map';
    config.plugins = [webpackProduction, webpackDeDupe, webpackMinify];
  }

  return config;

}
