<template>
  <div id="app" :class="{'app':true,'is-detail':isDetail,'is-about':isAbout, 'is-login':isLoginPage}">
    <TheHeading v-if="!isLoginPage"></TheHeading>
    <div class="container">
      <TheNav v-if="!isLoginPage"></TheNav>
      <router-view/>
    </div>
    <TheFooter v-if="!isLoginPage"></TheFooter>
  </div>
</template>

<script>
  import TheHeading from './components/TheHeading.vue';
  import TheNav from './components/TheNav.vue';
  import TheFooter from './components/TheFooter.vue';

  export default {
    components: {
      TheHeading,
      TheNav,
      TheFooter
    },
    data(){
      return {
        isLoginPage: false,
        isDetail: false,
        isAbout: false,
      }
    },

    created(){
      this.changeLang();     
      this.getPageName(); // pageName
    },

    watch: {
      $route(){
        // 任何路由切换都要关闭前一个页面遗留下来的未关闭的　ｍｅｓｓａｇｅ
        this.$message.closeAll();
        this.$notify.closeAll();
        
        sessionStorage.removeItem('messageTex'); // 清空定时器错误码

        // 判断是否是登录页面
        this.isLoginPage = this.$route.path.includes('/login'); 
        if(this.isLoginPage){
          // 向上找到　body　页面，改变其　背景色，ｃｓｓ 实现不了找父级元素  
          document.body.style.backgroundColor = '#f1f9ff';
          //  document.body.getElementById('app').style.backgroundColor = '#f1f9ff';
        }else{
          document.body.style.backgroundColor = '#fff';
          // document.body.getElementById('app').style.backgroundColor = '#f1f1f1';
        }
        // header.vue 的样式控制　和　nav.vue　的样式控制
        if(this.$route.path.includes('/cluster/nodedetail/')){ // 如果是详情页,左侧隐藏nav, header 白色
          this.isDetail = true;
        }else if(this.$route.path.includes('about')){ //　about页　隐藏 nav，header 蓝色
          this.isAbout = true; // 清空　white 的值
          this.isDetail = false;
        }else{ // 其它页, 显示　nav, header 蓝色
          this.isDetail = false;
          this.isAbout = false;
          // this.headerBgColor = ''; // 清空　white 的值
        }    

        // pageName
        this.getPageName();
        
      }
    },

    methods: {
      // 切换语言
      changeLang() {
        this.$i18n.locale = localStorage.getItem("locale")?localStorage.getItem("locale"):'zh-CN'; // 从 localStorage 中获取语言
      },

      // pageName
      getPageName(){
        // console.log('this.$route = ' + this.$route);
        var fullPath = this.$route.fullPath;
        switch (fullPath) {
          //===================== 首页 ==================
          case '/':
            this.$store.dispatch('pageNameAction',this.$t('m.nav.home'));
            break;

          //==================== 集群管理 ====================
          case '/cluster/nodelist':
            this.$store.dispatch('pageNameAction',this.$t('m.nav.node'));
            break;
          case '/cluster/nodeadd':
            this.$store.dispatch('pageNameAction',this.$t('m.node.autoAdd'));
            break;
          case '/cluster/zonelist':
            this.$store.dispatch('pageNameAction',this.$t('m.nav.zone'));
            break;
          case (fullPath.includes('cluster/zoneadd?operation=create')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.zone.new'));
            break;
          case  (fullPath.includes('/cluster/zoneadd?operation=edit')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.zone.edit'));
            break;
          case  (fullPath.includes('/cluster/nodedetail')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.node'));
            break;

          //==================== 存储模块 =======================
          case (fullPath.includes('/storage/listAdmin')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.store.dataVolume')); // 数据卷
            break;
          case '/storage/publicData': // 公共数据 
            this.$store.dispatch('pageNameAction',this.$t('m.publicData'));
            break;
          case '/storage/listViewer': // 私有数据
            this.$store.dispatch('pageNameAction',this.$t('m.privateData'));
            break;
          case '/storage/shareIn': // 共享数据
            this.$store.dispatch('pageNameAction',this.$t('m.sharingData'));
            break;

          //==================== 镜像模块 =======================
          case '/image/list/public':
            this.$store.dispatch('pageNameAction',this.$t('m.image.publicImage'));
            break;
          case '/image/list/private':
            this.$store.dispatch('pageNameAction',this.$t('m.image.privateImage'));
            break;
          case '/image/download':
            this.$store.dispatch('pageNameAction',this.$t('m.image.download'));
            break;
          case '/image/download/versions':
            this.$store.dispatch('pageNameAction',this.$t('m.image.download'));
            break;
          case '/image/upload':
            this.$store.dispatch('pageNameAction',this.$t('m.image.upload'));
            break;
          case (fullPath.includes('/image/make')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.image.makeImage'));
            break; 
          case (fullPath.includes('/image/makeByCSL')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.image.makeImage'));
            break; 
          case (fullPath.includes('/image/detail')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.image.imageDetail'));
            break; 
          case (fullPath.includes('image/download')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.image.download'));
            break; 
          case '/image/repository':
            this.$store.dispatch('pageNameAction',this.$t('m.image.privateImageRepository'));
            break; 
          case (fullPath.includes('/image/list/private?username')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.image.privateImageRepository'));
            break;

          //==================== 模板 =======================   
          case (fullPath.includes('job/submit?appType=job&istemplate=1')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.jobTraining'));
            break;
          case (fullPath.includes('interactive/submit?appType=interactive&istemplate=1')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.interactiveDevelopment'));
            break;
          case (fullPath.includes('visual/submit?appType=visual&istemplate=1')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.visual'));
            break;       
          case (fullPath.includes('appType=job&istemplate=1')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.job.jobTemplate'));
            break;
          case (fullPath.includes('appType=interactive&istemplate=1')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.job.interactiveTemplate'));
            break;
          case (fullPath.includes('appType=visual&istemplate=1')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.job.visualTemplate'));
            break;

          //==================== 模型训练 =======================
          // 任务训练　/modeltraining/job/list
          case '/modeltraining/job/list':　　// 列表
            this.$store.dispatch('pageNameAction',this.$t('m.nav.jobTraining')); // 任务训练
            break;
          case '/modeltraining/template/list':　　// 模板列表
            this.$store.dispatch('pageNameAction',this.$t('m.nav.templateList')); // 模板训练
            break;
          case '/modeltraining/job/listadmin':　　// 列表
            this.$store.dispatch('pageNameAction',this.$t('m.nav.jobTraining')); // 任务训练
            break;
          case (fullPath.includes('/modeltraining/job/submit')?fullPath:-1):　// 提交
            this.$store.dispatch('pageNameAction',this.$t('m.nav.submitjob'));
            break;
          case (fullPath.includes('/modeltraining/job/detail')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.job.jobDetails'));
            break;
          case '/modeltraining/job/statistics':　　// 统计
            this.$store.dispatch('pageNameAction',this.$t('m.nav.jobstatistics'));
            break;

          // 交互式开发
          case '/modeltraining/interactive/list':
            this.$store.dispatch('pageNameAction',this.$t('m.nav.interactiveDevelopment'));
            break;
          case (fullPath.includes('/modeltraining/interactive/submit')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.interactiveDevelopmentCreate'));
            break;
          case (fullPath.includes('/modeltraining/interactive/detail')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.interactiveDevelopmentDetail'));
            break;
          case (fullPath.includes('/modeltraining/interactive/jupyter/')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.interactiveDevelopment'));
            break;
          

          // 可视化
          case '/modeltraining/visual/list':
            this.$store.dispatch('pageNameAction',this.$t('m.nav.visual'));
            break;
          case (fullPath.includes('/modeltraining/visual/submit')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.createVisualization'));
            break;
          case (fullPath.includes('/modeltraining/visual/detailCaffe')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.visualDetails'));
            break;　
          case (fullPath.includes('/modeltraining/visual/detailTensorflow')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.visualDetails'));
            break;　
          
          //==================== 模型部署 =======================
          case (fullPath.includes('/modeldeployment/model/submit')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.modelCreate'));
            break;
          case '/modeldeployment/model/list':
            this.$store.dispatch('pageNameAction',this.$t('m.nav.modelDeployment'));
            break;
          case (fullPath.includes('/modeldeployment/model/detail')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.modelDetail'));
            break;

          
          
          //==================== 权限 =======================
          case (fullPath.includes('/authority/user/list')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.nav.user'));
            break;
          case '/authority/user/add?operation=create':
            this.$store.dispatch('pageNameAction',this.$t('m.authority.create'));
            break;
          case (fullPath.includes('/authority/user/add?operation=edit')?fullPath:-1):
            this.$store.dispatch('pageNameAction',this.$t('m.authority.edit'));
            break;
          case '/authority/group/list':
            this.$store.dispatch('pageNameAction',this.$t('m.nav.userGroup'));
            break;
          case '/authority/group/add':
            this.$store.dispatch('pageNameAction',this.$t('m.authority.createGroup'));
            break;
          
          //==================== 系统 =======================
          case '/aimax/about':
            this.$store.dispatch('pageNameAction',this.$t('m.about'));
            break;
          
          //==================== 监控中心 =======================
          case '/dashboard/dashboard':
            this.$store.dispatch('pageNameAction',this.$t('m.nav.dashboard'));
            break;

          default:
            this.$store.dispatch('pageNameAction',this.$t('m.nav.home'));
        }
      }
    }

  }
</script>

<style lang="less" scoped>
  body {
    background-color: #fff;
  }
  .app {
    // background: #fff;
    > header {

    }
    > div.container {
      > nav {
        position: relative;
      }
    }
  }
  
  .app.is-detail {
    > header {        
      div.pagename-logout {
        background-color: #ffffff;
        color: #444444;
      }
      div.username-logout{
        a, div.needHover {
          color: #444444;     
          &:hover  {
            background-color: #cccccc;
          }
        }
      }
    }
  }

  .app.is-about, .app.app.is-detail {
    > header {

    }
    > div.container {
      > nav {
        position:absolute;
        left: 0px;
        z-index: 2;
        padding-top: 0;
      }
    }
  }
  
</style>