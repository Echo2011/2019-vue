import Vue from 'vue';
import Router from 'vue-router';

// import TheHeading from './components/TheHeading.vue';
// const TheHeading = () => import('./components/TheHeading.vue');
// const Foo = () => import('./Foo.vue')

const Login = () =>import(/* webpackChunkName: "login" */　'./views/system/Login.vue');
const About = () =>import(/* webpackChunkName: "about" */　'./views/system/About.vue');
const Test = () =>import(/* webpackChunkName: "test" */　'./views/system/Test.vue');

const Home = () =>import(/* webpackChunkName: "home" */　'./views/home/Home.vue');

// import NodeList from './views/cluster/NodeList.vue';
const NodeList = () =>import(/* webpackChunkName: "nodeList" */　'./views/cluster/NodeList.vue');
const NodeAdd = () =>import(/* webpackChunkName: "nodeAdd" */　'./views/cluster/NodeAdd.vue');
const NodeDetail = () =>import(/* webpackChunkName: "nodeDetail" */　'./views/cluster/NodeDetail.vue');
const ZoneList = () =>import(/* webpackChunkName: "zoneList" */　'./views/cluster/ZoneList.vue');
const ZoneAdd = () =>import(/* webpackChunkName: "zoneAdd" */　'./views/cluster/ZoneAdd.vue');

const ImageUpload = () =>import(/* webpackChunkName: "imageUpload" */　'./views/image/ImageUpload.vue');
const ImageList = () =>import(/* webpackChunkName: "imageList" */　'./views/image/ImageList.vue');
const ImageTagDetail = () =>import(/* webpackChunkName: "imageTagDetail" */　'./views/image/ImageTagDetail.vue');
const ImageMake = () =>import(/* webpackChunkName: "imagemake" */　'./views/image/ImageMake.vue');
const ImageMakeByCSL = () =>import(/* webpackChunkName: "imagemake" */　'./views/image/ImageMakeByCSL.vue');

const ImageDownload = () =>import(/* webpackChunkName: "imageDownload" */　'./views/image/ImageDownload.vue');
const ImageDownloadVersions = () =>import(/* webpackChunkName: "imageDownloadVersion" */　'./views/image/ImageDownloadVersions.vue');
const Repository = () =>import(/* webpackChunkName: "imageRepository" */　'./views/image/Repository.vue');

const StoreDetailAdmin = () =>import(/* webpackChunkName: "storeDetailAdmin" */　'./views/storage/StoreDetailAdmin.vue');
const StoreListViewer = () =>import(/* webpackChunkName: "storeListViewer" */　'./views/storage/StoreListViewer.vue');
const StoreListAdmin = () =>import(/* webpackChunkName: "storeListAdmin" */　'./views/storage/StoreListAdmin.vue');
// const StoreMyShare = () =>import(/* webpackChunkName: "storeMyShare" */　'./views/storage/MyShare.vue');
const StoreShareDateViewer = () =>import(/* webpackChunkName: "StorePublicData" */　'./views/storage/ShareDateViewer.vue');

const JobList = () =>import(/* webpackChunkName: "jobList" */　'./views/modeltraining/JobList.vue');
const TemplateList = () =>import(/* webpackChunkName: "templateList" */　'./views/modeltraining/TemplateList.vue');
const JobListAdmin = () =>import(/* webpackChunkName: "jobListAdmin" */　'./views/modeltraining/JobListAdmin.vue');
const JobSubmit = () =>import(/* webpackChunkName: "jobSubmit" */　'./views/modeltraining/JobSubmit.vue');
const InteractiveList = () =>import(/* webpackChunkName: "interactiveList" */　'./views/modeltraining/InteractiveList.vue');
const JobDetail = () =>import(/* webpackChunkName: "jobDetail" */　'./views/modeltraining/JobDetail.vue'); 
const InteractiveDetail = () =>import(/* webpackChunkName: "interactiveDetail" */　'./views/modeltraining/InteractiveDetail.vue'); 
const JobJupyter = () =>import(/* webpackChunkName: "jobJupyter" */　'./views/modeltraining/JobJupyter.vue');
const JobStatistics = () =>import(/* webpackChunkName: "jobStatistics" */　'./views/modeltraining/JobStatistics.vue');
const VisualDetailCaffe = () =>import(/* webpackChunkName: "VisualDetailCaffe" */　'./views/modeltraining/VisualDetailCaffe.vue');
const VisualDetailTensorflow = () =>import(/* webpackChunkName: "VisualDetailTensorflow" */　'./views/modeltraining/VisualDetailTensorflow.vue');
const VisualList = () =>import(/* webpackChunkName: "visualList" */　'./views/modeltraining/VisualList.vue');
const VisualSubmit = () =>import(/* webpackChunkName: "visualSubmit" */　'./views/modeltraining/VisualSubmit.vue');

const ModelList = () =>import(/* webpackChunkName: "modelList" */　'./views/modeldeployment/ModelList.vue');
const ModelDetail = () =>import(/* webpackChunkName: "modelDetail" */　'./views/modeldeployment/ModelDetail.vue');


const AuthorityGroupAdd = () =>import(/* webpackChunkName: "groupAdd" */　'./views/authority/GroupAdd.vue');
const AuthorityGroupList = () =>import(/* webpackChunkName: "groupList" */　'./views/authority/GroupList.vue');
const AuthorityUserAdd = () =>import(/* webpackChunkName: "userAdd" */　'./views/authority/UserAdd.vue');
const AuthorityUserList = () =>import(/* webpackChunkName: "userList" */　'./views/authority/UserList.vue');
const AuthorityPersonal = () =>import(/* webpackChunkName: "personal" */　'./views/authority/Personal.vue');

const dashboardApp = () =>import(/* webpackChunkName: "dashboardApp" */　'./views/dashboard/dashboardApp.vue');
const dashboardNamespaceDetail = () =>import(/* webpackChunkName: "dashboardNamespaceDetail" */　'./views/dashboard/NamespaceDetail.vue');
const dashboardNodeDetail = () =>import(/* webpackChunkName: "dashboardNodeDetail" */　'./views/dashboard/NodeDetail.vue');

Vue.use(Router);

export default new Router({
  // mode: 'history'
  routes: [
    //=================== system =================
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/aimax/about',
      name: 'about',
      component: About
    },
    {
      path: '/aimax/test',
      name: 'test',
      component: Test
    },

    //================== home ===============
    {
      path: '/',
      name: 'home',
      component: Home
    },

    //================== cluster ===============
    {
      path: '/cluster/nodelist',
      name: 'nodeList',
      component: NodeList
    },
    {
      path: '/cluster/nodeadd',
      name: 'nodeAdd',
      component: NodeAdd
    },
    {
      path: '/cluster/nodedetail/:nodeName',
      name: 'nodeDetail',
      component: NodeDetail
    },
    {
      path: '/cluster/zonelist',
      name: 'zoneList',
      component: ZoneList
    },
    {
      path: '/cluster/zoneadd',
      name: 'zoneAdd',
      component: ZoneAdd
    },
  
    //================== modeltraining 模型训练 ===============
    // 任务训练
    {
      path: '/modeltraining/job/list',
      name: 'jobList',
      component: JobList
    },
    {
      path: '/modeltraining/job/listadmin',
      name: 'jobListAdmin',
      component: JobListAdmin
    },
    {
      path: '/modeltraining/job/detail',
      name: 'jobDetail',
      component: JobDetail
    },
    {
      path: '/modeltraining/job/submit', 
      name: 'jobSubmit',
      component: JobSubmit
    },
    {
      path: '/modeltraining/job/statistics',
      name: 'jobStatistics',
      component: JobStatistics
    },
    // 交互式开发
    
    {
      path: '/modeltraining/interactive/submit', 
      name: 'jobSubmit',
      component: JobSubmit
    },
    {
      path: '/modeltraining/interactive/list', 
      name: 'interactive',
      component: InteractiveList
    },
    {
      path: '/modeltraining/interactive/detail', 
      name: 'interactiveDetail',
      component: InteractiveDetail
    },
    {
      path: '/modeltraining/interactive/jupyter/:uid',
      name: 'jobJupyter',
      component: JobJupyter
    },
    // 可视化
    {
      path: '/modeltraining/visual/list',
      name: 'visualList',
      component: VisualList
    },
    {
      path: '/modeltraining/visual/detailCaffe',
      name: 'visualDetailCaffe',
      component: VisualDetailCaffe
    },
    {
      path: '/modeltraining/visual/detailTensorflow',
      name: 'visualDetailTensorflow',
      component: VisualDetailTensorflow
    },
    {
      path: '/modeltraining/visual/submit',
      name: 'visualSubmit',
      component: JobSubmit
    },

    // 模板    
    {
      path: '/modeltraining/template/submit',
      name: 'templateSubmit',
      component: JobSubmit
    },
    {
      path: '/modeltraining/template/list',
      name: 'templateList',
      component: TemplateList
    },  



    //================== mdoeldeployment 模型部署 =============== 
    {
      path: '/modeldeployment/model/list',
      name: 'modelList',
      component: ModelList
    },
    {
      path: '/modeldeployment/model/detail',
      name: 'modelDetail',
      component: ModelDetail
    },
    {
      path: '/modeldeployment/model/submit',
      name: 'modelSubmit',
      component: JobSubmit
    },

    //================== image =============== ImageTagDetail
    {
      path: '/image/upload',
      name: 'imageUpload',
      component: ImageUpload
    },
    {
      path: '/image/list/:publicorprivate',
      name: 'imageList',
      component: ImageList
    },
    {
      path: '/image/detail',
      name: 'imageTagDetail',
      component: ImageTagDetail
    },
    {
      path: '/image/repository',
      name: 'repository',
      component: Repository
    },
    {
      path: '/image/download',
      name: 'download',
      component: ImageDownload
    },
    {
      path: '/image/download/versions',
      name: 'downloadVersions',
      component: ImageDownloadVersions
    },
    {
      path: '/image/make',
      name: 'imageMake',
      component: ImageMake
    },
    {
      path: '/image/makeByCSL',
      name: 'imageMakeByCSL',
      component: ImageMakeByCSL
    },

    //================== storage ===============
    {
      path: '/storage/listViewer',
      name: 'storeListViewer',
      component: StoreListViewer
    },
    {
      path: '/storage/listAdmin',
      name: 'storeListAdmin',
      component: StoreListAdmin
    },
    {
      path: '/storage/listAdmin/:volumeName',
      name: 'storeDetailAdmin',
      component: StoreDetailAdmin
    },
    {
      path: '/storage/shareIn',
      name: 'storeShareDateViewer',
      component: StoreShareDateViewer
    },
    // {
    //   path: '/storage/myShare',
    //   name: 'storeMyShare',
    //   component: StoreMyShare
    // },
    {
      path: '/storage/publicData', // 管理员看到的公共数据
      name: 'StoreListViewerAdmin',
      component: StoreListViewer
    },

    //================== authority ===============
    {
      path: '/authority/group/add',
      name: 'authorityGroupAdd',
      component: AuthorityGroupAdd
    },
    {
      path: '/authority/group/list',
      name: 'authorityGroupList',
      component: AuthorityGroupList
    },
    {
      path: '/authority/user/add',
      name: 'authorityUserAdd',
      component: AuthorityUserAdd
    },
    {
      path: '/authority/user/list',
      name: 'authorityUserList',
      component: AuthorityUserList
    },
    {
      path: '/authority/personal',
      name: 'authorityPersonal',
      component: AuthorityPersonal
    },
    
//================== dashboard ===============
    {
      path: '/dashboard/node',
      name: 'dashboardNodeDetail',
      component: dashboardNodeDetail
    },
    {
      path: '/dashboard/dashboard',
      name: 'dashboardApp',
      component: dashboardApp
    },
    {
      path: '/dashboard/namespace',
      name: 'dashboardNamespaceDetail',
      component: dashboardNamespaceDetail
    },

  ]
})