import Vue from 'vue';
import Vuex from 'vuex';
// import axios from 'axios';
// import Lib from "../../assets/js/Lib";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    imagePageLoading: false, // 镜像下载页面的下载请求是否是正在返回结果
    // imageMakeList:[], // 正在制作列表，包括　正在，　成功，　失败
    imageMakingCount: 0,
    pageName:'',
    userInfoResult: {
      // "id": 1,
      // "username": "xmuukgctlnzhjrrhijcu",
      // "password": "",
      // "email": "123456@123.com",
      // "creator": "",
      // "groupId": "eibqbee",
      // "mobile": "12345678912",
      // "updateTime": "2018-03-12T06:51:33Z",
      // "loginTime": "",
      // "createTime": "2018-03-12T06:51:33Z",
      // "mender": "",
      // "quota": {
      //   "userId": 1,
      //   "cpu": 120,
      //   "gpu": 100,
      //   "dataStorage": "20GB",
      //   "internalMemory": "4000MB",
      //   "taskNumber": "300",
      //   "isDefault": 1
      // },
      // "groupname": "",
      // "volumeName": "",
      // "zoneName": "sss"
    },
    // user: { // 将在登录的时候清空上一次的, 原始接口格式
    //   id: 1,
    //   username: '',// "soelodgpydzpubl",
    //   password: '',// "",
    //   email: '',// "123456@123.com",
    //   creator: '',// "",
    //   groupId: '',// "qktfoc",
    //   mobile: '',// "12345678912",
    //   updateTime: '',// "2018-03-12T06:51:33Z",
    //   loginTime: '',// "",
    //   createTime: '',// "2018-03-12T06:51:33Z",
    //   mender: '',// "",
    //   quota: {
    //     userId: 1,
    //     cpu: 1, // 2,
    //     gpu: 1, // 4,
    //     dataStorage: '',　// "2GB",　// 存储配额
    //     internalMemory: '',　// "4MB", // 内存配额
    //     taskNumber: '',　// "30",　// 任务数量配额
    //     isDefault: 1　
    //   },
    //   groupname: '',// "",
    //   volumeName: '',// "",
    //   zoneName: '',// "zone111"
    // },
    // roles: {　//　对原始接口的格式做了处理 
    //   image: '', // "viewer",
    //   zone: '', // "viewer",
    //   storage: '', // "viewer",
    //   node: '', // "viewer",
    //   job: '', // "viewer",
    //   auth: '', // "viewer"
    // }, 
    // license: {} // 是否激活信息
  },

  // getters: {
  //   makings: state => {
  //     return state.imageMakeList.filter(ele => ele.status!==1);
  //   },

  //   makedFail: state => {
  //     return state.imageMakeList.filter(ele => ele.status==1);
  //   }
  // },

  mutations: {
    imageToChange(state){
      state.imagePageLoading = !state.imagePageLoading;
    },

    imageMaking(state,count){
      state.imageMakingCount = count;
    },

    pageName(state,pageName){
      state.pageName = pageName;
    },

    userInfoResult(state,obj){
      state.userInfoResult = obj;
    },

    rolesInfo(state,obj){
      state.roles = obj;
    },

    // license(state,param){
    //   state.license = param;
    // }

    
  },

  actions: {
    pageNameAction({commit,state},arg){
      commit('pageName',arg);
    },
  }
})

export default store;

