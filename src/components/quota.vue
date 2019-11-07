<template>
    <main>
      <section  v-loading="loading" :element-loading-text="$t('m.loading')">
        <el-form :model="maxForm" :rules="rules" ref="maxForm" label-width="160px"  size="small">     

            <el-form-item :label="$t('m.authority.cpuQuota')+' (Core)'" prop="cpu">
              <el-input-number v-model.number="maxForm.cpu" :min="1" :max="quotasMax.cpu" id="createuser_cpu"></el-input-number>
            </el-form-item>  
            <el-form-item :label="$t('m.authority.gpuQuota')+' (Core)'" prop="gpu">
              <el-input-number v-model.number="maxForm.gpu" :min="0" :max="quotasMax.gpu" id="createuser_gpu"></el-input-number>
            </el-form-item>

            <el-form-item :label="$t('m.authority.memoryQuota')" prop="memory" label-width="98px" style="padding-right:5px;" class="form-memory-unit" :error="errorMsg">
              <div style="display:inline-block;width:58px;position: relative;left: -7px;">
                <el-dropdown @command="memoryHandleCommand" id="createuser_memoryUnit">
                  <span class="el-dropdown-link">
                    ({{maxForm.memoryUnit}}<i class="el-icon-arrow-down el-icon--right"></i>)
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="GB" id="createuser_memoryUnit_gb">GB</el-dropdown-item>
                    <el-dropdown-item command="MB" id="createuser_memoryUnit_mb">MB</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <el-input-number v-model.number="maxForm.memory" :min="1" :max="quotasMaxMemory" id="createuser_memory">        
              </el-input-number>
            </el-form-item>

            <el-form-item :label="$t('m.authority.storageQuota')" prop="storage" label-width="98px" style="padding-right:5px;" class="form-memory-unit">
              <div style="display:inline-block;width:58px;position: relative;left: -7px;">
                <el-dropdown @command="storageHandleCommand" id="createuser_storageUnit">
                  <span class="el-dropdown-link">
                    ({{maxForm.storageUnit}}<i class="el-icon-arrow-down el-icon--right"></i>)
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="GB" id="createuser_storeageUnit_gb">GB</el-dropdown-item>
                    <el-dropdown-item command="MB" id="createuser_storeageUnit_mb">MB</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <el-input-number v-model.number="maxForm.storage" :min="1"  id="createuser_storage">        
              </el-input-number>
            </el-form-item>      
            <el-form-item :label="$t('m.authority.jobQuota')" prop="job">
              <el-input-number v-model.number="maxForm.job" :min="1" :max="quotasMax.job" id="createuser_job"></el-input-number>
            </el-form-item> 
            <!-- <p v-show="errorMsg" class="red-text" style="padding-left:80px;">{{errorMsg}}</p> -->
          
          
          <el-form-item style="margin-top:40px;">
            <el-button type="primary" size="medium" @click="submitForm('maxForm')" id="createuser_btn_submit">{{$t('m.submit')}}</el-button>
            <span v-if="$route.query.operation == 'edit'">
              <el-button  size="medium"  id="createuser_btn_cancel" @click="$router.go(-1)">{{$t('m.cancel')}}</el-button> 
            </span>
            <span v-else>
              <el-button @click="resetForm('maxForm')"  size="medium"  id="createuser_btn_reset">{{$t('m.reset')}}</el-button>
            </span>
            
            
          </el-form-item>
        </el-form>
      </section>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";
import { Message } from "element-ui";

export default {
  data() {
    var validateUserName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.username").toLowerCase()
          )
        );
      } else if (!/^[a-z0-9-_]{2,20}$/.test(value)) {
        callback(new Error(this.$t("m.username") + this.$t("m.rules.regularCommon2")));        
      }　else if(this.isUsernameExist){
        callback(new Error(this.$t("m.username") + this.$t("m.rules.alreadyExists")));
      } else {
        callback();
      }
    };
    var validatePass1 = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.password").toLowerCase()
          )
        );
      } else if (!/^[A-Za-z0-9!@#$%^&*]{6,20}$/.test(value)) {
        callback(new Error(this.$t("m.authority.password") + this.$t("m.rules.regularPass")));
      } else {
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t("m.rules.enterPassAgain")));
      } else if (value !== this.maxForm.password) {
        callback(new Error(this.$t("m.rules.InconsistentPass")));
      } else {
        callback();
      }
    };
    var validateMobile = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.telNumber")
          )
        );
      } else if (
        !/^[0-9]*$/.test(value)
      ) {
        callback(new Error(this.$t("m.authority.telNumber") + this.$t("m.rules.numberNoAnd")));
      } else {
        callback();
      }
    };  
    var validateEmail = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.emailAdress")
          )
        );
      } else if (
        !/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)
      ) {
        callback(new Error(this.$t('m.rules.correntEmail')));
      } else {
        callback();
      }
    };
    var validateJob = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.jobQuota").toLowerCase()
          )
        );
      } else if (
        !/^[1-9][0-9]*$/.test(value)
      ) {
        callback(new Error(this.$t("m.authority.jobQuota") + this.$t("m.rules.positiveIntegerNoAnd")));
      } else {
        callback();
      }
    };
    var validateCPU = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.cpuQuota")
          )
        );
      } else if (
        !/^[1-9][0-9]*$/.test(value)
      ) {
        callback(new Error(this.$t("m.authority.cpuQuota") + this.$t("m.rules.positiveIntegerNoAnd")));
      } else {
        callback();
      }
    };
    var validateGPU = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.gpuQuota")
          )
        );
      } else if (
        !/^[0-9]*$/.test(value)
      ) {
        callback(new Error(this.$t("m.authority.gpuQuota") + this.$t("m.rules.positiveIntegeror0NoAnd")));
      } else {
        callback();
      }
    };
    var validateMemory = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.memoryQuota").toLowerCase()
          )
        );
      } else if (
        !/^[1-9][0-9]*$/.test(value)
      ) {
        callback(new Error(this.$t("m.authority.memoryQuota") + this.$t("m.rules.positiveIntegerNoAnd")));
      } else {
        callback();
      }
    };
    var validateStorage = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.storageQuota").toLowerCase()
          )
        );
      } else if (
        !/^[1-9][0-9]*$/.test(value)
      ) {
        callback(new Error(this.$t("m.authority.storageQuota") + this.$t("m.rules.positiveIntegerNoAnd")));
      } else {
        callback();
      }
    };
    var validateGroup = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t('m.rules.pleaseChoose')+this.$t('m.authority.userGroup').toLowerCase()
          )
        );
      } else {
        callback();
      }
    };
    return {
      pagename:'',
      username:'',
      usernameID:'',
      isUsernameExist:false, // 用户名是否存在，　默认不存在
      isUsernameExistMsg:null,
      creator:'',
      isDefault:'',
      defaultQuota:{},
      maxForm: {
        username: '',
        password: '',
        confirmPassword: '',
        mobile: '',
        email: '',
        job:'',
        cpu:'',
        gpu:'',
        memory:'',
        memoryUnit:'GB',
        storage:'',
        storageUnit:'GB',
        userGroup:'',
        volumeName:'',
        zoneName: '', // 
      },
      rules: {
        username: [
          { required: true, validator: validateUserName,  trigger: 'change,blur' },
        ],
        password: [
          { required: true, validator: validatePass1, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ],
        mobile: [
         { required: true, validator: validateMobile, trigger: 'blur' }
        ],
        email: [      
          { required: true, validator: validateEmail, trigger: 'blur,change' }
        ],
        job: [
         { required: true, validator: validateJob, trigger: 'blur' }
        ],
        cpu: [
          { required: true, validator: validateCPU, trigger: 'blur' }
        ],
        gpu: [
          { required: true, validator: validateGPU, trigger: 'blur' }
        ],
        memory: [
         { required: true, validator: validateMemory, trigger: 'change' }
        ],
        storage: [
          { required: true, validator: validateStorage, trigger: 'blur' }
        ],
        userGroup: [
          { type: 'array',required: true, validator: validateGroup, trigger: 'change' }
        ],
        zoneName: [
          { required: true,  trigger: 'change' }
        ],
      },
      group:[{}],
      volumeList:[{}],
      isVisibleVolumes: true, // 是否显示 卷列表选择框 
      loading: false, // 
      zonesList: [],
      loadingZones: false, // 
      quotasMax:{
        cpu: 10000,
        gpu: 10000,
        job: 10000,
        memory: 10000,　// 单位　为　ｇｂ
      },
      errorMsg:'', // 内存配额超出限制的提示
      isZonesVisibleError: false,
    };
  },
  computed:{
    quotasMaxMemory: {
      get: function () {
        if(this.maxForm.memoryUnit == 'GB'){
          return this.quotasMax.memory ;
        }else if(this.maxForm.memoryUnit == 'MB'){
          return this.quotasMax.memory*1024;
        }
      },
    }
  },

  created(){
    this.operated();
  },

  methods: {
    // 内存配额是否超出限制
    tooMore(){
      if(this.maxForm.memoryUnit == 'GB'){
        if(this.maxForm.memory > this.quotasMax.memory){
          this.errorMsg = this.$t('m.rules.MemoryExceedsZoneQuota'); // '内存超出分区配额'
        }else{
          this.errorMsg = '';
        }
      }else if(this.maxForm.memoryUnit == 'MB'){
        if(this.maxForm.memory/1024 > this.quotasMax.memory){
          this.errorMsg =  this.$t('m.rules.MemoryExceedsZoneQuota'); // '内存超出分区配额' 
        }else{
          this.errorMsg = '';
        }
      }
    },
    
    // 改变分区时修改配额
    changeZone(index){
      this.quotasMax.cpu = this.zonesList[index].cpu;      
      this.quotasMax.gpu = this.zonesList[index].gpu;
      this.quotasMax.job = this.zonesList[index].jobs;
      this.quotasMax.memory = this.zonesList[index].memory;  
      
      if(this.maxForm.cpu > this.quotasMax.cpu){
        this.maxForm.cpu = this.quotasMax.cpu;
      };
      if(this.maxForm.gpu > this.quotasMax.gpu){
        this.maxForm.gpu = this.quotasMax.gpu;
      }
      if(this.maxForm.job > this.quotasMax.job){
        this.maxForm.job = this.quotasMax.job;
      }

      this.tooMore(); // 内存是否超出配额
    },

    // 改变内存配额的单位
    memoryHandleCommand(command){
      this.maxForm.memoryUnit = command;
      this.tooMore(); // 内存是否超出配额
    },

    // 改变存储配额的单位
    storageHandleCommand(command){
      this.maxForm.storageUnit = command;
    },

    

    // 判断是创建还是修改
    operated() {
      if (this.$route.query.operation == "edit") {
        // 修改
        this.pagename = this.$t("m.authority.edit"); // 传给　header 
        this.username = this.$route.query.which;
        this.maxForm.username = this.username;
        this.getwhoInfo(); // 
      } else if (this.$route.query.operation == "create") {
        // 创建
        this.pagename = this.$t("m.authority.create");
        // this.getDefaultQuota();
        this.getVolumes();
        this.getZones();
      }
      this.creator = Lib.Common.getCookies("username"); // 获取创建者      
      this.getGroup(); // 获取组列表
    },

    // 获取用户组
    getGroup(){
      this.$axios
      // '/api/group/groups'
      .get(Lib.API().auth.getGroupList)
      .then( res => {
        const data = res.data;
        if(data.success){
          this.group = data.results.map( ele => {
            var obj = {};
            obj['value'] = ele.id;
            obj['label'] = ele.groupname;
            return obj;
          })
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },

    // 获取数据卷列表
    getVolumes(){
      this.$axios
      // '/api/storage/volumes'
      .get(Lib.API().storage.adminGetVolumes)
      .then( res => {
        const data = res.data;
        if(data.success){
          if(Array.isArray(data.volumeInfos)){
            this.volumeList = data.volumeInfos.filter(ele => {
              if(ele.status == 'Started'){
                return true;
              }
            });
          }
          
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },

    // ====================================================[[ 创建
    
    // 获取分区列表
    getZones(){
      this.loadingZones = true;
      this.$axios
      .get(Lib.API().zone.getZoneList)      // '/api/zone/zones'
      .then(res => {
        const data = res.data;
        if(data.success){
          // 如果分区为空，提示用户需要先创建分区
          if(!data.results.length){
            this.isZonesVisibleError = true;
            this.loadingZones = false;
            return false;
          }

          // 1 赋值
          data.results.forEach( ele => {
            ele.cpu = ele.quotas.CPU; // 剩余 cpu
            ele.gpu = ele.quotas.GPU; // 剩余 cpu
            ele.jobs = ele.quotas.jobs;
            // ele.name = ele.qu
            // 转为 gb 单位
            if(ele.quotas.memory.substr(-2).toLowerCase() == 'mb'){
              ele.memory = parseInt(ele.quotas.memory / 1024)
            }else{
              ele.memory = parseInt(ele.quotas.memory)
            }
          })
          // 2 按照 GPU 大小进行排序， 如果相同，按memory
          data.results.sort((b,a) => {
            if(a.gpu == b.gpu){
              return (a.memory - b.memory)
            }else{
              return (a.gpu - b.gpu);
            }            
          });

          // 4 
          this.zonesList = data.results;
          this.maxForm.zoneName = this.zonesList[0].name;
          this.quotasMax.cpu = this.zonesList[0].cpu;
          this.quotasMax.gpu = this.zonesList[0].gpu;
          this.quotasMax.job = this.zonesList[0].jobs;
          this.quotasMax.memory = this.zonesList[0].memory;     
        }else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loadingZones = false;
      }).then(()=>{
        // 先获取分区并赋予分区第一个对象作为配额的最大值，
        // 再获取默认配额，并赋值默认配额
        // 因为已经　computed 配额的最大限额，所以这时如果出现超额，会有提示
        this.getDefaultQuota();
      })
    },

    // 获取默认配额
    getDefaultQuota(){      
      this.$axios
      // '/api/user/quota'
      .get(Lib.API().auth.getDefaultQuota)
      .then( res => {
        const data = res.data;
        if(data.success){
          this.defaultQuota = data.results;
          this.maxForm.job = this.defaultQuota.taskNumber;
          this.maxForm.cpu = this.defaultQuota.cpu;
          this.maxForm.gpu = this.defaultQuota.gpu;
          this.maxForm.memory = parseInt(this.defaultQuota.internalMemory);
          this.maxForm.memoryUnit = this.defaultQuota.internalMemory.replace(/[\d]/g,'').toUpperCase();
          this.maxForm.storage = parseInt(this.defaultQuota.dataStorage);
          this.maxForm.storageUnit = this.defaultQuota.dataStorage.replace(/[\d]/g,'').toUpperCase();
          
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },

    

    // 判断用户名是否重名
    usernameHandle(){
      if(!this.maxForm.username.trim()){
        return false;
      }
      this.$axios
      .get(Lib.API(this.maxForm.username).auth.userModify)
      // `/api/user/users/${this.maxForm.username}`
      .then( res => {
        const data = res.data;
        if(data.success){
          if(data.result.username.trim()){
            // 用户名存在
            this.isUsernameExist = true;
            this.isUsernameExistMsg = this.$t("m.username") + this.$t("m.rules.alreadyExists");            
          }else{
            this.isUsernameExist = false;
            this.isUsernameExistMsg = null;
          }
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },
    
    // ==================================================== 修改
    // 获取某一个用户信息详情
    getwhoInfo(){
      this.loading = true;
      this.$axios
      // `/api/user/users/${this.username}`
      .get(Lib.API(this.username).auth.userDetail)
      .then( res => {
        const data = res.data;
        if(data.success){     
          this.usernameID = data.result.id;
          this.maxForm.username = this.username;
          this.maxForm.email = data.result.email;
          this.maxForm.userGroup = data.result.groupId;
          this.maxForm.mobile = data.result.mobile;
          this.maxForm.volumeName = data.result.volumeName ? data.result.volumeName : '';
          this.maxForm.zoneName = data.result.zoneName ? data.result.zoneName : '';
          
          this.maxForm.job = data.result.quota.taskNumber;
          this.maxForm.cpu = data.result.quota.cpu;
          this.maxForm.gpu = data.result.quota.gpu;
          this.maxForm.memory = data.result.quota.internalMemory.slice(0, -2);
          this.maxForm.memoryUnit = data.result.quota.internalMemory.substr(-2);
          this.maxForm.storage = data.result.quota.dataStorage.slice(0, -2);
          this.maxForm.storageUnit = data.result.quota.dataStorage.substr(-2);
        
          if(!this.maxForm.volumeName){              
            this.getVolumes();
          }else{
            this.isVisibleVolumes = false;  
          }
          
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loading = false;
      })
    },
    
    // 提交
    submitForm(formName) {

      if(this.isZonesVisibleError){
        return false;
      }

      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 判断是否是默认配额
          if(
            this.maxForm.job == this.defaultQuota.taskNumber &&
            this.maxForm.cpu == this.defaultQuota.cpu && 
            this.maxForm.gpu == this.defaultQuota.gpu && 
            this.maxForm.memory == this.defaultQuota.internalMemory.slice(0, -2) && 
            this.maxForm.memoryUnit == this.defaultQuota.internalMemory.substr(-2) && 
            this.maxForm.storage == this.defaultQuota.dataStorage.slice(0, -2) && 
            this.maxForm.storageUnit == this.defaultQuota.dataStorage.substr(-2) 
          ){
            this.isDefault = 1;
          }else{
            this.isDefault = 0;
          }
          var method = '';
          var url = ''; 
          var params = {
            id: this.usernameID,
            username: this.maxForm.username.trim(),
            email: this.maxForm.email,
            password: this.maxForm.password,
            groupId: this.maxForm.userGroup,
            mobile: this.maxForm.mobile,
            volumeName: this.maxForm.volumeName,
            zoneName: this.maxForm.zoneName,     
          };  
          
          if(this.username){
            // 修改情况
            method = 'put';
            url = Lib.API(this.username).auth.userModify, //`/api/user/users/${this.username}`;
            params.mender = this.creator;
          }else{
            // 创建
            method = 'post';
            // url = 'http://rap2api.taobao.org/app/mock/2311/POST//api/user/users';
            url = Lib.API().auth.userAdd, // '/api/user/users'
            params.creator = this.creator;
            params.quota = {
              cpu: Number(this.maxForm.cpu),
              gpu: Number(this.maxForm.gpu),
              internalMemory: this.maxForm.memory+this.maxForm.memoryUnit,
              dataStorage: this.maxForm.storage + this.maxForm.storageUnit,
              taskNumber: Number(this.maxForm.job),
              isDefault:　this.isDefault
            }            
          }
          
          this.loading = true;
          this.$axios({
            method: method,
            url: url,
            data: params,

          }).then( res => {
            const data = res.data;
            if(data.success){
              this.$router.push({path:'/authority/user/list'});
            }else{
              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText, data.messageParams);
            }
            this.loading = false;
          })
        } else {
          return false;
        }
      });
    },

    // 重置
    resetForm(formName) {
      this.maxForm.memoryUnit = 'GB';
      this.maxForm.storageUnit = 'GB';
      this.maxForm.volumeName = '';
      this.$refs[formName].resetFields();
    }
  }
};
</script>

<style lang="less" scoped>
  form {
    width: 80%;
    margin: 40px auto;
    min-width: 400px;
  }
  .el-input .el-select .el-input .el-input__inner:not(.is-disabled) {
    border: none;
  }
  div.el-popper div.popper__arrow {
    display: none;
  }
  .isUsernameExist{
    input {
      border:1px solid red;
    }
  }
  .isUsernameExist + div.el-form-item__error{
    display: block;
  }
  table.zone-list {
    td,th {
      border: 1px solid #eeeeee;
      padding: 7px 0px 7px 10px;
      text-align: left;
    }
    th {
      padding: 0;
    }
    thead {
      // td {
      //   line-height: 30px !important;
      // }
      
      tr:first-child {
        th:first-child {
          padding-left: 32px;
        }
        th:nth-child(2){
          text-align: center;
        }
      }
    }    
  }
</style>


