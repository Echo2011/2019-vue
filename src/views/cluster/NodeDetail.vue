<template>
  <main>		
     <section class="nav-detail">
      <div class="detail-name">
        <p class="title">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-jiedian-"></use>
          </svg>
          <span>{{nodeName}}</span>
        </p>
        <div>
          <p>
            IP:{{nodeDetail.ip}}
          </p>
          <p>
            {{$t('m.node.runTime')}}：
            {{ nodeDetail.statustime | statustime }}
          </p>
          <p>
            {{$t('m.node.serviceStatus')}}：
            <span v-if="nodeDetail.healthStatus===1">
              <i class="el-icon-circle-check good" style="color:#ade83d"></i>
            </span>
            <span v-else-if="nodeDetail.healthStatus === 0">
              <i class="el-icon-warning warning"></i>
            </span>
          </p>
          
          <p>
            {{$t('m.node.healthStatus')}}：
            <span v-if="nodeDetail.serviceStatus===1">
              <i class="el-icon-circle-check good" style="color:#ade83d"></i>
            </span>
            <span v-else-if="nodeDetail.serviceStatus === 0">
              <i class="el-icon-warning warning"></i>
            </span>
          </p>
          
        </div>
      </div>
      <div class="detail-info">
        <table >
          <tr>
            <td> &nbsp;GPU</td>
            <td> &nbsp;CPU</td>
            <td> &nbsp;{{$t('m.memory')}}</td>
            <td> &nbsp;{{$t('m.disksize')}}</td>
          </tr>
          <tr>
            <td><svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-GPU"></use>
            </svg></td>
            <td> <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-cpu1"></use>
            </svg></td>
            <td> <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-aistubiaokuozhan-"></use>
            </svg></td>
            <td> <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-cunchu"></use>
            </svg></td>
          </tr>
          <tr>
            <td><span>{{nodeDetail.gpucount?nodeDetail.gpucount:''}}</span></td>
            <td><span>{{nodeDetail.cpucount?nodeDetail.cpucount:0}}</span>Core</td>
            <td><span>{{nodeDetail.memory}}</span></td>
            <td>
              <span v-if="nodeDetail.disksize">
                <span v-for="item in nodeDetail.disksize" :key="item">{{item}}<br/></span>
              </span>
            </td>
          </tr>
        </table>
      </div>
       <!-- 进度条 -->
      <div class="per-list-wrap">
        <h3>{{$t('m.utilization')}}</h3>
        <div class="per-list">
          <ul style="">
            <li>GPU</li>
            <li>CPU</li>
            <li>{{$t('m.memory')}}</li>
            <li>{{$t('m.disksize')}}</li>
          </ul>
          <div> 
            <el-progress  :show-text="false"  :percentage="nodeUsedPer['GPU Used']"></el-progress>
            <el-progress  :show-text="false"  :percentage="nodeUsedPer['CPU Used']"></el-progress>
            <el-progress  :show-text="false"  :percentage="nodeUsedPer['Mem Used']"></el-progress>
            <el-progress  :show-text="false"  :percentage="nodeUsedPer['Disk Used']"></el-progress>
          </div> 
          <ul style="">
            <li>{{nodeUsedPer['GPU Used']}}%</li>
            <li>{{nodeUsedPer['CPU Used']}}%</li>
            <li>{{nodeUsedPer['Mem Used']}}%</li>
            <li>{{nodeUsedPer['Disk Used']}}%</li>
          </ul>
        </div>               
    </div>
   
      <div class="detail-other">
        <h3>{{$t('m.operating')}}</h3>

        <ul v-if="nodeDetail.action != '2'" id="nodedetail_vif_action">
          <li v-if="nodeDetail.action === '1'" @click="powerOn(nodeDetail.nodeName)" id="nodedetail_poweron">
            <svg class="icon" aria-hidden="true" >
              <use xlink:href="#icon-start"></use>
            </svg>
            <span>{{$t('m.node.powerOn')}}</span>
          </li>
          <li v-if="nodeDetail.action === '0'" @click="isShowConfirmDelete=!isShowConfirmDelete; whatOperation = 'shutDown'" id="nodedetail_show_shutDownDiv">
            <svg class="icon" aria-hidden="true" >
              <use xlink:href="#icon-guanji"></use>
            </svg>
            <span>{{$t('m.node.shutDown')}}</span>
          </li>
          <li v-if="nodeDetail.action === '0'" @click="isShowConfirmDelete=!isShowConfirmDelete; whatOperation = 'restart'" id="nodedetail_show_restartDiv">
            <svg class="icon" aria-hidden="true" >
              <use xlink:href="#icon-zhongqi"></use>
            </svg>
            <span>{{$t('m.node.restart')}}</span>
          </li>
          <li @click="isShowConfirmDelete=!isShowConfirmDelete; whatOperation = 'delete'" id="nodedetail_show_deleteDiv"  v-show="standaloneOrCluster!=='standalone'">
            <svg class="icon" aria-hidden="true" >
              <use xlink:href="#icon-delete"></use>
            </svg>
            <span>{{$t('m.delete')}}</span>
          </li>
          <!-- <li> -->
            <!-- 打污点，取消污点 -->
            <!-- <el-switch
              v-model="nodeDetail.disable"
              active-text="打污点"
              inactive-text="取消污点" @change="disableChange">
            </el-switch>
          </li> -->
          
        </ul>
        <p v-else-if="nodeDetail.action === '2'"> 
          {{$t('m.node.notInstalled')}}
        </p>
        <transition name="deleteTransition">
          <div class="delete-message" v-show="isShowConfirmDelete" id="nodedetail_isShowConfirmDelete_div">
          <!-- <p class="title">SHANCHU</p> -->
            <p>{{$t('m.doYouDecide')+ ' '+$t('m.node.'+whatOperation).toLowerCase() + ' ' + nodeDetail.nodeName + '?'}}</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="isShowConfirmDelete = false" id="nodedetail_button_cancel">{{$t('m.cancel')}}</el-button>
              <el-button type="primary" size="mini" @click="isShowConfirmDelete=false;operationHandle(nodeDetail.nodeName,whatOperation)" id="nodedetail_button_confirm">{{$t('m.confirm')}}</el-button>
            </div>
          </div>
        </transition>
      </div>
      
    </section>
    
    <div class="nodedetail-content">     
      <el-tabs v-model="activeName">        
        <el-tab-pane :label="$t('m.node.resource')" name="resource" class="resource" >
          <div class="resource-item">
            <div class="item-div" style="">
              <div class="select-wrap"  style="">
                <span>{{$t('m.last')}} </span>
                <el-select class="select-time" style="width:120px;" v-model="memLimit" @change="getHistory('myChart1','memhistory',memLimit)" id="memLimit" :placeholder="$t('m.rules.pleaseChoose')">
                  <el-option v-for="item in limitList" :key="item.value" :label="item.label" :value="item.value"></el-option>      
                </el-select>
              </div>
              <div id='myChart1' style='width:100%;height:300px;'></div>
            </div>
            <div  class="item-div">
              <div class="select-wrap">
                <span>{{$t('m.last')}} </span>
                <el-select class="select-time" style="width:120px;" v-model="cpuLimit" @change="getHistory('myChart2','cpuhistory',cpuLimit)" id="cpuLimit" :placeholder="$t('m.rules.pleaseChoose')">
                  <el-option v-for="item in limitList" :key="item.value" :label="item.label" :value="item.value"></el-option>      
                </el-select>
              </div>
              <div id='myChart2' style='width:100%;height:300px;'></div>
            </div>
          </div>
          <div class="resource-item">
            <div class="item-div">
              <div class="select-wrap">
                <span>{{$t('m.last')}} </span>
                <el-select class="select-time" style="width:120px;" v-model="gpuLimit" @change="getHistory('myChart3','gpuhistory',gpuLimit)" id="gpuLimit" :placeholder="$t('m.rules.pleaseChoose')">
                  <el-option v-for="item in limitList" :key="item.value" :label="item.label" :value="item.value"></el-option>      
                </el-select>
              </div>
              <div id='myChart3' style='width:100%;height:300px;'></div>
            </div>     

            <div class="item-div">
              <div class="select-wrap">
                <span>{{$t('m.last')}} </span>
                <el-select class="select-time" style="width:120px;" v-model="netLimit" @change="getHistory('myChart4','nethistory',netLimit)" id="netLimit" :placeholder="$t('m.rules.pleaseChoose')">
                  <el-option v-for="item in limitList" :key="item.value" :label="item.label" :value="item.value"></el-option>      
                </el-select>
              </div>
              <div id='myChart4' style='width:100%;height:300px;'></div>
            </div>          
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('m.node.serviceStatus')" name="fourth" class="server-status"> 
          <div v-for="item in dockerlist" :key="item.nodeName" class="server-status-item">
            <div class="title">              
              <svg v-if="item.Status=='0'||item.PIDs=='0'" class="icon error" aria-hidden="true">
                <use xlink:href="#icon-warning"></use>
              </svg>
              <svg v-else class="icon ok" aria-hidden="true">
                <use xlink:href="#icon-ok"></use>
              </svg>
              <span>{{item.Name}}</span>
            </div>            
            <dl class="info">
              <div>
                <dt>{{$t('m.node.container')}}: </dt>
                <dd>{{item.Container}}</dd><br/> 
                <dt>{{$t('m.node.containerName')}}: </dt>
                <dd>{{item.Name}}</dd><br/>
                <dt>{{$t('m.node.memUsage')}}: </dt>
                <dd>{{item.MemUsage}}</dd><br/> 
                <!-- <dt>Status:</dt>                
                <dd v-if="item.Status=='0'||item.PIDs=='0'">error</dd> 
                <dd v-else>ok</dd> -->
              </div>
              <div>
                <dt>{{$t('m.node.netIO')}}: </dt>
                <dd>{{item.NetIO}}</dd><br/>
                <dt>{{$t('m.node.blockIO')}}: </dt>
                <dd>{{item.BlockIO}}</dd><br/>
                <!-- <dt>PIDs:</dt>    
                <dd>{{item.PIDs}}</dd>      -->
              </div>
            </dl>
          </div>
         
        </el-tab-pane>

         <el-tab-pane :label="$t('m.node.console')" name="fifth" class="server-status"  v-loading="loading" :element-loading-text="$t('m.loading')"> 
            <div id="gateone_container" style="position: relative; width: 100%; height: 662px;">
              <div id="gateone"></div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </main>

</template>

<script>
import Lib from "../../assets/js/Lib.js";
import echarts from 'echarts'
import gateone from '../../assets/js/gateone.js'
export default {

data() {
    return {
      memLimit:'30 min',
      cpuLimit:'30 min',
      gpuLimit:'30 min',
      netLimit:'30 min',
      limitList:[
        {label:'5 min', value: '1'},
        {label:'10 min', value: '2'},
        {label:'30 min', value: '3'},
        {label:'1 h', value: '4'},
        {label:'3 h', value: '5'},
        {label:'6 h', value: '6'},
        {label:'12 h', value: '7'},
        {label:'24 h', value: '8'},
        {label:'48 h', value: '9'},
      ],
      workspaceId:'',
      flag:'',
      options:{
        // title: { 
        //   text: this.$t('m.node.'+"memhistory"),
        //   textStyle:{
        //       color:'#555555',
        //       fontSize:16,
        //     }
        //   },
        // tooltip: { trigger: 'axis'},
        // legend: {
        //   y:'bottom',
        //   // padding:10,
        //   // itemGap:40,
        //   // bottom:'20',
        //   data: ["mem avai","mem total"]      },
        // grid: {
        //     left: '3%',
        //     right: '4%',
        //     bottom: 30,
        //     containLabel: true
        // },
        // toolbox: {
        //     // itemGap:50,
        //     // orient:"vertical",
        //     // itemSize:40,
        //     feature: {
        //         saveAsImage: {}
        //     }
        // },
        // xAxis: {
        //     type: 'category',
        //     boundaryGap: false,
        //     data: ["2018-05-15 13:12:54","2018-05-15 13:13:04","2018-05-15 13:13:14","2018-05-15 13:13:24","2018-05-15 13:13:34"]
        // },
        // yAxis: {
        //     type: 'value'
        // },
        // series: [{"symbol":"none","stack":"avai","data":[7152,7152,7152,7152,7152,7152,7152,7152,7152,7152,7153,7153,7152,7152,7153,7152,7153,7152,7152,7152,7152,7152,7152,7152,7152,7152,7152,7152,7152,7152,7152,7152,7151,7151,7152,7152,7152,7152,7153,7152,7152,7152,7151,7152,7152,7152,7153,7153,7153,7153,7152,7151,7152,7152,7152,7152,7151,7151,7152,7152],"name":"mem avai","type":"line"},{"symbol":"none","stack":"memtotal","data":[7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982],"name":"mem total","type":"line"},{"symbol":"none","stack":"memtotal","data":[7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982],"name":"mem use","type":"line"},{"symbol":"none","stack":"memtotal","data":[7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982],"name":"metal","type":"line"},{"symbol":"none","stack":"memtotal","data":[7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982],"name":"mem free","type":"line"},{"symbol":"none","stack":"memtotal","data":[7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982],"name":"m total","type":"line"},{"symbol":"none","stack":"memtotal","data":[7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982],"name":"mem cach","type":"line"},{"symbol":"none","stack":"memtotal","data":[7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982],"name":"memotal","type":"line"},{"symbol":"none","stack":"memtotal","data":[7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982],"name":"mem toal","type":"line"},{"symbol":"none","stack":"memtotal","data":[7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982,7982],"name":"mem buff","type":"line"}]
      },
      dockerlist:[
        // {"Status":"1","Container":"cf822fba47af","BlockIO":"0B / 0B","MemPerc":"0.01%","CPUPerc":"0.00%","NetIO":"0B / 0B","PIDs":"0","Name":"k8s_POD_nvidia-device-plugin","MemUsage":"1.176MiB / 7.795GiB"},{"Status":"0","Container":"792fbd45f3ac","BlockIO":"12.3kB / 0B","MemPerc":"0.17%","CPUPerc":"1.27%","NetIO":"355MB / 382MB","PIDs":"9","Name":"zabbix-agent","MemUsage":"13.41MiB / 7.795GiB"},{"Status":"1","Container":"a4a465eda608","BlockIO":"238kB / 0B","MemPerc":"0.35%","CPUPerc":"2.89%","NetIO":"0B / 0B","PIDs":"0","Name":"calico-node","MemUsage":"27.58MiB / 7.795GiB"},{"Status":"1","Container":"d036cbe3d0ab","BlockIO":"0B / 0B","MemPerc":"0.06%","CPUPerc":"0.00%","NetIO":"0B / 0B","PIDs":"24","Name":"k8s_nvidia-device-plugin","MemUsage":"4.777MiB / 7.795GiB"},{"Status":"1","Container":"886c5a7f9cea","BlockIO":"0B / 0B","MemPerc":"0.06%","CPUPerc":"0.00%","NetIO":"0B / 0B","PIDs":"2","Name":"k8s_install-cni_calico-node","MemUsage":"4.512MiB / 7.795GiB"},{"Status":"1","Container":"e643fa7dc274","BlockIO":"0B / 57.3kB","MemPerc":"0.00%","CPUPerc":"0.00%","NetIO":"738B / 180B","PIDs":"3","Name":"zabbix-plugin-docker","MemUsage":"276KiB / 7.795GiB"},{"Status":"1","Container":"f694a25a74c4","BlockIO":"0B / 0B","MemPerc":"0.01%","CPUPerc":"0.00%","NetIO":"0B / 0B","PIDs":"5","Name":"k8s_POD_calico-node","MemUsage":"1.168MiB / 7.795GiB"},{"Status":"1","Container":"0652466f3687","BlockIO":"102kB / 115kB","MemPerc":"0.07%","CPUPerc":"0.00%","NetIO":"1.3kB / 0B","PIDs":"20","Name":"gluster","MemUsage":"5.648MiB / 7.795GiB"}
      ],
      activeName: "resource", // tab栏 显示哪个tab
      isShowNav: false,
      nodeDetail: {
        memory: null,
        gpuused: null,
        gpucount: null,
        cpuused: null,
        cpucount: null,
        disksize: null,
        nodeName: null,
        ip: null,
        serviceStatus: null,
        healthStatus: null,
        nodeFlag: null,
        action: null,
        statustime: null
      }, // 获取到的数据
      nodeUsedPer:{
        "GPU Used":0,
        "CPU Used":0,
        "Mem Used":0,
        "Disk Used":0
      },
      nodeName: "",
      message: {
        // 给用户的反馈信息， type: success | error
        text: "",
        type: ""
      },
      isShowConfirmDelete: false,
      whatOperation:'' // 对节点做的什么操作：　关机/重启/删除
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
    //第一次进入页面不创建容器
    this.flag=localStorage.getItem("container_flag");
    if(this.flag!='false'){//如果是刷新后进入页面,符合条件
      this.standaloneOrCluster = localStorage.getItem('standaloneOrCluster')?localStorage.getItem('standaloneOrCluster'):'';
      this.nodeName = this.$route.params.nodeName;
      this.getNodeUsed();
      this.getDockerList();
      this.getNodeDetail();
    }
  },

  mounted() {
    
    //第一次进入页面不创建容器
    this.flag=localStorage.getItem("container_flag");
    if(this.flag!='false'){//如果是刷新后进入页面,符合条件
      this.getHistory("myChart1","memhistory","3");
      this.getHistory("myChart2","cpuhistory","3");
      this.getHistory("myChart3","gpuhistory","3");
      this.getHistory("myChart4","nethistory","3");
    }     
  },
  beforeDestroy(){
    localStorage.setItem('image_flag', false);
    localStorage.setItem('container_flag', false);
  },
  methods: {
    // // 打污点 or 取消污点
    // disableChange(){
    //   let url = '';
    //   if(this.nodeDetail.disable){ // disable 为 true，打污点
    //     url = Lib.API(this.nodeName).node.unschedule + `?nodeIp=${this.nodeDetail.ip}`
    //   }else{
    //     url = Lib.API(this.nodeName).node.schedule + `?nodeIp=${this.nodeDetail.ip}`
    //   }

    //   this.$axios
    //     .put(url)
    //     .then(res => {
    //       const data = res.data;
    //       if (data.success) {
    //         this.$message({          
    //           showClose: true,
    //           message: this.$t("m.successAdv"),
    //           type: "success",
    //           duration: Lib.Common.messageDuration
    //         });
    //       } else {
    //         this.nodeDetail.disable = !this.nodeDetail.disable; // 操作失败
    //         // 操作反馈信息： 失败
    //         var messageCode = data.message || "default";
    //         var messageText = this.$t("m.responseErrorMessage." + messageCode);
    //         Lib.Common.errorMessage(messageText, data.messageParams);
    //       }
          
    //     });
    // },

    //执行一次删除默认gateone操作
    closeWorkspace(){
      GateOne.Terminal.workspaceClosedEvent(null);
      setTimeout(() => {
        this.closeOneWorkspace();
      }, 2000 );
    },
    //删除旧workspace,及对应的terminal
    closeOneWorkspace(){
        this.workspaceId=localStorage.getItem("go_default_selectedWorkspace");
        GateOne.Terminal.workspaceClosedEvent(this.workspaceId)
    },

    // 用户操作提示信息
    openMessage() {
      this.$message({
        showClose: true,
        message: this.message.text,
        type: this.message.type,
        duration: Lib.Common.messageDuration
      });
    },


  getDetail(){
    return  this.$axios.get(`/api/node/nodes/${this.nodeName}`);
  },
  getAuth(){
    return  this.$axios.get(`/api/node/master/console`);
  },
    // 获取节点详情的数据
    getNodeDetail() {
      // 设置 this.nodeName 的值
      this.$axios
        // .get('http://rap2api.taobao.org/app/mock/2311/GET/api/node/nodes/%7BnodeName%7D')  // 虚拟数据的 api nodeItem
        
        // .get(`/api/node/nodes/${this.nodeName}`)
        .get(Lib.API(this.nodeName).node.nodeItem)
        .then(res => {
          const data = res.data;
          if (data.success) {
            data.disksize = data.disksize.split(',');
            this.nodeDetail = data;
            this.getCsl();
            }else{
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }
          })
          },


 getCsl() {
   console.log(this.nodeDetail);

    this.$axios.all([this.getAuth()])
                .then(this.$axios.spread((at)=>{
                  const auth = at.data;
        var newTerminal = () =>{
        // Introducing the superSandbox()!  Use it to wrap any code that you don't want to load until dependencies are met.
        // In this example we won't call newTerminal() until GateOne.Terminal and GateOne.Terminal.Input are loaded.
        GateOne.Base.superSandbox("NewExternalTerm", ["GateOne.Terminal", "GateOne.Terminal.Input"], (window, undefined)=> {
            "use strict";
            var existingContainer = GateOne.Utils.getNode('#'+GateOne.prefs.prefix+this.nodeName);
        GateOne.locations;GateOne.Net.setLocation(this.nodeName)
        var container = GateOne.Utils.createElement('div', {
                'id': 'container'+this.nodeName, 'class': 'terminal', 'style': {'height': '100%', 'width': '100%'}
        });
        var gateone = GateOne.Utils.getNode('#gateone');
        // Don't actually submit the form
        if (!existingContainer) {
                gateone.appendChild(container);
        } else {
                container = existingContainer;
        }
        // Create the new terminal
        if(this.nodeName==='master'){
          var termNum = GateOne.Terminal.newTerminal(1, null,container);
        }else{
          var termNum = GateOne.Terminal.newTerminal(1+this.nodeName.replace('n',''), null, container);
        }
        });
    };

    GateOne.init({
        auth: auth,
        url: `http://${location.host}:8000`,
        autoConnectURL: `ssh://root@${this.nodeDetail.ip}`,
        showToolbar: false
    }, newTerminal)

      
    })
    )},

  // 获取节点cpu,gpu,mem,disk使用率
    getNodeUsed() {
      // 设置 this.nodeName 的值
      this.$axios       
        .get(`/api/monitor/node/info?hostname=${this.nodeName}`+`-zabbix-agent`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.nodeUsedPer = data.item;
          }else{
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }
        })
    },

     // 获取节点必要的容器信息
    getDockerList() {
      this.$axios
        .get(`/api/monitor/node/item?hostname=${this.nodeName}`+`-zabbix-agent&keys=sysDockers`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.dockerlist = data.items;
          }else{
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }
        })
    },

    // 关机
    powerOff(nodeName) {
      this.$axios
        // .put(Lib.URL.nodeOff)
        .put(`/api/node/nodes/${nodeName}/powerOff`)
        .then(res => {
          const data = res.data;
          // 不管是否成功结果重新赋值
          
          // 操作成功
          if (data.success === true) {
            this.nodeDetail.action = data.node.action;
            this.message.text = nodeName +
            this.$t("m.node.shut") + this.$t("m.successAdv");
            this.message.type = "success";
            this.openMessage();
          } else {
            // 操作失败
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }
        })
    },

    // 开机
    powerOn(nodeName) {
      this.$axios
        // .put(Lib.URL.nodeOn)
        .put(`/api/node/nodes/${nodeName}/powerOn`)
        .then(res => {
          const data = res.data;          
          if (data.success) {
            this.nodeDetail.action = data.node.action;
            this.message.text =　nodeName +
            this.$t("m.node.switched") + this.$t("m.successAdv");
            this.message.type = "success";
            this.openMessage();
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }
        })
    },

    // 重启
    powerReset(nodeName) {
      this.$axios({
        method: "put",
        // url: Lib.URL.nodeReset
        url: `/api/node/nodes/${nodeName}/powerReset`
      })
        .then(res => {
          const data = res.data;          
          if (data.success) {
            this.nodeDetail.action = data.node.action;
            this.message.text = nodeName +
            this.$t("m.node.restarted") + this.$t("m.successAdv");
            this.message.type = "success";
            this.openMessage();
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }
        })
    },

    // 删除
    nodeDelete(nodeName) {
      this.isShowConfirmDelete = false; // 关闭删除对话框
      // 然后发送删除请求
      this.$axios({
        method: "delete",
        // url: Lib.URL.nodeDelete
        // url: `/api/node/nodes/${nodeName}/delete`
        url: Lib.API(nodeName).node.deleteNode + `?nodeIp=${this.nodeDetail.ip}`
      })
        .then(res => {
          const data = res.data;
          // 删除成功, 跳转到列表页
          if (data.success) {
            // this.dialogBacktoListVisible = true;
            // 删除成功， 跳转至节点列表页
            this.$router.push({path:'/cluster/nodelist'});
          } else {
            // 删除失败
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }
        })
    },

    // 确认哪个操作，并发送请求
    operationHandle(nodeName,operation){
      if(operation == 'delete'){
        this.nodeDelete(nodeName);
      }else if(operation == 'shutDown'){
        this.powerOff(nodeName);
      }else if(operation == 'restart'){
        this.powerReset(nodeName);
      }
    },

    // 获取资源
    getHistory(id,key_,limit) {
      // var  myChart = echarts.init(document.getElementById('myChart1'));
      //       myChart.setOption(this.options);
      this.$axios
        // .get('http://rap2api.taobao.org/app/mock/2311//api/monitor/cluster/item')
        .get(`/api/monitor/node/history?keys=${key_}&hostname=${this.nodeName}-zabbix-agent&limit=${limit}`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            const  memHistory =data.item;
                     
            this.options={
                title: {
                    text:this.$t('m.node.'+key_),
                    textStyle:{
                        color:'#555555',
                        fontSize:16,
                      }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    y:'bottom',
                    data: memHistory.legend
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: 30,
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        // saveAsImage: {} // 保存为图
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: memHistory.data
                },
                yAxis: {
                    type: 'value'
                },
                series: memHistory.series
            }
            var  myChart = echarts.init(document.getElementById(id));
            myChart.setOption(this.options);
           
          }else{
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }
        })
        }
     }
};
</script>

<style  lang="less" scoped>
main {
  display: flex;
  padding: 0;
}
/* 动画开始前 和 动画结束后的状态 */
.v-enter,
.v-leave-to {
  transform: translateX(-200px);
}

/* 进场和离场的动画效果 */
.v-enter-active,
.v-leave-active {
  transition: all 0.4s ease;
}
// 只在 detail 页面显示的样式

// 确认删除框显示/隐藏过渡
// 动画效果
// 动画效果
.deleteTransition-enter-active, .deleteTransition-leave-active {
  transition: all 0.4s;
}
// 进场，　出场状态
.deleteTransition-enter, .deleteTransition-leave-to {
  opacity: 0;
}

.nodedetail-content {
  flex-grow: 1;
  flex-shrink: 1;
  margin-left:20px;
  margin-top: 10px;
}
// header .pagename {
//   background-color: #fff;
//   color: #999;
// }
.control {
  width: 100%;
  background-color: #ffffff;
  border-radius: 5px;
  padding: 15px;
  > div {
    background-color: black;
    border-radius: 5px;
    height: 400px;
  }
}
.log {
  background-color: #fff;
  padding-bottom: 15px;
  form {
    padding: 20px 15px;
    box-shadow: 0 3px 2px #aaaaaa;
    margin-bottom: 30px;
  }
  input,
  select {
    width: 200px;
    height: 34px;
    margin: 8px 15px 8px 0;
    border-radius: 2px;
    border: 1px solid #cccccc;
  }
  div.log-info {
    height: 400px;
    background-color: black;
    border-radius: 5px;
    margin: 20px 15px 15px 15px;
  }
}
.resource {
  min-width: 900px;
  > div.resource-item {
    display: flex;
    margin-bottom: 15px;     
    > div{
      background-color: #fff;
      padding: 10px;
    }
    > div:first-child {
      // margin-right: 15px;
    }
  }
  img {
    border-radius: 5px;
  }
}
.server-status {
  > div.server-status-item {
    background-color: #fff;
    display: flex;
    align-items: center;
    width: 100%;
    border-bottom: 1px solid #dddddd;
    padding: 15px;
    line-height: 26px;
    div.title {
      flex-basis: 33%;
      padding-left: 10px;
      // text-align: center;
      // min-width: 200px;
      // font-size: 16px;
      // font-weight: 400;
    }
    dl.info {
      flex-basis: 66%;
     // flex-grow: 1;
      display: flex;
      justify-content: space-around;
      // flex-direction: column;
      > div{
        width: 50%;
      }
    }
  }
}
section.nav-detail {
  width: 340px;
  flex-grow: 0;
  flex-shrink: 0;
  padding: 0;
  margin: 0;
  line-height: 30px;
  border-right: 1px solid #cccccc;
}
div.detail-name {
  background-color: #1a99a5;
  padding: 20px 0 20px 18px;
  margin-top: 0;
  color: #fff;
  div{
    p {
      display: inline-block;
      margin-right: 25px;
      padding:0 20px 0 0;
      margin: 0;
    }
  }
  // table {
  //   font-size: 13px;
  //   border-collapse: collapse;
  //   tr > td:nth-child(3) {
  //     text-align: right;
  //   }
  //   tr > td:nth-child(2) {
  //     padding-right: 10px;
  //   }
  //   td {
  //     border:1px solid red;
  //   }
  // }
  svg {
    color: #fff;
  }
}
div.detail-info {
  padding: 20px;
  background-color: #eeeeee;
  line-height: 20px;
  table {
    width: 100%;   
    border-collapse: collapse;
    color:#666;
    tr:nth-child(2) {
      td {
        padding-bottom:10px;
      }
    }
    td {
      // text-align: center;
      padding: 0px 0;
      width: 25%;
      vertical-align: top;
      
    }
  }
  
  // > div {
  //   display: flex;
  //   justify-content: space-around;
  // }
  svg.icon {
    width: 2.7em;
    height: 2.7em;
    color: #666666;
  }
}
div.detail-other {
  // border-top: 1px solid #cccccc;
  margin: 10px 40px 10px 20px;
  background-color: #fff;
  position: relative;
  h3 {
    font-weight: bold;
    margin-bottom: 0;
  }
  ul {
    // margin-left: 20px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-left: 20px;
    li {
      line-height: 30px;
      // flex-basis: 50%;
      padding: 10px 0;
      cursor: pointer;
    }
  }
  .delete-message {
    background-color: #fff;
    padding: 20px;
    border: 1px solid #dddddd;
    box-shadow: 3px 3px 3px #dddddd;
    position: absolute;
    top: -135px;
    left: 10px;
    border-radius: 5px;
    // min-width: 180px;
    z-index: 2;
  }
}
.el-dialog__body > div:nth-child(1) {
  text-align: center;
}
.result-message {
  z-index: 12;
  width: 400px;
  position: absolute;
  left: 2px;
  top: 200px;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  box-shadow: 0px 0px 6px #dddddd;
  display: inline-block;
  padding: 10px 15px;
  background-color: rgba(255, 255, 255, 1);
  font-size: 14px;
  .title {
    font-weight: 600;
    border-bottom: 1px solid #cccccc;
    text-align: left;
  }
  .tip {
    color: #be3816;
  }
  .body {
    margin: 15px 0;
    p {
      margin: 0;
      padding: 0;
    }
    p:nth-child(2) {
      color: #999;
    }
  }
  .dialog-footer {
    text-align: right;
  }
}
.per-list-wrap {
  margin: 0 20px;
  h3 {
    margin-bottom: 0;
    font-weight: bold;
  }
  .per-list {
    display: flex;    
    ul {
      width: 60px;
      font-size: 13px;
      color: #666666;
    }
    ul:first-child {
      text-align: right;
      padding-right: 5px;
    }
    > div {
      flex-grow: 1;
      margin-right: 5px;
      > div{
        line-height: 30px;
        padding:12px 0;
      }
    }        
  }


}
// .el-popper[x-placement^="bottom"] .popper__arrow {
//   display: none;
// }
.item-div {
  width:48%;
  margin-right:15px;
  position:relative;
  height:340px;
  .select-wrap {
    position:absolute;
    top:10px; 
    right:20px; 
    z-index:2;  
  }
}


</style>

