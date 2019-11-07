import { Message } from 'element-ui';
import { m as en } from './lang/en-US.js';
import { m as zh } from './lang/zh-CN.js';

import Vue from 'vue'

let bus2 = new Vue(); // 公共组件， 

let lang, localLang = localStorage.getItem("locale")?localStorage.getItem("locale"):'zh-CN'; //
if(localLang == 'zh-CN'){
  lang = zh;
}else if(localLang == 'en-US') {
  lang = en;
}

// 获取 cookie 里某一键的值
function getCookies(key){  
  var cookies = document.cookie.split(';');  // 字符串分割成数组
  var result = {};

  for(var i = 0; i < cookies.length; i++){
      var  keyvaluepair = cookies[i].split('=');
      result[keyvaluepair[0].trim()] = keyvaluepair[1];
  }
  return result[key];
};

// 获取 url 后面的参数
function getUrlParam(key){
  // sdkjflsdkfj?operation=create&zoneName=ddd
  if(window.location.href.indexOf('?') >0){
    var params = window.location.href.split("?")[1].split("&"); // 分割成字符串
    var result = {};
    for(var i = 0; i < params.length; i++){
      var  keyvaluepair = params[i].split('=');
      result[keyvaluepair[0].trim()] = keyvaluepair[1];
    }
    return result[key];
  }else{
    return '';
  }  
};

// 刷新时 清空存储的定时器错误码
window.onunload = function (e) {
  sessionStorage.removeItem('messageTex');
};

// 显示错误码
/**
 * 
 * @param {*} data 
 * @param {*} where 三种情况，1，不传，普通错误提示， 2. 传'license'，是否激活，需要弹出dislog框，不做错误提示； 3. 传'interal'，定时器请求，错误提示只发一次；
 */
function errorMsg(data,where){
  /**
    data 数据结构
    {
      "message": "",
      "messageParams": [],
      "success": false,
      "license": {  // 不一定会有这个字段
        "licenseStatus": 1,
        "finalUser": "",
        "serialNum": "",
        "expireDate": ""
      }
    }
  */
    
  // 系统是否激活
  if(!data.success && data.license && data.license.licenseStatus!=='undefined' && data.license.licenseStatus !== 2 && data.license.licenseStatus !== 0){ //   触发 TheHeading.vue 中 dialog， 显示 激活 按钮
    bus2.$emit('licenseResponse');
  }
  if(where==='license'){ // 来自 license，不做错误提示，且跳出
    return false;
  }
  
  let messageTex = data.message || 'default',
  messageParams = data.messageParams || [];
  // 如果 翻译信息里有对应的错误码，做翻译
  if(lang.responseErrorMessage[messageTex]){
    messageTex = lang.responseErrorMessage[messageTex];
  }

  if(where==='interval'){　// 如果是　定时器　发出的请求    
      /**
     * 避免 当定时器 如果出现错误码时， 会不停地弹出 错误提示
     * 存储”错误码“到 sessionStorage 里， 存成数组（暂停 .length=4）， 因为可能会一个页面多个定时器同时弹出错误提示
     * 为什么没有存在 localStorage， 因为可能同一个页面多个tab 打开，公用会出现一个页面不弹出提示的现象
     */
    // 获取， 转成对象

    

    let arrMsg = JSON.parse(sessionStorage.getItem('messageTex')) || [];
    let isEqual = arrMsg.some((ele,index, array) => {
        return ele == messageTex;
    })
    if(isEqual){ // 如果错误码里有相同的错误提示，则不再提示错误信息
      return false;
    }else{
      arrMsg.push(messageTex); // 追加
      arrMsg = arrMsg.slice(-2); // 始终保持 2 个，当页面里有2个定时器交替错误时，仍可行，但是当多于2个，没有考虑
      sessionStorage.setItem('messageTex',JSON.stringify(arrMsg)); // 存入
    }
  }


  // 替换变量  
  if(messageTex.includes('%s1')){
    messageTex = messageTex.replace(/%s1/,messageParams[0]);
    messageTex = messageTex.replace(/%s2/,messageParams[1]);
  }else{
    messageTex = messageTex.replace(/%s/,messageParams.join(','));
  }
  
  // 调用
  Message({
    showClose: true,
    message: messageTex,
    type: 'error',
    duration: 0,
  });
};

function errorMessage(messageTex,messageParams,interval){
  // return false;  // 此函数弃用，使用上面的 errorMsg()
  /**
    "us-10006": "User is not signed in", // 用户未登录
    "us-10007": "Token is expired, please sign in again", //登陆超时，请重新登录
    "us-10008": "Authentication failed, please sign in", // 认证失败，请登录
   */
  // 当返回这三条错误码时，在　localStorage 里　needSignIn 设置未　‘yes’, 在　ｈｅａｄｅｒ中出现　登录　按钮文字，
  // 在登录成功后，清空/删除　needSignIn
  // var arrNeedSignIn = ["User is not signed in","用户未登录","Token is expired, please sign in again","登陆超时，请重新登录", "Authentication failed, please sign in","认证失败，请登录"];
  // arrNeedSignIn.forEach(ele => {
  //   if(messageTex == ele){
  //     localStorage.setItem('needSignIn','yes');
  //     return false;
  //   }
  // })
  
  // 系统未激活，不算错误，因此拦截 le_10006
  // if(messageTex.includes('system is not actived') || messageTex.includes('系统未激活')){
  //   return false;
  // }

  // 如果 翻译信息里没有对应的错误码，就不做翻译
  if(messageTex.includes('m.responseErrorMessage.')){
    messageTex = messageTex.split('m.responseErrorMessage.')[1];
  }

  if(interval){　// 如果是　定时器　发出的请求    
      /**
     * 避免 当定时器 如果出现错误码时， 会不停地弹出 错误提示
     * 存储”错误码“到 sessionStorage 里， 存成数组（暂停 .length=4）， 因为可能会一个页面多个定时器同时弹出错误提示
     * 为什么没有存在 localStorage， 因为可能同一个页面多个tab 打开，公用会出现一个页面不弹出提示的现象
     */
    // 获取， 转成对象

    // 刷新时 清空
    window.onunload = function (e) {
      sessionStorage.removeItem('messageTex');
    };

    var arrMsg = JSON.parse(sessionStorage.getItem('messageTex')) || [];
    // console.log(arrMsg);
    
    // 循环数组 arrMsg， 查看是否已经存在 
    var isEqual = arrMsg.some((ele,index, array) => {
        return ele == messageTex;
    })
    // console.log(isEqual);
    if(isEqual){
      // 有相等的
      return false; // 退出该函数， 不再弹出提示框
    }else{
      arrMsg.push(messageTex); // 追加
      // console.log('enter',arrMsg);
      
      arrMsg = arrMsg.slice(-2); // 始终保持 2 个
      sessionStorage.setItem('messageTex',JSON.stringify(arrMsg)); // 存入
    }
  }


  // 
  messageParams = messageParams || [];
  if(messageTex.includes('%s1')){
    messageTex = messageTex.replace(/%s1/,messageParams[0]);
    messageTex = messageTex.replace(/%s2/,messageParams[1]);
  }else{
    messageTex = messageTex.replace(/%s/,messageParams.join(','));
  }
  
  // 调用
  Message({
    showClose: true,
    message: messageTex,
    type: 'error',
    duration: 0,
  });
}

// 返回 message(用户操作反馈信息)　停留时间的长短
const messageDuration = 3000; // 毫秒，　０－》不会自动消失



export default  {
  getCookies,
  getUrlParam,
  errorMessage,
  errorMsg,
  messageDuration,
  bus2
}