const real =  function (params1,params2,params3,params4) {

  // 把　url　地址中的　/ 转成2个点　.. (typeof params == 'string') 
  if(params1 && (typeof params1 == 'string') && params1.includes('/')){
    params1 = params1.replace(/\//g, "..");
  }
  if(params2 && (typeof params2 == 'string') && params2.includes('/')){
    params2 = params2.replace(/\//g, "..");
  }
  if(params3 && (typeof params3 == 'string') && params3.includes('/')){
    params3 = params3.replace(/\//g, "..");
  }
  if(params4 && (typeof params4 == 'string') && params4.includes('/')){
    params4 = params4.replace(/\//g, "..");
  }

  return {
    node: {
      nodeList: "/api/node/nodes", // 获取节点列表
      nodeItem: `/api/node/nodes/${params1}`, // 节点详情
      getTwoNodes: `/api/node/nodes`, // 首页中　得到最近操作的　２　个节点
      getAutoNodes: `/api/node/nodes`, // 获取　需要自动添加的　节点列表
      addAutoNode: `/api/node/nodes`, // 提交 / 添加节点      
      getIsInstallingNode: `/api/node/nodes`, // 获取是否有正在添加的节点，　和定时器同一个请求，　只是仅发一次
      
      poweron: `/api/node/nodes/${params1}/powerOn`, // 开机
      poweroff: `/api/node/nodes/${params1}/powerOff`, // 关机
      restart: `/api/node/nodes/${params1}/powerReset`, // 重启
      deleteNode: `/api/node/nodes/${params1}/delete`, // 删除
      unschedule: `/api/node/nodes/${params1}/unschedule`, // 打污点
      schedule: `/api/node/nodes/${params1}/schedule`, //  取消污点
    },
    zone: {
      getZoneList: '/api/zone/zones', // 获取分区列表
      editZone:`/api/zone/zones/${params1}`, // edit one zone
      getZone:`/api/zone/zones/${params1}`, // get one zone
      createZone:`/api/zone/zones`, // create one zone
      deleteZone: `/api/zone/zones/${params1}`, // 删除分区
      systemQuotes: `/api/monitor/cluster/item?keys=clusterInfo`, // 系统配额
    },
    auth: {
      login: `/api/auth/login`, // 登录
      logout: `/api/auth/logout`, // 退出
      serverIP: `/api/auth/location`, // 发送 hostname 到后台 ?serverIP=192.168.134.230
      // getCode: `/api/license/getSequence`, // 获取序列码
      // getOrganSerial: '/api/license/getLicenseBaseInfo', // 获取 组织名 和 序列码
      // isActivation: '/api/license/getStatus', // 是否激活系统

      licenseCheck: '/api/auth/license/import', // 离线激活
      activation: `/api/auth/license/activation`, // 在线激活
      validation: `/api/auth/license/validation`, // 是否激活
      versionLatest: `/api/auth/version/latest`, // 获取最新版本 
      versionUpgrade: `/api/auth/version/upgrade`, // 更新系统
      
      userDetail: `/api/user/users/${params1}`, // 用户详情
      getGroupList: '/api/group/groups', // 获取组列表
      deleteGroup: `/api/group/groups/${params1}`, // 删除组
      getUserList: '/api/user/users', // 获取用户列表
      deleteUser: `/api/user/users/${params1}`, // 删除用户
      getDefaultQuota: '/api/user/quota', // 获取默认配额
      putDefaultQuota: `/api/user/quota`, // 提交默认配额
      editPassword: `/api/user/users/${params1}`, // 修改用户密码
      resetPass: `/api/user/resetpassword`, // 管理员重置普通用户密码
      getRoles: `/api/group/roles`, // 获取所有角色
      postNewGroup: `/api/group/groups`, // 创建用户组
      // getUserDetail: `/api/user/users/${params1}`, // 获取某一个用户详情
      userAdd: `/api/user/users`, // 添加用户
      userModify: `/api/user/users/${params1}`, //　修改用户
    },
    storage: {      
      adminGetVolumes: `/api/storage/volumes`, // get 请求，　管理员获取卷列表
      adminGetVolumesInfo: `api/storage/volumes/${params1}`, // 卷详情
      adminCreateVolume: `/api/storage/volumes`, //　post 请求，接口地址和上面一样，　但是请求不用，不能改成一个，因为 mock 数据不同，而且以后可能修改接口 管理员创建卷
      adminGetBricks: `/api/storage/bricks`, // 管理员创建卷时获取　块列表
      adminExpand: `/api/storage/volumes/${params1}/expande`, // 管理员 扩容卷
      
      upload: `/api/storage/volumes/${params1}/dirs/${params2}`, // 上传数据
      uploadProgress: `/api/storage/volumes/${params1}/dirs/${params2}/progress`, // 上传进度查询
      unzip:`/api/storage/volumes/${params1}/dirs/${params2}/unzip`, // 解压至当前文件夹
      viewerGetFileList: `/api/storage/volumes/${params1}/dirs/${params2}`, // 普通用户获取列表
      viewerViewDetail: `/api/storage/volumes/${params1}/dirs/${params2}/detail`, // 普通用户查看详情
      createDir: `/api/storage/volumes/${params1}/dirs`, // 创建目录
      deleteData: `/api/storage/volumes/${params1}/dirs/${params2}`, // 删除数据
      viewContent: `/api/storage/volumes/${params1}/dirs/${params2}/show`, // 查看文件内容
      moveTo: `/api/storage/volumes/${params1}/dirs/${params2}/move`, // 复制到
      copyTo: `/api/storage/volumes/${params1}/dirs/${params2}/copy`, // 移动到

      shareData: `/api/storage/volumes/${params1}/dirs/${params2}/share`, //　post　 分享数据
      myShare: `/api/storage/volumes/${params1}/dirs/${params2}/myShare`, // get  我的分享
      cancelShare: `/api/storage/volumes/${params1}/dirs/${params2}/cancleShare`, //DELETE  取消分享
      getShareDataToMe: `/api/storage/volumes/${params1}/dirs/${params2}/share`, //GET  获取分享的数据
      shareCopy: `/api/storage/volumes/${params1}/dirs/${params2}/copyShare`, //GET  共享或公共数据拷贝
      shareRange: `/api/storage/volumes/${params1}/dirs/${params2}/shareObj`, //GET   获取分享的范围
      unzipInterval: `/api/storage/volumes/${params1}/dirs/${params2}/decompressInfo`, // 解压过程定时器
      shareRootUnzip: `/api/storage/volumes/volumeName/dirs/shareDataOpInfo`, // 定时器 复制-分享数据根目录
    },
    image: {
      addTag: `/api/image/images/${params1}/tags`, // add tag
      privateImageList: `/api/image/images/${params1}`, // 
      publicImageList: `/api/image/images`, // 
      imageDetail: `/api/image/images/${params1}/tags`, // 
      deleteImage: `/api/image/images/${params1}/tags`, // 
      uploadDockerfile: `/api/image/images/upload/dockerfile`, // 上传 dockerfile 文件
      uploadTar: `/api/image/images/upload/tarfile`, // upload tar
      uploadProgress: `/api/image/images/upload/${params1}/${params2}/progress`, // 上传进度　定时器
      
      getPythons: `/api/image/images/make/search/addImage`, //获取　python 包
      makeImage: `/api/image/images/make`, // 制作镜像
      createContainer: `/api/image/images/container`, // 制作镜像
      makeImageByContainer: `/api/image/images/commitContainer`, // 制作镜像
      removeContainer: `/api/image/images/container`, // 制作镜像
      isContainerMaking: `/api/image/making/${params1}`, // 该容器是否有commit操作
      makeImageProgress: `/api/image/images/make/${params1}/${params2}/progress`, // 制作镜像进度　定时器

      getRemoteImages: `/api/image/images/search`, // 获取网络镜像
      getRemoteImagesVersions: `/api/image/images/version`, // /api/image/images/version
      imagesAli: `/api/image/images/aliImages`, //
      imagesVersionsAli: `/api/image/images/aliversion`, //

      pullImage: `/api/image/images/pull`, // pull image
      pullImageProgress: `/api/image/images/pull/${params1}/${params2}/progress`, // 
      getLoadingAndMakingList: `/api/image/images/imageInfomation`, // 用户获取下载、制作当天所有列表
      getImageTagDetail: `/api/image/images/imageDetect`, // 获取镜像详情
      cancelImageMakingLoading: `/api/image/images/cancel`, // 取消镜像下载或者制作
      // imageDoc: '/api/image/images/pushImageTxt', // 镜像列表页面 - 下载本机pushImageDoc
      imagesForjob: `/api/image/imagesForjob`, // 创建任务过滤镜像
    },

    job: {
      joblist: '/api/job/jobs', // 任务列表
      jobDetail: `/api/job/jobs/${params1}/${params2}`, // 任务详情
      submitJob: `/api/job/jobs`, // 提交任务
      deleteItem: `/api/job/jobs/${params1}`, // 删除任务
      pauseItem: `/api/job/jobs/${params1}/pause`, // 暂停任务
      resumeItem: `/api/job/jobs/${params1}/resume`, // 恢复任务

      jobfilepath: `/api/storage/volumes/${params1}/dirs/${params2}/jobfilepath`, // 路径      
      detailFailedInfo: `/api/job/jobs/${params1}/${params2}/errorList`, // 错误信息
      statistics: `/api/job/jobs/summary`, // 统计，管理员查看
      getUserLastQuotas: `/api/job/jobs/quota`, // 获取用户剩余配额
      getGpuTypes: `/api/job/jobs/gputypes`, // 获取数据类型


      createDeployments: `/api/job/deployments`, // 创建　交互式开发
      deleteDeployment: `/api/job/deployments/${params1}`, // 删除　交互式开发
      interactiveListAndDetail: `/api/job/deployments`, // 交互式开发列表及详情
      containerToImage: `/api/job/jobs/containerToImage`, // 交互式开发--->将容器保存成镜像
      saveImageProgress: `/api/job/jobs/event/saveImage`, // 保存镜像的定时器
      
      visualSubmitForCaffe: `/api/job/visualForCaffe`, // 创建可视化任务 for caffe  
      visualDetailForCaffee:　`/api/job/visual/${params1}`, // 可视化详情
      visualSubmitForTensorflow: `/api/job/visualForTensorflow`, // 创建可视化任务 for tensorflow　!! tensorflow　 的详情也用这个接口
      visualsList: '/api/job/visuals', // 获取　可视化列表
      visualDelete: `/api/job/visual/${params1}`, // 删除可视化任务列表
      
      joblog: `/api/job/jobs/${params1}/log`, // // 从任务 调 log 数据
      // joblogFromMonitor: `/api/monitor/node/item`, // 从监控调 log 数据

      // 模板
      templateList: `/api/job/templates`, // 模板列表
      templateInfo: `/api/job/templates/${params1}`, // 模板详情
      templateSubmit: `/api/job/templates`, // 提交模板
      templateUpdate: `/api/job/templates/${params1}`, // 修改模板
      templateDelete: `/api/job/templates/${params1}`, // 删除模板

    },

    modelDeployment:{  // 模型部署
      modelList: ``, // 同　交互式列表
      modelSubmit: ``,　// 同　提交任务
      modelDelete: ``,　// 同　删除　交互式开发
      modelPause: `/api/job/deployments/${params1}/pause`, // uid 暂停
      modelResume: `/api/job/deployments/${params1}/resume`, // uid 恢复
      modelParam: `/api/job/models/inputParameterSample`, // 获取入参格式
      modelTestSubmit: `/api/job/models/${params1}/predict`, // 模型测试 params1 => jobName
    },
    dashboard:{
      summery1:`/api/job/jobs/summary`,
      volumes:`/api/storage/volumes`,
      cluesterInfo:`/api/monitor/cluster/item?keys=dashboardClusterInfo`,

      nameSpaceInfo:`/api/monitor/namespace/dashboard?keys=namespaceInfo&nameSpace=${params1}`,
      namespaceDockerInfo:`/api/monitor/namespace/dashboard?keys=dockerInfo&nameSpace=${params1}`,
      namespaceHistory:`/api/monitor/namespace/dashboard?keys=history&nameSpace=${params1}`,

      nodesInfo:`/api/monitor/node/dashboard?keys=allNodesInfo`,
      nodesInfoByNode:`/api/monitor/node/dashboard?keys=nodesInfo&hostname=${params1}`,
      nodesDockerInfo:`/api/monitor/node/dashboard?keys=dockerInfo&hostname=${params1}`,
      nodesHistory:`/api/monitor/node/dashboard?keys=history&hostname=${params1}`,

      summery:`/api/monitor/job/summery`,
      history:`/api/monitor/job/history`,
      nodes:`/api/node/nodes`,
      jobInfo:`/api/monitor/job/info`,
    }
  }  
};
export default real;

// 使用说明
// url = Lib.API(param1,param2).auth.licenseCheck+'?sn=' + this.formLicense.serialCode;