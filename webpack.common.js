const path = require('path');
// 默认生成 index.html 文件 
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 用于 每次构建前清理/删除 /dist 文件夹
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports =   {
//   console.log('env.production = ' + env.production);
//   console.log('argv.mode = ' + argv.mode);
//   console.log('this.mode = ' + this.mode)
//  return {
  // context: path.resolve(__dirname, 'src'),
  entry: {
    app: './src/main.js',
  } ,

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      
      // 它会应用到普通的 `.js` 文件
      // 以及 `.vue` 文件中的 `<script>` 块
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },

      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[ext]',
            }
          }
        ]
      },

      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          name: 'font/[hash].[ext]'
        }
      },
    ]
  },

  plugins: [

    new VueLoaderPlugin(),

    new CleanWebpackPlugin(['dist']),

    new HtmlWebpackPlugin({ 
      favicon: './src/assets/img/favicon.ico',
      template: './public/index.html'
    }),

  ]
}
// }