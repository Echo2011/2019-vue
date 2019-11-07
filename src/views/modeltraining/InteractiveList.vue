<template>
    <main> 
      <!-- 状态 -->
      <el-dialog
        :title="$t('m.status')"
        :visible.sync="DialogVisibleFailedMsg"
        width="70%">
        <div v-loading="loadingDialog" :element-loading-text="$t('m.loading')">
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
                <td>{{item.createTime | toDate }}</td>
                <td>{{item.errorType}}</td>
                <td>{{item.errorReason}}</td>
                <td>{{item.errorMessage}}</td>            
              </tr>
            </tbody>
          </table>
          <p v-else>{{$t('m.noData')}}</p>          
        </div>   
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="DialogVisibleFailedMsg = false" id="interactive-dev">{{$t('m.confirm')}}</el-button>
        </span>     
      </el-dialog>

      <!-- 将容器保存成镜像  -->
      <el-dialog :title="$t('m.job.containerToImage')" :visible.sync="dialogFormVisible" @close="$refs['toImageForm'].resetFields()">
        <el-form :model="toImageForm"  size="medium" :rules="rules" ref="toImageForm">
          <el-form-item :label="$t('m.image.imageName')" label-width="160px" prop="imageName">
            <el-input v-model="toImageForm.imageName" auto-complete="off" id="interactive_makeImage_imageName"></el-input>
          </el-form-item>
          <el-form-item :label="$t('m.image.tagName')" label-width="160px" prop="tagName">
            <el-input v-model="toImageForm.tagName" auto-complete="off" id="interactive_makeImage_tagName"></el-input>
          </el-form-item>   
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false" id="interactive_toimage_cancel">{{$t('m.cancel')}}</el-button>
          <el-button type="primary" @click="containerToImage('toImageForm')"  id="interactive_toimage_confirm" >{{$t('m.confirm')}}</el-button>
        </div>
      </el-dialog>
      
      
      <router-link to="/modeltraining/interactive/submit?appType=interactive" id="interactive_a_new">
        <el-button size="medium" type="primary" plain icon="el-icon-plus" id="interactive_new" >{{$t('m.create')}}</el-button>          
      </router-link>  &nbsp; &nbsp; 
      <el-dropdown  trigger="click"  v-if="templateList.length">
        <el-button size="medium" type="primary" plain icon="el-icon-plus">
          {{$t('m.templateCreate')}}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="item in templateList" :key="item.templateName">
            <router-link
              :to="'/modeltraining/interactive/submit?appType=interactive&istemplate=1&templateName='+item.templateName"
            >{{item.templateName}}</router-link>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
          

      <section  v-loading="loading" :element-loading-text="$t('m.loading')" style="margin-top:15px;">
        <p>
          {{$t('m.runningProgram')}}({{list.length}})
        </p>
        <div class="interactive-wrap">
          <el-card  v-for="(item,index) in list" :key="item.jobName" style="overflow: visible;" v-loading="item.isActiving" :element-loading-text="$t('m.loading')">
            <div class="interactive-title">
              <span v-if="item.jobNameSimple=='Jupyter'" >
                <svg class="icon" aria-hidden="true" style="width:60px;height:60px;">
                  <use xlink:href="#icon-file_type_jupyter"></use>
                </svg> Jupyter
              </span>
              <span v-if="item.jobNameSimple=='Desktop'">
                <svg class="icon" aria-hidden="true" style="width:50px;height:50px;">
                  <use xlink:href="#icon-desktop"></use>
                </svg> Desktop
              </span>
              <span v-if="item.jobNameSimple=='JupyterLab'">
                <svg class="icon" aria-hidden="true" style="width:60px;height:60px;">
                  <use xlink:href="#icon-file_type_jupyter"></use>
                </svg> Jupyter<span style="color:#f37726">Lab</span>
              </span>
              <span v-if="item.jobNameSimple=='Terminal'">
                <svg class="icon" aria-hidden="true" style="width:60px;height:60px;">
                  <use xlink:href="#icon-terminal"></use>
                </svg> Terminal
              </span>
            </div>
            <p style="line-height:30px;position:relative;" class="operation">
              {{item.jobName}}<br />
              <!-- {{hostname}}: {{item.kubeServicePort}}<br /> -->
              <span v-for="(i, index) in item.kubeServicePorts" :key="index" style="display:block;">
                <!-- <span v-if="i.portName=='access'">{{i.nodePort}}</span> -->
                
                <span style="width:50px;display: inline-block;">{{i.portName}}</span> {{hostname}}:{{i.nodePort}} 
                <span v-if="i.portName=='ssh'"> (
                  {{$t('m.username')}}: root )  
                  <!-- {{$t('m.authority.password')}}: root -->
                   
                </span>
                <br />
              </span>
              <br />

              <!-- Terminal 进入 -->

              <span v-show="item.jobNameSimple!=='Terminal' && item.jobStatus.runningStatus !== 'Running'" style="display:inline-block; padding-right:10px;font-size:13px;">
                <i class="el-icon-loading"></i> {{$t('m.starting')}} <!-- 启动中 -->
              </span>

              <el-button  v-show="item.jobNameSimple!=='Terminal'&&item.jobStatus.runningStatus === 'Running'" @click="enterOldDev(index)" size="mini"  plain type="text"  style="margin-right:10px;margin-bottom:10px;">
                <i class="el-icon-edit"></i> {{$t('m.enter')}} <!-- 进入 -->
              </el-button>

              
                

              <!-- 详情 -->
              <router-link :to="'/modeltraining/interactive/detail?uid='+item.uid+'&jobName='+item.jobName+'&zoneName='+item.zoneName+'&owner='+item.owner">
                <el-button size="mini" type="text" plain icon="el-icon-view" > {{$t('m.detail')}}</el-button>          
              </router-link>

              <!-- 状态 -->
              <el-button size="mini" type="text" plain   @click="DialogVisibleFailedMsg = true; getFailedMsgList(item.uid,item.jobName)"  icon="el-icon-view" > {{$t('m.status')}}</el-button>

              <!-- delete -->
              <el-popover
                placement="bottom"
                width="360"
                v-model="item.deleteVisible" >
                  <div>
                    <!-- <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + '?'}}</p> -->
                    <!-- <div style="text-align: right; margin: 0">   -->
                      <el-button size="small" type="primary"    @click="dialogFormVisible = true;currentIndex=index" :disabled="item.jobNameSimple!=='Terminal' && item.jobStatus.runningStatus !== 'Running'">{{$t('m.job.containerToImageFirst')}}</el-button> 
                      <el-button type="primary" plain size="small" @click="item.deleteVisible=false;deleteOldDeployment(index)" style="margin-right:10px;margin-left:10px;" >{{$t('m.deleteDirectly')}}</el-button>                    
                      <el-button size="small" @click="item.deleteVisible = false">{{$t('m.cancel')}}</el-button>                      
                      
                    <!-- </div> -->
                  </div>
                <el-button slot="reference" type="text"  size="mini" icon="el-icon-delete" > {{$t('m.delete')}}</el-button>
              </el-popover>

              <el-button size="mini" type="text" plain :disabled="item.jobNameSimple!=='Terminal' && item.jobStatus.runningStatus !== 'Running'"  @click="dialogFormVisible = true;currentIndex=index"  icon="el-icon-news"> {{$t('m.job.containerToImage')}}</el-button>

            </p>                             
            
          </el-card>
        </div> 
        
        <div class="save-progress" v-show="isShowEventInfos">
          <p>{{ $t('m.job.containerSaving') }}:</p>
          <div v-for="(value,key) in eventInfos" :key="key" style="display:flex;">
            <div>{{ key }}</div>
            <div>
              <span v-for="(i,index) in value" :key="index" style="display:block;">{{i}}</span>
            </div>            
          </div>  
        </div>     

      </section>

      
    </main>

</template>

<script>
import Lib from "../../assets/js/Lib";
import BaseMainHeader from '../../components/BaseMainHeader.vue';

export default {
  components: {
    BaseMainHeader
  },
  data() {
    var validateImageName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.image.imageName")
          )
        );
      } else if (
        !/^[a-z0-9]([-_a-z0-9]{0,18}[a-z0-9])?$/.test(value.trim())
      ) {
        callback(new Error(this.$t("m.image.ImageName") + this.$t("m.rules.regularUnderline")));
      } else {
        callback();
      }
    };
    var validateTagName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(this.$t("m.rules.pleaseEnter") + this.$t("m.image.tagName"))
        );
      } else if (
        !/^[a-zA-Z0-9]([-_.a-zA-Z0-9]{0,18}[a-zA-Z0-9])?$/.test(value.trim())
      ) {
        callback(new Error(this.$t("m.image.TagName") + this.$t("m.rules.regularDot")));
      } else {
        callback();
      }
    };
    return {
      list: [], // zone list
      templateList: [],
      failedMsgList:[],
      loading: false,
      // loadingAdmin: false,
      DialogVisibleFailedMsg:false,
      loadingDialog: false,
      username: '',
      zoneName: '', // 
      hostname: '',
      owner: '',
      role: '',
      // ownerQuery: '',
      page: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10
      },
      dialogFormVisible: false,
      toImageForm: {
        imageName: '',
        tagName: '',
        // isPublic: '',
      },
      rules: {
        imageName: [
          { required: true, validator: validateImageName, trigger: "blur" }
        ],
        tagName: [
          { required: true, validator: validateTagName, trigger: "blur"   }
        ],
      },
      currentIndex:0,
      timeId: '',
      timeIdList: '',
      eventInfos: {},
      isShowEventInfos: false,
      
    };
  },

  created() {
    this.role = localStorage.getItem('rolesJob')?localStorage.getItem('rolesJob'):'viewer';
    this.getUser();
    this.getTemplateList();

    this.hostname = location.hostname;    
  },

  destroyed(){ 
    if(this.timeId){
      clearInterval(this.timeId)
    }
    if(this.timeIdList){
      clearInterval(this.timeIdList)
    }
  },

  methods: {
    // 获取模板列表
    getTemplateList() {
      this.loading = true;
      this.$axios({
        method: "get",
        url: Lib.API().job.templateList
      }).then(res => {
        let data = res.data;
        if (data.success) {
          // 过滤
          this.templateList = data.data.filter(ele => {
            return ele.appType == 'interactive';
          })
        } else {
          Lib.Common.errorMessage(
            this.$t("m.responseErrorMessage." + data.message || "default"),
            data.messageParams
          );
        }
        this.loading = false;
      });
    },

    // 保存镜像的定时器，获取列表后，只要列表有值，就发定时器请求
    saveImageInterval(){

      let obj = this.list[0];
      
      clearInterval(this.timeId); // 关闭上一个定时器

      this.timeId = setInterval(() => {
        this.$axios.get(Lib.API().job.saveImageProgress+`?owner=${obj.owner}&zoneName=${obj.zoneName}&appType=interactive`)
        .then(res => {
          const data = res.data;
          if(data.success){ 
            this.isShowEventInfos = Boolean(Object.keys(data.eventInfos).length);
            this.eventInfos = data.eventInfos;
            if(!this.isShowEventInfos){
              clearInterval(this.timeId);
            }             
          }else{ 
            this.isShowEventInfos = false;            
            this.eventInfos = {};
            clearInterval(this.timeId);
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
        })
      }, 2000) // 10000毫秒->  10秒 发一次请求　　
    },

    // 将容器保存成镜像
    containerToImage(formName){

      this.$refs[formName].validate(valid => {
        if (valid) {   
          this.dialogFormVisible = false;

          let obj = this.list[this.currentIndex];
          this.list[this.currentIndex].isActiving = true;
          this.$axios({
            method: 'post',
            url: Lib.API(this.username).job.containerToImage, 
            data: {
              jobName: obj.jobName,
              zoneName: obj.zoneName,
              imageName: this.toImageForm.imageName,
              tagName: this.toImageForm.tagName,
              // repositoryName: obj.owner,
              owner: obj.owner,
              uid: obj.uid
            }      
          }).then(res =>{
            const data = res.data;
            
            if(data.success){
              this.saveImageInterval();
            }else{
              var messageCode = data.message || 'default';
              var messageText = this.$t('m.responseErrorMessage.' + messageCode);
              Lib.Common.errorMessage(messageText, data.messageParams);
            }
            this.list[this.currentIndex].isActiving = false;
          })
        } else {
          return false;
        }
      });
    },

    // 获取用户使用的分区名
    getUser(){
      this.loading = true;
      this.username = Lib.Common.getCookies('username');

      this.$axios({
        method: 'get',
        url: Lib.API(this.username).auth.userDetail,       
      }).then(res =>{
        const data = res.data;
        
        if(data.success){
          this.zoneName = data.result.zoneName;
          this.getList(); // 获取列表
          this.haveNoOffHandle(); // 定时器
        }else{
          var messageCode = data.message || 'default';
          var messageText = this.$t('m.responseErrorMessage.' + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
          this.loading = false;
        }
      })
    },

    // 列表定时器
    haveNoOffHandle(){
      clearInterval(this.timeIdList); // 关闭上一个定时器
      this.timeIdList = setInterval(() => {
        this.getList('interval');
      },10000)
    },

    // 获取列表
    getList(interval){  
        let query = `?owner=${this.username}&zoneName=${this.zoneName}&appType=interactive`;    
        this.$axios({
          method: 'get',
          url: Lib.API().job.interactiveListAndDetail + query,           
        }).then(res =>{
          const data = res.data;
          if(data.success){

            data.jobs.forEach(ele => {
              ele.deleteVisible = false;
              ele.isActiving = false;

              if(ele.jobName.includes('jupyterlab')){
                ele.jobNameSimple = 'JupyterLab';
              }else if(ele.jobName.includes('jupyter')){
                ele.jobNameSimple = 'Jupyter';
              }else if(ele.jobName.includes('desktop')){
                ele.jobNameSimple = 'Desktop';
              }else if(ele.jobName.includes('terminal')){
                ele.jobNameSimple = 'Terminal';
              };

              ele.kubeServicePorts.forEach(e => {
                if(e.portName === 'access'){
                  ele.kubeServicePort = e.nodePort
                }
                
              })
            })

            // 所有的 item.jobNameSimple!=='Terminal' 状态是 Running 状态，停止发定时器
            // item.jobStatus.runningStatus === 'Running';
            let tem = data.jobs.filter(ele => {
              return ele.jobNameSimple !== 'Terminal'
            })
            let isAllTerminalRunning = tem.every( e => {
              return e.jobStatus.runningStatus === 'Running';
            })
            if(isAllTerminalRunning){
              clearInterval(this.timeIdList); // 关闭定时器
            }
            
            this.list = data.jobs;  
            if(!interval){ // 定时器，不发此请求
              this.saveImageInterval(); // 只要列表有值，就发定时器请求
            }
          }else{   
            clearInterval(this.timeIdList); // 错误 关闭定时器
            var messageCode = data.message || 'default';
            var messageText = this.$t('m.responseErrorMessage.' + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams,interval||'');
          }
          this.loading = false;
        })

    },


    // 获取失败/错误信息
    getFailedMsgList(uid,jobName){
      this.loadingDialog = true;
      this.$axios
        .get(Lib.API(uid,jobName).job.detailFailedInfo)
        .then(res => {
          const data = res.data;
          if (data.success) { 
            this.failedMsgList = data.jobErrors;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loadingDialog = false;
      })
    },

    // 删除旧的 交互式开发
    deleteOldDeployment(index){
      var url;      

      url = Lib.API('hand'+this.list[index].uid).job.deleteDeployment+'?zoneName=' + this.list[index].zoneName;

      this.loading = true;

      this.$axios({
        method: 'delete',
        url: url
      }).then(res =>{
        const data = res.data;
        if(data.success){
          this.$message({
            showClose: true,
            message:  this.$t("m.deleted")  + " " + this.$t("m.successAdv"),
            type: "success",
            duration: Lib.Common.messageDuration
          });

          this.getList(); // 重新获取
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loadinglist = false;
      })
    },

    // 继续 开发
    enterOldDev(index){
      var item = this.list[index];
      if(item.jobNameSimple === 'Terminal'){ // 
        // do something
      }else if(item.jobName.includes('jupyter')){
        // jupyter 开发 or jupyterlab 开发  /modeltraining/interactive/jupyter/:uid
        this.$router.push({ path: `/modeltraining/interactive/jupyter/${item.uid}`, query: { kubeServiceIp: location.hostname, kubeServicePort: item.kubeServicePort, zoneName: item.zoneName,jobName: item.jobName } });
      }else{
        var newWin = window.open('about:blank');
        var href = `http://${location.hostname}:${item.kubeServicePort}`;
        newWin.location.href = href;
      }
    },
    
  }
};
</script>

<style  lang="less"  scoped >
section {
  padding-left: 20px;
  padding-right: 20px;
}
div.interactive-wrap {
  display: flex;
  flex-wrap: wrap;
  // justify-content: space-between;
  padding-bottom:30px;
  >div {
    flex-basis: 31%;
    margin-right:2%;
    margin-bottom: 20px;
    .interactive-title {
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
      color:#767677;
      font-size: 2em;
    }
  }
}
.el-button + .el-button {
  margin-left: 0;
}

.save-progress > div {
  display: flex;
  margin-bottom: 10px;
  border: 1px solid #eee;
  padding: 10px;
  > div:first-child {
    padding-right: 20px;
  }
  > div:last-child {
    height: 200px;
    overflow-y: scroll;
    flex-grow: 1;
  }
}
</style>