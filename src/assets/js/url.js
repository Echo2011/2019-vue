import Vue from 'vue'
// import axios from 'axios'
// Vue.prototype.$axios = axios
import Common from './common.js' //

const url = {

  "login": "/api/auth/login", // 登录  ok
  "logout": "/api/auth/logout", // 退出  ok
  "nodeOverview": "/api/node", // overview 节点概况  ok
  "nodeLatest2": "/api/node/nodes?latest=2", // 最近操作的2个节点 ok
  "nodeList": "/api/node/nodes", // 节点列表 ok
  "nodeGetauto": "/api/node/nodes", // get 获取配置好的节点信息 ok
  "nodePostauto": "/api/node/nodes", // post 提交自动添加的节点 ok
  "nodeGetautoCurrstate": `/api/node/nodes?timer=AAA`, // 定时器获取节点状态

}


export default url;



