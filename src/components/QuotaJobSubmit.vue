

<template>
  <section style="padding:0; margin:0;">
    <!-- 资源配额显示 -->
    <div　class="user-resource">
      <el-form-item :label="$t('m.job.boundZone')" > <!-- 绑定的分区 -->
        {{this.form.zoneName}}                    
      </el-form-item>
      <el-form-item :label="$t('m.job.remainResourceOfTheZone')" v-if="!istemplate"> <!-- 分区剩余资源 -->
        GPU: <strong>{{zoneItem.gpu}}</strong> Core &nbsp; &nbsp; 
        CPU: <strong>{{zoneItem.cpu}}</strong> Core   &nbsp; &nbsp;
        {{$t('m.memory')}}: <strong>{{zoneItem.memory}}</strong> GB &nbsp; &nbsp;
        {{$t('m.zone.jobsNum')}}: <strong>{{zoneItem.jobNumber}}</strong>            
      </el-form-item>
      <el-form-item :label="$t('m.job.userRemainResource')" v-if="!istemplate"> <!-- 用户剩余资源 -->
        GPU: <strong>{{user.last.gpu}}</strong> Core &nbsp; &nbsp;
        CPU: <strong>{{user.last.cpu}}</strong> Core &nbsp; &nbsp;
        {{$t('m.memory')}}: <strong>{{user.last.memory}}</strong> GB &nbsp; &nbsp;
        {{$t('m.zone.jobsNum')}}: <strong>{{user.last.jobNumber}}</strong>                      
      </el-form-item>
      <el-form-item :label="$t('m.job.userTotalResource')" v-else> <!-- 用户配额 -->
        GPU: <strong>{{user.quotas.gpu}}</strong> Core &nbsp; &nbsp;
        CPU: <strong>{{user.quotas.cpu}}</strong> Core &nbsp; &nbsp;
        {{$t('m.memory')}}:  <strong>{{user.quotas.memory}}</strong> GB &nbsp; &nbsp;
        {{$t('m.zone.jobsNum')}}:  <strong>{{user.quotas.jobNumber}}</strong>                     
      </el-form-item>  
    </div>

    <!-- 单机版 -->
    <div v-if="!isdistributed">                
      <el-form-item :label="isneedgpu?$t('m.memory'):$t('m.memory')+'(GB)'" :label-width="isneedgpu?'137px':'200px'" style="padding-right:5px;">
        <div style="display:inline-block;width:58px;position: relative;left: -7px;" v-show="isneedgpu">
          <el-dropdown @command="handleCommand" id="submitjob_select_amount"  trigger="click">
            <span class="el-dropdown-link">
              ({{form.unit}}<i class="el-icon-arrow-down el-icon--right"></i>)
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="GB" id="submitjob_option_GB">GB</el-dropdown-item>
              <el-dropdown-item command="MB" id="submitjob_option_MB">MB</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <el-input-number v-model.number="form.amount" :precision="0" :step="1" :min="1" :max="standAloneMaxMemory" @blur="form.amount=form.amount?form.amount:1;computedErrorMsg()" @change="computedErrorMsg()" id="submitjob_memory_input"  >        
        </el-input-number>
      </el-form-item>
      <el-form-item label="CPU (Core)">
        <el-input-number v-model.number="form.cpu" :precision="0" :step="1"  :min="1" :max="maxCPU" @blur="form.cpu=form.cpu?form.cpu:1" id="submitjob_cpu">
        </el-input-number>                
      </el-form-item>
      <el-form-item label="GPU (Core)" v-if="isneedgpu">
        <el-input-number v-model.number="form.gpu" :precision="0" :step="1" :min="0"  :max="maxGPU" @blur="form.gpu=form.gpu?form.gpu:0" @change="$emit('gpu',form.gpu)" id="submitjob_gpu">
        </el-input-number>       
      </el-form-item>
      <el-form-item :label="$t('m.gpuType')"  v-if="isneedgpu">
        <el-select v-model="form.gpuType"  id="submitjob_select_gputype" clearable  :placeholder="$t('m.rules.pleaseChoose')"> 
          <el-option v-for="item in gpuTypeList" :label="item" :value="item" :key="item"></el-option>
        </el-select>               
      </el-form-item>
    </div>

    <!-- 分布式 -->
    <div class="parameter-server-wrap" v-else>
      
      <!-- worker　的配额 -->
      <div class="parameter-server-item">
        <el-form-item :label="$t('m.job.numberOfWorker')">
          <el-input-number :precision="0" :step="1"  :min="1" :max="serverQuotasMaxCPU" v-model.number="form.workerQuotas.count"  @blur="form.workerQuotas.count=form.workerQuotas.count?form.workerQuotas.count:1;numberBlurChangeHandle()"  @change="numberBlurChangeHandle" id="submitjob_worker_number"></el-input-number>                    
          </el-form-item>
        
        <el-form-item :label="$t('m.memory')" label-width="137px" style="padding-right:5px;">
          <div style="display:inline-block;width:58px;position: relative;left: -7px;">
            <el-dropdown @command="workerHandleCommand"  trigger="click">
              <span class="el-dropdown-link">
                ({{form.workerQuotas.unit}}<i class="el-icon-arrow-down el-icon--right"></i>)
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="GB" id="submitjob_worker_option_GB">GB</el-dropdown-item>
                <el-dropdown-item command="MB" id="submitjob_worker_option_MB">MB</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <el-input-number v-model.number="form.workerQuotas.amount" :precision="0" :step="1"  :min="1" :max="workerServerQuotasMaxMemory" @change="numberBlurChangeHandle"  id="submitjob_worker_memory_input">        
          </el-input-number>
        </el-form-item>
        <el-form-item label="CPU (Core)">
          <el-input-number v-model.number="form.workerQuotas.cpu" :precision="0" :step="1"  :min="1" :max="serverQuotasMaxCPU" @blur="form.workerQuotas.cpu=form.workerQuotas.cpu?form.workerQuotas.cpu:1;numberBlurChangeHandle()" @change="numberBlurChangeHandle" id="submitjob_worker_cpu">
          </el-input-number>                
        </el-form-item>
        <el-form-item label="GPU (Core)">
          <el-input-number v-model.number="form.workerQuotas.gpu" :precision="0" :step="1"  :min="0" :max="workerServerQuotasMaxGPU" @blur="form.workerQuotas.gpu=form.workerQuotas.gpu?form.workerQuotas.gpu:0;numberBlurChangeHandle()" @change="numberBlurChangeHandle();$emit('workerQuotasgpu',form.workerQuotasgpu.gpu)" id="submitjob_worker_gpu">
          </el-input-number>                
        </el-form-item>
      </div>

      <!-- 参数服务器　选中配额 -->
      <div class="parameter-server-item">
        <el-form-item :label="$t('m.job.numberOfParameterServer')">
          <el-input-number v-model="form.parameterServerQuotas.count" :precision="0" :step="1"  :min="1" :max="serverQuotasMaxCPU" @blur="form.parameterServerQuotas.count=form.parameterServerQuotas.count?form.parameterServerQuotas.count:1;numberBlurChangeHandle()" @change="numberBlurChangeHandle"  label="描述文字" id="submitjob_parameterServer" ></el-input-number>
        </el-form-item>

        <el-form-item :label="$t('m.memory')"  label-width="137px" style="padding-right:5px;">
          <div style="display:inline-block;width:58px;position: relative;left: -7px;">
            <el-dropdown @command="paraHandleCommand"  trigger="click">
              <span class="el-dropdown-link">
                ({{form.parameterServerQuotas.unit}}<i class="el-icon-arrow-down el-icon--right"></i>)
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="GB" id="submitjob_parameter_option_GB">GB</el-dropdown-item>
                <el-dropdown-item command="MB" id="submitjob_parameter_option_MB">MB</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <el-input-number v-model.number="form.parameterServerQuotas.amount" :precision="0" :step="1"  :min="1" :max="parameterServerQuotasMaxMemory" @blur="form.parameterServerQuotas.amount=form.parameterServerQuotas.amount?form.parameterServerQuotas.amount:1;numberBlurChangeHandle()" @change="numberBlurChangeHandle"  id="submitjob_parameter_memory_input">        
          </el-input-number>
        </el-form-item>
        <el-form-item label="CPU (Core)">
          <el-input-number v-model.number="form.parameterServerQuotas.cpu" :precision="0" :step="1"  :min="1" :max="serverQuotasMaxCPU" @blur="form.parameterServerQuotas.cpu=form.parameterServerQuotas.cpu?form.parameterServerQuotas.cpu:1;numberBlurChangeHandle()" @change="numberBlurChangeHandle" id="submitjob_parameter_cpu">
          </el-input-number>                
        </el-form-item>
      </div>
      
    </div>

    <p class="red-text" style="padding-left:80px;">{{errorMsg}}</p> 

  </section>
</template>

<script>
  import Lib from "../assets/js/Lib";

  export default {
    name:'quotaJobSubmit',
    props: {
      isdistributed: { // 是否是单机版
        type: Boolean,
        default: true,
      }, // 
      istemplate: { // 是否是模板
        type: Boolean,
        default: false,
      }, //
      form: {
        type: Object,
        default: {    
          cpu:1,
          gpu:0,
          amount:1,
          unit:'GB', 
          gpuType: '',
          parameterServerQuotas: {
            count: 1,
            cpu:1,
            amount:1,
            unit:'GB',
          },
          workerQuotas: {
            count:1 ,
            cpu:1,
            gpu:0,
            amount:1,
            unit:'GB',
          },
        }
      },
      isneedgpu: {
        type: Boolean,
        default: true,
      }
    },
    data: function() {  
      return { 
        // isdistributed: true,
        // istemplate: false,
        // form:{    
        //   cpu:1,
        //   gpu:0,
        //   amount:1,
        //   unit:'GB', 
        //   gpuType: '',
        //   parameterServerQuotas: {
        //     count: 1,
        //     cpu:1,
        //     amount:1,
        //     unit:'GB',
        //   },
        //   workerQuotas: {
        //     count:1 ,
        //     cpu:1,
        //     gpu:0,
        //     amount:1,
        //     unit:'GB',
        //   },
        // },
        zoneItem: {
          cpu:'',
          gpu:'',
          memory:'',
          jobNumber:'' // GB
        },
        user:{
          quotas: {
            cpu:1,
            gpu:0,
            memory:1,
            jobNumber:1,
          },
          last: {
            cpu:'',
            gpu:'',
            memory:'',
            jobNumber:'',
          }
        }, 
        errorMsg: '' , // 资源不足的提示
        gpuTypeList:[''], // GPU类型
        
      }
    },

    computed:{

      // 最大值 计算
      maxCPU(){ // cpu　最大值
        if(!this.istemplate) { // 非模板
          return Math.min(this.zoneItem.cpu , this.user.last.cpu);
        }else{
          return this.user.quotas.cpu;
        }
      },
      maxGPU(){ // gpu　最大值
        if(!this.istemplate) { // 非模板
          return Math.min(this.zoneItem.gpu, this.user.last.gpu );
        }else{
          return this.user.quotas.gpu;
        }        
      },
      maxMemory(){ // memory　最大值
        if(!this.istemplate) { // 非模板
          return Math.min(this.zoneItem.memory, this.user.last.memory);
        }else{
          return this.user.quotas.memory;
        }        
      },
      maxJobNumber(){ // job number　最大值
       if(!this.istemplate) { // 非模板
          return Math.min(this.zoneItem.jobNumber, this.user.last.jobNumber );
        }else{
          return this.user.quotas.jobNumber;
        }
      },

      // 单机版　
      standAloneMaxMemory(){ // 单机版　memory　最大值
        if(this.form.unit == 'GB'){ 
          return this.maxMemory; // 可能是分数， 故向下取整
        }else{
          return  this.maxMemory * 1024;
        }      
      },

      // 分布式　－》  worker　最大值　计算
      serverQuotasMaxCPU(){
        return this.maxCPU - 1;
      },      
      workerServerQuotasMaxGPU(){
        return this.maxGPU / this.form.workerQuotas.count;
      },
      workerServerQuotasMaxMemory(){
        if(this.form.workerQuotas.unit == 'GB'){
          return this.maxMemory - 1;
        }else{
          return  this.maxMemory * 1024 - 1;
        } 
      },

      // 分布式　－》  参数服务器　最大值　计算      
      parameterServerQuotasMaxMemory(){
        if(this.form.parameterServerQuotas.unit == 'GB'){
          return this.maxMemory - 1;
        }else{
          return  this.maxMemory *1024 - 1;
        } 
      },
      
    },

    watch:{
      isdistributed(){
        if(!this.isdistributed){ // 是 单机版
          this.computedErrorMsg();
        }else{
          this.numberBlurChangeHandle();
        }
      }
    },

    created(){
      this.username = Lib.Common.getCookies("username")?Lib.Common.getCookies("username"):null; // 获取用户名
      
      this.getUserQuotas();
      this.getGpuTypes(); 
    },
    
    mounted(){
      // 如果是模板修改页面， 会传来 form-quotas 的值， 赋值
      if(this.formquotas){
        this.form = this.formquotas;
      }
      
    },

    methods: {

      // 改变 内存 单位后， 重新验证
      handleCommand(command){
        this.form.unit = command;
        this.computedErrorMsg();
      },
      paraHandleCommand(command){
        this.form.parameterServerQuotas.unit = command;
        this.numberBlurChangeHandle();
      },
      workerHandleCommand(command){
        this.form.workerQuotas.unit = command;
        this.numberBlurChangeHandle();
      },

      // 非分布式 验证
      computedErrorMsg(){
        
        if(this.maxCPU < 1){
          this.errorMsg =  this.$t('m.rules.insufficientCPU'); // 'cpu资源不足';
          return false;
        }else{
          this.errorMsg = '';
        };
        
        
        // 单位都转为　GB 统一计算
        let m;
        if(this.form.unit == 'MB'){
          m = this.form.amount / 1024; // 参数服务器　内存　的值　
        }
        
        m = m || this.form.amount;
        if(this.maxMemory < m ){ // 因为 内存有单位， 当用户剩余 < 1， 但是选择 MB 也是可以创建的
          this.errorMsg = this.$t('m.rules.insufficientMemory');// 内存不足
          return false;
        }else{
          this.errorMsg = '';
        };

        if(this.maxJobNumber < 1){ // 提交任务，任务数量为０
          this.errorMsg =  this.$t('m.rules.insufficientNumber'); // '任务数量不足';
          return false;
        }else{
          this.errorMsg = '';
        }
            
      },

      // 分布式 计算其 “和“ 的值， 是否大于配额
      numberBlurChangeHandle(){
        
        if(this.form.workerQuotas.gpu > this.workerServerQuotasMaxGPU){
          this.errorMsg = this.$t('m.rules.insufficientGPU'); // gpu 资源不足
          return false;
        }else{
          this.errorMsg = '';
        }

        // 2,1 cpu
        if((this.form.parameterServerQuotas.cpu*this.form.parameterServerQuotas.count + this.form.workerQuotas.cpu*this.form.workerQuotas.count) > this.maxCPU){
          this.errorMsg = this.$t('m.rules.insufficientCPU'); // 'cpu资源不足';
          return false;
        }else{
          this.errorMsg = '';
        }

        // 2,2 jobNumber
        if((this.form.parameterServerQuotas.count + this.form.workerQuotas.count) > this.maxJobNumber){
          this.errorMsg = this.$t('m.rules.insufficientNumber'); // '任务数量不足';
          return false;
        }else{
          this.errorMsg = '';
        }

        // 2.3 内存
        let p,w;
        // 单位都转为　GB 统一计算
        if(this.form.parameterServerQuotas.unit == 'MB'){
          p = this.form.parameterServerQuotas.amount / 1024; // 参数服务器　内存　的值　
        }
        if(this.form.workerQuotas.unit == 'MB'){
          w = this.form.workerQuotas.amount / 1024;　// work 内存　的值
        }
        p = p || this.form.parameterServerQuotas.amount;
        w = w || this.form.workerQuotas.amount;
        
        // count 为　个数
        if((p*this.form.parameterServerQuotas.count + w*this.form.workerQuotas.count) > this.maxMemory){ 
          this.errorMsg = this.$t('m.rules.insufficientMemory'); // '内存资源不足'
        }else{
          this.errorMsg = '';
        }

      },

      // 发起 “用户详情" 请求，获取用户配额及分区名
      getUserQuotas(){   
        this.loading = true; 
        this.$axios
        // `/api/user/users/${this.username}`
        .get(Lib.API(this.username).auth.userDetail)
        .then( res => {
          const data = res.data;
          if(data.success){    
            // 用户配额   
            this.user.quotas.cpu = data.result.quota.cpu;
            this.user.quotas.gpu = data.result.quota.gpu;
            this.user.quotas.jobNumber = parseInt(data.result.quota.taskNumber);
            
            // 统一 转为　ｇｂ
            if(data.result.quota.internalMemory.substr(-2).toLowerCase() == 'mb'){ 
              this.user.quotas.memory = parseInt(data.result.quota.internalMemory.slice(0, -2))/1024;
              this.user.quotas.memory = Number(this.user.quotas.memory.toFixed(2));
            }else{
              this.user.quotas.memory = parseFloat(data.result.quota.internalMemory.slice(0, -2));
              this.user.quotas.memory = Number(this.user.quotas.memory.toFixed(2));
            }
            
            this.form.zoneName = data.result.zoneName;
            this.getQuota();  // 获取用户剩余配额和分区配额
            
            this.loading = false;
            
          }else{
            Lib.Common.errorMessage(this.$t("m.responseErrorMessage." + data.message || "default"), data.messageParams);
          }
        })
      },

      // 获取用户剩余配额和分区配额
      async getQuota(){
        let getUserLast = await this.$axios.get(Lib.API().job.getUserLastQuotas + `?owner=${this.username}`);       
        let getZone = await this.$axios.get(Lib.API(this.form.zoneName).zone.getZone);
        
        let userLast = getUserLast.data;
        let zoneItem = getZone.data;

        if(userLast.success){     
          this.user.last.cpu = userLast.cpu;
          this.user.last.gpu = userLast.gpu;
          this.user.last.jobNumber = parseInt(userLast.taskNumber);
          
          if(userLast.internalMemory.substr(-2).toLowerCase() == 'mb'){
            // 如果是　ｍｂ　转为　ｇｂ
            this.user.last.memory = parseInt(userLast.internalMemory.slice(0, -2))/1024;
            this.user.last.memory = Number(this.user.last.memory.toFixed(2));
          }else{
            this.user.last.memory = parseFloat(userLast.internalMemory.slice(0, -2));
            this.user.last.memory = Number(this.user.last.memory.toFixed(2));
          }
        }else{
          Lib.Common.errorMessage(this.$t("m.responseErrorMessage." + userLast.message || "default"), userLast.messageParams);
        }

        // zone        
        if (zoneItem.success) {
          this.zoneItem.cpu = zoneItem.result.quotas.CPU - zoneItem.result.quotas['CPU Used']; // 剩余 cpu
          this.zoneItem.gpu = zoneItem.result.quotas.GPU - zoneItem.result.quotas['GPU Used']; // 剩余 cpu
          this.zoneItem.jobNumber = zoneItem.result.quotas.jobs - zoneItem.result.quotas['jobs running']; // 剩余 cpu
          //  mb -> gb
          if(zoneItem.result.quotas.memory.substr(-2).toLowerCase() == 'mb'){
            zoneItem.result.quotas.memory = Number(Math.round(parseInt(zoneItem.result.quotas.memory) / 1024))
          }else{
            zoneItem.result.quotas.memory = parseInt(zoneItem.result.quotas.memory)
          }

          if(zoneItem.result.quotas['memory used']){
            if(zoneItem.result.quotas['memory used'].substr(-2).toLowerCase() == 'mb'){
              zoneItem.result.quotas['memory used'] = Math.round(parseInt(zoneItem.result.quotas['memory used']) / 1024)
            }else{
              zoneItem.result.quotas['memory used'] = parseInt(zoneItem.result.quotas['memory used'])
            }
          }
          
          this.zoneItem.memory = (zoneItem.result.quotas.memory - zoneItem.result.quotas['memory used']);            
          
        } else {
          Lib.Common.errorMessage(this.$t("m.responseErrorMessage." + zoneItem.message || "default"),zoneItem.messageParams);
        }

        // 初始化数据　检测是否　
        this.computedErrorMsg(); // 初始数据，错误提示 
      },


      // 获取 gpu 类型
      getGpuTypes(){  
        this.$axios
        .get(Lib.API().job.getGpuTypes)
        .then( res => {
          const data = res.data;
          if(data.success){ 
            if(data.gputypes.length) {
              this.gpuTypeList = data.gputypes;
            }                    
          }else{
            Lib.Common.errorMessage(this.$t("m.responseErrorMessage." + data.message || "default"), data.messageParams);
          }
        })
      },

    }
    
  }
</script>

<style lang="less" scoped>
  .parameter-server-wrap {
    display:flex; 
    flex-wrap: wrap;
    margin-left: 78px;
    .parameter-server-item {
      max-width: 45%;
      border:1px solid #eee;
      border-radius:5px;
      padding-top: 20px;
      padding-right: 20px;
      margin-right: 20px;
    }
  }

  .user-resource {
    margin-bottom: 12px;
    .el-form-item {
      margin-bottom: 3px !important;
    }
  }
  
  .el-dropdown-link:hover {
    cursor: pointer;
    color: #1a99a5;
  }
</style>

