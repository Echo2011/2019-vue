<template>
    <main>

      <section style="padding:0;" v-loading="loading" :element-loading-text="$t('m.loading')">  
        <el-card class="box-card" shadow="never" style="border:none; padding-bottom:50px;">
          <div slot="header" class="clearfix">
            <span style="font-weight:bold;">{{jobName}}</span>

            <div class="right-icon operation" style="float: right; position:relative;" type="text"> 
              <!-- 测试 -->
              <el-button type="text" @click="dialogTestVisible = true;getTestParam()" v-show="jobStatus.runningStatus == 'Running'" id="modeldetail_btn_test"> 
                <svg class="icon" aria-hidden="true" >
                  <use xlink:href="#icon-test"></use>
                </svg> {{$t('m.test')}}
              </el-button>
              <!-- 删除      -->
              <el-button  type="text"   @click="job.isDeleteVisible=true" id="modeldetail_btn_delete" >  <i class="el-icon-delete" ></i>  {{$t('m.delete')}}</el-button>　 
              <!-- 暂停 -->
              <el-button style="float: right; padding: 3px 0" type="text" v-show="jobStatus.runningStatus == 'Running'"  @click="pause(job.uid,job.zoneName,jobName)" id="modeldetail_btn_pause">&nbsp;  
                <svg class="icon" aria-hidden="true" >
                  <use xlink:href="#icon-zanting"></use>
                </svg> 
                {{$t('m.pause')}} &nbsp;
              </el-button>

              <!-- 恢复 -->
              <el-button style="float: right; padding: 3px 0" type="text"   @click="resume(job.uid,job.zoneName,job.jobName)" v-show="jobStatus.runningStatus == 'Paused'" id="modeldetail_btn_resume"> <i class="el-icon-caret-right" ></i> {{$t('m.resume')}} &nbsp;</el-button>

              <transition name="operationTransition">
                <div class="box-cart operation-message" v-show="job.isDeleteVisible">
                  <span class="close-wrap" @click="job.isDeleteVisible=false"><i class="el-icon-close"></i></span>
                  <div class="content">
                    <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' + jobName.slice(6) + '?'}}</p>
                    <div style="text-align: right; margin: 0">                        
                      <el-button type="primary" size="small" id="modeldetail__real_delete" @click="job.isDeleteVisible=false;remove(job.uid,jobName,job.zoneName)">{{$t('m.confirm')}}</el-button>
                      <el-button size="small" type="text"  @click="job.isDeleteVisible =false" id="modeldetail_btn_cancel">{{$t('m.cancel')}}</el-button>
                    </div>
                  </div>                      
                </div>
              </transition>
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
                    <li>{{$t('m.modelPath')}}: {{workItemInfo.entryFile}}</li>
                    <!-- <li>{{$t('m.job.MLlib')}}: {{workItemInfo.lib}}</li> -->
                    <li>{{$t('m.modelType')}}: {{workItemInfo.executor}}</li>
                  </ul>
                </ul>
              </el-card>

              <el-card class="box-card">
                <div slot="header" class="clearfix detail-title">
                  <span>{{$t('m.status')}}</span>  
                  <i class="el-icon-view" id="modeldetail_fail"  @click="DialogVisibleFailedMsg = true; getFailedMsgList()" :title="$t('m.view')"></i>
                </div>
                <ul>
                  <ul>
                    <li v-if="jobStatus.runningStatus!='Unknown'">{{$t('m.job.operatingStatus')}}: {{$t('m.job.'+jobStatus.runningStatus.toLowerCase())}}</li>
                    <li v-if="jobStatus.runningStatus == 'Terminated'">{{$t('m.job.jobResult')}}: {{$t('m.job.'+jobStatus.state.toLowerCase())}}                      
                    </li>
                    <li>{{$t('m.startTime')}}: {{jobStatus.startedTime | toDate}}</li>
                    <!-- <li>{{$t('m.endTime')}}: {{jobStatus.completedTime | toDate}}</li> -->
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
              <tr v-for="item in failedMsgList" :key="item.id">
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
          <el-button type="primary" @click="DialogVisibleFailedMsg = false" id="modeltail_dialog_failmessage_confirm">{{$t('m.confirm')}}</el-button>
        </span>       
      </el-dialog>

      <!-- 测试 -->
      <el-dialog :title="$t('m.test')" :visible.sync="dialogTestVisible" top="50px" @close="closeTest" id="modeldetail_dialog_test">
        <el-form :model="formTest" label-width="150px"  v-loading="loadingTest"  :element-loading-text="$t('m.loading')" size="mini">
          <el-form-item :label="$t('m.signature')" >
            <el-radio-group v-model="formTest.type" @change="changeParam">
              <el-radio v-for="item in testParamObjIndexArr" :label="item" :key="item" >{{item}}</el-radio>
              <!-- <el-radio label="xxxxxx"></el-radio> -->
            </el-radio-group>
          </el-form-item>
          <el-form-item  :label="$t('m.inputFormat')" >
            <pre style="line-height: 18px;height: 150px;background-color: #f9f9f9;overflow-y: scroll;padding: 5px;margin:0;">{{testParamObj[formTest.type]}}</pre>
          </el-form-item>
          <el-form-item :label="$t('m.input')" >
            <el-input type="textarea"  :rows="4" v-model="formTest.enter" id="modeldetail_dialog_textarea"></el-input>
          </el-form-item>
          <el-form-item >
            <el-button type="primary" plain @click="submit" size="middle" :disabled="loadingTestResult" id="modeldetail_dialog_btn_submit">{{$t('m.test')}}</el-button>
          </el-form-item>
          <el-form-item :label="$t('m.returnedResult')" >
            <!-- <el-input type="textarea" v-model="formTest.result"></el-input>  -->
            <span style="display:inline-block;min-height:100px;" v-loading="loadingTestResult"  :element-loading-text="$t('m.loading')" size="mini" v-if="testResult">{{testResult}} &nbsp; </span>
            <span v-else>{{$t('m.noData')}}</span>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogTestVisible = false" size="medium" id="modeldetail_dialog_test_close">{{$t('m.close')}}</el-button>
        </div>
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
      loading: false,  //
      loadingStatus: false,
      
      loadingTest: false, // 
      loadingTestResult: false , // 
      dialogTestVisible: false,
      testParamObj: {}, // 
      testParamObjIndexArr: [], // 
      formTest:{
        type: '',
        // param: '', // 
        enter: '',
        // result: ''
      },
      testResult:'', // 
      // paramSubmitIndex:0,

    };
  },

  created() {
    this.uid = this.$route.query.uid;
    this.zoneName = this.$route.query.zoneName;
    this.jobName = this.$route.query.jobName;
    this.username = Lib.Common.getCookies("username");    
    this.getDetail();
  },

  methods: {

    // 关闭测试　dialog　时触发
    closeTest(){
      this.formTest.enter = '';
      this.testResult = '';
    },

    // 提交　dialog　时
    submit(){
      this.loadingTestResult = true;
      this.$axios({
        method: "post",
        url: Lib.API(this.paramSubmitJobName).modelDeployment.modelTestSubmit,
        data: {
          kubeServiceIp: this.job.kubeServiceIp,
          kubeServicePort: this.job.kubeServicePort,
          inputVal: this.formTest.enter,
          signatureName: this.formTest.type
        }
      }).then(res => {
          const data = res.data;
          this.loadingTestResult = false;
          if (data.success) {            
            this.testResult = data.resultStr;
 
          } else {
            this.$message({          
              showClose: true,
              message: this.$t("m.responseErrorMessage." + (data.message || "default")),
              type: "error",
              duration: 0
            });
          }
          this.loadingTest = false;
      })
    },

    // 改变入参格式/签名时触发
    changeParam(){
      this.formTest.param = this.testParamObj[this.formTest.type]; 
    },

    // 获取入选参数
    getTestParam() {
      // this.paramSubmitIndex = index;
      // this.paramSubmitJobName = jobName; // 提交获取结果时用
      // 如果是　/aa/cc, 结果取　cc
      // 如果是根目录，　结果用　/
      this.loadingTest = true;
      var modelName,info = this.workItemInfo.entryFile;
      if(info.length == 1){
        modelName = info;
      }else{
        let temArr = info.split('/');
        modelName = temArr[temArr.length - 1];
      }
      
      this.$axios
        .get(Lib.API().modelDeployment.modelParam + `?kubeServiceIp=${this.job.kubeServiceIp}&kubeServicePort=${this.job.kubeServicePort}&modelName=${modelName}`) 
        .then(res => {
          const data = res.data;
          this.loadingTest = false;
          document.querySelector('textarea').focus();
          if (data.success) {  
                      
            this.testParamObj = JSON.parse(data.resultStr).metadata.signature_def.signature_def;
            this.testParamObjIndexArr = Object.keys(this.testParamObj);
            this.formTest.type = this.testParamObjIndexArr[0];
          } else {
            // 在　ｄｉａｌｏｇ里错误未正常显示          
            this.$message({          
              showClose: true,
              message: this.$t("m.responseErrorMessage." + (data.message || "default")),
              type: "error",
              duration: 0
            });
          }
      })
    },

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
        .get(Lib.API().job.interactiveListAndDetail + `?owner=${this.username}&zoneName=${this.zoneName}&jobName=${this.jobName}`)
        .then(res => {
          const data = res.data.jobs[0];
          if (data.success) {
            data.isDeleteVisible = false;
            data.isDeleting = false;
            this.job = data;
            this.workItemInfo = data.workItemInfo;
            this.jobStatus = data.jobStatus;
            this.workItemInfo = data.workItemInfo;
            this.volumeName = data.volumeName;
            this.owner = data.owner;
            this.quotas = data.quotas;
            data.kubeServicePorts.forEach(e => {
              if(e.portName === 'access'){
                this.job.kubeServicePort = e.nodePort
              }
            })

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

    //删除
    remove(uid,jobName,zoneName){
      this.loading = true;
      this.$axios({
        method: 'delete',
        url: Lib.API('hand'+uid).job.deleteDeployment+'?zoneName=' + zoneName,
      }).then(res =>{
        const data = res.data;
        if(data.success){
          
          this.$router.push({path:'/modeldeployment/model/list'});
        }else{
          this.loading = false;
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loading = false;
      })
    },

    // 暂停任务
    pause(uid,zoneName,jobName){
      
      this.loading = true;
      this.$axios
      .put(Lib.API(uid).modelDeployment.modelPause + `?zoneName=${zoneName}`)
      .then( res => {
        const data = res.data;
        if(data.success){
          this.$message({
            showClose: true,
            message: jobName.slice(6) + " " + this.$t("m.pause"),
            type: "success",
            duration: Lib.Common.messageDuration
          });
          this.jobStatus.runningStatus = 'Paused';
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loading = false;
      })
    },

    // 恢复任务
    resume(uid,zoneName,jobName){
      
      this.loading = true;
      this.$axios
      .put(Lib.API(uid).modelDeployment.modelResume + `?zoneName=${zoneName}`)
      .then( res => {
        const data = res.data;
        if(data.success){
          this.$message({
            showClose: true,
            message: jobName.slice(6) + " " + this.$t("m.resume"),
            type: "success",
            duration: Lib.Common.messageDuration
          });
          this.jobStatus.runningStatus = 'Running';
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loading = false;
      })
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
.el-radio {
  margin-right: 30px;
}
.el-radio + .el-radio {
    margin-left: 0px;
    margin-right: 30px;
    margin-bottom: 15px;
}
</style>