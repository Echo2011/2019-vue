<template>
    <main>
      <div class="main-btn-wrap">   
        <div>
          <router-link to="/modeldeployment/model/submit?appType=model" id="modellist_a_todetail">
            <el-button size="medium" type="primary" id="modellist_btn_new"  plain icon="el-icon-plus">{{$t('m.create')}}</el-button>
          </router-link>
        </div>  
        <div> 
          <el-input id="model_list_query" v-model="query" :placeholder="$t('m.pleaseEnter')+$t('m.modelName')" clearable></el-input> &nbsp; 
          <el-button  id="model_list_search" size="medium" type="primary" icon="el-icon-search" @click="getList">{{$t('m.search')}}</el-button>
        </div>        
      </div>

      

      <!-- 查结果 -->
      <section class="show-info">
       
         <table  v-loading="loading"  :element-loading-text="$t('m.loading')">
           <thead>
             <tr>
               <th>{{$t('m.modelName')}}</th> <!-- 模型名称 -->
               <th>{{$t('m.modelType')}}</th>　<!-- 模型类型 -->               
               <!-- <th>{{$t('m.image.imageName')}}</th>　镜像 -->
               <th>{{$t('m.creationTime')}}</th>　<!-- 创建时间 -->
               <th>{{$t('m.job.operatingStatus')}}</th>
               <th class="operation" style="padding-left:7px;">{{$t('m.operating')}}</th>　<!-- 操作 -->
             </tr>
           </thead>           
           <tbody v-if="list.length">
            <tr v-for="(item,index) in list" :key="item.uid"   >
               <td>{{item.jobName}}</td>               
               <td>{{item.workItemInfo.executor}}</td>               
               <!-- <td>{{item.imageName}}</td> -->
               <td>{{item.jobStatus.startedTime | toDate}}</td>  
               <td>{{$t('m.job.'+item.jobStatus.runningStatus.toLowerCase())}}</td>
               <td class="operation" v-loading="item.isActiving" :element-loading-text="$t('m.loading')">
                 <!-- 详情 -->
                  <router-link :to="'/modeldeployment/model/detail?owner='+username+'&zoneName='+zoneName+'&jobName='+item.jobName+'&uid='+item.uid"> 
                    <el-button type="text" icon="el-icon-view" > {{$t('m.detail')}}</el-button>
                  </router-link>

                  <!-- 测试 -->
                  <el-button type="text" v-show="item.jobStatus.runningStatus == 'Running'" @click="dialogTestVisible = true;getTestParam(index,item.jobName)"> 
                    <svg class="icon" aria-hidden="true" >
                      <use xlink:href="#icon-test"></use>
                    </svg> {{$t('m.test')}}
                  </el-button>

                  <!-- 删除 -->
                  <el-popover
                    placement="bottom"
                    width="360"
                    v-model="item.isDeleteVisible" >
                      <div>
                        <p style="text-align:left;">{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' + item.jobName + '?'}}</p>
                        <div style="text-align: right; margin: 0">  
                          <el-button size="mini" @click="item.isDeleteVisible = false">{{$t('m.cancel')}}</el-button>                      
                          <el-button type="primary" size="mini" @click="item.isDeleteVisible=false;remove(item.uid,item.jobName,index,item.zoneName)">{{$t('m.confirm')}}</el-button>
                        </div>
                      </div>
                    <el-button slot="reference" type="text" icon="el-icon-delete" >
                      {{$t('m.delete')}}
                    </el-button>
                  </el-popover>

                  <!-- 暂停 -->
                  <el-button type="text" v-show="item.jobStatus.runningStatus == 'Running'"  @click="pause(item.uid,item.zoneName,index,item.jobName)" style="position:relative;left:-13px;">  
                    <svg class="icon" aria-hidden="true" >
                      <use xlink:href="#icon-zanting"></use>
                    </svg> 
                    {{$t('m.pause')}}
                  </el-button>

                  <!-- 恢复 -->
                  <el-button type="text" icon="el-icon-caret-right"   @click="resume(item.uid,item.zoneName,index,item.jobName)" v-show="item.jobStatus.runningStatus == 'Paused'"> {{$t('m.resume')}}</el-button>

               </td>
             </tr>           
           </tbody>
         </table>
        
         <!-- 分页 -->
        <div class="page-block">  
          <span>{{$t('m.total')}} {{page.total}} {{$t('m.tiao')}}</span>   
          <!-- 不分页    -->
        </div>       
      </section>

      <!-- 测试 -->
      <el-dialog :title="$t('m.test')" :visible.sync="dialogTestVisible" top="50px" @close="closeTest" id="modellist_dialog">
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
            <el-input type="textarea"  :rows="4" v-model="formTest.enter" id="modellist_textarea_enter"></el-input>
          </el-form-item>
          <el-form-item >
            <el-button type="primary" plain @click="submit" size="middle" :disabled="loadingTestResult" id="modellist_dialog_btn_submit">{{$t('m.test')}}</el-button>
          </el-form-item>
          <el-form-item :label="$t('m.returnedResult')" >
            <!-- <el-input type="textarea" v-model="formTest.result"></el-input>  -->
            <span style="display:inline-block;min-height:100px;" v-loading="loadingTestResult"  :element-loading-text="$t('m.loading')" size="mini" v-if="testResult">{{testResult}} &nbsp; </span>
            <span v-else>{{$t('m.noData')}}</span>

          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogTestVisible = false" size="medium" id="modellist_dialog_btn_close">{{$t('m.close')}}</el-button>
        </div>
      </el-dialog>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
    return {   
      isConditionsMore: false,
      list:  [], 
      query: '', // 查询条件　－　模型名
      page: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 100 // 一页显示多少条 -> 不分页
      },  
      volumeName:'',
      username:'',
      loading: false, //
      loadingTest: false, // 
      loadingTestResult: false , // 
      zoneName:'', // 
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
      paramSubmitIndex:0,
      paramSubmitJobName: '', //
      testModelPath:'' , // 
    };
  },

  created() {
    this.username = Lib.Common.getCookies("username")?Lib.Common.getCookies("username"):null; 
    this.volumeName = localStorage.getItem('volumeName')?localStorage.getItem('volumeName'):'nfs';
    this.zoneName = localStorage.getItem('zoneName')?localStorage.getItem('zoneName'):''; 
    this.getList(); 
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
          kubeServiceIp: this.list[this.paramSubmitIndex].kubeServiceIp,
          kubeServicePort: this.list[this.paramSubmitIndex].kubeServicePort,
          inputVal: this.formTest.enter,
          signatureName: this.formTest.type,
          modelName: this.testModelPath, // 
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
    getTestParam(index,jobName) {
      this.paramSubmitIndex = index;
      this.paramSubmitJobName = jobName; // 提交获取结果时用
      // 如果是　/aa/cc, 结果取　cc
      // 如果是根目录，　结果用　/
      this.loadingTest = true;
      var info = this.list[index].workItemInfo.entryFile;
      if(info.length == 1){
        this.testModelPath = info;
      }else{
        let temArr = info.split('/');
        this.testModelPath = temArr[temArr.length - 1];
      }
      
      this.$axios
        .get(Lib.API().modelDeployment.modelParam + `?kubeServiceIp=${this.list[index].kubeServiceIp}&kubeServicePort=${this.list[index].kubeServicePort}&modelName=${this.testModelPath}`) 
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

    // 获取列表 
    getList(){
      this.loading = true; // 定时器发送请求时，不需要转转按钮

      this.$axios
        .get(Lib.API().job.interactiveListAndDetail + `?owner=${this.username}&zoneName=${this.zoneName}&pageSize=${this.page.pageSize}&pageNum=${this.page.currentPage}&jobName=${this.query}&appType=model`) 
        .then(res => {
          const data = res.data;
          if (data.success) {            
            data.jobs.forEach(ele => {
              ele.isDeleteVisible = false; //
              ele.isActiving = false;
              ele.kubeServicePorts.forEach(e => {
                if(e.portName === 'access'){
                  ele.kubeServicePort = e.nodePort
                }
              })
            })
            
            this.list = data.jobs; 
            this.page.total = data.total ? Number(data.total) : 0; 
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loading = false;
      })
    },

    //删除
    remove(uid,jobName,index,zoneName){
      this.list[index].isActiving = true;
      this.$axios({
        method: 'delete',
        url: Lib.API('hand'+uid).job.deleteDeployment+'?zoneName=' + zoneName,
      }).then(res =>{
        const data = res.data;
        if(data.success){
          this.$message({
            showClose: true,
            message: jobName + " " + this.$t("m.deleted"),
            type: "success",
            duration: Lib.Common.messageDuration
          });
          this.list.splice(index,1);
          // this.getList(); // 重新获取
        }else{
          this.loading = false;
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.list[index].isActiving = false;
      })
    },

    // 暂停任务
    pause(uid,zoneName,index,jobName){
      
      this.list[index].isActiving = true;
      this.$axios
      .put(Lib.API(uid).modelDeployment.modelPause + `?zoneName=${zoneName}`)
      .then( res => {
        const data = res.data;
        if(data.success){
          this.$message({
            showClose: true,
            message: jobName + " " + this.$t("m.pause"),
            type: "success",
            duration: Lib.Common.messageDuration
          });
          this.list[index].jobStatus.runningStatus = 'Paused';
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.list[index].isActiving = false;
      })
    },

    // 恢复任务
    resume(uid,zoneName,index,jobName){
      
      this.list[index].isActiving = true;
      this.$axios
      .put(Lib.API(uid).modelDeployment.modelResume + `?zoneName=${zoneName}`)
      .then( res => {
        const data = res.data;
        if(data.success){
          this.$message({
            showClose: true,
            message: jobName + " " + this.$t("m.resume"),
            type: "success",
            duration: Lib.Common.messageDuration
          });
          this.list[index].jobStatus.runningStatus = 'Running';
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.list[index].isActiving = false;
      })
    },
    

  }
};
</script>

<style lang="less" scoped>
main {
  position: relative;
}

section.search-info {
  > div.title {
    margin: 5px 0 10px 0;
    // color: #999999;
    font-weight: bold;
    padding-bottom: 10px;
  }
  form {    
    > div.input-wrap{
      display: flex;
      margin-right: 40px;
      > div {
        flex-basis: 50%;
        margin: 0 auto;
      }
    }
    
  }
}
table{  
  td:last-child {
    min-width: 100px; 
  }
}


.is-show-conditions {
  .el-form-item {
    margin-bottom: 0px;
  }
}
.more-confition-text {
  display: inline-block; 
  height: 44px;
  line-height: 48px;
}
.more-confition-text:hover {
  color:#1a99a5;
  cursor: pointer;
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