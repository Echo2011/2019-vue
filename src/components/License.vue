<template>
  <div class="license-visible" :style="{ height: pageHeight + 'px' }"  v-show="isLicenseVisible">
      
      <el-card v-loading="loading" :element-loading-text="$t('m.loading')">
        <div  style="position:absolute;top:80px;font-size: 1.2em;" class="red-text">
          <!--<span v-show="license.licenseStatus===0">
            {{$t('m.authority.contactSuper')}}   请联系超级管理员！ 
          </span> -->
          <!--
          <span v-show="license.licenseStatus===1">
            {{$t('m.authority.snTip2')}}   系统未激活, 请联系超级管理员！ 
          </span>
          -->
          <span v-show="license.licenseStatus===3&&!isSuper">
            {{$t('m.authority.snExpired')}}  <!-- 序列码已过期, 请联系AMAX！ -->
          </span>
          <span v-show="license.licenseStatus===5&&!isSuper">
            {{$t('m.authority.snExpired3')}}  <!-- 未绑定license, 请联系超级管理员！ -->
          </span>
          <span v-show="license.licenseStatus===3&&isSuper">
            {{$t('m.authority.snExpired2')}}  <!-- 序列码已过期, 请联系AMAX后，再激活系统！ -->
          </span>

          <span v-show="license.licenseStatus===4">
            {{$t('m.authority.snTip2')}}  <!-- 非法机器, 请联系AMAX！ -->
          </span>
        </div>

        <div v-show="!isSuper" style="margin-top: 140px;">
          <el-button  style="width:150px;"  @click="logout" id="theheading_submit_license_on_logout">{{$t('m.logout')}}</el-button>
        </div>
        
       
        <el-tabs v-model="activeName" v-show="isSuper">         

          <el-tab-pane :label="$t('m.authority.onActivationSystem')" name="online" v-if="offOrUpdate==='offActivationSystem'">
            <el-form :model="formLicense" :rules="rules" ref="formLicense"  label-width="180px" style="margin-top:50px;">
              <el-form-item :label="$t('m.authority.organizationName')" prop="organizationName">
                <span v-show="license.finalUser">{{license.finalUser}}</span>
                <el-input v-show="!license.finalUser" v-model.trim="formLicense.organizationName" id="theheading_formlicense_organization_on"></el-input>
              </el-form-item>
              <el-form-item :label="$t('m.authority.sn')" prop="sn">
                <span v-show="license.serialNum">{{license.serialNum}}</span>
                <el-input v-show="!license.serialNum" v-model.trim="formLicense.sn" id="theheading_formlicense_sn_on"></el-input>
              </el-form-item>
              <el-form-item label="" >
                <el-button type="primary" v-show="license.licenseStatus!==4" style="width:150px;" :disabled="!((license.finalUser||formLicense.organizationName)&&(license.serialNum||formLicense.sn))" @click="submitOn('formLicense')" id="theheading_submit_license_on">{{$t('m.authority.'+activationOrBind)}}</el-button>
                <el-button v-show="this.where!=='heading'"  style="width:150px;"  @click="logout" id="theheading_submit_license_on_logout">{{$t('m.logout')}}</el-button>
                
              </el-form-item>          
            </el-form>
          </el-tab-pane>

          <el-tab-pane :label="$t('m.authority.'+offOrUpdate)" name="offline">
            <el-form :model="formLicense" :rules="rules" ref="formLicense"  label-width="180px" style="margin-top:50px;">
              <el-form-item :label="$t('m.authority.organizationName')" prop="organizationName">
                <span v-show="license.finalUser">{{license.finalUser}}</span>
                <el-input v-show="!license.finalUser" v-model.trim="formLicense.organizationName" id="theheading_formlicense_organization"></el-input>
              </el-form-item>

              <el-form-item :label="$t('m.authority.sn')" prop="sn">
                <span v-show="license.serialNum">{{license.serialNum}}</span>
                <el-input v-show="!license.serialNum"  v-model.trim="formLicense.sn" id="theheading_formlicense_serialNum"></el-input>               
              </el-form-item>

              <el-form-item label="">
                <label for="xFile" class="upload-label" >{{$t('m.authority.uploadLicenseFile')}}</label>
                <input type="file" id="xFile" class="upload-input"  @change="updataLicense">
                <span class="upload-name">{{formLicense.fileName}}</span>
                
              </el-form-item>
              
              <el-form-item label=""  style="margin-top:30px;" >
                
                <el-button type="primary" style="width:150px;" v-show="license.licenseStatus!==4" :disabled="!((license.finalUser||formLicense.organizationName)&&(license.serialNum||formLicense.sn)&&formLicense.fileName)" @click="submitOff('formLicense')" id="theheading_submit_license">{{$t('m.authority.'+activationOrBind)}}</el-button>
                <el-button  style="width:150px;" v-if="this.where==='heading'"  id="theheading_btn_cancel" @click="$emit('isHeadingLicenseVisible', false)">{{$t('m.cancel')}}</el-button>
                <el-button v-show="this.where!=='heading'"  style="width:150px;"  @click="logout" id="theheading_submit_license_on_logout">{{$t('m.logout')}}</el-button>
              </el-form-item>          
            </el-form>
          </el-tab-pane>

        </el-tabs>

      </el-card>
    </div>
</template>

<script>
import Lib from "../assets/js/Lib";

export default {
  name:'License',
  props: {
    // licenseparams: Object, 
    where: {
      type: String,
      required: true,
      validator: function(value){
        return ['home','heading','response'].indexOf(value) !== -1
      }
    }     
  },
  data: function() {
    var validateOrganName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('m.authority.enterOrganization')));
      } else {
        callback();
      }
    };
    var validateSn = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('m.authority.enterSn')));
      } else {
        callback();
      }
    };
    return {
      isSuper: false,
      pageHeight: 0,
      license: {},
      formLicense:{
        organizationName: '',
        sn: '',
        fileName: '',
      },
      test: '',
      rules: {
        organizationName: [
          { required: true, validator: validateOrganName, trigger: ['blur', 'change'] }
        ],  
        sn: [
          { required: true, validator: validateSn, trigger: ['blur', 'change'] }
        ],  
      },
      activeName: 'online',
      offOrUpdate: '', // 离线激活 还是升级license
      loading: false,
      activationOrBind: '',
      isLicenseVisible: false, // 默认不显示
    }
  },

  created(){

    this.isSuper = localStorage.getItem('isSuper')==='1' ? true : false;
    this.offOrUpdate = 'offActivationSystem';
    this.pageHeight = window.innerHeight;

    /**
     * home: 来自登录进入后 首页调取 该组件
     * response： 来自 任何请求中错误码带的激活信息 调取该组件
     * heading： 来自 TheHeading.vue 用户手动点击 “更新license”
     * 
     */
    this.isActivation();
    if(this.where === 'heading'){
      this.activeName = 'offline',
      this.offOrUpdate = 'updateLicense'; // 更新 license
      this.isLicenseVisible = true;
    }else{
      this.isLicenseVisible = false;
    }
  },
  

  methods: {

    // 退出
    logout(){  
      this.$axios
        .get(Lib.API().auth.logout)　// '/api/auth/logout'
        .then(res => {

        // }).finally(() => {
          document.cookie = 'username=test;path=/;expires='+ new Date("1970-1-1");
          this.$router.push({path:'/login'});
        })
    }, 
    
    // 上传 license 文件
    updataLicense(){
      let inputFile = document.querySelector('input[type="file"]');      
      this.formLicense.fileName = inputFile.files[0].name;
    },
    

     // 离线激活
    submitOff(formName) {

      var file = document.querySelector('input[type="file"]').files[0];
      let param = new FormData();
      param.append("file", file);
      let config = {
        header: { "Content-Type": "multipart/form-data" },
      };         
      
      var url = Lib.API().auth.licenseCheck+'?sn=' + (this.license.serialNum || this.formLicense.sn);
      this.$axios.post(url, param, config).then(res => {
        const data = res.data;
        if (data.success) {
          this.$emit('isHomeLicenseVisible', false);
          this.$emit('isHeadingLicenseVisible', false);
        }else{
          Lib.Common.errorMsg(data);
        }           
        document.querySelector('input[type="file"]').value = '';
        this.formLicense.fileName = '';
      });
    },

    

    // 在线激活
    submitOn(formName) {
      this.$axios.post(Lib.API().auth.activation + `?finalUser=${this.license.finalUser || this.formLicense.organizationName}&sn=${this.license.serialNum || this.formLicense.sn}`)
      .then(res => {
        let data = res.data;
        if (data.success) { 
          this.$emit('isHomeLicenseVisible', false);
          this.$emit('isHeadingLicenseVisible', false);
        }else{
          Lib.Common.errorMsg(data);
        }  
        document.querySelector('input[type="file"]').value = ''; 
        this.formLicense.fileName = '';         
      });
    },

    // 系统是否激活， 激活的话才会发 升级版本的请求， 否则的话， 升级版本请求报错
    isActivation(){
      this.loading = true;

      this.$axios({
        method: 'post',
        url: Lib.API().auth.validation,
      }).then(res =>{
        const data = res.data;
        if(data.success){
          this.license = data.license;  
          if(this.license.licenseStatus===2||this.license.licenseStatus===0){ // 正常使用 or 0->未知错误，正常报错即可
            if(this.where !== 'heading'){
              this.$emit('isHomeLicenseVisible', false);
              this.$emit('isHeadingLicenseVisible', false);
            }
          }else{
            this.isLicenseVisible = true;
          }
          if(this.license.licenseStatus===5){
            this.activationOrBind = 'bind';
          }else{
            this.activationOrBind = 'activation';
          }
          
        }else{
          Lib.Common.errorMsg(data);
        }
        this.loading = false;
      })
    },
  }
  
}
</script>

<style lang="less" scoped>
.license-visible {
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  min-height: 200px;
  > div{
    width: 60%;
    margin: 0 auto;
    // height: 400px;
    background-color: #fff;
    position: relative;
    top:70px;
    

  }
}
.upload-label {
  // position: absolute;
  height: 40px;
  z-index: 10;
  background-color: #fff;
  width: 170px;
  border:1px solid #ccc;
  line-height: 38px;
  text-align: center;
  border-radius: 5px;
  // color: #fff;
  font-size: 13px;
  font-weight: normal;
  cursor: pointer;
  display:inline-block;
  &:hover {
    border:1px solid #1a99a5;
    color: #1a99a5;
  }
}
span.upload-name {
  position: absolute;
  left: 180px;
}
.upload-input {
  position: absolute;
  margin-top: 3px;
  opacity: 0;
  width: 30px;
}
</style>

