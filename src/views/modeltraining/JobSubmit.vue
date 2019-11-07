<template>
  <main>
    <section class="form-wrap" v-loading="loading" :element-loading-text="$t('m.loading')">
      <el-form ref="form" :model="form" :rules="rules" label-width="200px" size="small">
        
        <!-- ==================== 任务 / 模板 -- 公共部分  ==================== -->      
        <el-form-item :label="$t('m.name')" prop="jobName" v-if="!(appType=='model'&&istemplate)">
          <span  v-if="$route.path.includes('template')&&templateName">{{templateName}}</span>
          <el-input v-model.trim="form.jobName" id="submitjob_jobName" :autofocus="true" v-else></el-input>
        </el-form-item>
        <el-form-item :label="$t('m.desc')" v-if="$route.path.includes('template')&&istemplate"> 
          <el-input type="textarea" v-model="form.desc"></el-input>
        </el-form-item>
        

        <!-- ====================  提交任务  ==================== -->
        <div v-if="appType==='job'">
          <el-form-item :label="$t('m.job.entryFile')" :prop="$route.path.includes('template')&&istemplate?'':'entryFile'">
            <span v-if="templateName&&form.entryFile.length&&isFirst">
              {{'/' + form.entryFile.join('/')}} &nbsp; &nbsp; 
              <el-button type="text" @click="form.entryFile=[]">{{$t('m.edit')}}</el-button>
            </span>
            <entryFile id="submitjob_entryFile" v-on:event-entry="form.entryFile=$event;isFirst=false" v-else></entryFile>
          </el-form-item>

          <el-form-item :label="$t('m.job.executor')">
            <el-radio-group
              v-model="form.executor"
              id="submitjob_select_executor"
              @change="executorChange"
            >
              <el-radio label="python3">python3</el-radio>
              <el-radio label="python">python</el-radio>
              <el-radio label="shell">shell</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="$t('m.job.MLlib')">
            <el-radio-group v-model="form.lib" @change="labelChange">
              <el-radio v-for="item in libList" :label="item" :key="item">{{item}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <transition name="operationTransition">
            <el-form-item :label="$t('m.job.tfOperatingMode')" v-if="form.lib === 'tensorflow'">
              <el-radio-group
                v-model="form.type"
                id="submit_job_type"
              >
                <el-radio label="stand-alone">{{$t('m.job.standalone')}}</el-radio>
                <el-radio
                  label="distributed"
                  v-if="standaloneOrCluster!=='standalone'"
                >{{$t('m.job.distributed')}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </transition>
          <transition name="operationTransition">
            <el-form-item :label="$t('m.logPath')" v-if="form.executor === 'shell'">
              <el-input v-model="form.logPath" id="submitjob_logPath">
                <template slot="prepend">{{logPathFolder}}</template>
              </el-input>
            </el-form-item>
            <!-- working directory  -->
            <el-form-item :label="$t('m.job.workSpace')" v-if="form.lib === 'tensorflow'" :prop="$route.path.includes('template')&&istemplate?'':'workDirectoryJob'" >
              
              <el-input 
                v-model="form.workDirectoryJob"
                id="submitjob_working_directory"
                @focus="dialogStrorageTreeVisible = true"
              ></el-input>
              <!-- storage tree -->
              <el-dialog
                :title="$t('m.job.workSpace')"
                :visible.sync="dialogStrorageTreeVisible"
                @close="choseDialogStorageTree"
              >
                <p style="margin:0;padding:0">
                  {{$t('m.store.selectedPath')}}：
                  <strong>{{choosePath}}</strong>
                </p>
                <ul class="demo" style="min-height:300px;border:1px solid #eee;padding:10px 0;">
                  <storageTreeItem class="item" :model="treeData"></storageTreeItem>
                </ul>
                <div slot="footer" class="dialog-footer">
                  <el-button @click="choseDialogStorageTree">{{$t('m.cancel')}}</el-button>
                  <el-button
                    type="primary"
                    :disabled="!choosePath"
                    @click="deploymentSubmitHandle"
                  >{{$t('m.confirm')}}</el-button>
                </div>
              </el-dialog>
            </el-form-item>
          </transition>
          <el-form-item :label="$t('m.hyperparametric')" style="margin-bottom: 0px;">
            <div style="margin-bottom:15px;" v-for="(item,index) in superParamArr" :key="index">
              <el-input v-model="item.key" style=" width:10%;min-width:100px;" placeholder="key"></el-input>:
              <el-input v-model="item.value" style=" width:20%;min-width:200px" placeholder="value"></el-input>
              <i class="el-icon-plus" @click="superParamPlus" v-show="index==0"></i>
              <i class="el-icon-minus" @click="superParamMinus(index)" v-show="index!==0"></i>
              <br />
            </div>
          </el-form-item>
        </div>

        <!-- ====================  交互式开发  ==================== -->
        <div v-if="appType==='interactive'">
          <el-form-item :label="$t('m.job.executor')">
            <el-radio-group
              v-model="form.executor"
              id="submit_isDeployment_executor"
              @change="executorChange"
            >
              <el-radio label="jupyter">
                <svg class="icon" aria-hidden="true" style="width:30px;height:30px;">
                  <use xlink:href="#icon-file_type_jupyter" />
                </svg>
                Jupyter
              </el-radio>
              <el-radio label="desktop">
                <svg class="icon" aria-hidden="true" style="width:25px;height:25px;">
                  <use xlink:href="#icon-desktop" />
                </svg>
                Desktop
              </el-radio>
              <el-radio label="jupyterlab">
                <svg class="icon" aria-hidden="true" style="width:30px;height:30px;">
                  <use xlink:href="#icon-file_type_jupyter" />
                </svg>
                Jupyter
                <span style="color:#f37726">Lab</span>
              </el-radio>
              <el-radio label="terminal">
                <svg class="icon" aria-hidden="true" style="width:25px;height:25px;">
                  <use xlink:href="#icon-terminal" />
                </svg>
                Terminal
              </el-radio>
            </el-radio-group>
          </el-form-item>          
          <el-form-item
            :label="$t('m.authority.password')"
            :prop="$route.path.includes('template')&&istemplate?'':'password'"
          >
            <input
              type="text"
              style="width: 0px;height: 0px;position: absolute;z-index:-1;border: none;"
            />
            <el-input
              v-model.trim="form.password"
              id="submitjob_password"
              auto-complete="new-password"
              show-password
              style="width:340px;"
            ></el-input>
          </el-form-item>
          <transition name="operationTransition">
            <el-form-item :label="$t('m.resolution')" v-show="form.executor=='desktop'">
              <el-select v-model="form.resolution" id="submitjob_select_resolution">
                <el-option v-for="item in resolutionList" :label="item" :value="item" :key="item"></el-option>
              </el-select>
            </el-form-item>
          </transition>
        </div>

        <!-- ====================  模型部署  ==================== -->
        <div v-if="appType==='model'">
          <el-form-item :label="$t('m.type')">
            <el-radio-group v-model="form.executor" id="submit_model_executor">
              <el-radio label="tensorflowserving">TENSORFLOW_SERVING</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- ====================  可视化  ==================== -->
        <div v-if="appType==='visual'">
          <el-form-item  :label="$t('m.job.MLlib')">
            <el-radio-group v-model="form.executor" id="submit_visual_type" @change="executorChange">
              <el-radio label="tensorflow" id="submit_visual_type_tensorflow">tensorflow</el-radio> 
              <el-radio label="caffe" id="submit_visual_type_caffe">caffe</el-radio>              
            </el-radio-group>
          </el-form-item>          
          <el-form-item  :label="$t('m.visualizationTool')">
            {{form.lib}}
          </el-form-item>
          <!-- caffe 选中的路径/文件 -->
          <el-form-item :label="$t('m.logPath')" :prop="$route.path.includes('template')&&istemplate?'':'entryFile'" v-if="form.lib==='caffe'">
            <entryFile id="submitjob_visual_logpath" v-on:event-entry="form.entryFile=$event"></entryFile>
          </el-form-item>
        </div>

        <!-- 公共部分 -- 工作空间  -- 交互式开发 和 可视化-tf -->
        <el-form-item v-if="!(appType==='job'||(appType=='visual'&&form.executor=='caffe'))"
            :label="$t('m.job.workSpace')"
            :prop="$route.path.includes('template')&&istemplate?'':'workSpace'"
          >
            <el-input
              v-model="form.workSpace"
              id="submitjob_isDeployment_jobName"
              @focus="dialogStrorageTreeVisible = true"
            ></el-input>
            <!-- storage tree -->
            <el-dialog
              :title="$t('m.job.workSpace')"
              :visible.sync="dialogStrorageTreeVisible"
              @close="choseDialogStorageTree"
            >
              <p style="margin:0;padding:0">
                {{$t('m.store.selectedPath')}}：
                <strong>{{choosePath}}</strong>
              </p>
              <ul class="demo" style="min-height:300px;border:1px solid #eee;padding:10px 0;">
                <storageTreeItem class="item" :model="treeData"></storageTreeItem>
              </ul>
              <div slot="footer" class="dialog-footer">
                <el-button @click="choseDialogStorageTree">{{$t('m.cancel')}}</el-button>
                <el-button
                  type="primary"
                  :disabled="!choosePath"
                  @click="deploymentSubmitHandle"
                >{{$t('m.confirm')}}</el-button>
              </div>
            </el-dialog>
          </el-form-item>

        <!-- 资源配额　-->
        <hr />
        <quota-job-submit ref="quotas" :isdistributed="form.type==='distributed'" :istemplate="istemplate" :form="formQuotas" @gpu="form.gpu = $event;labelChange()" @workerQuotasgpu="form.workerQuotas.gpu = $event;labelChange()" :isneedgpu="appType!=='visual'"></quota-job-submit> 

        <!-- 选择镜像 -->
        <hr />
        <el-form-item :label="$t('m.job.chooseImage')" :prop="$route.path.includes('template')&&istemplate?'':'imageTag'" class="image-tag">
          <strong>{{this.form.imageTag.split('/')[this.form.imageTag.split('/').length-1]}}</strong> 
          <!-- <el-button icon="el-icon-close"  size="mini" circle></el-button> -->
          <i class="el-icon-circle-plus-outline dele-icon" v-show="form.imageTag&&istemplate" @click="form.imageTag='';isclear=true"></i>
          <br />
          <imageLabel :label="label" @imageTagValue="form.imageTag=$event;isclear=false" :isclear='isclear'></imageLabel>
        </el-form-item>

        <!-- 提交 -->
        <div class="submit-wrap">
          <el-form-item>
            <el-button v-if="$route.path.includes('template')&&!templateName"
              id="submitjob_btn_submitForm"
              type="primary"
              @click="submitTemplate"
              size="medium"
            >{{$t('m.job.saveTemplate')}}</el-button> &nbsp;  &nbsp; 

            <el-button v-if="$route.path.includes('template')&&templateName"
              id="submitjob_btn_submitForm"
              type="primary"
              @click="submitTemplate"
              size="medium"
            >{{$t('m.job.editTemplate')}}</el-button> &nbsp;  &nbsp; 

            <el-button v-if="!$route.path.includes('template')"
              id="submitjob_btn_submitForm"
              type="primary"
              @click="submitForm('form')"
              size="medium"
            >{{$t('m.submit')}}</el-button> &nbsp;  &nbsp; 
            
            <el-button v-if="!$route.path.includes('template')"
              id="submitjob_btn_submitForm"
              type="primary"
              @click="templateAndJob"
              size="medium"
            >{{$t('m.job.saveTemplateAndSubmitJob')}}</el-button> &nbsp;  &nbsp; 
            
            <el-button
              id="submitjob_btn_cancel"
              @click="$router.go(-1)"
              size="medium"
            >{{$t('m.cancel')}}</el-button>

            <el-card v-if="isEnterTemplateName" class="is-enter-template-name">
              {{$t('m.job.enterTemplateName')}}
              <el-input type="age" v-model.trim="form.templateName" ></el-input>
              <span style="display:block;margin-top:10px;" class="red-text" v-show="errorTemplateName">{{errorTemplateName}}</span>
              <el-button style="padding-bottom:20px;"
                id="submitjob_btn_template_submitForm"
                type="text"
                @click="checkTemplateName"
                size="medium"
              >{{$t('m.confirm')}}</el-button>
              <el-button type="text"
                id="submitjob_btn_template_cancel"
                @click="form.templateName='';isEnterTemplateName=false"
                size="medium"
              >{{$t('m.cancel')}}</el-button>
            </el-card>

          </el-form-item>
        </div>
      </el-form>
    </section>
  </main>
</template>

<script>
import storageTreeItem from "../../components/StorageTreeItem.vue";
import quotaJobSubmit from "../../components/QuotaJobSubmit.vue";
import entryFile from "../../components/EntryFile.vue";
import workSpace from "../../components/WorkSpace.vue";
import imageLabel from "../../components/ImageLabel.vue";
import Lib from "../../assets/js/Lib";

export default {
  components: {
    storageTreeItem,
    imageLabel,
    entryFile,
    workSpace,
    quotaJobSubmit
  },
  data() {
    var validateJobName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") +
              this.$t("m.name").toLowerCase()
          )
        );
      } else if (!/^[a-z0-9]([a-z0-9]{0,38}[a-z0-9])?$/.test(value)) {
        callback(
          new Error(
            this.$t("m.name") + this.$t("m.rules.regularCommonJobName2")
          )
        );
      } else {
        callback();
      }
    };
    var validateEntryFile = (rule, value, callback) => {
      if (!value.length) {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") +
              this.$t("m.job.entryFile").toLowerCase()
          )
        );
      } else {
        callback();
      }
    };
    var validateworkSpace = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") +
              this.$t("m.job.workSpace").toLowerCase()
          )
        );
      } else {
        callback();
      }
    };
    var validateworkDirectoryJob = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") +
              this.$t("m.job.workSpace").toLowerCase()
          )
        );
      } else {
        callback();
      }
    };

    var validateImage = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("m.job.pleaseChooseImage")));
      } else {
        callback();
      }
    };
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") +
              this.$t("m.authority.password").toLowerCase()
          )
        );
      } else if (!/^[A-Za-z0-9!@#$%^&*]{6,20}$/.test(value)) {
        callback(
          new Error(
            this.$t("m.authority.password") + this.$t("m.rules.regularPass")
          )
        );
      } else {
        callback();
      }
    };
    
    return {
      loading: false,
      treeData: {
        fileName: this.$t("m.store.allFiles"),
        directory: true,
        path: "", // 根目录时, path 为空, 后台要的路径,大家根据需要添加
        // 防止第一次随机获取数据为空, 默认加的 children
        children: [
          // { fileName: 'work.md', path: "/work.md", directory: true, children: [] },
          // { fileName: 'ss.md', path: "/ss.md", directory: false },
        ]
      },
      checked: [],
      username: "",
      volumeName: '',
      zoneName: '',
      libList: [], // 机器学习裤
      form: {
        templateName: '',
        desc: '',
        jobName: "",
        imageName: "",
        imageTag: "",

        entryFile: [],

        lib: "",
        type: "stand-alone", //
        executor: "jupyter", // 执行器
        logPath: "", //
        addOn: "",
        workSpace: "",

        password: "", //
        gpuType: "", // gpu数据类型
        resolution: "1250x940", //
        workDirectoryJob: "", // 创建任务时选择的空间

        gpu:0, // gpu 的值从子组件中穿过来， 影响 label 镜像的请求参数
        workerQuotas: {
          gpu: 0,
        },
      },
      rules: {
        jobName: [
          { required: true, validator: validateJobName, trigger: "blur" }
        ],
        templateName: [
          { required: true, validator: validateJobName, trigger: "blur" }
        ],
        entryFile: [
          { required: true, validator: validateEntryFile, trigger: "change" }
        ],
        workDirectoryJob: [
          {
            required: true,
            validator: validateworkDirectoryJob,
            trigger: "change"
          }
        ],
        workSpace: [
          {
            required: true,
            validator: validateworkSpace,
            trigger: "change"
          }
        ],

        imageTag: [
          { required: true, validator: validateImage, trigger: "change" }
        ],
        work: [],
        password: [
          { required: true, validator: validatePass, trigger: "blur" }
        ],
        
      },
      dialogStrorageTreeVisible: false,
      choosePath: "", // 选中的工作空间
      validateworkSpaceError: "",
      validateDeploymentPasswordError: "",
      changeEveryTime: true, // 每次改变， 因为 validateworkSpaceError 这个值每次改变才会每次显示， 否则，在关闭/取消 validateworkSpace 如果为空， 只报一次错，第 n+1 次就不报了
      loadingZones: false, // 分区列表加载镜像

      errorMsg: "", // 资源不足的提示
      resolutionList: [
        "800x600",
        "2560x1600",
        "1920x1440",
        "1856x1392",
        "1792x1344",
        "1920x1200",
        "1600x1200",
        "1680x1050",
        "1400x1050",
        "1280x1024",
        "1440x900",
        "1280x960",
        "1360x768",
        "1280x800",
        "1152x864",
        "1280x768",
        "1024x768",
        "640x480",
        "1250x940"
      ], // 分辨率
      logPathFolder: '/', // 用户选择的 入口文件 的路径
      superParamArr: [{ key: "", value: "" }], // 创建任务时，超参数调整
      standaloneOrCluster: "",
      label: {},
      appType: '', // job model interactive
      istemplate: false,
      templateName: '', // 修改/查看时的模板名
      formQuotas: {    
          cpu:1,
          gpu:0,
          amount:1,
          unit:'GB', 
          gpuType: '',
          parameterServerQuotas: {
            count: 1,
            cpu:1,
            amount:1,
            unit:'GB',
          },
          workerQuotas: {
            count:1 ,
            cpu:1,
            gpu:0,
            amount:1,
            unit:'GB',
          },
        }, // 修改模板时， 获取到的 gpuType 和 quotas的值 需要传给 子组件 QuotaJobSubmit.vue
      errorTemplateName: '', 
      isFirst: true,  // 是否是第一次获取到 模板 的值 ， 用于 entryFile 的值
      isEnterTemplateName: false,
      isclear: false, // 是否清空镜像
    };
  },

  created() {
    this.standaloneOrCluster = localStorage.getItem("standaloneOrCluster");
    
    this.username = Lib.Common.getCookies("username")
      ? Lib.Common.getCookies("username")
      : null; // 获取用户名
    this.volumeName = localStorage.getItem('volumeName')?localStorage.getItem('volumeName'):'nfs';
    this.zoneName = localStorage.getItem('zoneName'); 
    
    
    this.appType = this.$route.query.appType; // 任务类型
    this.istemplate = Boolean(this.$route.query.istemplate); // 是否是模板，模板的话不做验证， 除了资源配额
    this.templateName = this.$route.query.templateName; // 是否是模板，模板的话不做验证， 除了资源配额

    
    // 默认值
    if (this.appType === 'job') {
      this.form.jobName = "job" + parseInt(Math.random() * 100000); // 随机生成 job名
      this.label = { frames: ["tensorflow:python3"] };
      this.form.executor = "python3";
      this.libList = ["tensorflow", "pytorch"];
      this.form.lib = "tensorflow";

    }else if (this.appType === "interactive") {
      this.form.jobName = "interactive" + parseInt(Math.random() * 100000); // 随机生成 job名
      this.label = { jupyter: ["jupyter"] }; // 默认值
      this.form.executor = "jupyter";

    }else if (this.appType === "model") {
      this.form.jobName = "tensorflowserving" + parseInt(Math.random() * 100000); // 随机生成 job名
      this.label = { deploy: ["tensor-serving"] };
      "tensorflowserving" + parseInt(Math.random() * 100000);
      this.form.executor = "tensorflowserving";

    } else if(this.appType === 'visual') {
      this.form.jobName = "visual" + parseInt(Math.random() * 100000); // 随机生成 job名
      this.label = { visual: ['tensorboard'] };
      this.form.executor = "tensorflow";
      this.form.lib = "tensorboard";
    }

    
    // if(value === 'tensorflow'){
    //     this.whichtype = 'tensorboard';
    //     this.label = { visual: ['tensorboard'] };
    //   }else if(value === 'caffe'){
    //     this.whichtype = 'caffe';
    //     this.label = { visual: ['caffe'] };
    //   }

    if(this.istemplate){ // 新建模板
      if(this.$route.path.includes('template')){
        this.form.jobName = "template" + parseInt(Math.random() * 100000); // 随机生成 template 名
      }
      if(this.templateName){ // 修改/查看模板
        this.getTemplate(); // 获取模板详情
      }
    }
    
    Lib.bus.$on("choose-path", arg => {
      this.choosePath = "/" + arg;
    });
    Lib.bus.$on("log-path-folder", arg => {
      this.logPathFolder = arg;
    });
  },

  mounted() {
    // this.mountedHandle();
    // if (document.getElementById("submitjob_isDeployment_jobName")) {
    //   document.getElementById("submitjob_isDeployment_jobName").value = "";
    // }
    // if (document.getElementById("submitjob_password")) {
    //   document.getElementById("submitjob_password").value = "";
    // }
  },

  methods: {
    
    // 验证 templateName
    async checkTemplateName(){
      if (this.form.templateName === "") {
        return this.errorTemplateName = this.$t("m.rules.pleaseEnter") +
              this.$t("m.name").toLowerCase()
      } else if (!/^[a-z0-9]([a-z0-9]{0,38}[a-z0-9])?$/.test(this.form.templateName)) {
        return this.errorTemplateName = this.$t("m.name") + this.$t("m.rules.regularCommonJobName2")
      } else {
        this.errorTemplateName = '';
      }
    },

    // 保存模板并提交任务
    templateAndJob(){

      this.$refs['form'].validate(valid => {
        if (valid) {
          // this.templateName?templateAndJob(true):
          if(this.templateName){ // 在原有的模板上修改，不需要 验证是否 重名
            this.submitTemplate(false); // 保存模板
          } else {
            this.isEnterTemplateName = true;
          }
        }
      });

    },

    // 获取模板
    async getTemplate(){

      this.loading = false; // 取消　加载

      //1 获取模板详情
      let info = await this.$axios.get(Lib.API(this.templateName).job.templateInfo);
      info = info.data; 
      let data;
      
      if (info.success) {
        data = info.data;
      } else {
        Lib.Common.errorMessage(this.$t(
          "m.responseErrorMessage." + info.message || "default"
        ), info.messageParams);
      }
     
      
      // let t = {
      //   templateName: this.form.jobName,
      //   imageTag: this.form.imageTag,
      //   quotas: JSON.stringify(this.$refs['quotas'].$data.form),
      //   hyperParameters: this.superParamArr,
      //   description: this.form.desc,
      //   appType: this.appType,
      //   executor: this.form.executor,
      //   lib: this.form.executor,
      //   entryFile: this.appType==='job' ? this.form.entryFile : this.form.workSpace,
      //   workDirectory: this.form.workDirectoryJob,
      //   logPath: this.form.logPath, // 不用验证，/dd/tt 这个 tt 是 logpath 的值， 这个是用户输入的目录名， 不存在有没有现在，/dd/是入口文件目录，在 entryFile 中验证即可
      //   gputype: this.form.gputype
      // }
      // 1 获取数据
      /**
       * 2 验证 用 模板创建任务时验证， 修改/查看模板时也要验证
       *  2.1 验证 入口文件 ， 发送 “获取大小” 的请求
       * 如果文件不存在， 提示用户， 重新选择，并不输入原来的内容
       * 如果存在，复制，并更新 this.logPathFolder
       */

      // workDirectory	"/cnn_test/test/tt" ===> path = "cnn_test/test", fileName = "tt"
      // entryFile	"/" + this.form.entryFile.join("/")  ["cnn_test", "Photoshop_CS6_13.0.1.exe"] ===> path = "cnn_test", fileName = "Photoshop_CS6_13.0.1.exe"
      // path 根目录 传空

      // 2 验证 
      // 2.1 验证 entryFile
      if(data.entryFile){ // 如果有值验证， 复制
      console.log(data.entryFile);  // /mnist/mnist/core.1
        
        let path = data.entryFile.slice(1); // 去掉前面的 ‘/’ 发送请求 如果根目录，传空
        let arr = path.split('/');       
        path = arr.slice(0,-1);
        path = path.join('/');
        let fileName = arr[arr.length-1];

        // 发送 获取大小请求， ===> 是否存在该文件
        let checkEntryFile = await this.$axios.get(Lib.API(this.volumeName, this.username).storage.viewerViewDetail + `?path=${path}&type=private&fileName=${fileName}`);
        checkEntryFile = checkEntryFile.data;
        
        if(checkEntryFile.success) {
          // 成功， 赋值
          if(this.appType === 'job'){
            // 改成数组再赋值
            // this.$set(this.model, 'children', data.result)
            this.$set(this.form, 'entryFile', data.entryFile.slice(1).split('/'))
            // this.form.entryFile = path.split('/');

          }else if(this.appType === 'interactive' || this.appType === 'visual'){
            // 直接赋值
            this.form.workSpace = data.entryFile;
          }
        }else{
          // Lib.Common.errorMessage(this.$t("m.responseErrorMessage." + checkEntryFile.message || "default"),checkEntryFile.messageParams);
          // 提示用户，不存在
          this.$notify({
            title: '警告',
            message: '路径' + data.entryFile + '不存在，请重新选择',
            type: 'warning',
            duration: 0
          });
        }
      }

      /**
       * 2.2 如果 job  python tensorflow 验证 工作空间
       */
      if(data.workDirectory){ // 如果有值验证， 复制
        // let path = data.workDirectory.slice(1); // 去掉前面的 ‘/’ 发送请求
        // let arr = data.workDirectory.split('/');
        // let fileName = arr[arr.length-1];

        console.log(data.workDirectory);  // /mnist/mnist/core.1
        
        let path = data.workDirectory.slice(1); // 去掉前面的 ‘/’ 发送请求 如果根目录，传空
        let arr = path.split('/');      
        path = arr.slice(0,-1);
        path = path.join('/');
        let fileName = arr[arr.length-1];


        // 发送 获取大小的请求 ===> 是否存在该文件
        let checkWorkDirectore =  await this.$axios.get(Lib.API(this.volumeName, this.username).storage.viewerViewDetail + `?path=${path}&type=private&fileName=${fileName}`);
        checkWorkDirectore = checkWorkDirectore.data;
        
        if(checkWorkDirectore.success) {
          // 成功， 赋值          
            this.form.workDirectoryJob = data.workDirectory;
        }else{
          // Lib.Common.errorMessage(this.$t("m.responseErrorMessage." + checkWorkDirectore.message || "default"),checkWorkDirectore.messageParams);
          // 提示用户，不存在
          this.$notify({
            title: '警告',
            message: '工作空间'+ data.workDirectory + '已不存在，请重新选择',
            type: 'warning',
            duration: 0
          });
        }
      }      
      
      /**
       * 2.3 验证 镜像 是否还存在
       * 直接发 获取镜像详情请求，
       * registry.cluster.local/public/snafknxcph:oqpaxco 公共镜像
       * registry.cluster.local/user_ss/lwsmpoytgw:zabqcep 私有镜像
       * imageName	registry.cluster.local/public/snafknxcph
       * imageTag	oqpaxco
       * 如果有--选中，
       * 如果没有--提示用户 -- 镜像不存在，请重新选择
       */
      // 
      if(data.imageTag){
        let isPublic = data.imageTag.includes('/public/') ? '1' : '0';
        let repositoryName = data.imageTag.includes('/public/') ? 'public' : this.username;
        let image = data.imageTag;
        image = data.imageTag.split('/');
        image = image[image.length-1].split(':')[0];        

        let checkImage = await this.$axios.get(Lib.API(image).image.imageDetail+`?isPublic=${isPublic}&repositoryName=${repositoryName}&loginName=${this.username}`);   

        checkImage = checkImage.data;
        
        if (checkImage.success && checkImage.images.length) {
          // 赋值
          this.form.imageTag = data.imageTag;
        } else {
          // Lib.Common.errorMessage(this.$t("m.responseErrorMessage." + checkImage.message || "default"), checkImage.messageParams);
          // 提示用户，不存在
          this.$notify({
            title: '警告',
            message: '镜像'+ image + '已不存在，请重新选择',
            type: 'warning',
            duration: 0
          });
        }
      }

      // 2.4 验证 gpu 有没有
      // 获取 gpu 类型 ， 暂不做此验证
      data.quotas = JSON.parse(data.quotas);
      let gpu = await this.$axios.get(Lib.API().job.getGpuTypes);
      gpu = gpu.data;  
      if(gpu.success){ 
        
        if(data.quotas.gputype && !gpu.gputypes.includes(data.quotas.gputype)) { // 之前选的 gpu 类型，已经不存在
          data.quotas.gputype = ''; // 清空原来的值
          // 提示用户，gpu类型 已不存在
          this.$notify({
            title: '警告',
            message: 'gpu类型 ' + data.quotas.gputype +  ' gpu类型 已不存在，请重新选择',
            type: 'warning',
            duration: 0,
            offset: 50
          });
        }                   
      }else{
        // Lib.Common.errorMessage(this.$t("m.responseErrorMessage." + gpu.message || "default"), gpu.messageParams);
      }

      // quotas 赋值
      
      // console.log(this.formQuotas);
      // console.log(data.quotas);
      // console.log(JSON.parse(data.quotas));
      // let aa = JSON.parse(data.quotas)
      this.formQuotas =  data.quotas;
      console.log(this.formQuotas);
      
      // 其他赋值
      this.form.hyperParameters = JSON.stringify(data.superParamArr);
      this.form.desc = data.description;
      this.form.executor = data.executor;
      this.form.lib = data.lib;
      this.form.password = data.password;
      this.form.resolution = data.resolution;
      this.form.logPath = data.logPath;  // 不用验证，/dd/tt 这个 tt 是 logpath 的值， 这个是用户输入的目录名， 不存在有没有现在，/dd/是入口文件目录，在 entryFile 中验证即可
       
    },

    // 提交 / 修改 模板
    submitTemplate(isPop){

      this.loading = true;

      let url, method;
      if(this.templateName){ // 修改
        url= Lib.API(this.templateName).job.templateUpdate;
        method = 'put'
      }else{ // 提交
        url= Lib.API().job.templateSubmit;
        method = 'post';
      }
      let entryFile = '/' + this.form.entryFile.join('/');
      
      let data = {
        templateName: this.templateName || this.form.templateName || this.form.jobName,
        imageTag: this.form.imageTag,
        quotas: JSON.stringify(this.$refs['quotas'].$props.form), // 对象
        hyperParameters: JSON.stringify(this.superParamArr), // 数组
        description: this.form.desc,
        appType: this.appType,
        executor: this.form.executor,
        lib: this.form.lib,
        entryFile: this.appType==='job' ? entryFile : this.form.workSpace, // 数组
        workDirectory: this.form.workDirectoryJob,
        logPath: this.form.logPath,
        gputype: this.form.gputype,
        password: this.form.password,
        resolution: this.form.resolution
      }

      this.$axios({method, url, data})
        .then(res => {
          const data = res.data;
          this.loading = false; // 取消　加载
          if (data.success) {
            if(!isPop){ // 如果传的 false，则需要提交任务，因此不在此跳转
              this.submitForm('form'); // 提交任务, 保存模板并提交任务中的任务
              return false;
            }
            // 跳转到列表页
            this.$router.push({ path: "/modeltraining/template/list" }); 
          } else {
            Lib.Common.errorMessage(this.$t(
              "m.responseErrorMessage." + data.message || "default"
            ), data.messageParams);
            this.loading = false;
          }
      });
      
    },

    // 添加　超参数
    superParamPlus() {
      this.superParamArr.push({ key: "", value: "" });
    },

    // 减少　超参数
    superParamMinus(index) {
      this.superParamArr.splice(index, 1);
    },

    // 关闭 choseDialogStorageTree
    choseDialogStorageTree() {
      this.dialogStrorageTreeVisible = false;
      this.choosePath = "";
      if (!this.form.workSpace) {
        this.changeEveryTime = !this.changeEveryTime;
        this.validateworkSpaceError =
          this.$t("m.rules.pleaseChoose") +
          this.$t("m.job.workSpace").toLowerCase() +
          (this.changeEveryTime ? "。 " : "。");
      }
      if (!this.form.workDirectoryJob) {
        this.changeEveryTime = !this.changeEveryTime;
      }
    },

    // 确认空间
    deploymentSubmitHandle: function() {
      this.dialogStrorageTreeVisible = false;
      this.form.workSpace = this.choosePath;
      this.form.workDirectoryJob = this.choosePath;
    },

    // job 中 label 改变的条件
    labelChange() {
      if (this.form.executor == "python" || this.form.executor == "python3") {
        if (this.form.lib === "tensorflow") {
          if (
            (this.form.type === "stand-alone" && this.form.gpu) ||
            (this.form.type === "distributed" && this.form.workerQuotas.gpu)
          ) {
            // 单机版有gpu || 分布式有gpu
            this.label = {
              frames: ["tensorflow-gpu:" + this.form.executor]
            };
          } else if (
            (this.form.type === "stand-alone" && !this.form.gpu) ||
            (this.form.type === "distributed" && !this.form.workerQuotas.gpu)
          ) {
            // 单机版无gpu || 分布式无gpu
            this.label = {
              frames: ["tensorflow:" + this.form.executor]
            };
          }
        } else if (this.form.lib === "pytorch") {
          // 这个事件不会触发到这个值

          this.label = {
            frames: ["pytorch:" + this.form.executor]
          };
        }

        // 判断是单机版还是分布式，然后再分别判断
      } else if (this.form.executor == "shell") {
        this.label = {
          frames: ["caffe"]
        };
      }
    },

    // 代码执行器　－>　机器学习库 / label 
    executorChange(value) {
      if(this.appType === 'job'){  // 任务训练
        if (this.form.executor == "python" || this.form.executor == "python3") {
          this.libList = ["tensorflow", "pytorch"];
          this.form.lib = "tensorflow";
          this.form.logPath = "";
        } else if (this.form.executor == "shell") {
          this.libList = ["caffe"];
          this.form.lib = "caffe";
          this.form.logPath = "log";
        }
        this.labelChange();
      }else if(this.appType === 'interactive'){ // 交互式开发
        if (value === "jupyter") {
          this.label = { jupyter: ["jupyter"] };
        } else if (value === "jupyterlab") {
          this.label = { jupyter: ["jupyterlab"] };
        } else if (value === "desktop") {
          this.label = { vnc: true };
        } else if (value === "terminal") {
          this.label = { ssh: true };
        }
      }else if(this.appType === 'visual'){ // 可视化
        if(value === 'tensorflow'){
          this.form.lib = 'tensorboard';
          this.label = { visual: ['tensorboard'] };
        }else if(value === 'caffe'){
          this.form.lib = 'caffe';
          this.label = { visual: ['caffe'] };
        }
      }
      
    },

    // 提交 可视化任务
    submitVisual(){
      this.loading = true;  // 显示加载
      let url = '',path = '';    
      if(this.form.executor === 'tensorflow'){
        url = Lib.API().job.visualSubmitForTensorflow;
        path = this.form.workSpace;
      }else if(this.form.executor === 'caffe'){
        url = Lib.API().job.visualSubmitForCaffe;
        path = '/' + this.form.entryFile.join('/');
      }

      this.$axios.post(
        url,
        {
          jobName: this.form.jobName,
          owner: this.username,
          path: path,
          volumeName: this.volumeName,
          cpuAmount: this.form.cpu,
          memAmount: this.form.amount,
          imageName: this.form.imageTag.split(':')[0],
          imageTag: this.form.imageTag.split(':')[1],
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
    },

    // 提交 任务
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // 去取子组件里的值

          if (this.$refs["quotas"].$data.errorMsg) {
            return false; // 资源不足
          } else {
            this.form = { ...this.form, ...this.$refs["quotas"].$props.form };
          }

          if(this.appType === 'visual'){ // 创建可视化
            return this.submitVisual(); // 
          }

          var url,
            jobInfo = {}, // 要传的对象
            para = {}; // para 要传的　超参数调整

          // 循环获取　superParamArr　超参数调整, 过滤掉　key 或　value 为空的
          this.superParamArr.forEach(ele => {
            if (ele.key && ele.value) {
              para[ele.key] = ele.value;
            }
          });

          if (this.appType === 'interactive' || this.appType === 'model') {
            // 交互式开发  or 模型部署
            url = Lib.API().job.createDeployments;
          } else if(this.appType === 'job'){
            // 任务
            url = Lib.API().job.submitJob;
          }else if(this.appType === 'visual'){
            return this.submitVisual();
          }
          

          let publicObj = {
            owner: this.username,
            zoneName: this.zoneName,
            imageName: this.form.imageTag.split(":")[0],
            imageTag: this.form.imageTag.split(":")[1],
            volumeName: this.volumeName, // 从子组件中获取
          };
          let workItemInfo = {
            executor: this.form.executor,
            lib: this.form.lib,
          };
          let labels = {
            gputype: this.form.gpuType, // gpu类型, 会从子组件中获取到
            appType: this.appType,
          };
          console.log(this.form.cpu)
          console.log(this.form.gpu)
          let quotas =  {
            CPU: {
              resourceType: "CPU",
              amount: this.form.cpu
            },
            GPU: {
              resourceType: "GPU",
              amount: this.form.gpu
            },
            MEM: {
              resourceType: "MEM",
              amount: this.form.amount,
              unit: this.form.unit
            }
          };

          
          // 根据不同类型， 分别赋值
          if(this.appType === 'job'){  // 训练任务     
            publicObj = { // 添加任务名
              ...publicObj,
              hyperParameters: para,
            }
            workItemInfo = { // 添加工作路径
              ...workItemInfo,
              entryFile: "/" + this.form.entryFile.join("/"),
            }
            if(this.form.lib == "caffe"){ 
              publicObj = { // 添加任务名，
                ...publicObj,
                jobName: this.form.jobName,
              }
              labels = { // 添加 log 路径 
                ...labels,
                logPath: this.logPathFolder + this.form.logPath,
              };

            }else if(this.form.lib == "tensorflow"){ 
              if(this.form.type !== "distributed"){ // 单机版， 添加任务名
                publicObj = { // 添加超参数
                  ...publicObj,
                  jobName: this.form.jobName,
                }
              }
              workItemInfo = { // 添加工作空间
                ...workItemInfo,
                workDirectory: this.form.workDirectoryJob
              }
            }
          }else if(this.appType === 'interactive'){ // 交互式开发
            publicObj = { // 添加任务名
              ...publicObj,
              jobName: this.form.executor,
            }  
            // 添加路径， 密码
            workItemInfo = {
              ...workItemInfo,
              entryFile: this.form.workSpace,
            }
            labels = {
              ...labels,
              password: this.form.password,
            }
            if(this.form.executor == "desktop"){ // desktop // 添加分辨率
              labels = {
                ...labels,
                resolution: this.form.resolution,
              }
            }
          }else if(this.appType === 'model'){
            publicObj = { // 添加任务名
              ...publicObj,
              jobName: this.form.jobName,
            }
            workItemInfo = {
              ...workItemInfo,
              entryFile: this.form.workSpace,
            }
          }


          // 分布式
          if(this.appType === 'job' &&
            this.form.type == "distributed" &&
            this.form.lib == "tensorflow"){
            jobInfo = {
            jobs: [{
                ...publicObj,
                workItemInfo,
                labels,  

                // worker
                jobName:
                  this.form.jobName + "-worker-" + this.form.workerQuotas.count,
                quotas: {
                  CPU: {
                    resourceType: "CPU",
                    amount: this.form.workerQuotas.cpu
                  },
                  GPU: {
                    resourceType: "GPU",
                    amount: this.form.workerQuotas.gpu
                  },
                  MEM: {
                    resourceType: "MEM",
                    amount: this.form.workerQuotas.amount,
                    unit: this.form.workerQuotas.unit
                  }
                }            
              },{
                ...publicObj,
                workItemInfo,
                labels,

                // 　parameterServer
                jobName:
                  this.form.jobName +
                  "-ps-" +
                  this.form.parameterServerQuotas.count,
                quotas: {
                  CPU: {
                    resourceType: "CPU",
                    amount: this.form.parameterServerQuotas.cpu
                  },
                  GPU: {
                    resourceType: "GPU",
                    amount: this.form.parameterServerQuotas.gpu
                  },
                  MEM: {
                    resourceType: "MEM",
                    amount: this.form.parameterServerQuotas.amount,
                    unit: this.form.parameterServerQuotas.unit
                  }
                }
              }],
            total:
              this.form.workerQuotas.count +
              this.form.parameterServerQuotas.count
            };

          }else{ // 非分布式
            jobInfo = {
              jobs: [{
                ...publicObj,
                quotas,
                workItemInfo,
                labels,               
              }],
              total: 1
                
            };
          }

          this.loading = true; // 显示加载

          this.$axios.post(url, jobInfo).then(res => {
            const data = res.data;
            this.loading = false; // 取消　加载
            if (data.success) {
              // 跳转到列表页
              if (this.appType === "interactive") {
                this.$router.push({
                  path: "/modeltraining/interactive/list"
                }); 
              } else if (this.appType === 'model') {
                this.$router.push({ path: "/modeldeployment/model/list" }); 
              } else if (this.appType === 'job') {
                this.$router.push({ path: "/modeltraining/job/list" }); 
              }
            } else {
              var messageCode = data.message || "default";
              var messageText = this.$t(
                "m.responseErrorMessage." + messageCode
              );
              Lib.Common.errorMessage(messageText, data.messageParams);
            }
            });
          } else {
            return false;
          }
        
      });
    },

    // visual 提交
    submitVisual(){
      this.loading = true;  // 显示加载
      let url = '',path = '', memory;    
      if(this.form.type === 'tensorflow'){
        url = Lib.API().job.visualSubmitForTensorflow;
        path = this.form.workSpace;
      }else if(this.form.type === 'caffe'){
        url = Lib.API().job.visualSubmitForCaffe;
        path = '/' + this.form.entryFile.join('/'); 
      }

      if(this.form.unit === 'MB'){
        memory = parseInt(this.form.amount / 1024);
      }

      this.$axios.post(
        url,
        {
          jobName: this.form.jobName,
          owner: this.username,
          path: path,
          volumeName: this.volumeName,
          cpuAmount: this.form.cpu,
          memAmount: memory || this.form.amount,
          imageName: this.form.imageTag.split(':')[0],
          imageTag: this.form.imageTag.split(':')[1],
        }
      ).then(res => {
        const data = res.data;
        if (data.success) {
          this.$router.push({path:'/modeltraining/visual/list'});
        }else {
          Lib.Common.errorMessage(this.$t("m.responseErrorMessage." + data.message || "default"), data.messageParams);
        }
      })
    }
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
      > span.line {
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
        > tr:first-child {
          > td:first-child {
            cursor: pointer;
          }
        }
        tr:nth-child(2) td {
          padding: 0px 0 0px 10px;
        }
      }
      table {
        td,
        th {
          border: 1px solid #eeeeee;
          padding: 3px 0 3px 10px !important;
          text-align: left;
          padding-left: 10px;
        }
        th {
          border-top: none;
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
    display: inline-block;
    li {
      display: inline-block;
      padding-right: 5px;
      span {
        font-weight: bold;
      }
    }
    li:nth-child(even) {
      color: #ccc;
    }
  }
}
.parameter-server-wrap {
  display: flex;
  flex-wrap: wrap;
  // justify-content: space-around;
  margin-left: 78px;
  .parameter-server-item {
    // flex-basis:30%;
    // min-width:250px;
    max-width: 45%;
    border: 1px solid #eee;
    border-radius: 5px;
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
  margin-top: 20px;
  color: #666;
  display: block;
  width: 100%;
  font-size: 14px;
  text-align: right;
  &:hover {
    color: #1a99a5;
  }
}

hr {
  border-top: 1px solid #eee;
  margin: 15px 0;
  border-bottom: none;
}
.submit-wrap {
  padding-top: 20px;
  position: relative;
  > button {
    margin-right: 30px !important;
  }
  div.is-enter-template-name {
    width: 400px;
    position: absolute;
    bottom: 50px;
  }
}
.dele-icon {
  color: #666;
  display: inline-block; 
  margin-left: 20px;
  transform:rotate(45deg);
  &:hover {
    color: #1a99a5;
  }
}
</style>