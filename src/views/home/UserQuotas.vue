<template>
  
  <div class="item-wrap">
    <div style="margin-right:20px;margin-top:10px;">
      <h2 style="margin-bottom:20px;">{{$t('m.job.userResource')}}</h2>　
      <div style="display:flex;margin-bottom:30px;" v-for="(value,key,index) in quotas" :key="key">
        <div style="flex-basis:100px; text-align:right;padding-right:10px;">
          {{index==0||index==1?key.toUpperCase():$t('m.'+key)}}
        </div>
        <div style="flex-grow:1;">
          <el-progress :show-text="false"  :stroke-width="6" :percentage="parseInt(((value-lastResource[key])/value)*100)"></el-progress> 
          {{lastResource[key]}} 
          <span v-if="index==2">GB</span> 
          <span v-else-if="index==3">GB</span>
          <span v-else-if="index==4">{{$t('m.ge')}}</span>
          <span v-else>Core</span>
          {{$t('m.store.available')}}, {{$t('m.total')}} {{value}}
          <span v-if="index==2">GB</span><span v-else-if="index==3">GB</span><span v-else-if="index==4">{{$t('m.ge')}}</span><span v-else>Core</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data(){
    return{
      username:'',
      volumeName: '', 
      quotas:{
        cpu:1,
        gpu:1,
        memory:1,
        storage:1,
        jobNumber:1
      },
      lastResource:{
        cpu:0,
        gpu:0,
        memory:0,
        storage:0,
        jobNumber:0
      },     
    }
  },
  created(){
    
    this.username = Lib.Common.getCookies("username")?Lib.Common.getCookies("username"):null; // 获取用户名
    this.volumeName = localStorage.getItem('volumeName'); // !!! 不用默认加　nfs 
    this.getUserQuotas();
    this.getUserLast();
  },

  methods:{
    // 获取用户配额
    getUserQuotas(){    
      this.$axios
      // `/api/user/users/${this.username}`
      .get(Lib.API(this.username).auth.userDetail)
      .then( res => {
        const data = res.data;
        if(data.success){       
          this.quotas.cpu = data.result.quota.cpu;
          this.quotas.gpu = data.result.quota.gpu;
          this.quotas.jobNumber = parseInt(data.result.quota.taskNumber);
          
          // 内存
          if(data.result.quota.internalMemory && (data.result.quota.internalMemory.substr(-2).toLowerCase() == 'mb')){
            // 如果是　ｍｂ　转为　ｇｂ
            this.quotas.memory = parseInt(data.result.quota.internalMemory.slice(0, -2))/1024;
            this.quotas.memory = this.quotas.memory.toFixed(2);
          }else{
            this.quotas.memory = parseInt(data.result.quota.internalMemory);
          }

          // 存储
          if(data.result.quota.dataStorage && (data.result.quota.dataStorage.substr(-2).toLowerCase() == 'mb')){
            // 如果是　ｍｂ　转为　ｇｂ
            this.quotas.storage = parseInt(data.result.quota.dataStorage.slice(0, -2))/1024;
            this.quotas.storage = this.quotas.storage.toFixed(2);
          }else{
            this.quotas.storage = parseInt(data.result.quota.dataStorage);
          }
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },
    
    // 获取用户剩余资源
    getUserLast(){      
      this.$axios
      // `/api/user/users/${this.username}`
      .get(Lib.API().job.getUserLastQuotas + `?owner=${this.username}&volumeName=${this.volumeName}`)
      .then( res => {
        const data = res.data;
        if(data.success){     
          this.lastResource.cpu = data.cpu;
          this.lastResource.gpu = data.gpu;
          this.lastResource.jobNumber = Number(data.taskNumber);

          // 内存　如果是　ｍｂ　转为　ｇｂ
          if(data.internalMemory && (data.internalMemory.substr(-4).toLowerCase() == 'byte')){    
            this.lastResource.memory = parseInt(data.internalMemory.slice(0, -4))/1024/1024/1024;
            this.lastResource.memory = this.lastResource.memory.toFixed(2);
          }else if(data.internalMemory && (data.internalMemory.substr(-2).toLowerCase() == 'kb')){    
            this.lastResource.memory = parseInt(data.internalMemory.slice(0, -2))/1024/1024;
            this.lastResource.memory = this.lastResource.memory.toFixed(2);
          }else if(data.internalMemory && (data.internalMemory.substr(-2).toLowerCase() == 'mb')){    
            this.lastResource.memory = parseInt(data.internalMemory.slice(0, -2))/1024;
            this.lastResource.memory = this.lastResource.memory.toFixed(2);
          }else if(data.internalMemory && (data.internalMemory.substr(-2).toLowerCase() == 'gb')) {
            this.lastResource.memory = parseFloat(data.internalMemory).toFixed(2);
          }else {
            this.lastResource.memory = Number(data.internalMemory).toFixed(2);
          }

          // 数据存储 如果是　mb　转为　gb
          if(data.dataStorage && (data.dataStorage.substr(-4).toLowerCase() == 'byte')){    
            this.lastResource.storage = parseInt(data.dataStorage.slice(0, -4))/1024/1024/1024;
            this.lastResource.storage = this.lastResource.storage.toFixed(2);
          }else if(data.dataStorage && (data.dataStorage.substr(-2).toLowerCase() == 'kb')){    
            this.lastResource.storage = parseInt(data.dataStorage.slice(0, -2))/1024/1024;
            this.lastResource.storage = this.lastResource.storage.toFixed(2);
          }else if(data.dataStorage && (data.dataStorage.substr(-2).toLowerCase() == 'mb')){    
            this.lastResource.storage = parseInt(data.dataStorage.slice(0, -2))/1024;
            this.lastResource.storage = this.lastResource.storage.toFixed(2);
          }else if(data.dataStorage && (data.dataStorage.substr(-2).toLowerCase() == 'gb')){
            this.lastResource.storage = parseFloat(data.dataStorage).toFixed(2);
          }else{
            this.lastResource.storage = Number(data.dataStorage).toFixed(2);
          }
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>

</style>


