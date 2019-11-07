<template>
  <header>
    

    <div class="logo">
      <span  @click="changeNavWidth" id="header_showhidden_nav">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-menu2"></use>
        </svg>
      </span>      
      <h1 id="header_acm_name">
        <router-link to="/">
          <img src="../assets/img/AIMax-header.png"  />
        </router-link>
      </h1>
    </div>
    <div :class="{'pagename-logout':true,'is-nodedetail':isNodeDetail}">    
      <div class="page-name">{{ pageName }}</div>
      <div class="username-logout">
        <!-- 用户手册 ， 角色判断，所有模块都是普通用户-》展示普通用户手册；所有模块都是管理员-》展示管理员手册；既有管理员角色又有普通用户角色，两个手册都展示。 -->
        <span  v-if="role=='admin'||role=='both'"  id="header_btn_books_admin"><a :href="'http://'+hostname+':5680/admin/index.html'" target="_blank"> 
          <svg class="icon" aria-hidden="true" style="font-size:16px;">
            <use xlink:href="#icon-yewushouce"></use>
          </svg> {{$t('m.adminGuide')}} </a>
        </span>
        <span  v-if="role=='viewer'||role=='both'" id="header_btn_books_viewer"><a :href="'http://'+hostname+':5680/user/index.html'" target="_blank">
          <svg class="icon" aria-hidden="true" style="font-size:16px;">
            <use xlink:href="#icon-yewushouce"></use>
          </svg> {{$t('m.viewerGuide')}}</a>
        </span>

        <!-- 版本升级 -->
        <span @click="isVisibleVersionDialog=true;versionHandle()"  v-if="isSuper"  id="header_btn_version"><a href="###">{{$t('m.authority.versionUpgrade')}}</a></span>

        <div v-if="isVisibleVersionDialog" class="top-dialog-license" style="width:600px;right: 200px;" v-loading="loadingUpgrade" :element-loading-text="$t('m.loading')">
          <!-- 当前版本 -->
          <p>{{$t('m.authority.currentVersion')}}： {{version.currentVersion}}</p>

          <!-- 补丁信息 -->
          <table v-if="version.patches.length" class="table-version">
            <caption>{{$t('m.patchInfo')}}</caption>
            <thead>
            <tr>
              <th>{{$t('m.patchNumber')}}</th> <th>{{$t('m.patchName')}}</th> <th>{{$t('m.desc')}}</th> 
            </tr>
            </thead>
            <tbody>
              <tr v-for="item in version.patches" :key="item.id">
                <td>{{item.buildNum}}</td> <td>{{item.name}}</td> <td>{{item.descriptionShort}} 
                  <el-button type="text"  @click="patchDescription=item.description;versionDescriptionDialogVisible = true">{{$t('m.viewDetail')}}</el-button><!-- 查看详情 --></td>
              </tr>
            </tbody>
          </table>
          <!-- 升级失败原因 -->
          <p v-if="version.upgradable&&version.retry" style="color:#f56c6c;font-weight: bold;">
              {{'! ' + this.$t('m.authority.upgradeFailed')+' : '+ this.version.message}}
          </p>          
          
          <!-- 提示信息 -->
          <div style="text-align:center;z-index:10; margin-top:20px;">
            <div v-show="isVisibleVersionConfirm" style="line-height: 30px; position:absolute;bottom:10px;background-color:#fff;border:1px solid #ddd;border-radius:5px;box-shadow:0px 0px 5px #ddd;width:90%;padding:20px;">
              <p>{{$t('m.upgradeTip1')}}</p>
              <p style="padding-bottom:10px;">{{$t('m.upgradeTip2')}}</p>
                <el-button type="primary" plain size="middle" @click="isVisibleVersionDialog=false;isVisibleVersionConfirm=false;submitVersionHandle()" style="margin-right:10px;margin-left:10px;" id="header_btn_submit_version_btn1" >{{$t('m.confirm')}}</el-button>                    
                <el-button size="middle" @click="isVisibleVersionConfirm = false;isVisibleVersionDialog=false;"  id="header_btn_submit_version_btn2" >{{$t('m.cancel')}}</el-button>                      
            </div>
            <!-- // 说明升级有问题，需要重新升级，并展示升级失败原因 -->                
            <el-button slot="reference"  v-show="version.upgradable&&version.retry" id="header_btn_submit_version2"  type="primary" @click="isVisibleVersionConfirm = !isVisibleVersionConfirm">{{$t('m.authority.reUpgrade')}}</el-button>

            <el-button slot="reference"  v-show="version.upgradable&&!version.retry" id="header_btn_submit_version"  type="primary" @click="isVisibleVersionConfirm = !isVisibleVersionConfirm">{{$t('m.authority.versionUpgrade')}}</el-button>
                
            &nbsp; &nbsp; &nbsp; 
            <el-button id="header_btn_cancel_version"  type="primary" plain @click="isVisibleVersionDialog=false">{{$t('m.cancel')}}</el-button>
          </div>          
        </div>

        <!-- 更新license -->
        <span @click="licenseVisible=true" v-if="isSuper" id="header_btn_updatelicense"><a href="###">{{$t('m.authority.updateLicense')}}</a></span>


        <el-dropdown trigger="click">
          <div class="needHover"  id="header_username" >
            {{username}}<i class="el-icon-arrow-down el-icon--right"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <router-link to="/authority/personal?operation=editInfo" id="header_editinfo">{{$t('m.authority.editPersonalInformation')}}</router-link>
            </el-dropdown-item>
            <el-dropdown-item>
              <router-link to="/authority/personal?operation=editPass" id="header_editpass">{{$t('m.authority.changePassword')}}
              </router-link>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        
        <span :class="{isDetailLogout:isDetailLogout,logout:true}" @click="logout"><a href="###"  id="header_logout">{{$t('m.logout')}}</a></span>

      </div>
    </div>

    <!-- dialog - 详细版本升级信息 -->
    <el-dialog
      :title="$t('m.desc')"
      :visible.sync="versionDescriptionDialogVisible"
      width="60%" :modal="false"
      center style="z-index:2001">
      <p style="white-space:pre-wrap; word-wrap:break-word;">{{patchDescription}}</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="versionDescriptionDialogVisible = false">{{$t('m.close')}}</el-button><!-- 关闭 -->
      </span>
    </el-dialog>

    <!-- 激活 -->
    <License :where="where" v-if="licenseVisible" v-on:isHeadingLicenseVisible="licenseVisible=$event"></License>
  </header>
</template>

<script>
import Lib from "../assets/js/Lib";
import License from '../components/License.vue';

export default {
  components: {
    License
  },
  data() {
    return {
      username: "admin",
      isDetailLogout: false,
      isVisibleUpdateDialog: false,
      isVisibleVersionDialog: false,
      isVisibleVersionConfirm: false,
      licenseFileName: '',
      organizationName: '',
      serialCode: '',
      fileError: false,
      isNodeDetail: false,
      version:{
        currentVersion: "",
        message: "",
        upgradable: false,
        patches: [],
        success: true,
        messageParams: "",
        retry: false,
        currentPatch: 1,
      },
      versionDescriptionDialogVisible: false,
      hostname:'',
      role: '',
      loadingUpgrade: false,
      patchDescription: '',
      
      licenseVisible: false,
      isSuper: false,
      where: 'heading',

    };
  },


  computed: {
    pageName () {
      return this.$store.state.pageName
    }
  },

  watch: {
    $route(){
      if(this.$route.path.includes('/cluster/nodedetail/')){ // 如果是详情页,左侧隐藏nav, header 白色
        this.isNodeDetail = true;
      }else{ // 其它页, 显示　nav
        this.isNodeDetail = false;
      }    
    },
  },

  created(){

    this.isSuper = localStorage.getItem('isSuper')==='1' ? true : false; 
    this.username = Lib.Common.getCookies('username');
    this.hostname = location.hostname;

    if(location.hash.includes('/login')){ // this.$route.path 获取到的总是　‘/’ ？？？？不记得
      return false;      
    }

    // 判断角色 --> 显示哪一个用户手册
    let roleArr = [], roleOnly;
    roleArr.push(localStorage.getItem('rolesNode'));
    roleArr.push(localStorage.getItem('rolesZone'));
    roleArr.push(localStorage.getItem('rolesJob'));
    roleArr.push(localStorage.getItem('rolesStore'));
    roleArr.push(localStorage.getItem('rolesImage'));
    roleArr.push(localStorage.getItem('rolesAuth'));
    roleArr.push(localStorage.getItem('rolesDashboard'));
    roleOnly = roleArr.every(ele => {
      return ele === 'admin';
    })
    if(roleOnly){// 说明全部是 admin
      this.role = 'admin';
    }else{
      // 再次循环
      roleOnly = roleArr.every(ele => {
        return ele === 'viewer';
      })
      if(roleOnly){ // 说明全部是 viewer
        this.role = 'viewer';
      }else{ // 否则就是 2种角色都有
        this.role = 'both';
      }
    }
    
    // 接受 response 中 错误码中的 过期，非法机器
    Lib.Common.bus2.$on("licenseResponse", (arg) => {
      this.where = 'response';
      this.licenseVisible = true;      
    });

    this.isActivation(); // 系统是否激活 -> 是否发版本请求
  },

  methods: {
    
    // 系统是否激活， 激活的话才会发 升级版本的请求， 否则的话， 升级版本请求报错
    isActivation(){
      this.$axios({
        method: 'post',
        url: Lib.API().auth.validation,
      }).then(res =>{
        const data = res.data;
        if(data.success){  
          if(data.license.licenseStatus===2 && this.isSuper){
            this.versionHandle();
          }
        }else{
          Lib.Common.errorMsg(data);
        }
      })
    },

    // 更新系统请求
    submitVersionHandle(){
      this.loadingUpgrade = true;

      this.$axios.post(Lib.API().auth.versionUpgrade+`?retry=${this.version.retry}`)
        .then(res => {
        let data = res.data;
        if (data.success) {
          location.href = 'http://' + location.hostname +':5678/upgrade.html';
        } else{
          Lib.Common.errorMsg(data);
        }
        this.loadingUpgrade = false;         
      });
    },

    // 获取最新版本
    versionHandle(){ 
      this.loadingUpgrade = true;

      this.$axios.get(Lib.API().auth.versionLatest).then(res => {
        let data = res.data;
        if (data.success) {
          if(data.patches && data.patches.length){
            data.patches.forEach( ele => {
              ele.descriptionShort = ele.description.slice(0,10) + '...'
            })            
          }else{
            data.patches = [];
          }
          if(data.currentPatch){
            data.currentVersion = data.currentVersion + '-' + data.currentPatch; 
          }
          this.version = data;
          if(this.version.upgradable){
            this.isVisibleVersionDialog = true;
          }
        }else{
          Lib.Common.errorMsg(data);
        }
        this.loadingUpgrade = false;
      });
    },

    // 退出
    logout(){  
      this.$axios
        .get(Lib.API().auth.logout)　// '/api/auth/logout'
        .then(res => {
          // const data = res.data;
          // if (data.success) {
          //     // 删除 cookie 中的 username
          //     document.cookie = 'username=test;path=/;expires='+ new Date("1970-1-1");
          //     // 跳转至 登录页
          //     this.$router.push({path:'/login'});              
          // }else{
          //   // 退出失败
          // }
        // }).finally(() => {
          document.cookie = 'username=test;path=/;expires='+ new Date("1970-1-1");
          this.$router.push({path:'/login'});
        })
    }, 

    // 改变 nav 的宽度
    changeNavWidth(){
      Lib.bus.$emit('showNav',true);     
    },    
  },
};
</script>

<style lang="less" scoped>
header {
  display: flex;
  width: 100%;
  height: 50px;
  line-height: 50px;
  box-shadow: 0px 2px 2px #aaaaaa;
  z-index: 1999;
  position: fixed;
  top: 0;
}
  div.logo {
    width: 200px;
    position: relative;
    box-shadow: 0px 2px 2px #aaaaaa;
    background-color: #ffffff;
    span {
      margin-left: -15px;
      cursor: pointer;
      position: absolute;
      left: 35px;
      z-index: 2;
    }
    span:hover {
      color: #1a99a5;
      text-shadow: 1px 1px 0 #666666;
    }
    h1 {
      position: absolute;
      left: 52px;
      top: 5px;
      font-size: 16px;
      display: inline-block;
      margin: 0;
      padding: 0;
    }
  }

  div.pagename-logout, div.blue {
    background-color: #1a99a5;
    color: #fff;
    flex-grow: 1;
    display: flex;
    justify-content: space-between;    
    div.page-name{
      padding-left: 25px;
    }
    div.username-logout{
      padding-right: 15px;
      a, div.needHover {
        color: #ffffff;
        cursor: pointer;
        display: inline-block;
        padding: 0 30px;      
        &:hover  {
          background-color: #0b7783;
        }
      }
    }
  }
  div.pagename-logout.is-nodedetail{
    background-color: #ffffff;
    color: #444;
    flex-grow: 1;
    display: flex;
    justify-content: space-between;    
    div.page-name{
      padding-left: 25px;
    }
    div.username-logout{
      padding-right: 15px;
      a, div.needHover {
        color: #444;
        cursor: pointer;
        display: inline-block;
        padding: 0 30px;      
        &:hover  {
          background-color: rgb(235, 247, 249);
        }
      }
    }
  }

.top-dialog-license {
  position: absolute;
  top: 64px;
  width: 400px;
  border: 1px solid #ebeef5;
  box-shadow: 0px 2px 12px 0 rgba(0, 0, 0, 0.1);
  color: #444;
  right: 74px;
  background-color: #fff;
  border-radius: 5px;
  padding: 20px;
  z-index: 100;
  text-align: left;
  p {
    padding: 0;
    margin: 0;
    text-align: left;
  }
  div.btn-license {
    position: relative;
    text-align: left;
  }
  .el-dialog {
    z-index: 2200;
  }
}
table.table-version {
  width: 100%;
  // margin: 15px 0 30px;
  thead,tbody {
    line-height: 30px;
  }
  tr {
    border-bottom: 1px solid #eee;
  }
  thead tr {
    border-top: 1px solid #eee;
    line-height: 40px;
  }

  th {
    font-weight: normal;
    color: #666;
  }
  td,th {
    padding-left:2px;
  }
}

</style>

