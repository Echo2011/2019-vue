<template>
    <main>
        <el-tabs v-model="activeName">

          <el-tab-pane :label="$t('m.authority.editPersonalInformation')" name="editInfo" style="background-color:#fff; width: 100%; padding: 35px 10%;">
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" class="demo-ruleForm">
   　　　　　　　<el-form-item :label="$t('m.authority.mobile')" prop="mobile">
                <el-input v-model="ruleForm.mobile"></el-input>
              </el-form-item>
              <el-form-item :label="$t('m.authority.email')" prop="email">
                <el-input v-model="ruleForm.email"></el-input>
              </el-form-item> 
              <el-form-item>
                <el-button type="primary" @click="submitForm('ruleForm')">{{$t('m.submit')}}</el-button>
                <el-button @click="resetForm('ruleForm')">{{$t('m.reset')}}</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane :label="$t('m.authority.changePassword')" name="editPass" style="background-color:#fff; width: 100%; padding: 35px 10%;">
            
            <el-form :model="formPass" :rules="rulesPass" ref="formPass" label-width="160px" class="demo-ruleForm">
              <el-form-item :label="$t('m.authority.oldPassword')"  :error="oldPasswordMsg" prop="oldPassword">
                <el-input  type="password" v-model="formPass.oldPassword" @blur="checkPassword(formPass.oldPassword)"></el-input>
              </el-form-item>
   　　　　　　　<el-form-item :label="$t('m.authority.password')" prop="password">
                <el-input  type="password" v-model="formPass.password"></el-input>
              </el-form-item>
              <el-form-item :label="$t('m.authority.confirmPassword')" prop="confirmPassword">
                <el-input  type="password" v-model="formPass.confirmPassword"></el-input>
              </el-form-item> 
              <el-form-item>
                <el-button type="primary" @click="submitForm('formPass')">{{$t('m.submit')}}</el-button>
                <el-button @click="resetForm('formPass')">{{$t('m.reset')}}</el-button>
              </el-form-item>
            </el-form>                                                   
          </el-tab-pane>

        </el-tabs> 
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
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
      } else if (value !== this.formPass.password) {
        callback(new Error(this.$t("m.rules.InconsistentPass")));
      } else {
        callback();
      }
    };
    var validateold = (rule, value, callback) => {
      if (value === '') {
        console.log('validate');
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.oldPassword")
          )
        );
      }else if (!this.pass) {
        console.log('validate');
        callback(new Error(this.oldPasswordMsg = this.$t('m.authority.oldPassword')+this.$t('m.error')));
      } else {
        callback();
      }
    };
    
    return {
      creator:'',
      usernameID:'',
      username:'',
      activeName:'',
      pass:false,
      oldPasswordMsg:'',
      formPass: {
        oldPassword:'',
        password:'',
        confirmPassword:''
      },
      rulesPass:{
        oldPassword:[
          { required: true, validator: validateold, trigger: 'blur' }
        ],
        password: [
          { required: true, validator: validatePass1, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ],
        
      },

      ruleForm: {
        mobile:'',
        email:'',        
      },
      rules: {
        mobile: [
         { required: true, validator: validateMobile, trigger: 'blur' }
        ],
        email: [      
          { required: true, validator: validateEmail, trigger: 'blur' }
        ],        
      },  
      
      
    };
  },
  created(){
    this.username = Lib.Common.getCookies("username");
    this.activeName = this.$route.query.operation; // // 获取操作
    this.getwhoInfo(); // 获取用户信息
  },
  methods: {

    // 获取用户信息
    getwhoInfo(){
      this.$axios
      // /api/user/users/${this.username}
      .get(Lib.API(this.username).auth.userDetail)
      .then( res => {
        const data = res.data;
        if(data.success){     
          this.usernameID = data.result.id;
          this.ruleForm.username = this.username;
          this.ruleForm.email = data.result.email;
          this.ruleForm.mobile = data.result.mobile;
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },

    // 提交
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var param = null;
          if(this.activeName == 'editInfo'){
            // 提交 手机邮箱 数据
            param = {
              id : this.usernameID,
              username: this.ruleForm.username,
              email: this.ruleForm.email,
              mobile: this.ruleForm.mobile,
            }            
          }else if(this.activeName == 'editPass'){
            // 提交 密码　数据 
            // 1 验证原密码
            if(this.formPass.oldPassword.trim() == ''){
              // this.oldPasswordP = true;
              this.oldPasswordMsg = this.$t('m.rules.pleaseEnter')+this.$t('m.authority.oldPassword');
              return false;
            }else if(!this.pass){
              this.oldPasswordMsg = this.$t('m.authority.oldPassword')+this.$t('m.error');
              return false;
            }else{
              this.oldPasswordMsg = '';
            }
            

            param = {
              id : this.usernameID,
              username: this.ruleForm.username,
              password: this.formPass.password
            }
          }

          // 发送请求
          this.$axios({
            method: 'put',
            url: Lib.API(this.username).auth.userModify, // `/api/user/users/${this.username}`,
            data: param
          }).then( res => {
            const data = res.data;
            if(data.success){
              this.$message({
                showClose: true,
                message: this.$t("m.edited").toUpperCase(),
                type: "success",
                duration: Lib.Common.messageDuration
              });
            }else{
              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText, data.messageParams);
            }
          })
        } else {
          return false;
        }
      });
    },

    // 重置密码
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    // 检查原密码是否正确
    checkPassword(passwordValue){
      // console.log(passwordValue.trim())
      
      if(passwordValue.trim() === ''){
        // console.log('checkLogin');
        this.oldPasswordMsg = this.$t('m.rules.pleaseEnter')+this.$t('m.authority.oldPassword');
        return false;
      }
      // console.log('checkLogin');

      this.$axios({
        method: "post",
        url: Lib.API().auth.login, // "/api/auth/login",
        // url: "http://rap2api.taobao.org/app/mock/2311//api/auth/login",
        data: {
          username: this.username,
          password: this.formPass.oldPassword
        }
      }).then(res => {
        const data = res.data;
        if (data.success) {
          this.pass = true;
          this.oldPasswordMsg = '';
        }else{
          this.pass = false;
          this.oldPasswordMsg = this.$t('m.authority.oldPassword')+this.$t('m.error');
        }
      })
    },
        
  }
};
</script>

<style lang="less" scoped>
main {
  .el-tabs{
    .el-tabs__content{
      background-color: #fff !important;
      padding: 60px 0;
      .el-tab-pane{
        width: 80%;
        margin: 0 auto;
        .el-form-item:last-child {
          margin-top: 60px;
        }
      }     
    }
  }
}
  
  
</style>


