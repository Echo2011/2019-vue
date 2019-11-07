import Vue from 'vue';
import App from './App.vue';
import router from './router.js';
import VueI18n from 'vue-i18n'
import axios from 'axios'
import Lib from './assets/js/Lib.js'
import ElementUI from 'element-ui';
import './assets/css/theme/index.css';
import store from './store.js';

Vue.use(VueI18n);
Vue.use(ElementUI);

const i18n = new VueI18n({
    messages :{
        'zh-CN': require('./assets/js/lang/zh-CN.js'), // 中文语言包
        'en-US': require('./assets/js/lang/en-US.js')
    },
})


// 将 axios 添加到 Vue.prototype 中
axios.defaults.withCredentials = true;
Vue.prototype.$axios = axios

// 请求拦截器
axios.interceptors.request.use(function (config) {
  
  // 当同一个浏览器，2个用户登录时，前一个用户踢到登录页 
  if ((config.url != '/api/auth/login') && (sessionStorage.getItem("user")) && (localStorage.getItem("user") !== sessionStorage.getItem("user"))) {
      // this.$axios.get(Lib.API().auth.logout)　// ？ 不能在此发退出请求，session值带的是第二个用户的
      router.push({path:'/login'});
    }
    return config;
  }, function (error) {
    return Promise.reject(error);
});

// 响应拦截器
axios.interceptors.response.use(function (response) {

  // 系统是否激活，弹出 dialog 框
  if(!response.data.success && !response.config.url.includes('/api/auth/login')){ // 错误码,过滤登录请求
    Lib.Common.errorMsg(response.data,'license');
  }

  return response;
}, function (error) {
  // 错误处理
  if(error.response.status === 401){ // 未授权，长时间未进行任何操作
    // 跳到登录页面
    router.push({path:'/login'});
  }
  return Promise.reject(error);
});

new Vue({
  store,
  router: router, // 使用路由
  i18n: i18n,
  render: h => h(App) // render 函数
}).$mount('#app'); 
// 挂载到 #app (会替换 #app)

/**
渲染函数
该渲染函数接收一个 createElement 方法作为第一个参数用来创建 VNode。
如果组件是一个函数组件，渲染函数还会接收一个额外的 context 参数，为没有实例的函数组件提供上下文信息。

render : function(x){
  --------
  return x;
}

*/