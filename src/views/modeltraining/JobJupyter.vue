<template>

  <main style="position:relative;" 　>

    <el-dialog
      :title="$t('m.job.status')"
      :visible.sync="DialogVisibleFailedMsg"
      width="70%">
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
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="DialogVisibleFailedMsg = false">{{$t('m.confirm')}}</el-button>
      </span>
    </el-dialog>

    <div>      
      <!-- delete -->
      <el-popover
        placement="right"
        width="360"
        v-model="deleteVisible" >
          <div>
            <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + '?'}}</p>
            <div style="text-align: right; ">  
              <el-button size="mini" id="jupyter_delete_cancel" @click="deleteVisible = false">{{$t('m.cancel')}}</el-button>                      
              <el-button type="primary" id="jupyter_delete_delete"  size="mini" @click="deleteVisible=false;deleteHandle(true)">{{$t('m.confirm')}}</el-button>
            </div>
          </div>
        <el-button  slot="reference"  size="medium" type="primary" plain id="jupyter_delete"  icon="el-icon-delete" >{{$t('m.delete')}}</el-button>
      </el-popover>
         
      <el-button size="medium" type="primary" plain  @click="DialogVisibleFailedMsg = true; getFailedMsgList()"  icon="el-icon-view" id="jupyter_log">{{$t('m.job.status')}}</el-button>
    </div>

    <section style="padding:0;"  v-loading="loading"  :element-loading-text="$t('m.loading')">
      <iframe :src="src" style="width:100%; min-height:700px;" frameborder="0" v-if="!isDelete" >  
        <a :href="src">{{ $t('m.job.noiframe')}}</a>
      </iframe>
    </section>

    
  </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data(){
    return {
      DialogVisibleFailedMsg: false, // 任务运行失败/错误　信息
      failedMsgList: [],
      loading: false, // 加载遮罩层
      src: '',
      deleteVisible: false,
      isDelete: false,
      token: '',
      uid: '',
      jobName: '', // 
    }
  },

  created(){
    this.uid = this.$route.params.uid;
    this.token = this.$route.params.uid.slice(0,8);
    this.jobName = this.$route.query.jobName;
    // 把 删除 deployment 请求的 url 地址存起来，供删除时用
    localStorage.setItem('deleteJupyterApi',Lib.API(this.$route.params.uid).job.deleteDeployment+'?zoneName=' + this.$route.query.zoneName);
  },

  mounted(){   
    // iframe 的地址
    this.src = `http://${this.$route.query.kubeServiceIp}:${this.$route.query.kubeServicePort}`;
  },


  methods: {
    // 获取失败/错误信息
    getFailedMsgList(){
      // console.log('this.uid = ' + this.uid);
      // console.log('this.jobName = ' + this.jobName);
      this.$axios
        .get(Lib.API(this.uid,this.jobName).job.detailFailedInfo)
        .then(res => {
          const data = res.data;
          if (data.success) { 
            this.failedMsgList = data.jobErrors;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
      })
    },
    
    // 删除 
    deleteHandle(arg){
      var url;
      if(arg){ // 手动删除
        url = Lib.API('hand'+this.$route.params.uid).job.deleteDeployment+'?zoneName=' + this.$route.query.zoneName;
        this.loading = true;
      }else{
        url = Lib.API(this.$route.params.uid).job.deleteDeployment+'?zoneName=' + this.$route.query.zoneName
      }

      this.$axios({
        method: 'delete',
        url: url,
      }).then(res =>{
        const data = res.data;
        this.loading = false; // 关闭加载遮罩层
        if(data.success){
          // 删除成功
          this.$message({
            showClose: true,
            message: this.$t('m.job.closeDeployment') + this.$t("m.successAdv"),
            type: "success",
            duration: Lib.Common.messageDuration
          });
          this.isDelete = true;
          this.$router.push({path:'/modeltraining/interactive/list'}); // 跳转到交互式开发列表页
          // }
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);        
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
main.el-loading-parent--relative {
  div.el-loading-mask {
    z-index: 1000;
  }
}
</style>


