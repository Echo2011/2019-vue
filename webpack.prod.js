const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = merge(common, {

  mode: 'production',

  // devtool: 'cheap-module-source-map', // source-map 
  output: {    
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[chunkhash:8].js',
    chunkFilename: 'js/[name].[chunkhash:8].js',
  },
  
  optimization: {
    runtimeChunk: 'single', // 设置为 single，就能创建单个运行时 bundle(one runtime bundle)：
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
      }
    },
    minimizer: [
      new OptimizeCSSAssetsPlugin({})
    ]
  },

  module: {
    rules: [
      // 它会应用到普通的 `.css` 文件
      // 以及 `.vue` 文件中的 `<style>` 块
      {
        test: /\.css$/,
        // exclude: /node_modules/,   //remove this line
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]              
      },

      {
        test: /\.less$/,
        exclude: /node_modules/,   //remove this line
        use: [
          // 'vue-style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
        ],        
      },

    ]
  },

  plugins: [
    new webpack.HashedModuleIdsPlugin(), // 该插件会根据模块的相对路径生成一个四位数的hash作为模块id, 建议用于生产环境。 vendor hash 都应该保持一致, 没有做修改的文件打包后的ｈａｓｈ值保持不变
    new UglifyJSPlugin({
      sourceMap: true
    }),

    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "css/[name].[chunkhash:8].css",
      chunkFilename: "css/[name].[chunkhash:8].css"
    })

  ]
})

