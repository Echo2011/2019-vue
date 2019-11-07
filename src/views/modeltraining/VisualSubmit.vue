<template>
    <main>
      <section class="form-wrap" v-loading="loading"  :element-loading-text="$t('m.loading')">
        <el-form ref="form" :model="form" :rules="rules" label-width="200px"  size="small" style="margin-top:30px; margin-right: 100px;"> 
          <!-- 可视化名称 -->
          <el-form-item :label="$t('m.visualName')" prop="jobName">
            <el-input v-model.trim="form.jobName" id="submit_visual_jobName" :autofocus="true"></el-input>
          </el-form-item>
          
          <!-- 执行器        -->
          <el-form-item  :label="$t('m.job.MLlib')">
            <el-radio-group v-model="form.type" id="submit_visual_type" @change="radioHandle">
              <el-radio label="tensorflow" id="submit_visual_type_tensorflow">tensorflow</el-radio> 
              <el-radio label="caffe" id="submit_visual_type_caffe">caffe</el-radio>              
            </el-radio-group>
          </el-form-item> 

          <el-form-item  :label="$t('m.visualizationTool')">
            {{whichtype}}
          </el-form-item>
         
          <!-- caffe 选中的路径/文件 -->
          <el-form-item :label="$t('m.logPath')" prop="logPath" :error="entryFileErrorMessage" v-if="form.type==='caffe'">
            <el-cascader style="width:100%;"  :options="options" v-model="form.logPath"      
              @active-item-change="handleItemChange" id="submit_visual_logPath" >
            </el-cascader>
          </el-form-item>
          
          <!-- tensorflow　选中的文件夹 -->
          <el-form-item :label="$t('m.job.workSpace')" prop="entryFile" :error="validateDeploymentEntryFileError"  v-if="form.type==='tensorflow'">                  
            <el-input v-model="form.entryFile" id="submitvisual_tensorflow_file"  @focus="dialogStrorageTreeVisible = true" ></el-input>
            <!-- storage tree -->
            <el-dialog :title="$t('m.job.workSpace')" :visible.sync="dialogStrorageTreeVisible" @close="choseDialogStorageTree">    
                <p style="margin:0;padding:0">{{$t('m.store.selectedPath')}}： <strong>{{choosePath}}</strong></p>                 
                <ul class="demo" style="min-height:300px;border:1px solid #eee;padding:10px 0;">
                  <storageTreeItem class="item" :model="treeData" ></storageTreeItem>
                </ul>                    
              <div slot="footer" class="dialog-footer">
                <el-button @click="choseDialogStorageTree">{{$t('m.cancel')}}</el-button>
                <el-button type="primary" :disabled="!choosePath" @click="deploymentSubmitHandle">{{$t('m.confirm')}}</el-button>
              </div>
            </el-dialog>
          </el-form-item>

          <el-form-item :label="$t('m.job.remainResourceOfTheZone')">
            CPU: {{zoneItem.cpu}} Core 
            <span style="display:inline-block;color:#999;padding:0 10px;"></span>
            {{$t('m.memory')}}: {{zoneItem.memory}} GB 
          </el-form-item>

          <el-form-item :label="$t('m.job.userRemainResource')">
            CPU: {{user.cpu}} Core 
            <span style="display:inline-block;color:#999;padding:0 10px;"></span>
            {{$t('m.memory')}}: {{user.memory}}  GB
          </el-form-item> 
          
          <el-form-item label="CPU (Core)">
            <el-input-number v-model.number="form.cpu" :precision="0" :step="1" :min="1" :max="Math.min(zoneItem.cpu,user.cpu)" @blur="form.cpu=form.cpu?form.cpu:1"  id="submit_visual_cpu_input">        
            </el-input-number>
          </el-form-item> 

          <el-form-item :label="$t('m.memory')+' (GB)'">
            <el-input-number v-model.number="form.memory" :precision="0" :step="1"  :min="1" :max="Math.min(zoneItem.memory,user.memory)" @blur="form.memory=form.memory?form.memory:1" id="submit_visual_memory_input">        
            </el-input-number>
          </el-form-item>

          <el-form-item label="" v-show="errorMsg">
            <p class="red-text" style="padding-left:0px;">{{errorMsg}}</p>
          </el-form-item>

          <el-form-item :label="$t('m.job.chooseImage')" prop="imageTag">
            <imageLabel :label="label" @imageTagValue="form.imageTag= $event"></imageLabel>
          </el-form-item>

          <el-form-item style="padding-top:20px;">
            <el-button :disabled="errorMsg||!form.jobName"  id="visual_submit_btn_submitForm"  type="primary" @click="submitForm('form')" size="medium">{{$t('m.submit')}}</el-button>
            <el-button  id="visual_submit_btn_cancel" @click="$router.go(-1)"  size="medium">{{$t('m.cancel')}}</el-button>
          </el-form-item>
         
        </el-form>
      </section>

    </main>
</template>

<script>
import storageTreeItem from '../../components/StorageTreeItem.vue';
import imageLabel from '../../components/ImageLabel.vue';
import Lib from "../../assets/js/Lib";

export default {
  components: {
    storageTreeItem,
    imageLabel,
  },
  data() {

    var validateLogPath = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.logPath").toLowerCase()
          )
        );
      }  else {
        callback();
      }
    };
    var validateJobName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.visualName").toLowerCase()
          )
        );
      } else if (!/^[a-z]([a-z0-9]{0,18}[a-z0-9])?$/.test(value)) {
        callback(new Error(this.$t("m.visualName") + this.$t("m.rules.regularCommon4")));
      } else {
        callback();
      }
    };
    var validateDeploymentEntryFile = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.job.workSpace").toLowerCase()
          )
        );
      }  else {
        callback();
      }
    };
    var validateImage = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t('m.job.pleaseChooseImage')
          )
        );
      } else {
        callback();
      }
    };
    
    return {  
      loading: false,
      username: '',
      volumeName:　'',
      roleStorage: '',

      options: [], 
      optionFileArr:[], // 点击选择的文件夹名的集合， 不包括最后的文件名
      firstIndex:null, //  option数组的 index
      pathHistory:[], // 存放 path 的历史记录，用来避免发重复的请求
      optionIndexArr:[], // 获取到的所有 的 index 值
      entryFileErrorMessage:null, // 错误提示信息


      validateDeploymentEntryFileError:'',
      dialogStrorageTreeVisible: false,
      choosePath:'', // 选中的工作空间
      treeData: {
        fileName: this.$t('m.store.allFiles'),
        directory: true,
        path: '', // 根目录时, path 为空, 后台要的路径,大家根据需要添加
        // 防止第一次随机获取数据为空, 默认加的 children
        children: [
          // { fileName: 'work.md', path: "/work.md", directory: true, children: [] },
          // { fileName: 'ss.md', path: "/ss.md", directory: false },
        ]
      },


      form:{ 
        jobName: '', // 可视化名称      
        type: 'tensorflow',  // 执行器         
        logPath:[],
        entryFile:'',
        cpu: 1,
        memory: 1,
        imageTag: ''
      },
      rules: { 
        jobName: [
          { required: true, validator: validateJobName,  trigger: 'blur' },
        ],
        logPath: [
          { required: true, validator: validateLogPath, trigger: 'change' }
        ], 
        entryFile: [
          { required: true, validator: validateDeploymentEntryFile, trigger: 'change' }
        ] , 
        imageTag: [
          { required: true, validator: validateImage, trigger: 'change' }
        ],
      },  
      whichtype:'tensorboard',
      zoneItem: {
        cpu: 0,
        memory: 0,
      },
      user: {
        cpu: 0,
        memory: 0,
      },
      zoneName: '',
      errorMsg: '', // 资源不足
      label: {}, 
    };
  },

  created() {
    this.username = Lib.Common.getCookies("username")?Lib.Common.getCookies("username"):null; // 获取用户名
    this.volumeName = localStorage.getItem('volumeName')?localStorage.getItem('volumeName'):'nfs';
    this.form.jobName = 'visual'+parseInt(Math.random()*100000);
    this.roleStorage = localStorage.getItem('rolesStore') ? localStorage.getItem('rolesStore') : null;
    this.getLogPath();
    Lib.bus.$on("choose-path", arg => {
        this.choosePath = '/' + arg;
    });

    // this.getUserQuotas(); // 用户详情 -> 获取用户使用的分区名
    // this.getUserLast(); // // 获取用户剩余配额
    this.getQuotes(); // 计算配额
    // this.$emit('label',['tenorboard']); // 获取镜像列表
    this.label = {visual: ['tensorboard']};
    

  },

  methods: {
    
    // 资源不足 错误提示
    // numberBlurChangeHandle(){
    //   // console.log('this.user.cpu='+this.user.cpu);
    //   // console.log('this.zoneItem.cpu='+this.zoneItem.cpu);
    //   // console.log('this.user.memory='+this.user.memory);
    //   // console.log('this.zoneItem.memory='+this.zoneItem.memory);
      
    //   if(this.user.cpu <= 0 || this.zoneItem.cpu <= 0){
    //     this.errorMsg =  this.$t('m.rules.insufficientCPU'); // 'cpu资源不足';
    //     return false;
    //   }else{
    //     this.errorMsg = '';
    //   };

    //   if(this.user.memory <= 0 || this.zoneItem.memory <= 0){
    //     this.errorMsg =  this.$t('m.rules.insufficientMemory');// 内存不足
    //   }else{
    //     this.errorMsg = '';
    //   };            
    // },

    // 获取配额
    async getQuotes(){

      this.loading = true;
      let userQuotas,zoneName,zone;

      // 0 用户详情中获取分区
      zoneName = await this.$axios.get(Lib.API(this.username).auth.userDetail);
      if(zoneName.data.success){
        this.zoneName = zoneName.data.result.zoneName;
      }else{ // 错误码
        Lib.Common.errorMessage(this.$t('m.responseErrorMessage.' + (zoneName.data.message || 'default')), zoneName.data.messageParams);
      }
      

      // 1 分区配额
      zone = await this.$axios.get(Lib.API(this.zoneName).zone.getZone);
      if(zone.data.success){
        let data = zone.data;
        this.zoneItem.cpu = data.result.quotas.CPU - data.result.quotas['CPU Used']; // 剩余 cpu
        //  mb -> gb
        if(data.result.quotas.memory.substr(-2).toLowerCase() == 'mb'){
          data.result.quotas.memory = Math.round(parseInt(data.result.quotas.memory) / 1024)
        }else{
          data.result.quotas.memory = parseInt(data.result.quotas.memory)
        }

        if(data.result.quotas['memory used']){
          if(data.result.quotas['memory used'].substr(-2).toLowerCase() == 'mb'){
            data.result.quotas['memory used'] = Math.round(parseInt(data.result.quotas['memory used']) / 1024)
          }else{
            data.result.quotas['memory used'] = parseInt(data.result.quotas['memory used'])
          }
        }

        this.zoneItem.memory = (data.result.quotas.memory - data.result.quotas['memory used']);
      }else{ // 错误码
        Lib.Common.errorMessage(this.$t('m.responseErrorMessage.' + (zone.data.message || 'default')), zone.data.messageParams);
      }

      // 2 用户剩余配额
      userQuotas = await this.$axios.get(Lib.API().job.getUserLastQuotas + `?owner=${this.username}`);
      if(userQuotas.data.success){
        let data = userQuotas.data;

        this.user.cpu = data.cpu;          
        if(data.internalMemory.substr(-2).toLowerCase() == 'mb'){
          // 如果是　ｍｂ　转为　ｇｂ
          this.user.memory = parseInt(data.internalMemory.slice(0, -2))/1024;
        }else{
          this.user.memory = parseInt(data.internalMemory.slice(0, -2));
        }
      }else{ // 错误码
        Lib.Common.errorMessage(this.$t('m.responseErrorMessage.' + (userQuotas.data.message || 'default')), userQuotas.data.messageParams);
      }

      //3 判断配额
      this.loading = false;
      // this.numberBlurChangeHandle();
      if(this.user.cpu < 1 || this.zoneItem.cpu < 1){
        this.errorMsg =  this.$t('m.rules.insufficientCPU'); // 'cpu资源不足';
        return false;
      }else{
        this.errorMsg = '';
      };

      if(this.user.memory < 1 || this.zoneItem.memory < 1){
        this.errorMsg =  this.$t('m.rules.insufficientMemory');// 内存不足
      }else{
        this.errorMsg = '';
      };
    },

    // 选择空间
    deploymentSubmitHandle: function() {
      this.dialogStrorageTreeVisible = false;
      this.entryFileErrorMessage = '';
      this.form.entryFile = this.choosePath;
      
    },

    // 关闭 choseDialogStorageTree
    choseDialogStorageTree(){
      this.dialogStrorageTreeVisible = false;
      this.choosePath='';
      if(!this.form.entryFile){
        this.changeEveryTime = !this.changeEveryTime;
        this.validateDeploymentEntryFileError = this.$t("m.rules.pleaseChoose") + this.$t("m.job.workSpace").toLowerCase() + (this.changeEveryTime?'。 ':'。');
      }
    },

    
    // 执行器的选择
    radioHandle(value){
      if(value === 'tensorflow'){
        this.whichtype = 'tensorboard';
        this.label = { visual: ['tensorboard'] };
      }else if(value === 'caffe'){
        this.whichtype = 'caffe';
        this.label = { visual: ['caffe'] };
      }      
    },

    // 获取入口文件
    getLogPath(){

      var optionIndexStr = '';  
      var index = null;
      var whichChildren = null;
      var temArr = this.options;

      this.optionIndexArr = []; // 清空

      //1 获取 index 的数组
      for(var i=0; i < this.optionFileArr.length; i++){        
        var index = null;
        if(i===0){          
          index = this.options.findIndex( ele => {
            return ele.label == this.optionFileArr[i];           
          })
          this.optionIndexArr.push(index);
          this.firstIndex = index;
          whichChildren = 'temArr['+this.firstIndex+']';
        }else{
          // var tt = eval(whichChildren)
          index = eval(whichChildren).children.findIndex( ele => {
            return ele.label == this.optionFileArr[i];           
          })
          whichChildren = whichChildren+'.children['+index+']'
          this.optionIndexArr.push(index);
        }
      }

      //2 获取 路径 的字符串
      for(var j = 1; j < this.optionIndexArr.length; j ++){
        optionIndexStr += '.children['+this.optionIndexArr[j]+']'
      }
      optionIndexStr = 'temArr['+this.firstIndex+']'+optionIndexStr;


      // 优化 已经请求过的文件夹，不在请求
      var temIndex = this.pathHistory.findIndex(ele => {
        return ele == '/'+this.optionFileArr.join('/');
      })
      if(temIndex > 0){
        return false;
      }
      this.pathHistory.push('/'+this.optionFileArr.join('/'));
      
      let type = '', volumeName = '', userFolder = '';
      if(this.roleStorage === 'viewer'){
        volumeName = this.volumeName;
        userFolder = this.username;
        type = 'private';
      }else if(this.roleStorage === 'admin'){
        volumeName = 'public';
        userFolder = 'common';
        type = 'public';
      }

      // 请求
      this.$axios       
       .get(Lib.API(volumeName, userFolder).storage.viewerGetFileList+`?path=${'/'+this.optionFileArr.join('/')}&type=${type}`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            if(data.result.length > 0){
              // 1 过滤掉 压缩文件和图片
              data.result = data.result.filter((element,index,array) => {  
                return !(element.imgUrl || /[.]tar$/i.test(element.fileName) || /[.]tar[.]gz$/i.test(element.fileName) || /[.]zip$/i.test(element.fileName));
              })
            }else{
              return false;
            }
            if(this.firstIndex === null){
              data.result.forEach((ele,index) => {
                if(ele.directory){
                  this.options.push({
                    label:ele.fileName,
                    value:ele.fileName,
                    children: []});
                }else{
                  this.options.push({
                    label:ele.fileName,
                    value:ele.fileName,
                    });
                }                
              })
              
            }else{
              
              eval(optionIndexStr).children = [];
              data.result.forEach((ele,index) => {                  
                if(ele.directory){
                  eval(optionIndexStr).children.push({
                  label:ele.fileName,
                  value:ele.fileName,
                  children: []});
                }else{
                  eval(optionIndexStr).children.push({
                  label:ele.fileName,
                  value:ele.fileName,
                  });
                }                
              })
              console.log(temArr);
              // 重新赋值
              this.options = temArr;
            }
          }
        })    
    },

    handleItemChange(val) {
      this.optionFileArr = val;    // 点击的文件夹 数组
      this.getLogPath();
    },

    

    // 提交
    submitForm(formName) {      
      if(!this.form.logPath.length && this.form.type === 'caffe'){
        this.entryFileErrorMessage = this.$t("m.rules.pleaseEnter") + this.$t("m.logPath").toLowerCase();
        return false;
      }
          
      this.$refs[formName].validate((valid) => {
        if (valid) {
          
          this.loading = true;  // 显示加载
          let url = '',path = '';    
          if(this.form.type === 'tensorflow'){
            url = Lib.API().job.visualSubmitForTensorflow;
            path = this.form.entryFile;
          }else if(this.form.type === 'caffe'){
            url = Lib.API().job.visualSubmitForCaffe;
            path = '/' + this.form.logPath.join('/');
          }

          this.$axios.post(
            url,
            {
              jobName: this.form.jobName,
              owner: this.username,
              path: path,
              volumeName: this.volumeName,
              cpuAmount: this.form.cpu,
              memAmount: this.form.memory,
              imageName: this.form.imageTag.split('@')[0],
              imageTag: this.form.imageTag.split('@')[1],
            }
          ).then(res => {
            const data = res.data;
            if (data.success) {
              this.$router.push({path:'/modeltraining/visual/list'});
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
    
  }
};
</script>

<style lang="less" scoped>

</style>