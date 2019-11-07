<template>
  <main>
    <section class="form">

      <el-dialog width="30%" :title="$t('m.image.uploadFiles')" :visible.sync="innerVisible" id="imagelist_dialog_inner" :before-close="handleClose">
        <div class="inner-dialog">
          <p>{{$t('m.image.effortToUpload')}} <i class="el-icon-loading"></i></p>
          <p v-if="updateForm.fileName=='Dockerfile'">{{$t('m.image.takesAbout5Minutes')}}</p>
        </div>      
      </el-dialog>
    
      <el-form :model="updateForm" :rules="rules" ref="updateForm" class="outer-dialog-form"  size="small">
        <el-form-item :label="$t('m.image.ImageName')" :label-width="formLabelWidth" prop="name">
          <el-input v-model="updateForm.name" auto-complete="off" id="name" ></el-input>
        </el-form-item>
        <el-form-item :label="$t('m.image.TagName')" :label-width="formLabelWidth" prop="tag">
          <el-input v-model="updateForm.tag" auto-complete="off" id="tag"></el-input>
        </el-form-item>

        <el-form-item v-if="role=='viewer'" :label="$t('m.image.setToPublic')"  :label-width="formLabelWidth">
          <el-switch v-model="updateForm.public" id="imagelist_switch"></el-switch>
        </el-form-item>
        <el-form-item  :label="$t('m.image.dockerfile')"  :label-width="formLabelWidth">
          {{$t('m.no')}} <el-switch v-model="updateForm.isDockerfile" id="imagelist_switch_isDockerfile"></el-switch> {{$t('m.yes')}}
        </el-form-item>

        <el-form-item  :label-width="formLabelWidth">
          <span class="star">*</span>
          <label class="upload-label" for="xFile">{{$t('m.image.uploadFiles')}}</label>
          <input type="file" id="xFile" class="upload-input" @change="getSizeType">
          <span class="upload-name">{{this.updateForm.fileName}}</span>
        </el-form-item>
        <div class="upload-tip" :class="{ red: !updateForm.isFileOK }">
        {{$t('m.image.fileSizeMessage')}}
        </div>
        <el-form-item :label-width="formLabelWidth" style="margin-top:10px; color:#777777; ">
          <span style="border-top:1px solid #eee; display: inline-block; padding-top:2px;font-size:12px;">
            {{$t('m.updateImageTip')}}<br /> 
            demo: docker save -o java8.tar lwieske/java-8</span>
          
          
        </el-form-item>
        <!-- <p></p> -->

        <el-form-item style="margin-top:60px;margin-left:120px;">
          <el-button type="primary" @click="uploadHandle('updateForm')" size="medium" id="imagelist_button_confirm">{{$t('m.confirm')}}</el-button>
          <el-button @click="updateForm.isFileOK=true;$router.go(-1)"  size="medium"  id="imagelist_button_cancel">{{$t('m.cancel')}}</el-button>            
        </el-form-item>
      </el-form>
      
    </section>
    
  </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
    var validateImageName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.image.imageName")
          )
        );
      } else if (
        !/^[a-z0-9]([-_a-z0-9]{0,18}[a-z0-9])?$/.test(value.trim())
      ) {
        callback(new Error(this.$t("m.image.ImageName") + this.$t("m.rules.regularUnderline")));
      } else {
        callback();
      }
    };
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
        name: [
          { required: true, validator: validateImageName, trigger: "blur" }
        ],
        tag: [
          { required: true, validator: validateTagName, trigger: "blur"   }
        ]
      },
      role: "", // 用户角色: "admin" 或者 viewer
      username:'',
      innerVisible: false, // 里层的dialog
      formLabelWidth:'120px',
      updateForm: {
        name: "",
        tag: "",
        isFileOK: true, // 文件格式和大小默认都对的
        public: false,
        isDockerfile:false,
        fileSize: 0,
        fileName: ""
      },
      timerId: null, // 定时器ID
      cancelTokenSource:'',
      repositoryName: '', // 仓库名，如果是普通用户传　用户名，　管理员的话传　‘public’
    };
  },

  created() {
    this.changeLang();
  },

  methods: {
        // 切换语言
    changeLang() {
      this.$i18n.locale = localStorage.getItem("locale"); // 语言
      this.username = Lib.Common.getCookies("username"); // 用户名
      this.role = localStorage.getItem("rolesImage")?localStorage.getItem("rolesImage"):'viewer';
      if(this.role == 'viewer'){
        this.repositoryName = this.username;
      }else{
        this.repositoryName = 'public';
      }
    },

    // 判断文件类型和大小
    getSizeType() {
      var inputFile = document.querySelector('input[type="file"]');
      this.updateForm.fileSize = inputFile.files[0].size;
      this.updateForm.fileName = inputFile.files[0].name;      
      if (this.updateForm.fileSize / 1024 / 1024 >= (5*1024)) {
        this.updateForm.isFileOK = false;
        return false;
      } else {
        this.updateForm.isFileOK = true;
      }
    },

    // 上传镜像
    uploadHandle(formName) {
      if(!this.updateForm.fileName){
        this.updateForm.isFileOK = false;
        return false;
      }
      // 验证
      this.$refs[formName].validate(valid => {
        if (valid) {         
          // ,验证文件大小
          if (!this.updateForm.isFileOK) {
            return false;
          }

          // 取消上一个，每次只能传一个。
          if(this.cancelTokenSource){
            this.cancelTokenSource.cancel();
          }  
          // 关闭定时器
          this.stopTimer(); 

          // 3 请求参数
          var file = document.querySelector('input[type="file"]').files[0];
          let param = new FormData();
          param.append("file", file);
          this.cancelTokenSource = this.$axios.CancelToken.source();
          let config = {
            header: { "Content-Type": "multipart/form-data" },
            cancelToken:this.cancelTokenSource.token            
          };
          var url = "";
          var isPublic = null; // 默认为公共镜像，当管理员创建镜像时， 也只能是公共镜像        

          if (this.updateForm.public) {
            isPublic = "1";
          } else {
            isPublic = "0";
          }

          if(this.role == 'admin'){
            isPublic = '1'; // 如果是管理员， 只能是公开
          }

          if (!this.updateForm.isDockerfile) {
            url = Lib.API().image.uploadTar + `?imageName=${this.updateForm.name}&tagName=${this.updateForm.tag}&isPublic=${isPublic}&repositoryName=${this.repositoryName}`;
            // /api/image/images/upload/tarfile 
          } else {
            url = Lib.API().image.uploadDockerfile + `?imageName=${this.updateForm.name}&tagName=${this.updateForm.tag}&isPublic=${isPublic}&repositoryName=${this.repositoryName}`;
            // /api/image/images/upload/dockerfile 
          }
          this.innerVisible = true; // 打开里层的　dialog

          // if(this.role == 'viewer'){
          //   url = url + '&repositoryName='+ this.username;
          // }
          // 4 发送请求
          this.$axios.post(url, param, config).then(res => {
            const data = res.data;
            if (data.success) {
              // 发送定时器请求
              this.getInterval(this.updateForm.name,this.updateForm.tag); // 开启定时器              
            } else {
              this.innerVisible = false; // 关闭里层的dialog
              this.dialogFormVisible = false; // 关闭外层的dialog

              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText, data.messageParams);
            }            
            document.querySelector('input[type="file"]').value = '';
          });
        } else {
          return false;
        }
      });
    },

    // 上传镜像时的定时器请求
    getInterval(imageName,tagName){
      clearInterval(this.timerId);
      // 开启新的定时器
      this.timerId = setInterval(() => {
        // 发送请求， 获取添加结果
        this.$axios.get(Lib.API(imageName,tagName).image.uploadProgress )
        // `/api/image/images/upload/${imageName}/${tagName}/progress`        
        .then(res => {
          const data = res.data;
          if(data.success){ 
            // 0:正在上传,1:上传完成,2:上传出现异常
            if(data.status === 1){
              // 上传完成
              this.$message({
                showClose: true,
                message: this.$t("m.image.upload") + this.$t("m.successAdv"),
                type: "success",
                duration: Lib.Common.messageDuration
              });
              this.query = ""; // 清空 input 框 
              this.innerVisible = false; // 关闭里层的dialog
              if(this.role == 'admin'){
                this.$router.push({path:'/image/list/public'});
              }else{
                this.$router.push({path:'/image/list/private'});
              }
            }else if(data.status === 2){
              // 上传失败
              this.$message({
                showClose: true,
                message: this.$t("m.image.upload") + this.$t("m.failAdv"),
                type: "error",
                duration: Lib.Common.messageDuration
              });
            }

            if(data.status != 0){ // 不是正在上传
              this.innerVisible = false; // 关闭里层的dialog
              // 上传已经结束， 可能成功 or 失败                           
              this.stopTimer(); // 关闭定时器
              // 清空
              this.updateForm.name = ""; // 镜像名
              this.updateForm.tag = ""; // 标签名
              this.updateForm.fileName = ""; // 上传的文件名
            }
          }else{
            this.innerVisible = false; // 关闭里层的dialog
            this.updateForm.name = ""; // 镜像名
            this.updateForm.tag = ""; // 标签名
            this.updateForm.fileName = ""; // 上传的文件名                          
            this.stopTimer(); // 关闭定时器
            
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams,'interval');
          }
        
        })
      }, 5000) // 5000毫秒->  5秒 发一次请求　　
    },

     // 关闭定时器
    stopTimer: function () {
      clearInterval(this.timerId);
    }, 

    // 确认取消上传
    handleClose(done) {
      this.$confirm(this.$t('m.confirmCancelUpload'), this.$t('m.tip'), {
          confirmButtonText: this.$t('m.confirm'),
          cancelButtonText: this.$t('m.continueToUpload'),
          type: 'warning'
        }).then(() => {
          // 点击 确定
          this.stopTimer(); // 关闭定时器   
          this.innerVisible = false; // 关闭dialog       
        }).catch(() => {
          // 点击取消/ 继续上传
                   
        });
      
    }, 

    // // 重置
    // resetForm(formName) {
    //   this.$refs[formName].resetFields();
    // }
  }
};
</script>

<style  lang="less" scoped>
.upload-demo {
  padding-left: 160px;
}
label {
  width: 160px;
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
  padding-left: 120px;
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
</style>


