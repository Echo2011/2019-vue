
<template>
  <transition>
    <!-- isShowNav 默认显示， 只在 Detail 页面隐藏 -->
    <nav v-show="isShowNav" :class="{'nav-detail':isDetail}">
      <!-- :default-openeds="['2','3','5','9']" -->
      <el-menu  :default-openeds="defaultOpeneds" class="el-menu-vertical-demo" :collapse="isCollapse" router :default-active="pathTrue">
        
        <el-menu-item index="/" id="nav_home" >        
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-shouye"></use>
            </svg>
            <span slot="title">{{$t('m.nav.home')}}</span>        
        </el-menu-item>

        <!-- 集群管理 -->
        <el-submenu index="2" >
          <template slot="title">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-server_icon"></use>
              </svg>
              <span slot="title">{{$t('m.nav.cluster')}}</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-if="node=='admin'" index="/cluster/nodelist" id="nav_node">{{$t('m.nav.node')}}</el-menu-item>
            <el-menu-item v-if="zone" index="/cluster/zonelist" id="nav_zone">{{$t('m.nav.zone')}}</el-menu-item>
          </el-menu-item-group>      
        </el-submenu>

        <!-- 模型训练 Model training -->
        <el-submenu  index="3">
          <template slot="title" id="nav_job">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-yingyong"></use>
            </svg>
            <span slot="title">{{$t('m.nav.modelTraining')}}</span>
          </template>
          <el-menu-item-group>
            <el-menu-item  index="/modeltraining/job/list"  id="nav_job_list_viewer" v-if="job=='viewer'">{{$t('m.nav.jobTraining')}}</el-menu-item>
            <el-menu-item  index="/modeltraining/job/listadmin"  id="nav_job_list_admin" v-if="job==='admin'">{{$t('m.nav.jobTraining')}}</el-menu-item>
            <el-menu-item  index="/modeltraining/interactive/list"  v-if="job=='viewer'"  id="nav_job_deployment">{{$t('m.nav.interactiveDevelopment')}}</el-menu-item>
            <el-menu-item  index="/modeltraining/visual/list" v-if="job=='viewer'"   id="nav_job_visual">{{$t('m.nav.visual')}}</el-menu-item>
            <el-menu-item  index="/modeltraining/template/list"  id="nav_job_list_viewer" v-if="job=='viewer'">{{$t('m.nav.templateList')}}</el-menu-item>
            <el-menu-item  index="/modeltraining/job/statistics" v-if="job=='admin'" id="nav_job_statistics">{{$t('m.nav.jobstatistics')}}</el-menu-item>
          </el-menu-item-group>      
        </el-submenu>

        <!-- 模型部署　Model deployment -->
        <el-menu-item  v-if="job=='viewer'" index="/modeldeployment/model/list" id="nav_model_deployment">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-deploymentunit"></use>
          </svg>
          <span slot="title">{{$t('m.nav.modelDeployment')}}</span>
        </el-menu-item>

        <!-- 数据存储 -->
        <el-submenu  index="5">
          <template slot="title" id="nav_store" >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-cunchu"></use>
            </svg>
            <span slot="title">{{$t('m.nav.store')}}</span>
          </template>
          <el-menu-item-group>
            <!-- 管理员 -->
            <el-menu-item  v-if="storage==='admin'&&standaloneOrCluster==='cluster'"  index="/storage/listAdmin"   id="nav_store_volume">{{$t('m.store.dataVolume')}}</el-menu-item>
            <el-menu-item  v-if="storage=='admin'"  index="/storage/publicData"   id="nav_store_public">{{$t('m.publicData')}}</el-menu-item>
            <!-- 普通用户 -->
            <el-menu-item  v-if="storage=='viewer'" index="/storage/listViewer"  id="nav_store_private">{{$t('m.privateData')}}</el-menu-item>
            <el-menu-item  v-if="storage=='viewer'" index="/storage/shareIn"  id="nav_store_share">{{$t('m.sharingData')}}</el-menu-item>          
            <!-- <el-menu-item  v-if="image=='viewer'" index="/storage/myShare"  id="nav-image-download">我的分享</el-menu-item> -->
          </el-menu-item-group>
        </el-submenu>

        <!-- 镜像 -->
        <el-submenu  index="6">
          <template slot="title" id="nav_image" >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-docker1"></use>
            </svg>
            <span slot="title">{{$t('m.nav.image')}}</span>
          </template>
          <el-menu-item-group>
            <el-menu-item  index="/image/list/public"  id="nav_image_public">{{$t('m.image.publicImage')}}</el-menu-item>
            <el-menu-item  index="/image/list/private" v-if="image=='viewer'" id="nav_image_pirvate">{{$t('m.image.privateImage')}}</el-menu-item>
            <el-menu-item  v-if="image=='admin'"  index="/image/repository"   id="nav-image-repository">{{$t('m.image.privateImageRepository')}}</el-menu-item>
            <el-menu-item  index="/image/download"  id="nav-image-download">{{$t('m.image.download')}}</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

        <!-- 权限管理 -->
        <el-submenu v-if="auth=='admin'" index="9" >
          <template slot="title" id="nav_auth">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-cloud-permissions"></use>
            </svg>
            <span slot="title">{{$t('m.nav.authority')}}</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/authority/user/list" id="nav_auth_user">{{$t('m.nav.user')}}</el-menu-item>
            <el-menu-item index="/authority/group/list" id="nav_auth_group">{{$t('m.nav.userGroup')}}</el-menu-item>
          </el-menu-item-group>      
        </el-submenu>

        <el-menu-item v-if="dashboard==='admin'"  index="/dashboard/dashboard" id="nav_model_dashboard">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-jiankong"></use>
          </svg>
          <span slot="title">{{$t('m.nav.dashboard')}}</span>
        </el-menu-item>
        
      </el-menu>
    
    </nav> 
  </transition>
</template>

<script>
import Lib from "../assets/js/Lib.js";

export default {

  data() {
    return {
      isCollapse: false, // 默认展开， 点击收齐/展开, 待完善功能,
      isShowNav: true,
      node:'',
      zone:'',
      job:'',
      storage:'',
      image:'',
      auth:'',
      isDetail: false,
      pathTrue:'',
      defaultOpeneds:['2','3','5']
    };
  },

  watch: { 
    // 监视路由
    $route(){
      // 标示 左侧菜单， 当进入子子菜单里时
      switch (this.$route.path) {
        case (this.$route.path.includes('/storage/listAdmin/')?this.$route.path:-1):　// 数据卷详情
          this.pathTrue = '/storage/listAdmin';
          break;
        case '/modeltraining/template/submit':　// 创建模板
          this.pathTrue = '/modeltraining/template/list';
          break;
        case '/modeltraining/interactive/submit':　// 交互式开发提交
          this.pathTrue = '/modeltraining/interactive/list';
          break;
        case '/authority/user/add':　// 添加/修改用户
          this.pathTrue = '/authority/user/list';
          break;
        case '/authority/group/add':　// 添加组
          this.pathTrue = '/authority/group/list';
          break;
        case '/image/upload':　　// 上传镜像
          this.pathTrue = '/image/list/public';
          break;

        case '/cluster/zoneadd':　　// 添加分区
          this.pathTrue = '/cluster/zonelist';
          break;
        case '/cluster/nodeadd':　　// 添加节点
          this.pathTrue = '/cluster/nodelist';　
          break;
        case '/modeltraining/job/detail':　// 任务详情
          this.pathTrue = '/modeltraining/job/list';
          break;
        case '/modeltraining/job/submit':　// 任务提交 /modeltraining/job/submit
          this.pathTrue = '/modeltraining/job/list';
          break;
        case '/modeltraining/interactive/detail':　// 交互式开发详情
          this.pathTrue = '/modeltraining/interactive/list';
          break;
        case (this.$route.path.includes('/modeltraining/interactive/jupyter/')?this.$route.path:-1):　//　进入交互式开发 
          this.pathTrue = '/modeltraining/interactive/list';
          break;
        case '/modeltraining/visual/detailCaffe':　// 
          this.pathTrue = '/modeltraining/visual/list';
          break;
        case '/modeltraining/visual/detailTensorflow':　// 
          this.pathTrue = '/modeltraining/visual/list';
          break;
         case '/modeltraining/visual/submit':　// 
          this.pathTrue = '/modeltraining/visual/list';
          break;
        case '/modeldeployment/model/detail':　// 
          this.pathTrue = '/modeldeployment/model/list';
          break;
        case '/modeldeployment/model/submit':　// 
          this.pathTrue = '/modeldeployment/model/list';
          break;
        
        case '/image/download/versions':　　// 下载镜像的版本 
          this.pathTrue = '/image/download';
          break;
        case '/image/make':　// 制作镜像
          if(localStorage.getItem('rolesImage')=='viewer'){
            this.pathTrue = '/image/list/private';
          }else{
            this.pathTrue = '/image/list/public';
          }
          break;
        case '/image/makeByCSL':　// 制作镜像
          if(localStorage.getItem('rolesImage')=='viewer'){
            this.pathTrue = '/image/list/private';
          }else{
            this.pathTrue = '/image/list/public';
          }
          break;
        default:
          this.pathTrue = this.$route.path;
      }


      // 
      if(this.$route.path.includes('/cluster/nodedetail/') || this.$route.path.includes('about')){
        this.isShowNav = false;
      }else{
        this.isShowNav = true;
      }
    }
  },

  created() {
    this.standaloneOrCluster = localStorage.getItem('standaloneOrCluster');

    if (this.$route.path == '/') {
      this.pathTrue = '/';
    }



    // 接受来自 header 的触发事件传来的参数
    Lib.bus.$on("showNav", () => {
      if(this.$route.path.includes('/cluster/nodedetail/') || this.$route.path.includes('about')){
        this.isCollapse = false;
        this.isShowNav = !this.isShowNav;
        this.isDetail = true;
      }else{
        this.isCollapse = !this.isCollapse
        this.isShowNav = true;
        this.isDetail = false;
      }
    });
    this.judgmentRoles(); // 判断角色，展示不同菜单
    // console.log('$route.path = ' + $route.path);
  },

  methods: {

    // 判断角色，展示不同菜单
    judgmentRoles(){     
      this.node = localStorage.getItem('rolesNode') ? localStorage.getItem('rolesNode') : null;
      this.zone = localStorage.getItem('rolesZone') ? localStorage.getItem('rolesZone') : null;
      this.job = localStorage.getItem('rolesJob') ? localStorage.getItem('rolesJob') : null;
      this.storage = localStorage.getItem('rolesStore') ? localStorage.getItem('rolesStore') : null;
      this.image = localStorage.getItem('rolesImage') ? localStorage.getItem('rolesImage') : null;
      this.auth = localStorage.getItem('rolesAuth') ? localStorage.getItem('rolesAuth') : null;
      this.dashboard = localStorage.getItem('rolesDashboard') ? localStorage.getItem('rolesDashboard') : null;
    }
  }
};
</script>

<style lang="less" scoped>
nav {
  background-color: #fff;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
.el-menu-item-group {
  text-indent: 28px;
}
</style>

