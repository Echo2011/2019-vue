
<template>
    <div class="login">
      <!-- <button @click="$store.commit('increment')">+++</button> -->
        <h1 id="acm_name">
          <img src="../../assets/img/AIMax-login.png"  />
        </h1>
        <div>
            <h2 id="login_h2">{{$t('m.login')}}</h2>
            <div class="inputWrap">
              <span>
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-user"></use>
                </svg>                
              </span><input id="input_username" type="text" @keydown="verifMessIsShow=false" @keyup.enter="login" :placeholder="$t('m.usernamePlaceholder')" v-model="username" autofocus name="username">
            </div>
            <p class="verification" id="text_tip_username" v-show="usernameMessIsShow">{{$t('m.usernamePlaceholder')}}</p>
            <div class="inputWrap">
              <span>
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-mima1"></use>
                </svg>                
              </span><input id="input_password" type="password" @keydown="verifMessIsShow=false" @keyup.enter="login" :placeholder="$t('m.passwordPlaceholder')" v-model="password" name="password">
            </div>
            <p class="verification" id="text_tip_passwrod" v-show="passwordMessIsShow">{{$t('m.passwordPlaceholder')}}</p>
            <p class="verification" id="text_tip_loginmessage"  v-show="verifMessIsShow">
              {{$t('m.loginMessage')}}</p>
            <div class="select-wrap" style="positon:relative">
            <el-select v-model="value" id="select_language" :placeholder="$t('m.pleaseChoose')" @change="changeLang">
                <el-option id="option_language"
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
            </el-select>
            </div>
            <el-button type="primary" class="login-btn" @click="login" id="button_login" :disabled="isDisabled">{{loginText}}</el-button>  
        </div>        
    </div>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
    return {
      username: "",
      password: "",
      usernameMessIsShow: false,
      passwordMessIsShow: false,
      verifMessIsShow: false,
      options: [
        {
          value: "zh-CN",
          label: "中文"
        },
        {
          value: "en-US",
          label: "English"
        }
      ],
      value: "zh-CN", // 语言选项, 对应 options 里的 value 的值, 默认语言为中文
      loginText:'',
      isDisabled: false,
    };
  },
  created() {
    
    this.changeLang();    
  },
  methods: {
    // 切换语言
    changeLang() {
      // 因为把 i18n 挂载在了 vue 实例上， 因此可以这样写
      this.$i18n.locale = this.value; //
     
      localStorage.setItem("locale", this.value); // 把 语言 存到 localeStorage
       
      this.loginText = this.$t('m.login');
    },

    // 登录
    login() {
      // console.log(0);
      if (this.username.trim() == "") {
        this.usernameMessIsShow = true;
        this.verifMessIsShow = false;
        return false;
      } else {
        this.usernameMessIsShow = false;
      }
      if (this.password.trim() == "") {
        this.passwordMessIsShow = true;
        this.verifMessIsShow = false;
        return false;
      } else {
        this.passwordMessIsShow = false;
      }
      
      this.verifMessIsShow = false;
      // 禁止重复点击 登录按钮
      this.loginText = this.$t('m.logging'); // logging in
      this.isDisabled = true;
      this.$axios({
        method: "post",
        url: Lib.API().auth.login, //  "/api/auth/login",
        // url:'http://rap2api.taobao.org/app/mock/2311//api/auth/login',
        data: {
          username: this.username,
          password: this.password
        }
      })
        .then(res => {
          const data = res.data;

          // 登录成功， 1，把用户名存到 cookie 中
          // 2，跳转到集群管理页面
          if (data.success) {
            
            localStorage.clear(); // 清空 所有　本地存储
            localStorage.setItem("locale", this.value); // 把 语言 存到 localeStorage
            // 清空　store　里的　user 数据
            // this.$store.commit('userInfoResult', {});
            
            // 清空　store 里的　roles 数据
            this.$store.commit('rolesInfo',{});

            // 0 删除 localStorage 里存的 jupyter 删除用的
            if(localStorage.getItem('deleteJupyterApi）')){
              localStorage.removeItem('deleteJupyterApi');
            }

            // 把　roles 的值处理后发给　store
            var rolesObj = {};
            rolesObj.image = data.roles.image[0];
            rolesObj.zone = data.roles.zone[0];
            rolesObj.storage = data.roles.storage[0];
            rolesObj.node = data.roles.node[0];
            rolesObj.job = data.roles.job[0];
            rolesObj.auth = data.roles.auth[0];
            rolesObj.dashboard = data.roles.monitor[0];
            this.$store.commit('rolesInfo',rolesObj);

            // 1，  获取用户名，存在 cookie 里
            document.cookie = `username=${this.username};path=/`;
            // localStorage.setItem("username", this.username);         

            // 2，  将 volumeName 存在 storage 里
            localStorage.setItem('volumeName', data.volumeName?data.volumeName:'');
              
            // 3， 清空下载镜像里存的 query 
            localStorage.setItem('imageExternalQuery', '');

            // 4，是否是单机版
            localStorage.setItem('standaloneOrCluster', data.type?data.type:'');

            // 删除 joblist 的查询记录
            localStorage.removeItem(this.username+'formQueryJoblist');
            // 清空　visual list 的查询记录
            localStorage.removeItem('formQueryVisualList');
            localStorage.removeItem('zoneName'); // 把用户绑定的分区名存到 localStorage 里

            // 节点
            if(data.roles.node){
              localStorage.setItem("rolesNode", data.roles.node[0]);              
            }else{
              localStorage.removeItem("rolesNode");
            } 
            // 分区
            if(data.roles.zone){
              localStorage.setItem("rolesZone", data.roles.zone[0]);              
            }else{
              localStorage.removeItem("rolesZone");
            }

            // // 任务
            if(data.roles.job){
              localStorage.setItem("rolesJob", data.roles.job[0]);              
            }else{
              localStorage.removeItem("rolesJob");
            }
            
            // 存储
            if(data.roles.storage){
              localStorage.setItem("rolesStore", data.roles.storage[0]);              
            }else{
              localStorage.removeItem("rolesStore");
            }  
            // 镜像
            if(data.roles.image){
              localStorage.setItem("rolesImage", data.roles.image[0]);
            }else{
              localStorage.removeItem('rolesImage');
            }
            // 权限
            if(data.roles.auth){
              localStorage.setItem("rolesAuth", data.roles.auth[0]);              
            }else{
              localStorage.removeItem("rolesAuth");
            }
            if(data.roles.auth){
              localStorage.setItem("rolesDashboard", data.roles.monitor[0]);              
            }else{
              localStorage.removeItem("rolesDashboard");
            }
            
            // 发送请求，发送 ip ， 不包括 port
            this.$axios       
              .get(Lib.API().auth.serverIP+`?serverIP=${location.hostname}`)
              .then(res => {})

            // 存储 sessionStorage localStorage 用于限制 同一个浏览器里只能同一个用户登录
            localStorage.setItem("user", this.username);
            sessionStorage.setItem("user", this.username);

            // 调取用户详情，存储是否是 超级管理员， 以及 分区名
            this.judgeIsSuper();
            
          } else {
            this.verifMessIsShow = true;
            // 恢复
            this.isDisabled = false;
            this.loginText = this.$t('m.login');
          }
          
        });
        
    },

    judgeIsSuper(){    
      
    // 查询该用户的详情， 看其 creator 是否有值， 如果没有值说明是第一个用户， 即超级管理员
      this.$axios({
        method: 'get',
        url: Lib.API(this.username).auth.userDetail})
        .then(res =>{
          const data = res.data;
          
          if(data.success){
            localStorage.setItem('zoneName',data.result.zoneName||''); // 把分区名存到 localStorage 里
            if(data.result.creator===''){ // 说明是超级管理员
              localStorage.setItem("isSuper", '1');
            }else{
              localStorage.setItem("isSuper", '0');
            }
          }
        // }).finally(() => {
          // 跳转
          this.$router.push({path:'/'});
        })
    },

    
  }
};
</script>

<style lang="less" scoped>
div.inputWrap {
  margin: 25px 0 5px 0;
  // display: flex;
  position: relative;
  span {
    background-color: #f5f7fa;
    display: inline-block;
    border-top: 1px solid #dddddd;
    border-bottom: 1px solid #dddddd;
    border-left: 1px solid #dddddd;
    padding: 0px 20px;
    height: 40px;
    line-height: 40px;
    border-radius: 5px 0 0 5px;
    box-sizing: border-box;
    position: relative;
    z-index: 100;
    svg {
      color: #999999;
    }
  }
  input {
    border: 1px solid #dddddd;
    height: 40px;
    line-height: 40px;
    border-radius: 0px 5px 5px 0px;
    box-sizing: border-box;
    flex-grow: 1;
    padding-left: 15px;
    color: #444444;
    position: absolute;
    right: 0;
    width: 300px;
  }
  input:focus {
    outline: none !important;
    border: 1px solid #80cbdc;
  }
}
.login-btn {
  width: 100%;
  span {
    font-size: 16px;
  }
  
}
body {
  
  display: flex;
  justify-content: center;
  align-items: center;
}
.login h1,
.login h2 {
  text-align: center;
  font-size: 18px;
}
div.login {
  width: 400px;
  margin: 50px auto 0 auto;
  > div {
    background-color: #fff;
    padding: 20px;
    border: 1px solid #cccccc;
    box-shadow: 2px 2px 2px #aaaaaa;
    border-radius: 5px;
    padding-bottom: 40px;
  }
  .el-input {
    margin: 12px 0;
  }
  .two-input {
    margin-bottom: 0;
    color: 1px solid red;
  }
  .select-wrap {
    text-align: right;
    margin:15px 0;
    .el-select {
      width: 130px;
      color: #999999;
    }
    .el-input {
      margin: 0;
    }
    .el-input .el-input__inner:not(.is-disabled) {
      border-color: #ffffff !important;
    }

    .el-select .el-input.is-focus .el-input__inner {
      border-color: #ffffff !important;
    }
  }
}
.el-popper[x-placement^="bottom"] .popper__arrow {
  display: none !important;
}
p.verification {
  color: #e74a4a;
  font-size: 13px;
  margin: 0;
  padding: 0;
}
</style>



