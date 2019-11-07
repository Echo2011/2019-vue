<template>
  <main>
    <section class="form" v-loading="loading" :element-loading-text="$t('m.loading')" >
    
          {{ this.$route.query.imageName }} : {{this.$route.query.tagName}}
       
        <div id="gateone_container" style="position: relative; width: 100%; height: 662px;margin-bottom:20px">
              <div id="gateone"></div>
          </div>
          <!-- <el-button type="primary" @click="makeImageHandle('updateForm')" size="medium" id="makeImage_button_confirm" >制作镜像</el-button> -->
          <el-button type="primary" @click="dialogFormVisible = true">{{$t('m.image.makeImage')}}</el-button>
          <el-button type="primary" @click="goImageList()"  size="medium"  id="makeImage_button_cancel">{{$t('m.image.saveAndLeave')}}</el-button>            
          <el-button @click="isContainerMaking()" size="medium" id="removeContainer_button_confirm" >{{$t('m.image.removeAndLeave')}}</el-button>
    </section>
    <!-- Form -->

<el-dialog title="" :visible.sync="dialogFormVisible" v-loading="loading1" :element-loading-text="$t('m.loading')" >
  <el-form :model="updateForm" :rules="rules" ref="updateForm" class="outer-dialog-form"   >
    <el-form-item :label="$t('m.image.ImageName')" :label-width="formLabelWidth">
          {{ this.$route.query.imageName }}
        </el-form-item>
    <el-form-item :label="$t('m.image.TagName')" :label-width="formLabelWidth" prop="tag">
      <el-input  v-model="updateForm.tag" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item v-if="role=='viewer'" :label-width="formLabelWidth" :label="$t('m.image.setToPublic')">
          <el-switch v-model="updateForm.public" id="makeImage_switch"></el-switch>
    </el-form-item>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="dialogFormVisible = false">{{$t('m.cancel')}}</el-button>
    <el-button type="primary" @click="makeImageHandle('updateForm')">{{$t('m.confirm')}}</el-button>
  </div>
</el-dialog>
  </main>
</template>

<script>
import Lib from "../../assets/js/Lib";
import gateone from '../../assets/js/gateone.js'


export default {
  data() {
    var validateTagName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(this.$t("m.rules.pleaseEnter") + this.$t("m.image.tagName"))
        );
      } else if (
        !/^[a-zA-Z0-9]([-_.a-zA-Z0-9]{0,18}[a-zA-Z0-9])?$/.test(value.trim())
      ) {
        callback(new Error(this.$t("m.image.TagName") + this.$t("m.rules.regularDot")));
      } else {
        callback();
      }
    };
    return {
      rules: {
        tag: [
          { required: true, validator: validateTagName, trigger: "blur"   }
        ],
     
      },
      dialogFormVisible:false,
      role: "", // 用户角色: "admin" 或者 viewer
      username:'',
      formLabelWidth:'200px',
      updateForm: {
        tag: "",
        public: false,
       
      },
      loading: false, // 
      loading1: false, // 
      imageName: '',
      tagName: '',
      repositoryName: '',
      containerId:null,
      terminalId:null,
      termNum:null,
      terminalId:'',
      workspaceId:'',
      flag:"false",
    };
  },
beforeCreate(){
  localStorage.removeItem('go_default_bookmarks');
  localStorage.removeItem('go_default_deletedBookmarks');
  localStorage.removeItem('go_default_iconQueue');
  localStorage.removeItem('go_default_logs_sort');
  localStorage.removeItem('go_default_selectedTerminal');
  localStorage.removeItem('go_default_selectedWorkspace');
  localStorage.removeItem('go_default_sort');
  localStorage.removeItem('go_default_USN');
  localStorage.removeItem('go_default_prefs');
  localStorage.removeItem('container_id');

  this.flag=localStorage.getItem("image_flag");
  //第一次进入页面,刷新页面
  if(this.flag==='false'){//第一次进入页面,执行该分支
    this.flag='true'
    localStorage.setItem('image_flag', this.flag);
    window.location.reload();
  }else{//刷新后进入页面,执行该分支
    localStorage.setItem('container_flag', this.flag);
  }
},
  created() {
    // this.initMyDate();
    this.username = Lib.Common.getCookies("username"); // 用户名
    this.role = localStorage.getItem("rolesImage")?localStorage.getItem("rolesImage"):'viewer';
    this.repositoryName = this.$route.query.repositoryName;
    this.imageName = this.$route.query.imageName;
    this.tagName = this.$route.query.tagName
  },
  mounted(){
    //第一次进入页面不创建容器
    this.flag=localStorage.getItem("container_flag");
    if(this.flag!='false'){//如果是刷新后进入页面,符合条件
      this.createContainer();
    }

  },
beforeDestroy(){
  localStorage.removeItem('container_id');
  localStorage.setItem('image_flag', false);
  localStorage.setItem('container_flag', false);
},
  methods: {
    getAuth(){
      return  this.$axios.get(`/api/node/master/console`);
    },
    //执行一次删除默认gateone操作
    closeWorkspace(){
      GateOne.Terminal.workspaceClosedEvent(null);
      setTimeout(() => {
        this.closeOneWorkspace();
      this.loading = false; 
      }, 4000 );
    },
    //删除旧workspace,及对应的terminal
    closeOneWorkspace(){
        this.workspaceId=localStorage.getItem("go_default_selectedWorkspace");
        GateOne.Terminal.workspaceClosedEvent(this.workspaceId)
    },
    newTerminal (close_workspace) {
          GateOne.Logging.setLevel(10);
    //        GateOne.Visual.cleanupWorkspaces();
   
        // Introducing the superSandbox()!  Use it to wrap any code that you don't want to load until dependencies are met.
        // In this example we won't call newTerminal() until GateOne.Terminal and GateOne.Terminal.Input are loaded.
        // GateOne.Visual.init();
        GateOne.Base.superSandbox("NewExternalTerm", ["GateOne.Terminal", "GateOne.Terminal.Input"], (window, undefined)=> {
            "use strict";
            var existingContainer = GateOne.Utils.getNode('#gt'+200+""+this.terminalId);
        GateOne.locations;GateOne.Net.setLocation(this.terminalId)

        var container = GateOne.Utils.createElement('div', {
                'id': 'container'+this.terminalId, 'class': 'terminal', 'style': {'height': '100%', 'width': '100%'}
        });

        var gateone = GateOne.Utils.getNode('#gateone');

        // Don't actually submit the form
        if (!existingContainer) {
                gateone.appendChild(container);
        } else {
                container = existingContainer;
        }
        // Create the new terminal
    
        // this.termNum = GateOne.Terminal.newTerminal(200+""+this.terminalId, null, container);
        this.termNum = GateOne.Terminal.newTerminal(null, null, container);
        close_workspace();
        });
   
    },

     getCsl1() {
       this.$axios.all([this.getAuth()])
                .then(this.$axios.spread((at)=>{
                  const auth = at.data;

    GateOne.init({
        auth: auth,
        url: `http://${location.host}:8001`,
        autoConnectURL: `${this.containerId}`,
        // autoConnectURL: `f94e75f4646`,
        showToolbar: false,
    }, this.newTerminal(this.closeWorkspace))
    })
    )},

    // 制作镜像
    makeImageHandle(formName) {

      this.containerId=localStorage.getItem('container_id');

      this.$refs[formName].validate(valid => {
        if (valid) {         
          
          
          if(this.$store.state.imageMakingCount >= 3){
            this.$message({          
                showClose: true,
                message: this.$t('m.image.makeNotExceed3'),
                type: "warning",
                duration: Lib.Common.messageDuration              
            });
            return false;
          }
          this.loading1=true;     
        
          if(this.role == 'admin'){
            this.updateForm.public = true;
          }

          this.$axios.post(            
            Lib.API().image.makeImageByContainer,
            {
              "cid": this.containerId.split('|')[0],
              "baseImage": this.imageName , // 基础镜像
              "tagName": this.updateForm.tag,
              "isPublic": this.updateForm.public ? 1 : 0,
              "repositoryName": this.role == 'viewer' ? this.username : 'public',
              "loginName":this.username,
            }).then(res => {
              const data = res.data;
              if (data.success) {
                this.dialogFormVisible = false; // 关闭外层的dialog
                this.$message({
                  showClose: true,
                  message: this.imageName+":"+this.updateForm.tag+  " " + this.$t("m.image.makingBackground"),
                  type: "success",
                  duration: Lib.Common.messageDuration
                });
                 // 发送定时器请求
                Lib.bus.$emit('imageMake',{repositoryName:this.role == 'viewer' ? this.username : 'public', imageName:this.imageName, tagName:this.updateForm.tag}); 

              } else {
                this.dialogFormVisible = false; // 关闭外层的dialog
                var messageCode = data.message || "default";
                var messageText = this.$t("m.responseErrorMessage." + messageCode);
                Lib.Common.errorMessage(messageText, data.messageParams);
              }  
                  this.loading1=false;     
            // document.querySelector('input[type="file"]').value = '';
          });
        } else {
          return false;
        }
      });
    },
createContainer() {
  if(this.$store.state.imageMakingCount >= 3){
    this.$message({          
                showClose: true,
                message: this.$t('m.image.makeNotExceed3'),
                type: "warning",
                duration: Lib.Common.messageDuration              
            });
            return false;
          }

          if(this.role == 'admin'){
            this.updateForm.public = true;
          }

          this.loading = true;

          this.$axios.post(            
            Lib.API().image.createContainer,　
            {
              "loginName": this.username, // 基础镜像
              "baseImage": this.$route.query.imageName, // 基础镜像
              "tagName": this.$route.query.tagName,
              "isPublic": this.updateForm.public ? 1 : 0,
              "repositoryName": this.role == 'viewer' ? this.username : 'public',
            }).then(res => {
              const data = res.data;
              if (data.success) {
                
                this.containerId=data.cid;
                this.terminalId=data.terminalId;
                localStorage.setItem('container_id',this.containerId);
                this.getCsl1();
               
              } 
            // document.querySelector('input[type="file"]').value = '';
          });
             var isPublic = this.updateForm.public ? 1 : 0;
      // Lib.bus.$emit('imageDownload',{repositoryName:this.repositoryName, isPublic, imageName:this.imageName, tagName:this.updateForm.tag}); 
    },

    isContainerMaking() {
      this.$axios.get(
        Lib.API( this.containerId.substring(0,64)).image.isContainerMaking).then(res => {
          const data = res.data;
          if (data.success) {
            if(data.status==0){
              this.removeContainer();
            }else{
               this.$message({          
                  showClose: true,
                  message: this.$t('m.image.makingBackground'),
                  type: "warning",
                  duration: Lib.Common.messageDuration              
              });
            }
          } 
        });
    },
    removeContainer() {
      this.loading=true;
      this.$axios.delete(
        Lib.API().image.removeContainer+`?repository=${this.repositoryName}&image=${this.$route.query.imageName}&tag=${this.tagName}&loginName=${this.username}&isPublic=${this.updateForm.public ? 1 : 0}`).then(res => {
          const data = res.data;
          if (data.success) {
            // 后退一步，到镜像列表页
            if(this.role == 'admin'){
              this.$router.push({path:'/image/list/public'}); 
            }else{
              this.$router.push({path:'/image/list/private'}); 
            } 
          } 
        });
        //gateone连接中断,container才可以关闭,否则 docker stop命令会阻塞
        setTimeout(() => {
          this.closeOneWorkspace();
        }, 100 );
    },
    goImageList(){
      if(this.role == 'admin'){
        this.$router.push({path:'/image/list/public'}); 
      }else{
        this.$router.push({path:'/image/list/private'}); 
      } 
    }
  }
};
</script>

<style  lang="less" scoped>
.upload-demo {
  padding-left: 160px;
}
label {
  width: 180px;
  img {
    vertical-align: text-bottom;
  }
}

.el-form-item__content {
  margin-left: 160px;
}
.upload-label {
  position: absolute;
  height: 32px;
  z-index: 10;
  background-color: #80cbdc;
  width: 100px;
  line-height: 32px;
  text-align: center;
  border-radius: 5px;
  color: #fff;
  font-size: 13px;
  font-weight: normal;
  cursor: pointer;
}
.upload-input {
  position: absolute;
  margin-top: 3px;
  opacity: 0;
  width: 30px;
}
div.upload-tip {
  padding-left: 160px;
  margin-top: 40px;
  font-size: 12px;
  color: #777777;
}
div.upload-tip.red {
  color: rgb(253, 78, 78);
}
span.upload-name {
  position: absolute;
  left: 120px;
}
span.star {
  color: rgb(246, 121, 121);
  display: inline-block;
  position: absolute;
  z-index: 100;
  margin-left: -12px;
}
.inner-dialog {
  text-align: center;
  p:first-child {
    font-size: 16px;
    color: #1a99a5;
  }
  p:last-child {
    font-size: 12px;
    color: #777777;
  }
}
form.el-form .el-form-item:nth-child(1) {
  margin-bottom: 30px;
  div.el-form-item__error {
    color: #dd5454;
  }
}
.dialog-outer > div:first-child {
  width: 700px;
}
th {
  border-top: 1px solid #eeeeee;
}
ul.package-list {
  li {
    display: inline-block;
    padding-right: 30px;
    min-width: 330px;
    img {
      padding-right:5px;
    }
  }
}
</style>


