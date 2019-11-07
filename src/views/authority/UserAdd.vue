<template>
    <main>
      <section  v-loading="loading" :element-loading-text="$t('m.loading')">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="180px"  size="small">
          <el-form-item :label="$t('m.username')" prop="username" >
            <span v-if="username">{{this.username}}</span>
            <span v-else>
              <el-input id="createuser_username" v-model.trim="ruleForm.username"></el-input>
              <!-- <el-input id="createuser_username" v-model="ruleForm.username" @blur="usernameHandle"></el-input> -->
            </span>            
          </el-form-item>
          <el-form-item v-if="!username" :label="$t('m.authority.password')" prop="password">
            <input type="hidden">
            <input type="text" style="width: 0px;height: 0px;position: absolute;z-index:-1;border: none;">
            <el-input id="createuser_password" auto-complete="new-password" show-password type="password" v-model.trim="ruleForm.password"></el-input>
          </el-form-item>
          <el-form-item v-if="!username"  :label="$t('m.authority.confirmPassword')" prop="confirmPassword">
            <el-input id="createuser_confirmpassword"  type="password" v-model.trim="ruleForm.confirmPassword"></el-input>
          </el-form-item>
          <el-form-item :label="$t('m.authority.mobile')" prop="mobile">
            <el-input id="createuser_mobile" v-model.trim="ruleForm.mobile"></el-input>
          </el-form-item>
          <el-form-item :label="$t('m.authority.email')" prop="email">
            <el-input id="createuser_email" v-model.trim="ruleForm.email"></el-input>
          </el-form-item>
          <el-form-item :label="$t('m.authority.userGroup')" prop="userGroup">
            <el-select v-model="ruleForm.userGroup" id="createuser_usergroup" :placeholder="$t('m.rules.pleaseChoose')+$t('m.authority.userGroup')">
               <el-option
                v-for="item in group"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 选择卷列表 -->
          <el-form-item :label="$t('m.store.dataVolume')" v-if="isVisibleVolumes">
            <!-- 如果有　nfs, 那么就只有这一个　nfs, 就默认给这个值，因为管理员为　nfs 时，不可以创建卷，但是为空时可以创建。为避免是 nfs，但是用户没有选，创建卷时判断不了有没有　nfs 这种情况 -->
            <span v-if="volumeList.length && volumeList[0].volumeName==='nfs' && volumeList[0].status==='Started'">
              nfs
            </span>
            <el-select v-else v-model="ruleForm.volumeName" id="createuser_volume" clearable :placeholder="$t('m.rules.pleaseChoose')+$t('m.store.dataVolume')">
              <el-option
                v-for="item in volumeList"
                :key="item.volumeName"
                :label="item.volumeName"
                :value="item.volumeName">
              </el-option>
            </el-select>
          </el-form-item>  
          <el-form-item :label="$t('m.store.dataVolume')" v-else>
            {{ruleForm.volumeName}}
          </el-form-item>       
          
          <!-- 分区　＋　配额 -->
          <!-- <div v-if="!username"> -->
            <!-- 选中分区 -->
          <el-form-item :label="$t('m.job.chooseZone')" prop="zoneName">
            <table class="zone-list">
              <thead>
                <tr>
                  <th rowspan="2">{{$t('m.zone.name')}}</th>
                  <th colspan="4">{{$t('m.zone.quota')}}</th>
                </tr>    
                <tr>
                  <th  style="line-height:20px;padding:0;">GPU</th>
                  <th>{{$t('m.memory')}}</th>
                  <th>CPU</th>
                  <th>{{$t('m.zone.jobsNum')}}</th>
                </tr>                
              </thead>
              <tbody>
                <tr v-for="(item,index) in zonesList" :key="item.name">
                  <td style="line-height:20px;"><el-radio v-model="ruleForm.zoneName" :label="item.name" @change="changeZone(index)"></el-radio></td>
                  <td>{{item.gpu}} Core</td>
                  <td>{{item.memory}} GB</td>
                  <td>{{item.cpu}} Core</td>
                  <td>{{item.jobs}}</td>
                </tr>
              </tbody>
            </table>
            <p  v-show="username" style="padding:0;margin:0;color:#666;">{{$t('m.authority.changeZone')}}</p>
            <span v-if="isZonesVisibleError" class="red-text">{{$t('m.createZoneFirst')}}</span>
          </el-form-item>

          <el-form-item :label="$t('m.authority.cpuQuota')+' (Core)'" prop="cpu">
            <el-input-number v-model.number="ruleForm.cpu" :min="1" :max="quotasMax.cpu" id="createuser_cpu"></el-input-number>
          </el-form-item>  
          <el-form-item :label="$t('m.authority.gpuQuota')+' (Core)'" prop="gpu">
            <el-input-number v-model.number="ruleForm.gpu" :min="0" :max="quotasMax.gpu" id="createuser_gpu"></el-input-number>
          </el-form-item>

          <el-form-item :label="$t('m.authority.memoryQuota')" prop="memory" label-width="118px" style="padding-right:5px;" class="form-memory-unit" :error="errorMsg">
            <div style="display:inline-block;width:58px;position: relative;left: -7px;">
              <el-dropdown @command="memoryHandleCommand" id="createuser_memoryUnit" class="drop-down">
                <span class="el-dropdown-link">
                  ({{ruleForm.memoryUnit}}<i class="el-icon-arrow-down el-icon--right"></i>)
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="GB" id="createuser_memoryUnit_gb">GB</el-dropdown-item>
                  <el-dropdown-item command="MB" id="createuser_memoryUnit_mb">MB</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <el-input-number v-model.number="ruleForm.memory"   :min="1" :max="quotasMaxMemory" id="createuser_memory">        
            </el-input-number>
          </el-form-item>

          <el-form-item :label="$t('m.authority.storageQuota')" prop="storage" label-width="118px" style="padding-right:5px;" class="form-memory-unit">
            <div style="display:inline-block;width:58px;position: relative;left: -7px;">
              <el-dropdown @command="storageHandleCommand" id="createuser_storageUnit" class="drop-down">
                <span class="el-dropdown-link">
                  ({{ruleForm.storageUnit}}<i class="el-icon-arrow-down el-icon--right"></i>)
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="GB" id="createuser_storeageUnit_gb">GB</el-dropdown-item>
                  <el-dropdown-item command="MB" id="createuser_storeageUnit_mb">MB</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <el-input-number v-model.number="ruleForm.storage" :min="1"  id="createuser_storage">        
            </el-input-number>
          </el-form-item>      
          <el-form-item :label="$t('m.authority.jobQuota')" prop="job">
            <el-input-number v-model.number="ruleForm.job" :min="1" :max="quotasMax.job" id="createuser_job"></el-input-number>
          </el-form-item> 
          <!-- </div> -->
          
          <el-form-item style="margin-top:40px;">
            <el-button type="primary" size="medium" @click="submitForm('ruleForm')" id="createuser_btn_submit">{{$t('m.submit')}}</el-button>
            <el-button  size="medium"  id="createuser_btn_cancel" @click="$router.go(-1)">{{$t('m.cancel')}}</el-button>            
          </el-form-item>
        </el-form>
      </section>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";
// import { Message } from "element-ui";

export default {
  data() {
    var validateUserName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.username").toLowerCase()
          )
        );
      } else if (!/^[a-z0-9-]{2,20}$/.test(value)) {
        callback(new Error(this.$t("m.username") + this.$t("m.rules.regularCommon5")));        
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
      } else if (value !== this.ruleForm.password) {
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
    var validateZoneName = (rule, value, callback) => {
      if (value === "" && !this.zonesList.length) {
        callback(
          new Error(this.$t('m.createZoneFirst'))
        );
      } else {
        callback();
      }
    };
    return {
      pagename:'',
      username:'',
      usernameID:'',
      creator:'',
      isDefault:'',
      defaultQuota:{},
      ruleForm: {
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
          { required: true, validator: validateUserName,  trigger: 'blur' },
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
          { required: true, validator: validateEmail, trigger: 'blur' }
        ],
        userGroup: [
          { type: 'array',required: true, validator: validateGroup, trigger: 'change' }
        ],
        zoneName: [
          { required: true, validator: validateZoneName, trigger: 'change' }
        ],
      },
      group:[{}],
      volumeList:[{}],
      isVisibleVolumes: true, // 是否显示 卷列表选择框 
      loading: false, // 
      zonesList: [],
      quotasMax:{
        cpu: 10000,
        gpu: 10000,
        job: 10000,
        memory: 10000,　// 单位　为　ｇｂ
      },
      isZonesVisibleError: false,
    };
  },
  computed:{
    // 内存最大值
    quotasMaxMemory: {
      get: function () {
        if(this.ruleForm.memoryUnit == 'GB'){
          return this.quotasMax.memory ;
        }else if(this.ruleForm.memoryUnit == 'MB'){
          return this.quotasMax.memory*1024;
        }
      },
    },

    // 内存配额超出限制的提示
    errorMsg: {
      get: function () {
        if(this.ruleForm.memoryUnit == 'GB'){
          if(this.ruleForm.memory > this.quotasMax.memory){
            return this.$t('m.rules.MemoryExceedsZoneQuota'); // '内存超出分区配额'
          }else{
            return '';
          }
        }else if(this.ruleForm.memoryUnit == 'MB'){
          if(this.ruleForm.memory/1024 > this.quotasMax.memory){
            return this.$t('m.rules.MemoryExceedsZoneQuota'); // '内存超出分区配额' 
          }else{
            return '';
          }
        }
      }
    }
  },

  created(){
    this.operated(); 
  },
  mounted(){   
    document.getElementById('createuser_username').value = '';
    document.getElementById('createuser_password').value = '';
    
  },


  methods: {
    
    // 改变分区时修改配额
    changeZone(index){
      this.quotasMax.cpu = this.zonesList[index].cpu;      
      this.quotasMax.gpu = this.zonesList[index].gpu;
      this.quotasMax.job = this.zonesList[index].jobs;
      this.quotasMax.memory = this.zonesList[index].memory;  
      
      if(this.ruleForm.cpu > this.quotasMax.cpu){
        this.ruleForm.cpu = this.quotasMax.cpu;
      };
      if(this.ruleForm.gpu > this.quotasMax.gpu){
        this.ruleForm.gpu = this.quotasMax.gpu;
      }
      if(this.ruleForm.job > this.quotasMax.job){
        this.ruleForm.job = this.quotasMax.job;
      }

    },

    // 改变内存配额的单位
    memoryHandleCommand(command){
      this.ruleForm.memoryUnit = command;
    },

    // 改变存储配额的单位
    storageHandleCommand(command){
      this.ruleForm.storageUnit = command;
    },

    // 判断是创建还是修改
    operated() {
      if (this.$route.query.operation == "edit") {
        // 修改
        this.pagename = this.$t("m.authority.edit"); // 传给　header 
        this.username = this.$route.query.which;
        this.ruleForm.username = this.username;
        this.getwhoInfo(); // 
      } else if (this.$route.query.operation == "create") {
        // 创建
        this.pagename = this.$t("m.authority.create");
        this.getVolumes();
        
      }
      this.getZones(); // 获取分区列表
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
          
          if(data.volumeInfos.length){
            this.volumeList = data.volumeInfos.filter(ele => {
              if(ele.status == 'Started'){
                return true;
              }
            });
            if(this.volumeList[0].volumeName==='nfs' && this.volumeList[0].status == 'Started'){
              this.ruleForm.volumeName = 'nfs';
            }           
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
      this.$axios
      .get(Lib.API().zone.getZoneList)      // '/api/zone/zones'
      .then(res => {
        const data = res.data;
        if(data.success){
          // 如果分区为空，提示用户需要先创建分区
          if(!data.results.length){
            this.isZonesVisibleError = true;
            return false;
          }

          // 1 赋值
          data.results.forEach( ele => {
            ele.cpu = ele.quotas.CPU; // 剩余 cpu
            ele.gpu = ele.quotas.GPU; // 剩余 cpu
            ele.jobs = ele.quotas.jobs;
            if(ele.quotas.memory.substr(-2).toLowerCase() == 'mb'){
              ele.memory = parseInt(ele.quotas.memory) / 1024;
              ele.memory = ele.memory.toFixed(2);
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
          
          this.quotasMax.cpu = this.zonesList[0].cpu;
          this.quotasMax.gpu = this.zonesList[0].gpu;
          this.quotasMax.job = this.zonesList[0].jobs;
          this.quotasMax.memory = this.zonesList[0].memory; 
          
          if(!this.username){ // 创建
            this.ruleForm.zoneName = this.zonesList[0].name;
          }
        }else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
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
           if(!this.username){ // 创建
            this.ruleForm.job = this.defaultQuota.taskNumber;
            this.ruleForm.cpu = this.defaultQuota.cpu;
            this.ruleForm.gpu = this.defaultQuota.gpu;
            this.ruleForm.memory = parseInt(this.defaultQuota.internalMemory);
            this.ruleForm.memoryUnit = this.defaultQuota.internalMemory.replace(/[\d]/g,'').toUpperCase();
            this.ruleForm.storage = parseInt(this.defaultQuota.dataStorage);
            this.ruleForm.storageUnit = this.defaultQuota.dataStorage.replace(/[\d]/g,'').toUpperCase();
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
          this.ruleForm.username = this.username;
          this.ruleForm.email = data.result.email;
          this.ruleForm.userGroup = data.result.groupId;
          this.ruleForm.mobile = data.result.mobile;
          this.ruleForm.volumeName = data.result.volumeName ? data.result.volumeName : '';
          this.ruleForm.zoneName = data.result.zoneName ? data.result.zoneName : '';
          
          this.ruleForm.job = data.result.quota.taskNumber;
          this.ruleForm.cpu = data.result.quota.cpu;
          this.ruleForm.gpu = data.result.quota.gpu;
          this.ruleForm.memory = data.result.quota.internalMemory.slice(0, -2);
          this.ruleForm.memoryUnit = data.result.quota.internalMemory.substr(-2);
          this.ruleForm.storage = data.result.quota.dataStorage.slice(0, -2);
          this.ruleForm.storageUnit = data.result.quota.dataStorage.substr(-2);
        
          if(!this.ruleForm.volumeName){              
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

      if(this.isZonesVisibleError){ // 没有分区
        return false;
      }

      if(this.errorMsg){　// 超出配额
        return false;
      }

      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 判断是否是默认配额
          if(
            this.ruleForm.job == this.defaultQuota.taskNumber &&
            this.ruleForm.cpu == this.defaultQuota.cpu && 
            this.ruleForm.gpu == this.defaultQuota.gpu && 
            this.ruleForm.memory == this.defaultQuota.internalMemory.slice(0, -2) && 
            this.ruleForm.memoryUnit == this.defaultQuota.internalMemory.substr(-2) && 
            this.ruleForm.storage == this.defaultQuota.dataStorage.slice(0, -2) && 
            this.ruleForm.storageUnit == this.defaultQuota.dataStorage.substr(-2) 
          ){
            this.isDefault = 1;
          }else{
            this.isDefault = 0;
          }
          var method = '';
          var url = ''; 
          var params = {
            id: this.usernameID,
            username: this.ruleForm.username.trim(),
            email: this.ruleForm.email,
            password: this.ruleForm.password,
            groupId: this.ruleForm.userGroup,
            mobile: this.ruleForm.mobile,
            volumeName: this.ruleForm.volumeName,
            zoneName: this.ruleForm.zoneName,  
            quota : {
              cpu: Number(this.ruleForm.cpu),
              gpu: Number(this.ruleForm.gpu),
              internalMemory: this.ruleForm.memory+this.ruleForm.memoryUnit,
              dataStorage: this.ruleForm.storage + this.ruleForm.storageUnit,
              taskNumber: Number(this.ruleForm.job),
              isDefault:　this.isDefault,
            }  
          };  
          
          if(this.username){
            // 修改情况
            method = 'put';
            url = Lib.API(this.username).auth.userModify, //`/api/user/users/${this.username}`;
            params.mender = this.creator;
            params.quota.userId = this.usernameID;
          }else{
            // 创建
            method = 'post';
            // url = 'http://rap2api.taobao.org/app/mock/2311/POST//api/user/users';
            url = Lib.API().auth.userAdd, // '/api/user/users'
            params.creator = this.creator;
            // params.quota = {
              
            // }            
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
      this.ruleForm.memoryUnit = 'GB';
      this.ruleForm.storageUnit = 'GB';
      this.ruleForm.volumeName = '';
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
  .drop-down:hover {
  cursor: pointer;
}
</style>


