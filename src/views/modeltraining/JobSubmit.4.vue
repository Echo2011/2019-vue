<template>
    <main>
      <section class="form-wrap" v-loading="loading"  :element-loading-text="$t('m.loading')">
        <el-form ref="form" :model="form" :rules="rules" label-width="200px"  size="small">

          

              <!-- 提交任务 -->
              <div v-if="!isDeployment">
                <el-form-item :label="$t('m.job.jobName')" prop="jobName">
                  <el-input v-model.trim="form.jobName" id="submitjob_jobName" :autofocus="true"></el-input>
                </el-form-item>
                <el-form-item :label="$t('m.job.entryFile')" prop="entryFile">
                  <entryFile id="submitjob_entryFile" v-on:event-entry="form.entryFile=$event"></entryFile>

                </el-form-item>

                <el-form-item :label="$t('m.job.executor')">
                  <el-select v-model="form.executor" @change="libHandle" id="submitjob_select_executor"> 
                    <el-option label="python3" value="python3" id="submitjob_option_python3"></el-option>
                    <el-option label="python" value="python" id="submitjob_option_python"></el-option>
                    <el-option label="shell" value="shell" id="submitjob_option_shell"></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item :label="$t('m.job.MLlib')">
                  <el-radio-group v-model="form.lib" @change="labelChange">
                    <el-radio v-for="item in libList" :label="item" :key="item">{{item}}</el-radio>
                  </el-radio-group>
                </el-form-item>  
                <transition name="operationTransition" >
                <el-form-item  :label="$t('m.job.tfOperatingMode')" v-if="form.lib === 'tensorflow'">
                  <el-radio-group v-model="form.type" id="submit_job_type" @change="tfOperatingModeHandle">
                    <el-radio label="stand-alone" >{{$t('m.job.standalone')}}</el-radio> 
                    <el-radio label="distributed"  v-if="standaloneOrCluster!=='standalone'">{{$t('m.job.distributed')}}</el-radio>
                  </el-radio-group>
                </el-form-item> 
                </transition>  
                <transition name="operationTransition" >
                  <el-form-item  :label="$t('m.logPath')" v-if="form.executor === 'shell'"  prop="logPath">
                    <el-input v-model="form.logPath" id="submitjob_logPath">
                      <template slot="prepend">{{logPathFolder}}</template>
                    </el-input>
                  </el-form-item>
                  <!-- working directory  -->
                  <el-form-item :label="$t('m.job.workSpace')" v-if="form.lib === 'tensorflow'">
                    
                    <el-input v-model="form.wordingDirectory" id="submitjob_working_directory"  @focus="dialogStrorageTreeVisible = true" ></el-input>
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
                </transition>  
                <el-form-item  :label="$t('m.hyperparametric')" style="margin-bottom: 0px;">
                  <div style="margin-bottom:15px;" v-for="(item,index) in superParamArr" :key="index">
                    <el-input v-model="item.key" style=" width:10%;min-width:100px;"  placeholder="key">
                    </el-input> :
                    <el-input v-model="item.value"  style=" width:20%;min-width:200px" placeholder="value">
                    </el-input> 
                    <i class="el-icon-plus" @click="superParamPlus" v-show="index==0"></i>
                    <i class="el-icon-minus" @click="superParamMinus(index)" v-show="index!==0"></i><br/>
                  </div>                
                </el-form-item>                                                       
              </div>

              <!-- 交互式开发 -->
              <div v-if="isDeployment&&!isModel">  
                <el-form-item  :label="$t('m.job.executor')">
                  <el-radio-group v-model="form.executor" id="submit_isDeployment_executor" @change="interactiveExecutorChange">
                    <el-radio label="jupyter" >
                      <svg class="icon" aria-hidden="true" style="width:30px;height:30px;">
                        <use xlink:href="#icon-file_type_jupyter"></use>
                      </svg>
                      Jupyter
                    </el-radio> 
                    <el-radio label="desktop" >
                      <svg class="icon" aria-hidden="true" style="width:25px;height:25px;">
                        <use xlink:href="#icon-desktop"></use>
                      </svg>
                      Desktop
                    </el-radio>
                    <el-radio label="jupyterlab" >
                      <svg class="icon" aria-hidden="true" style="width:30px;height:30px;">
                        <use xlink:href="#icon-file_type_jupyter"></use>
                      </svg>
                      Jupyter<span style="color:#f37726">Lab</span>
                    </el-radio>
                    <el-radio label="terminal" >
                      <svg class="icon" aria-hidden="true" style="width:25px;height:25px;">
                        <use xlink:href="#icon-terminal"></use>
                      </svg>
                      Terminal
                    </el-radio>
                  </el-radio-group>
                </el-form-item> 
                              
                <el-form-item :label="$t('m.job.workSpace')" prop="deploymentEntryFile" :error="validateDeploymentEntryFileError" >
                  
                  <el-input v-model="form.deploymentEntryFile" id="submitjob_isDeployment_jobName"  @focus="dialogStrorageTreeVisible = true" ></el-input>
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
                <el-form-item :label="$t('m.authority.password')" prop="password" :error="validateDeploymentPasswordError" >
                  <input type="text" style="width: 0px;height: 0px;position: absolute;z-index:-1;border: none;">
                  <el-input v-model.trim="form.password" id="submitjob_password" auto-complete="new-password"  show-password style="width:340px;"></el-input>
                </el-form-item>
                <transition  name="operationTransition">
                  <el-form-item :label="$t('m.resolution')" v-show="form.executor=='desktop'">
                    <el-select v-model="form.resolution"  id="submitjob_select_resolution" > 
                      <el-option v-for="item in resolutionList" :label="item" :value="item" :key="item"></el-option>
                    </el-select>                  
                  </el-form-item>
                </transition>
                  
              </div>

              <!-- 模型部署 -->
              <div v-if="isDeployment&&isModel">  
                <el-form-item :label="$t('m.modelName')" prop="modelName">
                  <el-input v-model.trim="form.modelName" id="submit_model_name" :autofocus="true"></el-input>
                </el-form-item>
                <el-form-item  :label="$t('m.modelType')">
                  <el-radio-group v-model="form.executor" id="submit_model_executor">
                    <el-radio label="tensorflowserving" >TENSORFLOW_SERVING
                    </el-radio>
                  </el-radio-group>
                </el-form-item> 
                              
                <el-form-item :label="$t('m.modelPath')" prop="deploymentEntryFile" :error="validateDeploymentEntryFileError" >
                  
                  <el-input v-model="form.deploymentEntryFile" id="submit_model_path"  @focus="dialogStrorageTreeVisible = true" ></el-input>
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
              </div>

          <!-- 第二步 资源配额　-->
          <hr>
              <quota-job-submit ref="quotas" :isdistributed="false" :istemplate="false"></quota-job-submit>         

          <!-- 第四步 选择镜像 -->
          <hr>
              <el-form-item :label="$t('m.job.chooseImage')" prop="imageTag" class="image-tag" >
                <imageLabel :label="label" @imageTagValue="form.imageTag= $event"></imageLabel>   
              </el-form-item>            
            
          
          <!-- 提交 -->
          <div>
            <el-form-item>
              <el-button   id="submitjob_btn_submitForm"  type="primary" @click="submitForm('form')" size="medium">{{$t('m.submit')}}</el-button>
              <el-button  id="submitjob_btn_cancel"  @click="$router.go(-1)"  size="medium">{{$t('m.cancel')}}</el-button>
              
            </el-form-item>
          </div>

        </el-form>
      </section>



    </main>
</template>

<script>
import storageTreeItem from '../../components/StorageTreeItem.vue';
import quotaJobSubmit from '../../components/QuotaJobSubmit.vue';
import entryFile from '../../components/EntryFile.vue';
import workSpace from '../../components/WorkSpace.vue';
import imageLabel from '../../components/ImageLabel.vue';
import Lib from "../../assets/js/Lib";

export default {
  components: {
    storageTreeItem,
    imageLabel,
    entryFile,
    workSpace,
    quotaJobSubmit,
  },
  data() {
    var validateJobName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.job.jobName").toLowerCase()
          )
        );
      } else if (!/^[a-z0-9]([a-z0-9]{0,18}[a-z0-9])?$/.test(value)) {
        callback(new Error(this.$t("m.job.jobName") + this.$t("m.rules.regularCommonJobName")));
      } else {
        callback();
      }
    };
    var validateModelName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.modelName").toLowerCase()
          )
        );
      } else if (!/^[a-z0-9]([a-z0-9]{0,38}[a-z0-9])?$/.test(value)) {
        callback(new Error(this.$t("m.modelName") + this.$t("m.rules.regularCommonJobName2")));
      } 
       else {
        callback();
      }
    };
    var validateEntryFile = (rule, value, callback) => {
      if (!value.length) {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.job.entryFile").toLowerCase()
          )
        );
      }else {
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
    var validatePass = (rule, value, callback) => {
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
    var validateLogPath = (rule, value, callback) => {
      if (value === "") {
        this.form.logPath = 'log';
      } else if (value.search(/[<>/*?,\s]/) >= 0 || value.length > 20) { // 不可以　<>/*?,\s 可以是汉字
        callback(new Error(this.$t('m.logPath') + this.$t('m.rules.regularMore')));
      } else {
        callback();
      }
    };
    return {  
      loading: false,
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
      checked: [],
      username: '',  
      libList: [],　// 机器学习裤
      form:{
        zoneName:'',
        jobName:'',
        modelName: '',
        imageName:'',
        imageTag:'',
        

        entryFile:[],

        lib:'tf',
        type: 'stand-alone', // 
        executor:'jupyter',  // 执行器    
        logPath: '', // 
        addOn:'',
        deploymentEntryFile: '',
        
        password:'', // 
        gpuType:'', // gpu数据类型
        resolution: '1250x940', // 
        wordingDirectory: '', // 创建任务时选择的空间
      },
      rules: {
        jobName: [
          { required: true, validator: validateJobName,  trigger: 'blur' },
        ],
        modelName: [
          { required: true, validator: validateModelName,  trigger: 'blur' },
        ],
        entryFile: [
          { required: true, validator: validateEntryFile, trigger: 'change' }
        ],   
        deploymentEntryFile: [
          { required: true, validator: validateDeploymentEntryFile, trigger: 'change' }
        ] ,    
        
        imageTag: [
          { required: true, validator: validateImage, trigger: 'change' }
        ], 
        work:[],
        password: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ],  
        logPath:[
          { required: true, validator: validateLogPath,  trigger: 'blur' },
        ],
      },  
      volumeName:'',
      isDeployment: false, // 是否是交互式开发， 如果不是， 那就是 提交任务 
      dialogStrorageTreeVisible: false,
      choosePath: '', // 选中的工作空间
      validateDeploymentEntryFileError:'',
      validateDeploymentPasswordError:'',
      changeEveryTime: true , // 每次改变， 因为 validateDeploymentEntryFileError 这个值每次改变才会每次显示， 否则，在关闭/取消 validateDeploymentEntryFile 如果为空， 只报一次错，第 n+1 次就不报了
      loadingZones: false, // 分区列表加载镜像
      
      errorMsg: '' , // 资源不足的提示
      resolutionList: [
        '800x600',
        '2560x1600',
        '1920x1440',
        '1856x1392',
        '1792x1344',
        '1920x1200',
        '1600x1200',
        '1680x1050',
        '1400x1050',
        '1280x1024',
        '1440x900',
        '1280x960',
        '1360x768',
        '1280x800',
        '1152x864',
        '1280x768',
        '1024x768',
        '640x480',
        '1250x940',
      ], // 分辨率
      isModel: false, // 
      // logPathFolder: '/', // 
      superParamArr:[
        {key:'',value:''},
      ], // 创建任务时，超参数调整
      standaloneOrCluster: '',
      label: {},
      
    };
  },

  

  created() {
    this.standaloneOrCluster = localStorage.getItem('standaloneOrCluster');
    this.changeLang();
    Lib.bus.$on("choose-path", arg => {
        this.choosePath = '/' + arg;
    });
    

  },

  mounted(){   
    this.mountedHandle();
    if(document.getElementById('submitjob_isDeployment_jobName')){
      document.getElementById('submitjob_isDeployment_jobName').value = '';
    }
    if(document.getElementById('submitjob_password')){
      document.getElementById('submitjob_password').value = '';
    }  
    
  },

  methods: {
    

    // 
    changeLang() {
      this.$i18n.locale = localStorage.getItem("locale"); 
      this.username = Lib.Common.getCookies("username")?Lib.Common.getCookies("username"):null; // 获取用户名
      // 随机生成 job名      
      this.form.jobName = 'job'+parseInt(Math.random()*100000);
      this.form.modelName = 'tensorflowserving'+parseInt(Math.random()*100000);
      this.volumeName = localStorage.getItem('volumeName')?localStorage.getItem('volumeName'):'nfs';
      if(this.$route.query.deploymentorsubmit) {
        this.isDeployment = true;  // 交互式开发 或者 模型部署
      }else{　
        // 提交任务
        this.isDeployment = false; 
        this.label = {frames:['tensorflow:python3']};
      }
      if(this.$route.query.deploymentorsubmit === 'deployment'){ // 交互式开发
        this.label = {jupyter:["jupyter"]}; // 默认值
      }
      if(this.$route.query.deploymentorsubmit === 'model'){ // 模型部署
        this.isModel = true; 
        this.label = {deploy:["tensor-serving"]};
      }
    },

    // 切换 单机版/分布式 触发
    tfOperatingModeHandle(){
      this.computedErrorMsg();
      console.log(this.errorMsg);
      if(!this.errorMsg){ // 如果没有值， 说明通过初始验证， 再进行最大值验证
        this.numberBlurChangeHandle();
      }      
    },

    
        // 添加　超参数
    superParamPlus(){
      this.superParamArr.push({key:'',value:''})
    },

    // 减少　超参数
    superParamMinus(index){
      this.superParamArr.splice(index,1)
    },

    

    mountedHandle(){
      if(this.isDeployment && this.isModel){
        this.form.executor = 'tensorflowserving';
      }else if(this.isDeployment){
        this.form.executor = 'jupyter';
      }else{
        this.form.executor = 'python3';
        this.libList = ['tensorflow','pytorch'];
        this.form.lib = 'tensorflow'; 
      }
    },   

    // 关闭 choseDialogStorageTree
    choseDialogStorageTree(){
      this.dialogStrorageTreeVisible = false;
      this.choosePath='';
      if(!this.form.deploymentEntryFile){
        this.changeEveryTime = !this.changeEveryTime;
        this.validateDeploymentEntryFileError = this.$t("m.rules.pleaseChoose") + this.$t("m.job.workSpace").toLowerCase() + (this.changeEveryTime?'。 ':'。');
      }
      if(!this.form.wordingDirectory){
        this.changeEveryTime = !this.changeEveryTime;
      }
    },

    // 在线编辑， 选择好空间
    deploymentSubmitHandle: function() {
      this.dialogStrorageTreeVisible = false;
      this.form.deploymentEntryFile = this.choosePath;
      this.form.wordingDirectory = this.choosePath;
    },

    // label 改变的条件
    labelChange(){
      if(this.form.executor == 'python' || this.form.executor == 'python3'){

        if(this.form.lib === 'tensorflow'){
          if((this.form.type === 'stand-alone'&&this.form.gpu)||(this.form.type === 'distributed'&&this.form.workerQuotas.gpu)){ // 单机版有gpu || 分布式有gpu
              this.label = {
                frames:['tensorflow-gpu:'+this.form.executor]
              }
          }else if((this.form.type === 'stand-alone'&&!this.form.gpu)||(this.form.type === 'distributed'&&!this.form.workerQuotas.gpu)){ // 单机版无gpu || 分布式无gpu 
              this.label = {
                frames:['tensorflow:'+this.form.executor]
              }
          }
        }else if(this.form.lib === 'pytorch'){ // 这个事件不会触发到这个值
        
          this.label = {
            frames:['pytorch:'+this.form.executor]
          }
        }


        // 判断是单机版还是分布式，然后再分别判断
      }else if(this.form.executor == 'shell'){
        this.label = {
            frames:['caffe']
          }
      };
    },

    // 根据代码执行器　－>　机器学习库  -> image 列表传参label
    libHandle(){
      if(this.form.executor == 'python' || this.form.executor == 'python3'){
        this.libList = ['tensorflow','pytorch'];
        this.form.lib = 'tensorflow'; 
        this.form.logPath = '';     

        // 判断是单机版还是分布式，然后再分别判断
      }else if(this.form.executor == 'shell'){
        this.libList = ['caffe'];
        this.form.lib = 'caffe';
        this.form.logPath = 'log';
      };

      this.labelChange();
    },

    // 交互式开发时，改变 executor 时
    interactiveExecutorChange(value){
      if(value === 'jupyter'){
        this.label = {jupyter:['jupyter']};
      }else if(value === 'jupyterlab'){
        this.label = {jupyter:['jupyterlab']};
      }else if(value === 'desktop'){
        this.label = {vnc:true};
      }else if(value === 'terminal'){
        this.label = {ssh:true};
      }      
    },

    // 提交
    submitForm(formName) {    
      
      this.$refs[formName].validate((valid) => {
        if (valid) {
          
          // 去取子组件里的值

          if(this.$refs['quotas'].$data.errorMsg){
            return false; // 资源不足
          }else{
            this.form = {...this.form,...this.$refs['quotas'].$data.form}
          }

          var url, jobInfo = {}, para = {}; // para 要传的　超参数调整

          // 循环获取　superParamArr　超参数调整, 过滤掉　key 或　value 为空的
          this.superParamArr.forEach(ele => {
            if(ele.key && ele.value){
              para[ele.key] = ele.value;
            }            
          })
          
          if(this.isDeployment){　// 交互式开发  or 模型部署
            url = Lib.API().job.createDeployments;
          }else{ // 任务
            url = Lib.API().job.submitJob;
          }

          if(!this.isDeployment && (this.form.type=="distributed") && (this.form.lib == "tensorflow")){
            // 提交任务，且　分布式
            var jobInfos = [];
            // 公共部分
            var otherObj = {
              owner:this.username,
              zoneName: this.form.zoneName,
              imageName: this.form.imageTag.split('@')[0],
              imageTag: this.form.imageTag.split('@')[1],
              workItemInfo:{
                entryFile: '/' + this.form.entryFile.join('/'),
                executor:this.form.executor,
                lib:this.form.lib,
                workDirectory: this.form.lib === 'tensorflow' ?  this.form.wordingDirectory : '',
              },
              volumeName: this.volumeName,
              // labels:{
              hyperParameters:para
              // },

            }
            // worker
            jobInfos.push({ 
              ...otherObj,              
              jobName: this.form.jobName+'-worker-'+this.form.workerQuotas.count,                
              quotas:{
                CPU:{
                  resourceType:'CPU',
                  amount:this.form.workerQuotas.cpu,
                },
                GPU:{
                  resourceType:'GPU',
                  amount:this.form.workerQuotas.gpu,
                },
                MEM:{
                  resourceType:'MEM',
                  amount:this.form.workerQuotas.amount,
                  unit:this.form.workerQuotas.unit,                
                },
              },                
            })
            // 　parameterServer
            jobInfos.push({ 
              ...otherObj,              
              jobName: this.form.jobName+'-ps-' + this.form.parameterServerQuotas.count,                
              quotas:{
                CPU:{
                  resourceType:'CPU',
                  amount:this.form.parameterServerQuotas.cpu,
                },
                GPU:{
                  resourceType:'GPU',
                  amount:this.form.parameterServerQuotas.gpu,
                },
                MEM:{
                  resourceType:'MEM',
                  amount:this.form.parameterServerQuotas.amount,
                  unit:this.form.parameterServerQuotas.unit,                
                },
              },                
            })
            
            // 最后赋值给要传的变量
            jobInfo = {
              jobs : jobInfos,
              total: this.form.workerQuotas.count + this.form.parameterServerQuotas.count
            }
          }else{
            // 提交任务，单机，　或者在线编辑,  模型部署
            var paramJobName;
            let appType = '';
            if(!this.isDeployment){ // 任务
              paramJobName = this.form.jobName;
              appType = 'job';

            }else{
              if(this.isModel){ // 模型
                paramJobName = this.form.modelName;
                appType = 'model';
              }else{
                paramJobName = this.form.executor;　// 交互式开发
                appType = 'interactive';
              }
            }
            
            jobInfos = [{
              owner:this.username,
              zoneName: this.form.zoneName,
              jobName: paramJobName,
              imageName: this.form.imageTag.split('@')[0],
              imageTag: this.form.imageTag.split('@')[1],
              labels:{
                password: this.form.password,
                resolution: this.form.resolution,
                gputype:  this.form.gpuType, // gpu类型
                logPath: this.logPathFolder + this.form.logPath,  // caffee 时用到
                appType,
              },
              hyperParameters: para,
              quotas:{
                CPU:{
                  resourceType:'CPU',
                  amount:this.form.cpu,
                },
                GPU:{
                  resourceType:'GPU',
                  amount:this.form.gpu,
                },
                MEM:{
                  resourceType:'MEM',
                  amount:this.form.amount,
                  unit:this.form.unit,                
                },
              },
              workItemInfo:{
                entryFile: this.isDeployment ? this.form.deploymentEntryFile : '/' + this.form.entryFile.join('/'),
                workDirectory: (!this.isDeployment && this.form.lib === 'tensorflow') ?  this.form.wordingDirectory : '',
                executor:this.form.executor,
                lib:this.form.lib,
              },
              volumeName: this.volumeName
            }];
            jobInfo = {
              jobs : jobInfos,
              total: 1
            }
          }

          this.loading = true;  // 显示加载
           
          this.$axios.post(url,jobInfo).then(res => {
            const data = res.data;
            this.loading = false;　// 取消　加载 
            if (data.success) {
              
              if(this.isDeployment){ // 交互式开发
                if(this.$route.query.deploymentorsubmit === 'deployment'){　// 
                  this.$router.push({path:'/modeltraining/interactive/list'}); // 跳转到交互式开发列表页
                }else if(this.isModel) { // 模型部署
                  this.$router.push({path:'/modeldeployment/model/list'}); // 跳转到交互式开发列表页
                }
              }else{ // 提交任务
                this.$router.push({path:'/modeltraining/job/list'}); // 跳转到任务列表页
              }
              
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

  section.form-wrap {
    padding: 30px;
    div.step {
      margin-top: 10px;
      display: flex;
      div.left {
        flex-basis: 30px;
        position: relative;
        p {
          background-color: #fff;
          margin: 0;
          padding-bottom: 10px;
          position: relative;
          z-index: 2;
          span.num {
            display: inline-block;
            color: #ffffff;
            width: 30px;
            text-align: center;
            height: 30px;
            line-height: 30px;
            border-radius: 50%;
            background-color: #1a99a5;
            font-weight: bold;
            position: relative;
            z-index: 2;
            margin: 0;
          }          
        }
        >span.line {
          display: inline-block;
          height: 100%;
          width: 1px;
          margin-left: 15px;
          background-color: #dddddd;
          position: absolute;
          top: 0;
        }
      }
      div.right {
        flex-grow: 1;
        margin-left: 15px;
        p.title {
          margin-top: 5px;
          font-weight: bold; 
        }
        
      }      
    }
    div.step.four {
      table {
        > thead {
          th {
            text-align: left;
          }
        }
        td {
          text-align: left;
        }
        > tbody {
          > tr:first-child{
            > td:first-child {
              cursor: pointer;
            }
          }
          tr:nth-child(2) td{
            padding: 0px 0 0px 10px;
          }
          
        }
        table {
          td,th {
            border: 1px solid #eeeeee;
            padding: 3px 0 3px 10px !important;
            text-align: left;
            padding-left: 10px;
          }
          th {
            border-top:none;
          }
          th:first-child {
            padding-left: 30px !important;
          }
          tr:last-child td {
            border-bottom: none;
          }
        }
      }
    }
  } 
  .image-tag {
    > div.el-form-item__content {
      margin-left: 0 !important;
    }
    .el-tabs__header {
      margin-bottom: 0;
    }
  }
  div.el-dialog__body {
    padding: 5px 20px;
  }
  .user-resource {
    line-height: 3em;
    margin-bottom: 20px;
    ul {
      display:inline-block;
      li {
        display: inline-block;
        padding-right:5px;
        span {
          font-weight: bold;
        }
      }
      li:nth-child(even){
        color:#ccc;
      }
    }
  }
  .parameter-server-wrap {
    display:flex; 
    flex-wrap: wrap;
    // justify-content: space-around;
    margin-left: 78px;
    .parameter-server-item {
      // flex-basis:30%;
      // min-width:250px; 
      max-width: 45%;
      border:1px solid #eee;
      border-radius:5px;
      padding-top: 20px;
      padding-right: 20px;
      margin-right: 20px;
    }
  }
  .ttt > label.el-form-item__label {
    padding-right: 3px;
  }
  .el-dropdown-link:hover {
    cursor: pointer;
    color: #1a99a5;
  }

  .is-more {
    margin-top:20px;
    color: #666;
    display: block;
    width: 100%;
    font-size: 14px;
    text-align: right;
    &:hover{
      color: #1a99a5;
    }
  }

  hr {
    border-top:1px solid #eee;
    margin:15px 0;
    border-bottom: none;
  }

</style>