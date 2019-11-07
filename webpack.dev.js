const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {  

  // 设置开发模式(development mode)，来确保 bundle 是压缩过的(minified)
  mode: "development",
  
  // 追踪错误和警告,将编译后的代码映射回原始源代码
  devtool: 'inline-source-map',

  output: {    
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
  },
  
  devServer: { // 告诉开发服务器(dev server),在哪里查找文件
    contentBase: './dist',
    host: '0.0.0.0', // 外部访问本机服务器时，需设置此
    port: 8091,
  },

  module: {
    rules: [
      // 它会应用到普通的 `.css` 文件
      // 以及 `.vue` 文件中的 `<style>` 块
      {
        test: /\.css$/,
        // exclude: /node_modules/,   //remove this line
        use: [
          'style-loader',
          'css-loader'
        ]              
      },

      {
        test: /\.less$/,
        exclude: /node_modules/,   //remove this line
        use: [
          // 'vue-style-loader',
          'style-loader',
          'css-loader',
          'less-loader',
        ],        
      },

    ]
  },

});