<template>
    <main>
      <section  v-loading="loading" :element-loading-text="$t('m.loading')">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="160px" class="demo-ruleForm"  size="small">
          <el-form-item :label="$t('m.authority.userGroupName')" prop="groupname" :error="isnameExistMsg">      
            <el-input id="creategroup_groupname" v-model="ruleForm.groupname" @blur="groupnameHandle"></el-input>       
          </el-form-item>
          <el-form-item class='el-form-item-roles' :label="$t('m.authority.associatedRoles')" prop="isChooseRoles">
            <div v-if='roles.length' v-for="(item,index) in roles" :key="index" :class="{ radioGroupWrap:true, isChoose:true}" >
              <span class="title">{{$t('m.nav.'+item.module)}}</span>
              <el-radio-group   v-model="item.whichId" 
              
              >
                <el-radio v-for='info in item.role' :label="info.id" :key="info.id">{{$t('m.authority.'+info.roleName.split('_')[1])}}
                  </el-radio>
              </el-radio-group>
            </div>            
          </el-form-item> 

          <!-- 用户权限的管理员必须同时是数据存储的管理员 -> 废弃 -->
          <!-- <p v-show="isAuthAndStore" class="red-text">{{$t('m.authority.authAndStore')}}</p> -->

          <el-form-item class="el-form-item-submit">
            <el-button id="creategroup_btn_submit"  size="medium"  type="primary" @click="submitForm('ruleForm')">{{$t('m.submit')}}</el-button>
            <el-button id="creategroup_btn_reset"  size="medium"   @click="$router.go(-1)">{{$t('m.cancel')}}</el-button>
          </el-form-item>
        </el-form>
      </section>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
    var validateUserName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.userGroupName").toLowerCase()
          )
        );
      } else if (
        // !/^[a-z0-9]([-a-z0-9]{0,18}[a-z0-9])?$/.test(value)
        value.search(/[<>/*?,/]/) >= 0
      ) {
        callback(new Error(this.$t("m.authority.userGroupName") + this.$t("m.rules.regularLength1AndSpace")));
      }　else if(this.isnameExist){
        callback(new Error(this.$t("m.authority.userGroupName") + this.$t("m.rules.alreadyExists")));
      } else {
        callback();
      }
    };
    var validateRoles = (rule, value, callback) => {
        callback();
    };
    
    return {
      creator:'',
      isnameExist : false, //是否重名
      isnameExistMsg : null,
      // isAuthAndStore: false,
      backRoles:[],
      roles:[],
      chooseRoles:[],
      ruleForm: {
        groupname: '',
      },
      rules: {
        groupname: [
          { required: true, validator: validateUserName,  trigger: 'blur' },
        ],
        isChooseRoles:[
          { required: true, validator: validateRoles}
        ]
      },
      loading: false, //    
      
    };
  },
  created(){
    this.creator = Lib.Common.getCookies("username");
    this.getRoles(); // 获取组列表
  },
  methods: {

    // 获取所有角色
    getRoles(){
      this.loading = true;
      this.$axios
      .get(Lib.API().auth.getRoles) // '/api/group/roles'
      // .get('http://rap2api.taobao.org/app/mock/2311//api/group/roles')
      .then( res => {
        const data = res.data;
        if(data.success){
          this.backRoles = data.results;
           // 1, -> 创建对象,添加键值对,生成新数组 this.roles
          this.roles = this.backRoles.map( ele => {
            var obj = {};
            obj['module'] = ele.roleName.split('_')[0];
            obj['whichId'] = '';
            obj['role'] = [];
            return obj;
          });
          // 2, 对 this.roles 数组去重
          var temArray = [];
          temArray.push(this.roles[0]);
          this.roles.forEach( ele => {
            var isHave = temArray.every( element => {
              return element.module != ele.module;
            })
            if(isHave){
              temArray.push(ele);
            }
          })
          this.roles = temArray;

          // 3,  填充 this.roles 里的 role 数组
          this.backRoles.forEach( ele => {
            this.roles.forEach( element => {
              if(ele.roleName.indexOf(element.module)>=0 && ele.roleName.indexOf('admin') >= 0){
                element.role.push(ele);
              }
              if(ele.roleName.indexOf(element.module)>=0 && ele.roleName.indexOf('viewer') >= 0){
                element.role.unshift(ele);
                  element.whichId = ele.id;
              }
            })
          })
          
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loading = false;
      })
    },

    // 判断用户组名是否重名
    groupnameHandle(){
      this.$axios
        // `/api/group/groups`
        .get(Lib.API().auth.getGroupList) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            var isExist = data.results.some( ele => {
              return ele.groupname == this.ruleForm.groupname
            })
            if(isExist){
              // 用户名存在
              this.isnameExist = true;
              this.isnameExistMsg = this.$t("m.username") + this.$t("m.rules.alreadyExists"); 
            }else{
              // 不存在
              this.isnameExist = false;
              this.isnameExistMsg = null;
            }
          } else {
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
          
          // 获取选中角色的 id chooseRoles
          this.roles.forEach( ele => {  
              var obj = {};
              obj['id'] = ele.whichId;
              ele.role.forEach(item => {
                if(item.id == ele.whichId){
                  obj['roleName'] = item.roleName;
                  return false;
                }
              })
              this.chooseRoles.push(obj);
          })

          this.loading = true;
          this.$axios({
            method: 'post',
            url: Lib.API().auth.postNewGroup, // '/api/group/groups',
            data: {
              groupname: this.ruleForm.groupname,
              creator: this.creator,
              roles: this.chooseRoles
            },
          }).then( res => {
            const data = res.data;
            if(data.success){
              this.$router.push({path:'/authority/group/list'}); 
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
  }
};
</script>

<style lang="less" scoped>
  li.nav-authority  li:nth-child(2) {
    color: #1a99a5;
  }
  form {
    width: 80%;
    margin: 40px auto;
    min-width: 400px;
  }
  .el-form-item__content {
    display: flex;
    flex-wrap:  wrap;
    .radioGroupWrap {
      border:1px solid #cccccc;
      width: 150px;
      border-radius: 5px;    
      padding: 0 8px;
      margin:10px 20px 5px 0px;
      position: relative;
      height:150px;
      display: inline-block;
      vertical-align: top;
      span.title {
        display: block;
        border-bottom: 1px solid #eeeeee;
        text-align: center;
      }
      span.circle{
        border:1px solid #cccccc;
        width: 20px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        border-radius: 100%;
        top: -8px;
        right: -8px;
        position: absolute;
        background-color: #fff;
        i {
          color: #ffffff;
        }
      }
      label.el-radio {
        display: block;
        margin: 20px 0;
      }
    }
    .isChoose{
      // border:1px solid #1a99a5;
      span.circle{
        border:1px solid #1a99a5;
        i {
          color: #1a99a5;
        }
      }
    }
  }
  .el-form .el-form-item.el-form-item-roles{
    margin-bottom: 0px;
  }
  .el-form .el-form-item.el-form-item-submit {
    margin-top:60px;
  }
  p.red-text {
    padding:0;
    margin:0 0 10px 160px;
  }
</style>


