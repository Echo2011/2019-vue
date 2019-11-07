<template>
  <main>
    <section class="form">
    
      <el-form :model="updateForm" :rules="rules" ref="updateForm" class="outer-dialog-form" v-loading="loading" :element-loading-text="$t('m.loading')"   size="small">
        <el-form-item :label="$t('m.image.ImageName')" :label-width="formLabelWidth">
          {{ this.$route.query.imageName }}
          <!-- <el-input v-model="updateForm.name" auto-complete="off" id="makeimage_name" ></el-input> -->
        </el-form-item>
        <el-form-item :label="$t('m.image.TagName')" :label-width="formLabelWidth" prop="tag">
          <el-input v-model="updateForm.tag" auto-complete="off" id="makeimage_tag"></el-input>
        </el-form-item>

        <!-- python2 -->
        <el-form-item :label="$t('m.image.pythonPackageInstalled')" :label-width="formLabelWidth">
          <ul class="package-list">
            <li v-for="(item,index) in tagDetail.pythonPkgs" :key="index">
              <img :src="getImgUrl(item)" :alt="item" >{{item}}
            </li>
          </ul>
        </el-form-item>
        <el-form-item :label="$t('m.image.python2Package')" :label-width="formLabelWidth">
          <el-checkbox-group v-model="updateForm.checkList2" >
            <el-checkbox v-for="(item,index) in python2List" :key="index" :label="item.value" style="margin-left:0;" :disabled="item.disabled">
              <img :src="getImgUrl(item.value)" :alt="item.value" >
              {{item.value}}</el-checkbox>
          </el-checkbox-group>
          <div style="margin-bottom:15px;" v-for="(item,index) in packageUserAdd2" :key="index">
            <el-input v-model="item.value"  style=" width:20%;min-width:300px" :placeholder="$t('m.image.ImageName')">
            </el-input> 
            <i class="el-icon-plus" @click="packageUserAddHandle(packageUserAdd2)" v-show="index==0"></i>
            <i class="el-icon-minus" @click="packageUserMinusHandle(packageUserAdd2,index)" v-show="index!==0"></i><br/>
          </div>
        </el-form-item>

        <!-- python3 -->
        <el-form-item :label="$t('m.image.python3PackageInstalled')" :label-width="formLabelWidth">
          <ul class="package-list" v-if="tagDetail.python3Pkgs.length">
            <li v-for="(item,index) in tagDetail.python3Pkgs" :key="index">
              <img :src="getImgUrl(item)" :alt="item" >{{item}}
            </li>
          </ul>
          <span v-else>{{$t("m.noData")}}</span>
        </el-form-item>
        <el-form-item :label="$t('m.image.python3Package')" :label-width="formLabelWidth">
          <el-checkbox-group v-model="updateForm.checkList3" >
            <el-checkbox v-for="(item,index) in python3List" :key="index" :label="item.value" style="margin-left:0;" :disabled="item.disabled">
              <img :src="getImgUrl(item.value)" :alt="item.value" >
              {{item.value}}</el-checkbox>
          </el-checkbox-group>
          <div style="margin-bottom:15px;" v-for="(item,index) in packageUserAdd3" :key="index">
            <el-input v-model="item.value"  style=" width:20%;min-width:300px" :placeholder="$t('m.image.ImageName')">
            </el-input> 
            <i class="el-icon-plus" @click="packageUserAddHandle(packageUserAdd3)" v-show="index==0"></i>
            <i class="el-icon-minus" @click="packageUserMinusHandle(packageUserAdd3,index)" v-show="index!==0"></i><br/>
          </div>
        </el-form-item>


        <el-form-item :label="'Python '+$t('m.image.version')" :label-width="formLabelWidth" >
          <span v-if="isNoHasPythonVersion" class="red-text">{{$t('m.noData')+' '+$t('m.image.noMakeImage')}}</span> 
          <span v-else>  Python {{tagDetail.python}}  &nbsp;   &nbsp;   &nbsp;   &nbsp; 
          Python3 {{tagDetail.python3}} </span>       
        </el-form-item>
        <el-form-item :label="$t('m.system')" :label-width="formLabelWidth" >
          {{tagDetail.dist}} {{tagDetail.distVersion}}
        </el-form-item>
        <el-form-item v-if="role=='viewer'" :label-width="formLabelWidth" :label="$t('m.image.setToPublic')">
          <el-switch v-model="updateForm.public" id="makeImage_switch"></el-switch>
        </el-form-item>

        <el-form-item v-show="isSelectPackageOne" :label-width="formLabelWidth" label="" class="red-text">
          {{ $t("m.rules.selectOrEnterAtLeast") + $t("m.image.pythonPackage") }}
        </el-form-item>
        
        <el-form-item style="margin:70px 30%;">
          <el-button type="primary" @click="makeImageHandle('updateForm')" size="medium" id="makeImage_button_confirm" :disabled="isNoHasPythonVersion">{{$t('m.confirm')}}</el-button>
          <el-button @click="$router.go(-1)"  size="medium"  id="makeImage_button_cancel">{{$t('m.cancel')}}</el-button>            
        </el-form-item>
      </el-form>
      
    </section>
    
  </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

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
        // checkList:[
        //    { type: 'array', required: true, message: this.$t("m.rules.selectAtLeast")+this.$t("m.image.pythonPackage"), trigger: 'change' }
        // ],
      },
      role: "", // 用户角色: "admin" 或者 viewer
      username:'',
      formLabelWidth:'200px',
      python2List:[],
      python3List:[],
      updateForm: {
        tag: "",
        public: false,
        checkList2: [], // 可以选择的镜像，
        checkList3: [], // 可以选择的镜像，
      },
      timerId: null, // 定时器ID
      cancelTokenSource:'',
      loading: false, // 
      tagDetail: {
        python3Pkgs:[],
      },
      // python2List: [], 
      // python3List: [],
      packageUserAdd2: [{value:''}],
      packageUserAdd3: [{value:''}],
      isSelectPackageOne: false,
      isNoHasPythonVersion: false,
      imageName: '',
      tagName: '',
      repositoryName: '',
    };
  },

  created() {
    this.username = Lib.Common.getCookies("username"); // 用户名
    this.role = localStorage.getItem("rolesImage")?localStorage.getItem("rolesImage"):'viewer';
    this.repositoryName = this.$route.query.repositoryName;
    this.imageName = this.$route.query.imageName;
    this.tagName = this.$route.query.tagName
    // this.getPythons();
    this.getImageTagDetail();
  },

  methods: {
       // 添加　超参数
    packageUserAddHandle(arr){
      // if(arr)
      // this.packageUserAdd.push({key:'',value:''})
      arr.push({value:''})
    },

    // 减少　超参数
    packageUserMinusHandle(arr,index){

      arr.splice(index,1)
      // this.packageUserAdd.splice(index,1)
    },
    // 详情
    getImageTagDetail() {   
      this.loading = true;
      this.$axios
        .get(Lib.API().image.getImageTagDetail+`?repositoryName=${this.repositoryName}&imageName=${this.imageName}&tagName=${this.tagName}`)
        // `/api/image/images/make/search/addImage`
        .then(res => {
          let data = res.data;
          if (data.success) {
            
            if(data.imageInfoDetect.pythonPkgs){
              data.imageInfoDetect.pythonPkgs = data.imageInfoDetect.pythonPkgs.split(',');
            }else{
              data.imageInfoDetect.pythonPkgs = [];
            }

            if(data.imageInfoDetect.python3Pkgs){
              data.imageInfoDetect.python3Pkgs = data.imageInfoDetect.python3Pkgs.split(',');
            }else{
              data.imageInfoDetect.python3Pkgs = [];
            }

            if(data.imageInfoDetect.python3.includes(' ')){
              data.imageInfoDetect.python3 = data.imageInfoDetect.python3.split(' ')[1];
            }

            this.tagDetail = data.imageInfoDetect;            
            if(!this.tagDetail.python && !this.tagDetail.python3){
              this.isNoHasPythonVersion = true;
            }
            
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loading = false;
        }).then( () => {
          this.getPythons();
        });
    }, 
       

    // 解决动态获取 img 的 src 属性不显示问题
    getImgUrl(petTem) {
      let pet = petTem.split(' ')[0];
      // 图标
      var arrIcon = ['Bokeh','cython','ipython','jupyter','matplotlib','NetworkX','numpy','NuPIC','pandas','Plotly','python','scikit-learn','scipy','seaborn','Statsmodels'];

      var images = require.context('../../assets/img/python-icon/', false, /\.gif$/);
      
      if(arrIcon.includes(pet)){
        return images('./' + pet + ".gif");
      }else{
        return images('./python.gif');
      }
      
    },

    // 获取 Python 包
    getPythons() {   
      this.$axios
        .get(Lib.API().image.getPythons)
        // `/api/image/images/make/search/addImage`
        .then(res => {
          const data = res.data;
          if (data.success) {
            
            // this.python2List = data.pythonImages; // 
            // this.python3List = data.pythonImages; // 
            // 循环要装的包，禁止选择已经安装好的包
            // python2
            data.pythonImages.forEach( element => {
              let temB = this.tagDetail.pythonPkgs.some( ele => {
                return element === ele.split(' ')[0];
              })
              if(temB){
                this.python2List.push({
                  value: element,
                  disabled: true
                })    
              }else{
                this.python2List.push({
                  value: element,
                  disabled: false
                })
              }
            })
            
            // python3
            data.pythonImages.forEach( element => { 
              let temB = this.tagDetail.python3Pkgs.some( ele => {
                return   element === ele.split(' ')[0];
              }) 
              if(temB){
                this.python3List.push({
                  value: element,
                  disabled: true
                })
              }else{
                this.python3List.push({
                  value: element,
                  disabled: false
                })
              }
              
            })

          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
        });
    },  

    // 制作镜像
    makeImageHandle(formName) {

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

          // 循环 -》过滤掉空值
          let temArr2 = [], temArr3 = [];

          this.packageUserAdd2.forEach(ele => {
            if(ele.value){
              temArr2.push(ele.value);
            }            
          })     

          this.packageUserAdd3.forEach(ele => {
            if(ele.value){
              temArr3.push(ele.value);
            }            
          })
          // 赋值
          let addPython2 = [...this.updateForm.checkList2,...temArr2];
          let addPython3 = [...this.updateForm.checkList3,...temArr3];

          if((addPython2.length + addPython3.length) === 0){
            this.isSelectPackageOne = true;
            return false;
          }else{
            this.isSelectPackageOne = false;
          }

          if(this.role == 'admin'){
            this.updateForm.public = true;
          }

          this.loading = true;

          this.$axios.post(            
            Lib.API().image.makeImage,　// '/api/image/images/make',
            {
              "baseImage": this.$route.query.imageName + ':'+this.$route.query.tagName, // 基础镜像

              "newImage": this.$route.query.imageName + ':' + this.updateForm.tag,
              "addPython2": addPython2,
              "addPython3": addPython3,
              "isPublic": this.updateForm.public ? 1 : 0,
              "repositoryName": this.role == 'viewer' ? this.username : 'public',
            }).then(res => {
              this.loading = false; 
              const data = res.data;
              if (data.success) {
                
                // 发送定时器请求
                Lib.bus.$emit('imageMake',{repositoryName:this.role == 'viewer' ? this.username : 'public', imageName:this.updateForm.name, tagName:this.updateForm.tag}); 

                // 后退一步，到镜像列表页
                window.history.length > 1 ? this.$router.go(-1) : this.$router.push('/');              
              } else {
                // this.innerVisible = false; // 关闭里层的dialog
                // this.dialogFormVisible = false; // 关闭外层的dialog

                var messageCode = data.message || "default";
                var messageText = this.$t("m.responseErrorMessage." + messageCode);
                Lib.Common.errorMessage(messageText, data.messageParams);
              }  
                       
            // document.querySelector('input[type="file"]').value = '';
          });
        } else {
          return false;
        }
      });
    },

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


