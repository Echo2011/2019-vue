
import Vue from 'vue'
var bus = new Vue(); // 公共组件， 用于 header 组件控制 nav 组件的宽度

import './filter.js';
import './iconfont.js' // 图标字体库
import Common from './common.js' // 
import URL from './url.js'
// import API from 'assets/js/api.js'
// import './elementui.js' // element 组件
import '../css/layout.less' // element css文件

// [[============== axios + api ==================
import mock from './api/mock.js';
import real from './api/real.js';

var API;
if(process.env.NODE_ENV == 'production'){
  API = real;
}else if(process.env.NODE_ENV == 'development') {
  API = mock;
}
// ============== axios + api ==================]]

export default {
  URL,
  API,
  Common,
  bus,
}
