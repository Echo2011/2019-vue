<template>
    <main>
      <!-- 运行状况 -->
      <el-dialog
        :title="$t('m.job.status')"
        :visible.sync="DialogVisibleFailedMsg"
        width="80%">
        <table v-if="failedMsgList && failedMsgList.length" class="ai-table">
          <thead>
            <tr>
              <th>{{$t('m.time')}}</th>
              <th>{{$t('m.type')}}</th>
              <th>{{$t('m.reason')}}</th>
              <th>{{$t('m.msg')}}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in failedMsgList" :key="item.id">
              <td>{{item.createTime | toDate}}</td>
              <td>{{item.errorType}}</td>
              <td>{{item.errorReason}}</td>
              <td style="hyphens: auto;">{{item.errorMessage}}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>{{$t('m.noData')}}</p>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="DialogVisibleFailedMsg = false">{{$t('m.confirm')}}</el-button>
        </span>
      </el-dialog>

     <section>
       <el-card class="box-card"  v-loading="loading" :element-loading-text="$t('m.loading')" shadow="never">
          <div class="box-card-title" style="display:flex;justify-content: space-between;
margin-bottom: 20px;">
            <span class="job-name" style="font-weight:bold;">{{job.jobName}}</span>
            <div class="right-icon operation" style="float: right; position:relative;" type="text">

                <el-button type="text" v-if="role=='viewer'" @click="getModelPath(true)" id="jobdetail_modelDownload"><i class="el-icon-download" ></i> {{$t('m.job.modelDownload')}}</el-button>

                <!-- delete -->
                <el-popover
                  placement="bottom"
                  width="360"
                  v-model="job.isDeleteVisible" >
                    <div>
                      <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + '?'}}</p>
                      <div style="text-align: right; ">
                        <el-button size="mini" id="jobdetail_delete_cancel" @click="job.isDeleteVisible=false">{{$t('m.cancel')}}</el-button>
                        <el-button type="primary" id="jobdetail_delete"   size="mini" @click="job.isDeleteVisible=false;deleteHandle(job.uid,job.zoneName,job.jobName)">{{$t('m.confirm')}}</el-button>

                      </div>
                    </div>
                  <el-button  slot="reference" type="text" v-if="(jobStatus.runningStatus != 'Terminated') && (jobStatus.runningStatus != 'Canceled')"   id="jobdetail_isDeleteVisible"><i class="el-icon-delete" ></i> {{$t('m.delete')}}</el-button>
                </el-popover>

                <!-- 暂停 -->
                <el-button type="text"  id="jobdetail_running" v-if="jobStatus.runningStatus == 'Running'" @click="pause(job.uid,job.zoneName,job.jobName)">
                  <svg class="icon" aria-hidden="true" >
                    <use xlink:href="#icon-zanting"></use>
                  </svg>
                  {{$t('m.pause')}}
                </el-button>

                <!-- 恢复 -->
                <el-button  type="text" id="jobdetail_paused" @click="resume(job.uid,job.zoneName,job.jobName)" v-if="jobStatus.runningStatus == 'Paused'"><i  class="el-icon-caret-right" style="font-size:20px;" ></i> {{$t('m.resume')}}</el-button>

            </div>
          </div>
          <el-tabs v-model="activeName" @tab-click="tabHandleClick">
            <!-- 详情 -->
            <el-tab-pane :label="$t('m.detail')" name="detail">
              <p>{{$t('m.job.hostIP')}}:
              <span v-for="(value,key,index) in job.pods" :key="index">{{value.hostIP}} &nbsp; &nbsp; &nbsp; </span>
              </p>
              <div class="detail-body">

                  <el-card class="box-card">
                    <div slot="header" class="clearfix detail-title">
                      <span>{{$t('m.job.basicInfo')}}</span>
                    </div>
                    <ul>
                      <li>{{$t('m.zone.name')}}: {{job.zoneName}}</li>
                      <li>{{$t('m.image.ImageName')}}: {{job.imageName}}</li>
                      <li>{{$t('m.image.imageTag')}}: {{job.imageTag}}</li>
                      <li v-if="role=='admin'">{{$t('m.username')}}: {{job.owner}}</li>
                      <li v-for="(value,key,index) in job.hyperParameters" :key="index" >{{key}}: {{value}} </li>
                    </ul>
                  </el-card>
                  <el-card class="box-card">
                    <div slot="header" class="clearfix detail-title">
                      <span>{{$t('m.job.quotas')}}</span>
                    </div>
                    <ul>
                      <ul>
                        <li>GPU: {{quotas.GPU.amount}}Core</li>
                        <li>{{$t('m.memory')}}: {{quotas.MEM.amount+quotas.MEM.unit}}</li>
                        <li>CPU: {{quotas.CPU.amount}}Core</li>                        
                        <li>{{$t('m.gpuType')}}: {{job.labels.gputype?job.labels.gputype:$t('m.notSelected')}}</li>

                      </ul>
                    </ul>
                  </el-card>
                  <el-card class="box-card">
                    <div slot="header" class="clearfix detail-title">
                      <span>{{$t('m.job.codeInfo')}}</span>
                    </div>
                    <ul>
                      <ul>
                        <li>{{$t('m.job.entryFile')}}: {{workItemInfo.entryFile}}</li>
                        <li>{{$t('m.job.MLlib')}}: {{workItemInfo.lib}}</li>
                        <li>{{$t('m.job.executor')}}: {{workItemInfo.executor}}</li>
                        <li v-if="workItemInfo.executor==='shell'">{{$t('m.logPath')}}: {{job.labels.logPath}}</li>
                      </ul>
                    </ul>
                  </el-card>
                  <el-card class="box-card">
                    <div slot="header" class="clearfix detail-title">
                      <span>{{$t('m.job.jobStatus')}}</span>
                      <i class="el-icon-view"  @click="DialogVisibleFailedMsg = true; getFailedMsgList()" :title="$t('m.view')"></i>
                    </div>
                    <ul>
                      <li v-if="jobStatus.runningStatus!='Unknown'">{{$t('m.job.operatingStatus')}}: {{$t('m.job.'+jobStatus.runningStatus.toLowerCase())}}</li>
                      <li v-if="jobStatus.runningStatus == 'Terminated'">{{$t('m.job.jobResult')}}: {{$t('m.job.'+jobStatus.state.toLowerCase())}}
                      </li>
                      <li>{{$t('m.startTime')}}: {{jobStatus.startedTime | toDate}}</li>
                      <li>{{$t('m.endTime')}}: {{jobStatus.completedTime | toDate}}</li>
                    </ul>
                  </el-card>
              </div>

              <!-- 监控-->
              <!-- echarts : 圆形图表 -->
              <el-card class="box-card" style=" margin:20px 0;">
                <div style="display:flex;align-items: center;">
                  <!-- <div style="height:168px;flex-basis:50%;"> -->
                    <div style="height:208px;flex-basis:50%;" id='middle'></div>
                  <!-- </div> -->

                  <table class="summery">
                    <thead>
                      <tr>
                        <th>cpu</th>
                        <th></th>
                        <th>{{$t('m.unit')}}：% &#12288;</th>
                        
                        <th>{{$t('m.memory')}}</th>
                        <th></th>
                        <th >{{$t('m.unit')}}：% &#12288;</th>
                        
                        <th>gpu util</th>
                        <th></th>
                        <th >{{$t('m.unit')}}：% &#12288;</th>

                        <th>gpu mem</th>
                        <th></th>
                        <th >{{$t('m.unit')}}：% &#12288;</th>
                      </tr>
                    </thead>
                    <tbody>
                       <tr>
                        <td></td> <td>{{$t('m.average')}}</td> <td>{{jobSummery.cpu_limit_avg}}</td>
                        <td></td> <td>{{$t('m.average')}}</td> <td>{{jobSummery.mem_limit_avg}}</td>
                        <td></td> <td>{{$t('m.average')}}</td> <td>{{jobSummery.gpu_util_avg}}</td>
                        <td></td> <td>{{$t('m.average')}}</td> <td>{{jobSummery.gpu_mem_avg}}</td>
                      </tr>
                      <tr>
                        <td></td> <td>{{$t('m.aximum')}}</td> <td>{{jobSummery.cpu_limit_max}}</td>
                        <td></td> <td>{{$t('m.aximum')}}</td> <td>{{jobSummery.mem_limit_max}}</td>
                        <td></td> <td>{{$t('m.aximum')}}</td> <td>{{jobSummery.gpu_util_max}}</td>
                        <td></td> <td>{{$t('m.aximum')}}</td> <td>{{jobSummery.gpu_mem_max}}</td>
                      </tr>
                        <tr>
                        <td></td> <td>{{$t('m.minimum')}}</td> <td>{{jobSummery.cpu_limit_min}}</td>
                        <td></td> <td>{{$t('m.minimum')}}</td> <td>{{jobSummery.mem_limit_min}}</td>
                        <td></td> <td>{{$t('m.minimum')}}</td> <td>{{jobSummery.gpu_util_min}}</td>
                        <td></td> <td>{{$t('m.minimum')}}</td> <td>{{jobSummery.gpu_mem_min}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </el-card>

              <!-- echarts : 长型图表 -->
              <el-card class="box-card" style=" margin:20px 0;">
                <div  id="job_history" style="height: 300px;"></div>
              </el-card>

            </el-tab-pane>

            <!-- log -->
            <el-tab-pane label="log" name="log" class="tab-log" v-loading="logLoading" :element-loading-text="$t('m.loading')">
              <div >
                <!-- <div  class="log" > -->
                  <ul class="log" v-show="logList.length" >
                    <li v-for="(item,index) in logList" :key="index">
                      <code>{{item}}</code>
                    </li>
                  </ul>
                  <p v-if="!logList.length" class="log" style="color:#fff;" >
                    {{$t('m.noData')}}
                  </p>
                <!-- </div> -->
                
                <div class="page-block"  style="padding-right:20px;"> 

                    <el-form :inline="true" :model="logQuery" status-icon ref="logQuery" label-width="0px" class="demo-ruleForm" >

                      <el-form-item label="" prop="size">
                        <span>{{$t('m.total')}} {{logList.length}}/{{logQuery.totalLineNum}} {{$t('m.tiao')}} &nbsp; &nbsp; &nbsp; </span>
                        <!-- <span>{{$t('m.total')}} {{logQuery.maxFetchedLineNum>-1?logQuery.maxFetchedLineNum:0}} {{$t('m.tiao')}} &nbsp; &nbsp; &nbsp; </span> -->
                        <el-input-number v-model="logQuery.size" :step="10" controls-position="right" :min="1" :max="5000" style="width:110px;" id="jobdetail_log_input_size"></el-input-number>
                        <span> {{$t('m.itemTime')}} </span> 
                      </el-form-item>

                      <el-form-item label="" >
                        <el-button type="text" style="font-size:13px;"  @click="logQuery.offset=-1;logQuery.maxFetchedLineNum=-1;logFromJob(-1,'auto')"  id="jobdetail_log_btn_size">{{$t('m.getLatest')}}</el-button> 
                      </el-form-item>

                      <el-form-item label="">
                        <span style="color:#999; padding:0 20px;">|</span>
                      </el-form-item>

                      <el-form-item label="">
                        {{$t('m.locateThePosition')}} &nbsp; &nbsp;  {{$t('m.from')}} 
                        <el-input-number v-model="logQuery.from" :step="10" controls-position="right" :min="0"  style="width:110px;"  id="jobdetail_log_input_from"></el-input-number>
                        {{$t('m.tiao')}}
                      </el-form-item>

                      <el-form-item label="">—></el-form-item>
                      <el-form-item label="">
                        {{$t('m.to')}}
                        <el-input-number v-model="logQuery.to" :step="10" controls-position="right" :min="logQuery.from+1"  style="width:110px;"  id="jobdetail_log_input_to"></el-input-number>
                        {{$t('m.tiao')}} 
                      </el-form-item>
                      
                      <el-form-item>
                        <el-button type="text"   @click="logFromJob(logQuery.from,true)" style="font-size:13px;"  id="jobdetail_log_btn_to"> {{$t('m.confirm')}} </el-button>
                      </el-form-item>
                    </el-form>
                </div> 
              </div>
              
            </el-tab-pane>
          </el-tabs>

        </el-card>

     </section>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";
import echarts from "echarts";
import { Message } from "element-ui";

export default {
  data() {
    // var validateSize = (rule, value, callback) => {
    //   if (value === '') {
    //     callback(new Error('请输入密码'));
    //   } else {
    //     if (this.ruleForm.checkPass !== '') {
    //       this.$refs.ruleForm.validateField('checkPass');
    //     }
    //     callback();
    //   }
    // };
    return {
      pickerOptions1: {
        shortcuts: [{
          text: this.$t('m.today'),
          onClick(picker) {
            picker.$emit('pick', new Date());
          }
        }, {
          text: this.$t('m.yesterday'),
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', date);
          }
        }, {
          text: this.$t('m.thisWeek'),
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', date);
          }
        }]
      },
      DialogVisibleFailedMsg: false, // 任务运行失败/错误　信息
      failedMsgList: [],
      dateTime:'', // log 中选择的时间
      uid:'',
      logList:[],
      myChartData:null,
      zoneName:'',
      containerId:'',
      metricData:null,
      role:'',
      timerId: null,
      job: {
        success: true,
        message: "",
        messageParams: [],
        owner: '',
        zoneName: '',
        jobName: '',
        imageName: '',
        imageTag: '',

        workItemInfo: {
          entryFile: '', // /l-l/tt/dd
          executor: '', // shell
          lib: '', // caffe
          addOn: {}
        },
        jobStatus: {
          runningStatus: '', // Running
          state: '', // Failed
          startedTime: '', // 2018-03-12T06:51:33Z
          completedTime: '', // 2018-03-12T06:51:33Z
        },
        
        pods: {},
        uid: '',
        volumeName: '',
        labels: {
          gputype: '',
          logPath: '', // /aa/bb/cc/log
        },
        hyperParameters: {
          // key11: value11,
          // key222: value222
        }
      },
      jobStatus:{
        runningStatus:'',
      },
      workItemInfo:{},
      quotas:{
        CPU:{
          amount:null,
        },
        GPU: {
          amount:null
        },
        MEM:{
          amount:null,
          unit:null
        }
      },
      pods:{},
      activeName:'detail',
      volumeName:'',
      username: '',
      jobName:'', // 任务名
      owner: '',
      modelPath:'',
      logPath:'', //..
      loading: '', //
      timer1:null,
      timer2:null,
      timer3:null,
      jobHistory:[],
      jobInfo:{},
      jobSummery: {},
      logQuery: {
        offset: -1,
        maxFetchedLineNum: -1,
        totalLineNum: 0,
        size: 10,
        from: 0,
        to: 1
      },
       rules: {
          // size: [
          //   { validator: validateSize, trigger: 'blur' }
          // ],
          // from: [
          //   { validator: validateFrom, trigger: 'blur' }
          // ],
          // to: [
          //   { validator: validateTo, trigger: 'blur' }
          // ]
        },
      isShowMoreLog: false,
      // isLatest: true,
      sizeError: '',
      logLoading: false,
    };
  },
  created() {
    this.role =  localStorage.getItem("rolesJob")?localStorage.getItem("rolesJob"):null; // 获取角色
    this.uid = this.$route.query.uid;
    this.zoneName = this.$route.query.zoneName;
    this.jobName = this.$route.query.jobName;
    this.startedTime = this.$route.query.startedTime;
    this.completedTime = this.$route.query.completedTime;

    this.username = Lib.Common.getCookies('username');
    // this.clearTimer();
    this.getDetail();

   
  },
  mounted(){
    // this.getList();
    // log 添加滚动条
     this.history();
    this.summery();
    this.ontimeMetric();
  },
  beforeDestroy() {
    clearInterval(this.timer1);        
    this.timer1 = null;

    clearInterval(this.timer2);        
    this.timer2 = null;

    clearInterval(this.timer3);        
    this.timer3 = null;
  },
  destroyed(){
    if(this.timerId){
      clearInterval(this.timerId);
    }
  },
  methods: {
    // add: function () {
    //   this.items.splice(this.randomIndex(), 0, this.nextNum++)
    // },
    // 设置 log 的高度自定义，因为 tab 的高度是根据静态内容定义的，即一开始就定死了
    tabHandleClick(tab, event){
      let tagLog = document.querySelector('.log');
      console.log(tagLog);
    
      // var tagLog = document.querySelector('div.tab-log');
      tagLog.style.height = window.innerHeight - 333 + 'px'; // 333, header + footer + 其它
    },

  getData(percent,name) {
    return [{
        value: percent,
        name: name+' used',
        itemStyle: {
          normal: {
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            }
          }
        }
    }, {
        value: 100 - percent,
        name: name+' free',
        title:'free',
        itemStyle: {
          normal : {
              color: '#ccc',
              label: {
                  show: false,
              },
              labelLine: {
                  show: false,
              },
          emphasis: {
              color: 'rgba(0,0,0,0)'
          }
          }
      }
    }];
},

//4个饼图
ontimeMetric(){
  this.metricData = echarts.init(document.getElementById("middle"));
  this.changePieData();
  this.timer1=setInterval(() => {
    this.changePieData();
      }, 12000 );
},
changePieData(){
            this.$axios
          .get(Lib.API().dashboard.jobInfo + `?jobName=${this.jobName}&nameSpace=${this.zoneName}`)
          .then(res => {
            const data = res.data;
            if (data.success) {
              //获取job的实时监控数据
              this.jobInfo=data.jobInfo;
              this.option = {
                title: [{
                      text: 'cpu',
                      left:'7.5%',
                        top:'5%',
                      textStyle: {
                        fontSize:'15',
                        fontWeight:'300',
                      }
                  }, {
                    text: 'mem',
                    left:'32.5%',
                    top:'5%',
                    textStyle: {
                      fontSize:'15',
                      fontWeight:'300',
                      }
                  }, {
                      text: 'gpu util',
                      left:'56%',
                        top:'5%',
                      textStyle: {
                        fontSize:'15',
                        fontWeight:'300',
                      }
                  }, {
                      text: 'gpu mem',
                      left:'80%',
                        top:'5%',
                      textStyle: {
                        fontSize:'15',
                        fontWeight:'300',
                      }
                  }],
                  tooltip: {
                    trigger: 'item',
                    formatter: function(params, ticket, callback) {
                      // console.log(params);
                      return params.name + ": " + params.value + "%";
                      }
                      },

      series: [{
          name: 'cpu limit',
          type: 'pie',
          clockWise: true, //顺时加载
          hoverAnimation: false, //鼠标移入变大
          radius: [50,60],
          center : ['10%','61%'],
          label: {
              normal: {
                  show: false,
              }
          },
          data: this.getData(this.jobInfo.cpu_limit,'cpu limit')
      }, {
          name: 'mem limit',
          type: 'pie',
          clockWise: true, //顺时加载
          hoverAnimation: false, //鼠标移入变大
          radius: [50,60],
          center : ['35%','61%'],
          label: {
              normal: {
                  show: false,
              }
          },
          data: this.getData(this.jobInfo.mem_limit,'mem limit')
      },{
          name: 'gpu util',
          type: 'pie',
          clockWise: true, //顺时加载 
          hoverAnimation: false, //鼠标移入变大
          radius: [50,60],
          center : ['60%','61%'],
          label: {
              normal: {
                  show: false,
              }
          },
          data: this.getData(this.jobInfo.gpu_util,'gpu util')
      },{
          name: 'gpu mem',
          type: 'pie',
          clockWise: true, //顺时加载 
          hoverAnimation: false, //鼠标移入变大
          radius: [50,60],
          center : ['85%','61%'],
          label: {
              normal: {
                  show: false,
              }
          },
          data: this.getData(this.jobInfo.gpu_mem,'gpu mem')
      }]
  };
    this.metricData.setOption(this.option);
    
    } else {
      var messageCode = data.message || "default";
      var messageText = this.$t("m.responseErrorMessage." + messageCode);
      Lib.Common.errorMessage(messageText, data.messageParams);
    }
  })
},

    // 获取失败/错误信息　×　－》　改为　运行状况（还没有结果－成功、失败，　正在运行中出错了就可以查看该信息）
    getFailedMsgList(){
      this.$axios
        .get(Lib.API(this.uid,this.jobName).job.detailFailedInfo)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.failedMsgList = data.jobErrors;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
      })
    },



    // 任务模型路径获取
    getModelPath(isSecond){

      // 如果 this.modelPath 已经获取
      if(isSecond && this.modelPath){
        this.downloadModel();
        return false;
      }

      this.$axios
        .get(Lib.API(this.volumeName, this.owner).job.jobfilepath + `?entryFile=${this.workItemInfo.entryFile}&lib=${this.workItemInfo.lib}`)
        .then(res => {
          const data = res.data;
          if(data.success){
            this.logPath = data.logPath;
            this.modelPath = data.modelPath ? data.modelPath : '';
            if(isSecond){
              if(this.modelPath){　// 找到路径，　
                this.downloadModel();
              }else{　// 未找到路径，提示用户　未找到任务模型，　灰色文字
                this.$message({
                  showClose: true,
                  message: this.$t("m.job.modelNotFound"),
                  // type: "warning",
                  duration: Lib.Common.messageDuration
                });
              }
            }
          }else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
      })
    },

    // 下载任务模型
    downloadModel(){

      var aa = document.createElement('a');
      var isDir;
      if(this.workItemInfo.lib == 'caffe'){
        isDir = false;
      }else if(this.workItemInfo.lib == 'tensorflow') {
        isDir = true;
      }
      //    /test/cnn_test/model
      let path,fileName;
      // this.modelPath  '/aa/bb/cc'
      path = this.modelPath.slice(1); // aa/bb/cc
      path = path.split('/'); // [ "aa", "bb", "cc" ]
      fileName = path.pop();
      path = path.join('/');
      
      let href = `/api/storage/volumes/${this.volumeName}/dirs/${this.owner}/download?path=${path}&isDir=${isDir}&type=private&fileName=${fileName}`; 

      aa.setAttribute('href',href);
      document.body.appendChild(aa);
      aa.click();
    },

    restartInterval(){
      if(this.jobStatus.runningStatus === 'Running'){ // 正在进行，才会有log不停产出，需要发定时器
        // this.logFromJob(-1); // // 先立即执行一次
        clearInterval(this.timerId)
        this.timerId = setInterval(() => { // 定时器会晚1分钟执行 
          this.logFromJob(-1,'interval');
        }, 3000)  
      }else if(this.jobStatus.runningStatus === 'Terminated'){  // 已完成，需要延迟再发一次，确保log已全部更新
        this.logFromJob(-1); // // 先立即执行一次
        setTimeout(() => { // 延迟执行 
          this.logFromJob(-1);
        }, 10000)           
      }else{
        this.logFromJob(-1);
      }
    },

    // 获取日志
    logFromJob(offset,position){
        console.log('logFromJob');
        
        let size;
        size = this.logQuery.size;
        if(position === 'interval'){ // 定时器

        }else if(position === 'auto'){ // 用户手动点击 获取获取最新
          this.logLoading = true;
          this.restartInterval();
        }else if(position){ // 定位获取
          console.log('dddd');
          if(this.logQuery.from >= this.logQuery.to){
            this.logQuery.from = this.logQuery.to - 1;
          }          
          // 关闭定时器
          clearInterval(this.timerId);
          size = (this.logQuery.to - this.logQuery.from);
          if(size > 5000){
            this.logQuery.to = this.logQuery.from + 5000;
            size = 5000;
          }
          offset = this.logQuery.from;
          this.logLoading = true;
        }

        // 发起请求
        this.$axios
          .get(Lib.API(this.jobName).job.joblog + `?size=${size}&zoneName=${this.zoneName}&maxFetchedLineNum=${this.logQuery.maxFetchedLineNum}&offset=${offset}`)
          .then(res => {
            let data = res.data;
            if (data.success) {
              if(data.content){
                // 字符串转为数组
                data.content = data.content.slice(0,-2);
                data.content = data.content.split('\n');
                data.content.reverse();
              } else {
                data.content = [];
              }

              this.logQuery.totalLineNum = data.totalLineNum;
              if(position === 'interval'){ // 定时器
                console.log('000');
                this.logList = [...data.content, ...this.logList];
                // 判断是否是最大行号
                if(data.endFetchedLineNum > this.logQuery.maxFetchedLineNum){
                  this.logQuery.maxFetchedLineNum = data.endFetchedLineNum;
                }
              } else if(position === 'auto'){ // 手动获取
                this.logList = data.content;
                // this.isLatest = true;
                // this.logQuery.from = null;
                // this.logQuery.to = null;
                // 判断是否是最大行号
                if(data.endFetchedLineNum > this.logQuery.maxFetchedLineNum){
                  
                  this.logQuery.maxFetchedLineNum = data.endFetchedLineNum;
                }
                
              }else{ // 定位获取 or 自动获取
                console.log('1111');
                
                this.logList = data.content;
              }              
              
              
            } else{
              clearInterval(this.timerId); // 关闭定时器
              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText,data.messageParams,'interval');
            }
            this.logLoading = false;
        })
      
    },

    // 获取详情
    getDetail(interval){

      if(!interval){  // 如果定时器发的, 不显示　loading
        this.loading = true;
      }

      this.$axios
        // .get(`http://rap2api.taobao.org/app/mock/2311//api/job/jobs/%7Buid%7D`)
        // .get(`/api/job/jobs/${this.uid}?zoneName=${this.zoneName}`)
        .get(Lib.API(this.uid,this.jobName).job.jobDetail + `?zoneName=${this.zoneName}`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            data.isDeleteVisible = false;
            this.job = data;
            this.workItemInfo = data.workItemInfo;
            this.jobStatus = data.jobStatus;
            this.workItemInfo = data.workItemInfo;
            this.volumeName = data.volumeName;
            this.owner = data.owner;
            this.quotas = data.quotas;
              for(var key in data['pods']){
              for(var key1 in data.pods[key]['containers']){
                if(data['pods'][key]['containers'][key1]['id']){
                  this.containerId=data['pods'][key]['containers'][key1]['id'].split("//")[1];
                }
              }
            }
            
          this.restartInterval();
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams,interval);
          }
          this.loading = false;
      })
    },

    // 暂停任务
    pause(uid,zoneName,jobName){
      this.$axios
      // .put(`/api/job/jobs/${uid}/pause?zoneName=${zoneName}`)
      .put(Lib.API(uid).job.pauseItem + `?zoneName=${zoneName}`)
      .then( res => {
        const data = res.data;
        if(data.success){
          Message({
            showClose: true,
            message: jobName + " " + this.$t("m.pause"),
            type: "success",
            duration: Lib.Common.messageDuration
          });
          this.jobStatus.runningStatus = 'Paused';
          // 关闭获取 log 定时器
          clearInterval(this.timerId);
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },

    // 恢复任务
    resume(uid,zoneName,jobName){
      this.$axios
      // .put(`/api/job/jobs/${uid}/resume?zoneName=${zoneName}`)
      .put(Lib.API(uid).job.resumeItem + `?zoneName=${zoneName}`)
      .then( res => {
        const data = res.data;
        if(data.success){
          Message({
            showClose: true,
            message: jobName + " " + this.$t("m.resume"),
            type: "success",
            duration: Lib.Common.messageDuration
          });
          this.jobStatus.runningStatus = 'Running';
          // 开启获取 log 定时器
          this.restartInterval();
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },

    // 删除
    deleteHandle(uid,zoneName,jobName){
      this.$axios
        .delete(Lib.API(uid).job.deleteItem +`?zoneName=${zoneName}`)
        // .delete(`/api/job/jobs/${uid}?zoneName=${zoneName}`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.$router.push({path:'/modeltraining/job/list'}); // 跳转到列表页
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
      })
    },

    // getList(){
      // if(this.workItemInfo.lib != 'pytorch'){ // 不知道为什么加这个条件
        // this.timer=setInterval(() => {
          // if(this.containerId){ // 容器是否就绪，就绪后才会有id，有log；没有就绪，没有log，即失败或者准备状态
            // this.initLog();
          // }else{
            // this.getDetail('interval');
          // }
        // }, 5000 );
      // }
    // },

    // 清除　定时器
    // clearTimer(){
    //   if(this.timer){
    //     clearInterval(this.timer)
    //   }
    // },

//以下为监控

    history(){
      this.twooption3 = {
        title: {
          text: "",
          left: "5%",
          padding: 0
        },
        legend: { left: "40%" },
        tooltip: { trigger: "axis" },
        dataset: {
          source: []
        },
        xAxis: [
          { type: "category", gridIndex: 0, boundaryGap: false, show: true },
          { type: "category", gridIndex: 1, boundaryGap: false, show: true },
          { type: "category", gridIndex: 2, boundaryGap: false, show: true },
          { type: "category", gridIndex: 3, boundaryGap: false, show: true }
        ],
        yAxis: [
          {
            gridIndex: 0,
            name: "cpu (%)",
            type: "value",
            nameLocation: "middle",
            nameGap: "50",
            nameTextStyle: {
              color: "#333"
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true
            }
          },
          {
            gridIndex: 1,
            name: "mem (MiB)",
            type: "value",
            nameLocation: "middle",
            nameGap: "50",
            nameTextStyle: {
              color: "#333"
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true
            }
          },
          {
            gridIndex: 2,
            name: "gpu util (%)",
            type: "value",
            nameLocation: "middle",
            nameGap: "50",
            nameTextStyle: {
              color: "#333"
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true
            }
          },
          // 
          {
            gridIndex: 3,
            name: "gpu mem (Mib)",
            type: "value",
            nameLocation: "middle",
            nameGap: "50",
            nameTextStyle: {
              color: "#333"
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true
            }
          }
        ],
        grid: [
          { top: "14%", left: "5%", right: "55%", bottom: "58%" },
          { top: "56%", left: "5%", right: "55%", bottom: "8%" },
          { top: "56%", left: "55%", right: "1%", bottom: "8%" },
          { top: "14%", left: "55%", right: "1%", bottom: "58%" },
        ],
        series: [
          {
            type: "line",
            stack: "cpu",
            xAxisIndex: 0,
            yAxisIndex: 0,
            seriesLayoutBy: "row",
            symbolSize: "0"
          },
          {
            type: "line",
            xAxisIndex: 1,
            yAxisIndex: 1,
            stack: "mem",
            seriesLayoutBy: "row",
            symbolSize: "0"
          },

            {
              type: "line",
              xAxisIndex: 3,
              yAxisIndex: 3,
              stack: "gpu mem",
              seriesLayoutBy: "row",
              symbolSize: "0"
            }
            ,
          {
            type: "line",
            xAxisIndex: 2,
            yAxisIndex: 2,
            stack: "gpu util",
            seriesLayoutBy: "row",
            symbolSize: "0"
          }
        ]
      };
      this.myChartData = echarts.init(document.getElementById("job_history"));
      this.changeHistory();
      this.timer2=setInterval(() => {
        this.changeHistory();
      }, 12000 );

    },
    //修改历史记录数据
    changeHistory(){
      var startTime=new Date(this.startedTime).getTime();
            var endTime=null;
            if(this.completedTime){
              endTime=new Date(this.completedTime).getTime();
            }else{
              endTime=new Date().getTime();
            }
            if(this.startedTime){
              this.$axios
              .get(Lib.API().dashboard.history+`?jobName=${this.jobName}&nameSpace=${this.zoneName}&startTime=${startTime}&endTime=${endTime}`)
              .then(res => {
                const data = res.data;
                if (data.success) {
                    //获取job的历史数据
                      this.jobHistory=data.jobHistory;
                      this.$nextTick(function() {
                          this.twooption3.dataset.source = this.jobHistory;
                          this.myChartData.setOption(this.twooption3);
                      });
                } else {
                  var messageCode = data.message || "default";
                  var messageText = this.$t("m.responseErrorMessage." + messageCode);
                  Lib.Common.errorMessage(messageText, data.messageParams);
                }
            })
            }
    },

  //修改统计表格的数据
    changeSummery(){
        var startTime=new Date(this.startedTime).getTime();
            var endTime=null;
            if(this.completedTime){
              endTime=new Date(this.completedTime).getTime();
            }else{
              endTime=new Date().getTime();
            }
            if(this.startedTime){
              this.$axios
              .get(Lib.API().dashboard.summery+`?jobName=${this.jobName}&nameSpace=${this.zoneName}&startTime=${startTime}&endTime=${endTime}`)
              .then(res => {
                const data = res.data;
                if (data.success) {
                    //获取job的历史数据
                      this.jobSummery=data.jobInfo;

                } else {
                  var messageCode = data.message || "default";
                  var messageText = this.$t("m.responseErrorMessage." + messageCode);
                  Lib.Common.errorMessage(messageText, data.messageParams);
                }
            })
          }
    },
    summery(){
      this.changeSummery();
      this.timer3=setInterval(() => {
        this.changeSummery();
      }, 12000 );
    }
  }


};
</script>

<style lang="less" scoped>
section > .el-card{
  -webkit-box-shadow: none;
  box-shadow: none;
  border:none;
  div.clearfix {
    >span.job-name {
      font-weight: bold;
    }
  }
  .el-card__header {
    border-bottom:none;
  }
}
div.quotas {
  ul {
    display: flex;
    justify-content: space-around;
    li {
      flex-basis: 33%;
      text-align: center;
    }
  }
}
div.detail-body {
  display: flex;
  justify-content: space-between;
  > div {
    flex-basis: 22%;
    min-width: 200px;
    flex-wrap: wrap;
    li {
      padding: 8px 0;
    }
  }
}
div.right-icon {
  > span:hover {
    color: #1a99a5;
    cursor: pointer;
  }
}

.tab-log {
  
  
}
main section table tr {

}
.log {
  // border-top: 1px solid #eeeeee;
  // margin-top: 20px;
  background-color: #000;
  overflow-y: auto;
  padding: 20px;
  li {
    border-bottom: none;
    line-height: 30px;
    // padding: 10px 0;
    color: #fff;
    &:hover {
      background-color: #333;
    }
  }
}

.el-time-spinner.has-seconds .el-time-spinner__wrapper {
  width: 33%;
}
.clearfix.detail-title {
  font-weight: bold;
  color: #666;
  i:hover {
    color: #1a99a5;
    cursor: pointer;
  }
}
.echarts-wrap {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  box-shadow: 2px 2px 2px #ddd;
  border-radius: 5px;

  div.left {
    display: flex;

    flex-grow: 1;

  }
}
table.summery {
  width: 50%;
  border-left: 1px solid #eeeeee;
  border-right: 1px solid #eeeeee;
  th {
    color: #666;
    font-weight: bold;
  }
  td,th {
    padding-left: 10px;
    text-align:center;
    line-height: 26px;
    padding: 0;
  }
  thead tr{
    border-top: 1px solid #eeeeee;
    border-bottom: 1px solid #eeeeee;
    height: 45px;
  }
  td:nth-child(3), td:nth-child(6),td:nth-child(9),th:nth-child(3), th:nth-child(6), th:nth-child(9){
    border-right: 1px solid #eeeeee;
  }
  tbody {
    tr:nth-child(1), tr:nth-child(2), tr:nth-child(4), tr:nth-child(5), tr:nth-child(7), tr:nth-child(8){
        border-bottom: 1px solid #fff;
      }
  }
  
  // .page-block {
  //   input[type="number"]{
     
  //   }
  // }
  
}
</style>
