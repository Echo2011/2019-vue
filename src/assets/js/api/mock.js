let host;
host = `http://192.168.121.2:8080/app/mock/1`;
// host = `http://192.168.121.100:8080`; // 

const mock = function (params1,params2,params3,params4) {

  return {

    node: {
      nodeList: host + "/api/node/nodes/dddddd", // 获取节点列表
      nodeItem: host + `/api/node/nodes/{nodeName}`, // 节点详情
      getTwoNodes: `http://rap2api.taobao.org/app/mock/data/8926`, // 最近操作的　２　个节点
      getAutoNodes: `http://192.168.121.2:8080/app/mock/1/api/node/nodes/status`, // 获取　需要自动添加的　节点列表
      addAutoNode: `http://rap2api.taobao.org/app/mock/2311/POST/api/node/nodes`, // 提交 / 添加节点
      getIsInstallingNode: `http://rap2api.taobao.org/app/mock/data/22288`, // 获取是否有正在添加的节点，　和定时器同一个请求，　只是仅发一次
      poweron: host + `/app/mock/1/api/node/nodes/{nodeName}/powerOn`, // 开机
      poweroff: `http://192.168.121.2:8080/app/mock/1/api/node/nodes/{nodeName}/powerOff`, // 关机
      restart: `http://192.168.121.2:8080/app/mock/1/api/node/nodes/{nodeName}/powerReset`, // 重启
      deleteNode: `http://192.168.121.2:8080/app/mock/1/delete/api/node/nodes/{nodeName}/delete`, // 删除
      unschedule: `http://192.168.121.2:8080/app/mock/1/put/api/node/nodes/{nodeName}/unschedule`, // 打污点
      schedule: `http://192.168.121.2:8080/app/mock/1/put/api/node/nodes/{nodeName}/schedule`, // 取消污点
    },

    zone: {
      getZoneList: host + '/api/zone/zones/dd', // 获取分区列表
      editZone:'http://rap2api.taobao.org/app/mock/2311/PUT//api/zone/zones/%7Bzonename%7D', // edit one zone
      getZone:`http://192.168.121.2:8080/app/mock/1/api/zone/zones/%7Bzonename%7D`, // get one zone
      createZone:`http://rap2api.taobao.org/app/mock/2311/POST//api/zone/zones`, // create one zone
      deleteZone: `http://rap2api.taobao.org/app/mock/2311/DELETE//api/zone/zones/%7Bzonename%7D`, // 删除分区
      systemQuotes: `http://192.168.121.2:8080/app/mock/1/ddddd`, // 系统配额
    },

    auth:{
      login: host + `/api/auth/login`, // 登录
      logout: host + `/api/auth/logout`, // 退出 
      serverIP: host + `/api/auth/location`, // 发送 hostname 到后台 ?serverIP=192.168.134.230
      
      // getCode: 'http://192.168.121.2:8080/app/mock/1/api/license/getSequence?organizationName=',　// 获取序列码
      // getOrganSerial: 'http://192.168.121.2:8080/app/mock/1/api/license/getLicenseBaseInfo', // 获取 激活信息
      // isActivation: host + '/api/license/getStatus', // 是否激活系统
      
      versionLatest: host + `/api/auth/version/latest`, // 获取最新版本
      versionUpgrade: host + `/api/auth/version/upgrade`, // 系统更新
      licenseCheck: host + '/api/auth/license/import',　// 离线激活
      activation: host + `/api/auth/license/activation`, // 在线激活
      validation: host + `/api/auth/license/validation`, // 是否激活

      userDetail: host + '/api/user/users/{username}', // 用户详情
      // userDetail: host + `/api/user/users/${params1}`, // 用户详情
      getGroupList: host + '/api/group/groups', // 获取组列表
      deleteGroup: 'http://rap2api.taobao.org/app/mock/2311/DELETE//api/user/users/%7BuserId%7D', // 删除组
      getUserList: host + '/api/user/users', // 获取用户列表
      deleteUser: 'http://192.168.121.2:8080/app/mock/1/api/user/users/%7BuserId%7D', // 删除用户
      getDefaultQuota: host + '/api/user/quota', // 获取默认配额
      putDefaultQuota: host + `/api/user/quota`, // 提交默认配额
      editPassword: `http://rap2api.taobao.org/app/mock/2311/PUT//api/user/users/%7Busername%7D`, // 修改用户密码
      resetPass: `http://rap2api.taobao.org/app/mock/2311/PUT//api/user/users/%7Busername%7D`, // 管理员重置普通用户密码
      getRoles: host + `/api/group/roles`, // 所有角色
      postNewGroup: host + `/api/group/groups`, // 创建用户组
      
      userAdd: host + `/api/user/users`, // 添加用户
      userModify: `http://rap2api.taobao.org/app/mock/2311/PUT//api/user/users/%7Busername%7D`, //　修改用户
    },
    storage: {      
      adminGetVolumes: host + `/api/storage/volumes`, // 管理员获取卷列表
      adminGetVolumesInfo: `http://192.168.121.2:8080/app/mock/1/api/storage/volumes/{volumeName}`, // 卷详情
      adminCreateVolume: `http://rap2api.taobao.org/app/mock/2311/post/api/storage/volumes`, // 管理员创建卷
      adminGetBricks: `http://192.168.121.2:8080/app/mock/1/api/storage/bricks`, // 管理员创建卷时获取　块列表
      adminExpand: `http://192.168.121.2:8080/app/mock/1/api/storage/volumes/{volumeName}/expande`, // 管理员 扩容卷
      
      upload: `http://192.168.121.2:8080/app/mock/1/post/api/storage/volumes/{volumeName}/dirs/{userFolder}`, // 上传数据
      unzip:host+`/api/storage/volumes/%7B%7DvolumeName%7D/dirs/%7BuserFolder%7D/unzip`, // 解压至当前文件夹
      viewerGetFileList: host + '/get/api/storage/volumes/{volumeName}/dirs/{userFolder}/dddd', // 普通用户查看私有数据　ｏｒ　管理员查看公共数据
      viewerViewDetail: 'http://192.168.121.2:8080/app/mock/1/get/api/storage/volumes/{volumeName}/dirs/{userFolder}/detail', // 查看大小
      createDir: `http://rap2api.taobao.org/app/mock/2311/POST/api/storage/volumes/%7BvolumeName%7D/dirs`, // 创建目录
      deleteData: `http://rap2api.taobao.org/app/mock/2311/POST/api/storage/volumes/%7BvolumeName%7D/dirs`, // 删除数据
      viewContent: `http://192.168.121.2:8080/app/mock/1/api/storage/volumes/%7BvolumeName%7D/dirs/%7BuserFolder%7D/show`, // 查看文件内容
      moveTo: `http://rap2api.taobao.org/app/mock/2311//api/storage/volumes/%7BvolumeName%7D/dirs/%7BuserFolder%7D/move`, // 移动到
      copyTo: `http://rap2api.taobao.org/app/mock/2311//api/storage/volumes/%7BvolumeName%7D/dirs/%7BuserFolder%7D/copy`, // 复制到

      shareData: `http://192.168.121.2:8080/app/mock/1/post/api/storage/volumes/%7BvolumeName%7D/dirs/%7BuserFolder%7D/share`, //　post　/api/storage/volumes/{volumeName}/dirs/{userFolder}/share 分享数据
      cancelShare: `http://192.168.121.2:8080/app/mock/1/api/storage/volumes/%7BvolumeName%7D/dirs/%7BuserFolder%7D/cancleShare`, //DELETE /api/storage/volumes/{volumeName}/dirs/{userFolder}/cancleShare 取消分享
      getShareDataToMe: `http://192.168.121.2:8080/app/mock/1/api/storage/volumes/%7BvolumeName%7D/dirs/%7BuserFolder%7D/share/DDDDDDDD`, //GET /api/storage/volumes/{volumeName}/dirs/{userFolder}/share 获取分享的数据
      shareCopy: `http://192.168.121.2:8080/app/mock/1/api/storage/volumes/%7BvolumeName%7D/dirs/%7BuserFolder%7D/copyShare`, //GET /api/storage/volumes/{volumeName}/dirs/{userFolder}/copyShare 共享或公共数据拷贝
      shareRange: `http://192.168.121.2:8080/app/mock/1/api/storage/volumes/%7BvolumeName%7D/dirs/%7BuserFolder%7D/shareObj`, //GET  /api/storage/volumes/{volumeName}/dirs/{userFolder}/shareObj 获取分享的范围
      unzipInterval: host + `/api/storage/volumes/{volumeName}/dirs/{userFolder}/decompressInfo`, // 定时器 + 解压/复制/删除/移动 过程
      shareRootUnzip: host + `/api/storage/volumes/volumeName/dirs/shareDataOpInfo`, // 定时器 复制-分享数据根目录 
    },

    image: {
      addTag: `http://rap2api.taobao.org/app/mock/2311/POST//api/image/images/%7Bimage%7D/tags/%7BtagName%7D`, // add tag
      privateImageList: `http://192.168.121.2:8080/app/mock/1/api/image/images/%7Busername%7D`, // 
      publicImageList: `http://192.168.121.2:8080/app/mock/1/api/image/images/dddddd?q=&page=6&publicPage=3`, // 
      imageDetail: `http://rap2api.taobao.org/app/mock/2311//api/image/images/%7Bimage%7D/tags`, // 
      deleteImage: `http://rap2api.taobao.org/app/mock/2311/DELETE//api/image/images/%7Bimage%7D/tags`, // 
      uploadDockerfile: `http://rap2api.taobao.org/app/mock/2311//api/image/images/upload/dockerfile`, // 上传　ｄｏｃｋｅｒｆｉｌｅ　文件
      uploadTar: `http://192.168.121.2:8080/app/mock/1/api/image/images/upload/tarfile`, // upload tar
      uploadProgress: `http://192.168.121.2:8080/app/mock/1/api/image/images/upload/{imageName}/{tagName}/progress`, // 上传进度　定时器
      
      getPythons: `http://rap2api.taobao.org/app/mock/2311//api/image/images/make/search/addImage`, //获取　python 包
      makeImage: `http://rap2api.taobao.org/app/mock/2311/post//api/image/images/make/ddd`, // 制作镜像
      makeImageProgress: `http://rap2api.taobao.org/app/mock/2311//api/image/images/make/%7BrepositoryName%7D/%7BnewImage%7D/progress`, // 制作镜像进度　定时器

      getRemoteImages: host + `/api/image/images/search?imageName=`, // dockerhub 镜像列表      
      getRemoteImagesVersions: host + `/api/image/images/version`, // /api/image/images/version 
      imagesAli: host + `/api/image/images/aliImages`, // 
      imagesVersionsAli: host + `/api/image/images/aliversion`, // 
      
      pullImage: `http://rap2api.taobao.org/app/mock/2311/api/image/images/pull`, // pull image
      // pullImageProgress: `/api/image/images/pull/${params1}/${params2}/progress`, // 
      pullImageProgress: `http://rap2api.taobao.org/app/mock/2311//api/image/images/pull/%7BrepositoryName%7D/%7BimageName%7D/progress`, // 
      getLoadingAndMakingList: `http://rap2api.taobao.org/app/mock/2311/api/image/images/imageInfomation`, // 用户获取下载\制作列表
      getImageTagDetail: `http://192.168.121.2:8080/app/mock/1/api/image/images/imageDetect?`, // 获取镜像详情
      cancelImageMakingLoading: `http://rap2api.taobao.org/app/mock/2311/api/image/images/cancel`, // 取消镜像下载或者制作 
      // imageDoc: 'http://192.168.121.2:8080/app/mock/1/api/image/images/pushImageTxt', // 镜像列表页面 - 下载本机pushImageDoc
      imagesForjob: `http://192.168.121.2:8080/app/mock/1/api/image/imagesForjob`, // 创建任务过滤镜像
      
    },
    
    job: {
      joblist: 'http://192.168.121.2:8080/app/mock/1/api/job/jobs/dddd', // 任务列表
      jobDetail: `http://rap2api.taobao.org/app/mock/2311/api/job/jobs/%7Buid%7D/%7BjobName%7D`,  // 任务详情
      submitJob: `http://rap2api.taobao.org/app/mock/2311/api/job/jobs`,  　// 提交任务
      deleteItem: `http://rap2api.taobao.org/app/mock/2311/api/job/jobs/%7Buid%7D`, // 删除任务
      pauseItem: `http://192.168.121.2:8080/app/mock/1/api/job/jobs/%7Buid%7D/pause`, // 暂停任务
      resumeItem: `http://192.168.121.2:8080/app/mock/1/api/job/jobs/%7Buid%7D/resume`, // 恢复任务

      jobfilepath: 'http://rap2api.taobao.org/app/mock/2311/api/storage/volumes/%7BvolumeName%7D/dirs/%7BuserFolder%7D/jobfilepath',　// 路径
      detailFailedInfo: `http://192.168.121.2:8080/app/mock/1/api/job/jobs/%7Buid%7D/%7BjobName%7D/errorList`, // 错误信息
      statistics: `http://rap2api.taobao.org/app/mock/2311//api/job/jobs/summary`, // 统计，管理员查看
      getUserLastQuotas: `http://192.168.121.2:8080/app/mock/1/api/job/jobs/quota`, // 获取用户剩余配额
      getGpuTypes: `http://192.168.121.2:8080/app/mock/1/api/job/jobs/gputypes`, // 获取数据类型

      interactiveListAndDetail: `http://192.168.121.2:8080/app/mock/1/api/job/deployments/ddddd`, // 交互式开发　列表及详情
      createDeployments: `http://rap2api.taobao.org/app/mock/2311/api/job/deployments`,  　// 创建　交互式开发
      deleteDeployment: `http://rap2api.taobao.org/app/mock/2311/api/job/deployments/%7Buid%7D`, 　// 删除　交互式开发
      containerToImage: `http://192.168.121.2:8080/app/mock/1/api/job/jobs/containerToImage`, // 交互式开发--->将容器保存成镜像
      saveImageProgress: `http://192.168.121.2:8080/app/mock/1/api/job/jobs/event/saveImage`, // 保存镜像的定时器

      visualsList: 'http://192.168.121.2:8080/app/mock/1/api/job/visuals', // 获取　可视化列表
      visualSubmitForCaffe: `http://192.168.121.2:8080/app/mock/1/api/job/visualForCaffe`, // 创建可视化任务 for caffe  
      visualDetailForCaffee:　'http://192.168.121.2:8080/app/mock/1/get/api/job/visual/%7Bid%7D', // 可视化详情
      visualSubmitForTensorflow: `http://192.168.121.2:8080/app/mock/1/api/job/visualForTensorflow`, // 创建可视化任务 for tensorflow　!! tensorflow　 的详情也用这个接口
      visualDelete: `http://192.168.121.2:8080/app/mock/1/api/job/visual/%7Bid%7D`, // 删除可视化
      joblog: `http://192.168.121.2:8080/app/mock/1/api/job/jobs/{jobName}/log`, // 从任务 调 log 数据
      // joblogFromMonitor: `http://rap2api.taobao.org/app/mock/2311//api/monitor/node/item?keys=dockerLogs&hostname=`, // 从监控调 log 数据

      // 模板
      templateList: `http://192.168.121.2:8080/app/mock/1/api/job/templates`, // 模板列表
      templateInfo: `http://192.168.121.2:8080/app/mock/1/get/api/job/templates/{templateName}`, // 模板详情
      templateSubmit: `http://192.168.121.2:8080/app/mock/1/api/job/templates`, // 提交模板
      templateUpdate: `http://192.168.121.2:8080/app/mock/1/put/api/job/templates/{templateName}`, // 修改模板
      templateDelete: `http://192.168.121.2:8080/app/mock/1/delete/api/job/templates/{templateName}`, // 删除模板
    },

    modelDeployment:{  // 模型部署
      modelList: ``, // 同　交互式列表
      modelSubmit: ``,　// 同　交互式开发
      modelDelete: ``,　// 同　删除　交互式开发
      modelPause: `http://rap2api.taobao.org/app/mock/2311/put/api/job/deployments/%7Buid%7D/pause`, // uid 暂停
      modelResume: `http://rap2api.taobao.org/app/mock/2311/api/job/deployments/%7Buid%7D/resume`, // uid 恢复
      modelParam: `http://rap2api.taobao.org/app/mock/2311/api/job/models/inputParameterSample`, // 获取入参格式
      modelTestSubmit: `http://rap2api.taobao.org/app/mock/2311/post/api/job/models/%7BjobName%7D/predict`, // 模型测试
    },
    dashboard:{
      summery1:`http://192.168.121.2:8080/app/mock/1/api/job/jobs/summary1`,
      volumes:`http://192.168.121.2:8080/app/mock/1/api/storage/volumes1`,
      cluesterInfo:`http://192.168.121.2:8080/app/mock/1/api/monitor/cluster/item_dashboardClusterInfo`,
      nameSpaceInfo:`http://192.168.121.2:8080/app/mock/1/api/monitor/cluster/item_dashboardNamespaceInfo`,
      namespaceDockerInfo:`http://192.168.121.2:8080/app/mock/1/api/monitor/cluster/item_dashboardNamespaceDockerInfo`,
      namespaceHistory:`http://192.168.121.2:8080/app/mock/1/api/monitor/cluster/item_dashboardNamespaceHistory`,
      nodes:`http://192.168.121.2:8080/app/mock/1/api/node/nodes1`,
      nodesInfo:`http://192.168.121.2:8080/app/mock/1/api/monitor/cluster/item_dashboardNodesInfo`,
      nodesInfoByNode:`http://192.168.121.2:8080/app/mock/1/api/monitor/cluster/item_dashboardNodesInfo`,
      nodesDockerInfo:`http://192.168.121.2:8080/app/mock/1/api/monitor/cluster/item_dashboardNodeDockerInfo`,
      nodesHistory:`http://192.168.121.2:8080/app/mock/1/api/monitor/cluster/item_dashboardNodesHistory`,
      summery:`http://192.168.121.2:8080/app/mock/1/api/monitor/job/summery`,
      history:`http://192.168.121.2:8080/app/mock/1/dashboard/jobHistory`,
      jobInfo:`http://192.168.121.2:8080/app/mock/1/dashboard/jobInfo`,

    }
  }  
};

export default mock;

// 使用说明
// url = Lib.API(param1,param2).auth.licenseCheck+'?sn=' + this.formLicense.serialCode;