<template>
  <main  v-loading="loading" :element-loading-text="$t('m.loading')">
    <div class="main-btn-wrap">   
      <div style="font-weight:bold;height: 40px;line-height: 40px;">
        {{jobName}}
      </div>  
      <div> 
        <el-popover
          placement="bottom"
          width="360"
          v-model="isDeleteVisible" >
            <div>
              <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' + jobName + '?'}}</p>
              <div style="text-align: right; margin: 0">  
                <el-button size="mini" id="interactive_detail_btn_cancel" @click="isDeleteVisible = false">{{$t('m.cancel')}}</el-button>                      
                <el-button type="primary" size="mini"  id="interactive_detail_btn_delete"  @click="isDeleteVisible=false;deleteHandle(id)">{{$t('m.confirm')}}</el-button>
                
              </div>
            </div>
          <el-button slot="reference" size="medium" id="interactive_tensorflow_detail_delete" plain  type="primary" icon="el-icon-delete" >
          {{$t('m.delete')}}
          </el-button>
        </el-popover>
      </div>        
    </div>

    <iframe :src="url" style="width:100% ;height:1080px;border:0;"></iframe>
  </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {

  data() {
    return {  
      id:'',
      url:'',
      jobName: '',       
      isDeleteVisible: false,
      loading: false,
    };
  }, 

  created() {
    this.id = this.$route.query.id;
    this.url = `http://${location.hostname}:${this.$route.query.port}`;
    this.jobName = this.$route.query.jobName;   
  },

  methods: {

    // 删除
    deleteHandle(id) {
      this.loading = true;
      this.$axios
        .delete(Lib.API(id).job.visualDelete)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.$router.push({path:'/modeltraining/visual/list'}); // 跳转到交互式开发列表页
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
            this.loading = false;
          }
        });
    },
  }
};
</script>

<style lang="less" scoped>
 
</style>