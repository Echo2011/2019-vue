<template>
    <main>
      <div class="main-btn-wrap">   
        <div>
          <router-link id="userlist_createuser" to="/authority/user/add?operation=create">
            <el-button size="medium" type="primary"  plain icon="el-icon-plus">{{$t('m.authority.create')}}</el-button>
          </router-link> &nbsp; &nbsp; 
          <el-button id="userlist_btn_editquota" size="medium" type="primary"  plain icon="el-icon-edit"  @click="dialogFormVisible = true;getDefaultQuota">{{$t('m.authority.editQuota')}}</el-button>
        </div>
        <div>
          <el-select id="userlist_select_usergroup" v-model="groupId" :placeholder="$t('m.rules.pleaseChoose')+$t('m.authority.userGroup')">
              <el-option
              v-for="item in group"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-input  id="userlist_getuserlist" v-model="query" :placeholder="$t('m.pleaseEnter')+$t('m.username')" ></el-input>
          <el-button size="medium" type="primary" icon="el-icon-search" @click="getUserList">{{$t('m.search')}}</el-button>
          <el-button id="userlist_btn_reset" size="medium" @click="query='';groupId='';page.currentPage=1;getUserList" type="text" >{{$t('m.reset')}}</el-button>
        </div>        
      </div> 

      <!-- 修改默认配额 -->
      <el-dialog :title="$t('m.authority.editQuota')" :visible.sync="dialogFormVisible">
        <el-form  ref="formQuote" :model="formQuote" :rules="formQuoteRules" label-width="200px"  size="small">
          <el-form-item :label="$t('m.authority.cpuQuota')" prop="cpu">
            <el-input  id="userlist_cpu" v-model="formQuote.cpu">
               <template slot="append">Core</template>
            </el-input>
          </el-form-item>  
          <el-form-item :label="$t('m.authority.gpuQuota')" prop="gpu">
            <el-input  id="userlist_gpu" v-model="formQuote.gpu">
               <template slot="append">Core</template>
            </el-input>
          </el-form-item>  
          <el-form-item :label="$t('m.authority.memoryQuota')" prop="memory">
            <el-input  id="userlist_memory"  v-model="formQuote.memory">
              <el-select style="width:75px;" id="userlist_select_memoryunit"  v-model="formQuote.memoryUnit" slot="append" :placeholder="$t('m.rules.pleaseChoose')">
                <el-option label="MB" value="MB"  id="userlist_memoryunit_mb" ></el-option>
                <el-option label="GB" value="GB"  id="userlist_memoryunit_gb" ></el-option>
              </el-select>
            </el-input>
          </el-form-item>  
          <el-form-item :label="$t('m.authority.storageQuota')" prop="storage">
            <el-input v-model="formQuote.storage" id="userlist_storage" >
              <el-select style="width:75px;" id="userlist_select_storage" v-model="formQuote.storageUnit" slot="append" :placeholder="$t('m.rules.pleaseChoose')">
                <el-option label="MB" value="MB" id="userlist_select_storage_mb"></el-option>
                <el-option label="GB" value="GB" id="userlist_select_storage_gb"></el-option>
              </el-select>
            </el-input>
          </el-form-item> 
          <el-form-item :label="$t('m.authority.jobQuota')" prop="job">
            <el-input v-model="formQuote.job" id="userlist_job"></el-input>
          </el-form-item> 
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button id="userlist_btn_submit" type="primary" @click="putDefaultQuota('formQuote')">{{$t('m.edit')}}</el-button>
          <el-button id="userlist_btn_cancel"  @click="cancelDefaultQuota('formQuote')">{{$t('m.cancel')}}</el-button>
        </div>
      </el-dialog>

      <section class="show-info">
       
         <table  v-loading="loading" :element-loading-text="$t('m.loading')" >
           <thead>
             <tr>
               <th>{{$t('m.username')}}</th>
               <th>{{$t('m.authority.mobile')}}</th>
               <th>{{$t('m.authority.email')}}</th>
               <th>{{$t('m.authority.createTime')}}</th>
               <th>{{$t('m.authority.creator')}}</th>
               <th>{{$t('m.authority.updateTime')}}</th>
               <th>{{$t('m.authority.editor')}}</th>
               <th>{{$t('m.job.boundZone')}}</th>
               <th>{{$t('m.authority.groupName')}}</th>
               <th>{{$t('m.operating')}}</th>
             </tr>
           </thead>           
           <tbody v-if="list.length">
             <tr v-for="(item,index) in list" :key="item.username" >
               <td>{{item.username}}</td>
               <td>{{item.mobile}}</td>
               <td>{{item.email}}</td>
               <td>{{item.createTime | toDate('date')}}</td>
               <td>{{item.creator}}</td>   
               <td>{{item.updateTime | toDate('date')}}</td>
               <td>{{item.mender}}</td>    
               <td>{{item.zoneName}}</td>    
               <td>{{item.groupname}}</td>      
               <td class="operation" >
                  <i class="el-icon-more"  @click="item.isMore=!item.isMore" ></i>

                  <!-- isMore -->
                  <transition name="operationTransition">
                  <div class="box-cart view-more" v-show="item.isMore">
                    <span class="close-wrap" @click="item.isMore=false"><i class="el-icon-close"></i></span>
                    <ul style="display:block;">
                      <li @click="item.isViewquota=true;item.isMore=false"><i class="el-icon-view"></i> {{$t('m.authority.checkQuotas')}}</li>
                      <li @click="item.isViewRoles=true;item.isMore=false;userGetRoles(item.groupname,index)"><i class="el-icon-view"></i>{{$t('m.authority.viewAssociatedRoles')}}</li>
                      <li><router-link :to="'/authority/user/add?operation=edit&which='+item.username+'&id='+item.id"><i class="el-icon-edit"></i> {{$t('m.authority.modifyUserInfo')}}</router-link></li>
                      <li @click="item.isResetPassword=true;item.isMore=false"><i class="el-icon-edit-outline"></i> {{$t('m.authority.resetPassword')}}</li>
                      <li @click="item.isDelete=true;item.isMore=false"><i class="el-icon-delete"></i> {{$t('m.delete')}}</li>
                    </ul>
                  </div>
                  </transition>

                  <!-- isViewquota -->
                  <transition name="operationTransition">
                  <div class="box-cart view-quote" v-show="item.isViewquota">
                    <div class="title">
                      <span>{{$t('m.authority.checkQuotas')}}</span>                      
                    </div>
                    <span class="close-wrap" @click="item.isViewquota=false"><i class="el-icon-close"></i></span>               
                    <ul>
                      <li style="font-weight:bold;"><span>{{$t('m.store.volumeName')}}:</span> {{item.volumeName}}</li>
                      <li><span>{{$t('m.authority.cpuQuota')}}:</span> {{item.quota.cpu}}Core</li>
                      <li><span>{{$t('m.authority.gpuQuota')}}:</span> {{item.quota.gpu}}Core</li>
                      <li><span>{{$t('m.authority.memoryQuota')}}:</span> {{item.quota.internalMemory}}</li>
                      <li><span>{{$t('m.authority.storageQuota')}}:</span> {{item.quota.dataStorage}}</li>      
                      <li><span>{{$t('m.authority.jobQuota')}}:</span> {{item.quota.taskNumber}}</li>
                    </ul>
                  </div>
                  </transition>

                  <transition name="operationTransition">
                  <div class="box-cart view-quote" v-show="item.isViewRoles">
                    <div class="title">
                      <span>{{$t('m.authority.associatedRoles')}}</span>                      
                    </div>
                    <span class="close-wrap" @click="item.isViewRoles=false"><i class="el-icon-close"></i></span>               
                    <ul>
                      <li v-for="role in item.roles" :key="role.id"><span>{{$t('m.nav.'+role.roleName.split('_')[0])}}:</span> {{$t('m.authority.'+role.roleName.split('_')[1])}}</li>
                    </ul>
                  </div>
                  </transition>

                  <!-- isResetPassword -->
                  <transition name="operationTransition">
                  <div class="box-cart reset-password" v-show="item.isResetPassword">              
                    <span class="close-wrap" @click="item.isResetPassword=false;cancelEditPass('formPass'+item.id)"><i class="el-icon-close"></i></span>       
                    <el-tabs v-model="activeName">                      
                        <el-tab-pane :label="$t('m.authority.changePassword')" name="first"  style="padding:0 20px;">
                          <el-form 　 :ref="'formPass'+item.id" :model="formPass" :rules="rulesPass" label-width="160px"  size="small">                         
                            <el-form-item :label="$t('m.authority.password')" prop="password" >
                              <el-input v-model="formPass.password"></el-input>
                            </el-form-item>
                            <el-form-item :label="$t('m.authority.confirmPassword')" prop="confirmPassword" >
                              <el-input v-model="formPass.confirmPassword"></el-input>
                            </el-form-item>
                            <el-form-item>
                              <el-button type="primary" size="small" @click="submitPass('formPass'+item.id,item.username,item.id)"> &nbsp;　{{$t('m.submit')}} &nbsp;　</el-button>
                              <el-button  type="text" @click="cancelEditPass('formPass'+item.id);item.isResetPassword=false;formPass.password='';formPass.confirmPassword=''" size="small"> &nbsp;　{{$t('m.cancel')}} &nbsp; </el-button>
                            </el-form-item>
                          </el-form>                                                    
                        </el-tab-pane>
                        <el-tab-pane :label="$t('m.authority.resetPassword')" name="second"  style="padding:0 20px;">
                          <p>{{$t('m.authority.resetPasswordTip')}}</p>
                          <el-button type="primary" size="small"  @click="resetPass(item.username,item.id,item.email);item.isResetPassword=false"> &nbsp;　{{$t('m.authority.resetPassword')}} &nbsp;　</el-button>
                          <el-button type="text" @click="item.isResetPassword=false" size="small"> &nbsp; {{$t('m.cancel')}} &nbsp;</el-button>
                        </el-tab-pane>
                      </el-tabs>                 
                  </div>
                  </transition>

                  <!-- 删除框 -->
                  <transition name="operationTransition">
                    <div class="box-cart operation-message" v-show="item.isDelete">
                      <span class="close-wrap" @click="item.isDelete=false"><i class="el-icon-close"></i></span>
                      <div class="content">
                        <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' + item.username + '?'}}</p>
                        <div style="text-align: right; margin: 0"> 
                          <el-button size="small"   @click="item.isDelete = false">{{$t('m.cancel')}}</el-button>                       
                          <el-button type="primary" size="small" @click="item.isDelete=false;deleteHandle(item.id,item.username)">{{$t('m.confirm')}}</el-button>
                        </div>
                      </div>                      
                    </div>
                  </transition> 
                  
               </td>
             </tr>           
           </tbody>
         </table>
        
         <!-- 分页 -->
         <div class="page-block">  
            <span id="userlist_page_total">{{$t('m.total')}} {{page.total}} {{$t('m.tiao')}}</span>      
            <el-pagination id="userlist_page"
              @current-change="getUserList"
              :current-page.sync="page.currentPage"
              :page-size="page.pageSize"
              layout="prev, pager, next"
              :total="page.total">
            </el-pagination>
        </div>       
      </section>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
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
    return {     
      list: [], 
      query:'',
      admin:'', // 管理员
      groupId:'',
      group:[{}],　// 用户组键值对列表
      groupBackpuForRoles:[], // 原始用户组列表
      ruleForm:{
        password:'',
        passwordConfirm:''
      },
      rules:{
        password:[],
        passwordConfirm:[]
      },

      page: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10 // 一页显示多少条
      },

      activeName: 'second', // 首先显示哪一个ｔａｂ页

      dialogFormVisible:false,
      defaultData:{},
      formQuote:{ // 修改默认配额
        id:'',
        cpu:0,
        gpu:0,
        memory:'',
        memoryUnit:'',
        storage:'',
        storageUnit:'',
        job:'',
      },
      formQuoteRules: {        
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
         { required: true, validator: validateMemory, trigger: 'blur' }
        ],
        storage: [
          { required: true, validator: validateStorage, trigger: 'blur' }
        ],
      },
      formPass: {
        password:'',
        confirmPassword:''
      },
      rulesPass: {
        password: [
          { required: true, validator: validatePass1, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ],
      },
      loading: false, // 
    };
  },

  created() {
    this.admin = Lib.Common.getCookies("username"); // 获取　权限管理员用户名  
    this.groupId = this.$route.query.groupId?Number(this.$route.query.groupId):''; // 获取组id
    this.getUserList(); 
    this.getDefaultQuota();
    this.getGroup();
  },

  methods: { 

    // 获取用户组
    getGroup(){
      this.$axios
      // .get('/api/group/groups')
      .get(Lib.API().auth.getGroupList)
      .then( res => {
        const data = res.data;
        if(data.success){
          this.groupBackpuForRoles = data.results;
          this.group = data.results.map( ele => {
            var obj = {};
            obj['value'] = ele.id;
            obj['label'] = ele.groupname;
            return obj;
          });          

        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },

    // 获取　默认配额 
    getDefaultQuota(){      
      this.$axios
      // .get('/api/user/quota')
      .get(Lib.API().auth.getDefaultQuota)
      .then( res => {
        const data = res.data;
        if(data.success){
          this.formQuote.id = data.results.id;
          this.formQuote.job = data.results.taskNumber;
          this.formQuote.cpu = data.results.cpu;
          this.formQuote.gpu = data.results.gpu;
          this.formQuote.memory = parseInt(data.results.internalMemory);
          this.formQuote.memoryUnit = data.results.internalMemory.replace(/[\d]/g,'').toUpperCase();
          this.formQuote.storage = parseInt(data.results.dataStorage);
          this.formQuote.storageUnit = data.results.dataStorage.replace(/[\d]/g,'').toUpperCase();
          // 把表单中的数据存到　定好的一个对象中
          for (var prop in this.formQuote){
            this.defaultData[prop] = this.formQuote[prop];
          }
        }else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },

    // 提交 默认配额
    putDefaultQuota(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios({
            method: 'put',
            url: Lib.API().auth.putDefaultQuota, // '/api/user/quota',
            data: {
              id: this.formQuote.id,
              cpu: this.formQuote.cpu,
              gpu: this.formQuote.gpu,
              internalMemory: this.formQuote.memory + this.formQuote.memoryUnit,
              dataStorage:  this.formQuote.storage + this.formQuote.storageUnit,
              taskNumber: this.formQuote.job
            },
          }).then( res => {
            const data = res.data;
            if(data.success){
              this.dialogFormVisible = false;
            　// 修改成功，更新默认的对象中的数据，即把此时的表单数据再次存到定好的对象中，留取消按钮时用
              for (var prop in this.formQuote){
                this.defaultData[prop] = this.formQuote[prop];
              }
              this.$message({
                showClose: true,
                message: this.$t('m.authority.defaultQuota') + " " + this.$t("m.edited"),
                type: "success",
                duration: Lib.Common.messageDuration
              });
            }else {
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

    // 取消 修改默认配额
    cancelDefaultQuota(formName){ 
      this.$refs[formName].resetFields();       
      for (var prop in this.defaultData){
        this.formQuote[prop] = this.defaultData[prop];
      }     
      this.dialogFormVisible = false;  
    },

    // 获取用户列表 
    getUserList(){
      this.loading = true;
      this.$axios
        // .get(`http://rap2api.taobao.org/app/mock/2311//api/user/users?page=${this.page.currentPage}&q=${this.query}&groupId=${this.groupId}`)
        .get(Lib.API().auth.getUserList + `?page=${this.page.currentPage}&q=${this.query}&groupId=${this.groupId}`) 
        .then(res => {
          const data = res.data;
          if (data.success) {            
            data.results.map(ele => {
              ele.isMore = false; // 显示所有操作
              ele.isViewquota = false;　// 查看配额
              ele.isResetPassword = false; //　重置密码 
              ele.isDelete = false; //
              ele.isViewRoles = false;
              ele.roles = [];
            })
            this.list = data.results;
            this.page.total = data.total; 
            this.page.pageSize = data.pageSize;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loading = false;
      })
    },

    // 修改密码
    submitPass(formName,username,id) {
      this.$refs[formName][0].validate((valid) => {
        if (valid) {
          // 验证成功，隐藏　修改框
          this.list.forEach( ele => {
            if(ele.id === id){
              ele.isResetPassword = false;
              return false;
            }
          })
          // 发请求
          this.$axios({
            method: 'put',
            // url:'http://rap2api.taobao.org/app/mock/2311/PUT//api/user/users/%7Busername%7D',
            url: Lib.API(username).auth.editPassword, //`/api/user/users/${username}`,
            data:{
              id: id,
              username: username,
              password: this.formPass.password,
              mender:　this.admin
            }
          }).then( res => {
            const data = res.data;
            if(data.success){
              this.$message({
                showClose: true,
                message: this.$t('m.authority.password') + " " + this.$t("m.edited"),
                type: "success",
                duration: Lib.Common.messageDuration
              });
            }else{
              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText, data.messageParams);
            }
          })

          // 清空
          this.formPass.password = '';
          this.formPass.confirmPassword = '';

        } else {
          return false;
        }
      });
    },

    // 取消修改
    cancelEditPass(formName){
      this.$refs[formName][0].resetFields();
    },

    // 重置密码
    resetPass(username,id,email){
      this.$axios({
        method: 'put', 
        // url:'http://rap2api.taobao.org/app/mock/2311/PUT//api/user/users/%7Busername%7D',
        url: Lib.API().auth.resetPass, //`/api/user/resetpassword`,
        data:{
          userId: id,
          username: username,
          password: parseInt(Math.random() * 10).toString()+parseInt(Math.random() * 10).toString()+parseInt(Math.random() * 10).toString()+parseInt(Math.random() * 10).toString()+parseInt(Math.random() * 10).toString()+parseInt(Math.random() * 10).toString(),
          // mender:　this.admin
          email:email
        }
      }).then( res => {
        const data = res.data;
        if(data.success){
          // item.isResetPassword=false;
          this.$message({
            showClose: true,
            message: this.$t('m.authority.password') + " " + this.$t("m.edited"),
            type: "success",
            duration: Lib.Common.messageDuration
          });        
        }else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },
   



    // 删除
    deleteHandle(id,username){
      this.loading = true;
      this.$axios
        // `/api/user/users/${id}`
        .delete(Lib.API(id).auth.deleteUser) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.$message({
              showClose: true,
              message: username + " " + this.$t("m.deleted"),
              type: "success",
              duration: Lib.Common.messageDuration
            });
            // 延迟　２　秒发请求，否则有缓存
            setTimeout(this.getUserList, 1000); // 延迟执行获取列表
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loading = false;
      })
    },

    // 某个用户获取自己的角色
    userGetRoles(groupName,index){
      this.groupBackpuForRoles.forEach( ele => {
        if(ele.groupname === groupName){
          this.list[index].roles = ele.roles;
          return false;
        }
      })
    },

  }
};
</script>

<style  lang="less" scoped>

// 动画效果
.operationTransition-enter-active,
.operationTransition-leave-active {
  transition: all 0.4s;
}
// 进场，　出场状态
.operationTransition-enter,
.operationTransition-leave-to {
  opacity: 0;
}
td:last-child {
  cursor: pointer;
  position: relative;
  width: 80px;
  i {
    padding: 8px;
  }
  i:hover {
    color: #1a99a5;
  }
  div.view-more {  
       
    ul li {
      color: #1a99a5;
      &:hover {
        text-decoration: underline #1a99a5;
      }
    }
  }
  > div.view-quote {
    li span {
      display: inline-block;
      width: 110px;
      text-align: right;
    }    
  }
  div.reset-password {
    width: 550px;
    .el-tabs__nav {
      margin-left:20px;
    }
    .el-tabs__content {
      margin: 0 20px;
    }
  }
}

</style>
