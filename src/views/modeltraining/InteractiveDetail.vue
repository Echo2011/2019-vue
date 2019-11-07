<template>
    <main>

      <section style="padding:0;" v-loading="loading" :element-loading-text="$t('m.loading')">  
        <el-card class="box-card" shadow="never" style="border:none; padding-bottom:50px;">
          <div slot="header" class="clearfix">
            <span>{{jobName}}</span>
            <div class="right-icon operation" style="float: right; position:relative;" type="text">

              <el-button v-show="jobStatus.runningStatus !== 'Paused'&&!jobName.includes('terminal')" @click="enterOldDev" size="medium"   type="text" icon="el-icon-edit" id="interactivedetail_btn_enter">
                {{$t('m.enter')}}
              </el-button>

              <!-- delete -->
              <el-popover
                placement="bottom"
                width="360"
                v-model="job.isDeleteVisible" >
                  <div>
                    <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + '?'}}</p>
                    <div style="text-align: right; margin: 0">  
                      <el-button size="mini"  id="jobdetail_delete_cancel"  @click="job.isDeleteVisible = false">{{$t('m.cancel')}}</el-button>                      
                      <el-button type="primary" size="mini"  id="jobdetail_delete"  @click="job.isDeleteVisible=false;deleteHandle(job.uid,job.zoneName,jobName)">{{$t('m.confirm')}}</el-button>
                    </div>
                  </div>
                <el-button slot="reference" id="interactive_detail_delete" type="text"  size="medium" icon="el-icon-delete" >{{$t('m.delete')}}</el-button>
              </el-popover>
            </div>

          </div>
                      
          <p>{{$t('m.job.hostIP')}}:
          <span v-for="item in job.pods" :key="item.hostIP">{{item.hostIP}} &nbsp; &nbsp; &nbsp; </span>
          </p>
          <div class="detail-body">

              <el-card class="box-card">
                <div slot="header" class="clearfix detail-title">
                  <span>{{$t('m.job.basicInfo')}}</span>                  
                </div>
                <ul>
                  <li>{{$t('m.zone.name')}}: {{job.zoneName}}</li>
                  <li>{{$t('m.image.ImageName')}}: {{job.imageName}}</li>
                  <li>{{$t('m.image.imageTag')}}: {{job.imageTag}}</li>
                  <li v-if="role=='admin'">{{$t('m.username')}}: {{job.owner}}</li>
                </ul>
              </el-card>

              <el-card class="box-card">
                <div slot="header" class="clearfix detail-title">
                  <span>{{$t('m.job.quotas')}}</span>                  
                </div>
                <ul>
                  <ul>
                    <li>GPU: {{quotas.GPU.amount}}Core</li>
                    <li>CPU: {{quotas.CPU.amount}}Core</li>
                    <li>{{$t('m.memory')}}: {{quotas.MEM.amount+quotas.MEM.unit}}</li>
                  </ul>
                </ul>
              </el-card>

              <el-card class="box-card">
                <div slot="header" class="clearfix detail-title">
                  <span>{{$t('m.applicationInformation')}}</span>                  
                </div>
                <ul>
                  <ul>
                    <li>{{$t('m.job.workSpace')}}: {{workItemInfo.entryFile}}</li>
                    <!-- <li>{{$t('m.job.MLlib')}}: {{workItemInfo.lib}}</li> -->
                    <li>{{$t('m.job.executor')}}: {{workItemInfo.executor}}</li>
                  </ul>
                </ul>
              </el-card>

              <el-card class="box-card">
                <div slot="header" class="clearfix detail-title">
                  <span>{{$t('m.status')}}</span>  
                  <i class="el-icon-view"  @click="DialogVisibleFailedMsg = true; getFailedMsgList()" :title="$t('m.view')"></i>
                </div>
                <ul>
                  <ul>
                    <li v-if="jobStatus.runningStatus!='Unknown'">{{$t('m.job.operatingStatus')}}: {{$t('m.job.'+jobStatus.runningStatus.toLowerCase())}}</li>
                    <li v-if="jobStatus.runningStatus == 'Terminated'">{{$t('m.job.jobResult')}}: {{$t('m.job.'+jobStatus.state.toLowerCase())}}                      
                    </li>
                    <li>{{$t('m.creationTime')}}: {{jobStatus.startedTime | toDate}}</li>
                  </ul>
                </ul>
              </el-card>
          </div>   
        </el-card>         
      </section>

      <!-- 运行状况 -->
      <el-dialog
        :title="$t('m.job.status')"
        :visible.sync="DialogVisibleFailedMsg"
        width="80%">
        <div v-loading="loadingStatus" :element-loading-text="$t('m.loading')">
          <table v-if="failedMsgList && failedMsgList.length" class="ai-table">
            <thead>
              <tr>
                <th>{{$t('m.time')}}</th>
                <th>{{$t('m.type')}}</th>
                <th>{{$t('m.reason')}}</th>
                <th>{{$t('m.msg')}}</th>              
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item,index) in failedMsgList" :key="index">
                <td>{{item.createTime | toDate}}</td>
                <td>{{item.errorType}}</td>
                <td>{{item.errorReason}}</td>
                <td style="hyphens: auto;">{{item.errorMessage}}</td>              
              </tr>
            </tbody>
          </table>
          <p v-else>{{$t('m.noData')}}</p>          
        </div> 
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="DialogVisibleFailedMsg = false">{{$t('m.confirm')}}</el-button>
        </span>       
      </el-dialog>

    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
    return {
      DialogVisibleFailedMsg: false, // 任务运行失败/错误　信息
      failedMsgList: [],
      // dateTime:'', // log 中选择的时间
      uid: "",
      logList: [],
      zoneName: "",
      containerId: "",
      role: "",
      job: {},
      jobStatus: {
        runningStatus: ""
      },
      workItemInfo: {},
      quotas: {
        CPU: {
          amount: null
        },
        GPU: {
          amount: null
        },
        MEM: {
          amount: null,
          unit: null
        }
      },
      pods: {},
      volumeName: "",
      username: "",
      jobName: "", // 任务名
      owner: "",
      loading: false,  //
      loadingStatus: false,
    };
  },

  created() {
    this.role = localStorage.getItem("rolesJob") ? localStorage.getItem("rolesJob") : null; // 获取角色
    this.uid = this.$route.query.uid;
    this.zoneName = this.$route.query.zoneName;
    this.jobName = this.$route.query.jobName;
    this.owner = this.$route.query.owner;
    this.username = Lib.Common.getCookies("username");    
    this.getDetail();
  },

  methods: {
    // 获取失败/错误信息　×　－》　改为　运行状况（还没有结果－成功、失败，　正在运行中出错了就可以查看该信息）
    getFailedMsgList() {
      this.loadingStatus = true;
      this.$axios
        .get(Lib.API(this.uid, this.jobName).job.detailFailedInfo)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.failedMsgList = data.jobErrors;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loadingStatus = false;
        });
    },

    // 获取详情
    getDetail() {
      this.loading = true;
      this.$axios
        .get(Lib.API().job.interactiveListAndDetail + `?owner=${this.owner}&zoneName=${this.zoneName}&jobName=${this.jobName}`)
        .then(res => {
          const data = res.data.jobs[0];
          if (data.success) {
            data.isDeleteVisible = false;
            data.kubeServicePorts.forEach(e => {
              if(e.portName === 'access'){
                data.kubeServicePort = e.nodePort
              }
              
            })
            this.job = data;
            this.workItemInfo = data.workItemInfo;
            this.jobStatus = data.jobStatus;
            this.workItemInfo = data.workItemInfo;
            this.volumeName = data.volumeName;
            this.owner = data.owner;
            this.quotas = data.quotas;
            

            for (var key in data["pods"]) {
              for (var key1 in data.pods[key]["containers"]) {
                if (data["pods"][key]["containers"][key1]["id"]) {
                  this.containerId = data["pods"][key]["containers"][key1][
                    "id"
                  ].split("//")[1];
                }
              }
            }
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loading = false;
        });
    },

    // 删除
    deleteHandle(uid, zoneName, jobName) {
      this.$axios
        .delete(Lib.API('hand'+uid).job.deleteDeployment + `?zoneName=${zoneName}`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.$router.push({path:'/modeltraining/interactive/list'}); // 跳转到交互式开发列表页
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
        });
    },

    // 继续 开发
    enterOldDev(){
      if(this.jobName.includes('jupyter')){
        // jupyter 开发 or jupyterlab 开发
        this.$router.push({ path: `/modeltraining/interactive/jupyter/${this.uid}`, query: { kubeServiceIp: location.hostname, kubeServicePort: this.job.kubeServicePort, zoneName: this.zoneName,jobName:this.jobName } });
      }else{
        var newWin = window.open('about:blank');
        var href = `http://${location.hostname}:${this.job.kubeServicePort}`;
        newWin.location.href = href;
      }
      
    },

  }
};
</script>

<style lang="less" scoped>
section {
  
}
div.quotas {
  ul {
    display: flex;
    justify-content: space-around;
    li {
      flex-basis: 33%;
      text-align: center;
    }
  }
}
div.detail-body {
  display: flex;
  justify-content: space-between;
  > div {
    flex-basis: 22%;
    min-width: 200px;
    flex-wrap: wrap;
    li {
      padding: 8px 0;
    }
  }
}

div.right-icon {
  > span:hover {
    color: #1a99a5;
    cursor: pointer;
  }
}
.tab-log {
  overflow-y: scroll;
}
table.log {
  border-top: 1px solid #eeeeee;
  margin-top: 20px;
}

.el-time-spinner.has-seconds .el-time-spinner__wrapper {
  width: 33%;
}
.clearfix.detail-title {
  font-weight: bold;
  color: #666;
  i:hover {
    color: #1a99a5;
    cursor: pointer;
  }
}
</style>