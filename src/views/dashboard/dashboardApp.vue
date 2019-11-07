<template>    
    <main>
      <section class="dash-board" style="background-color: #f1f1f1;">

        <div>
            <el-title type="text" icon >{{$t('m.dashboard.cluster')}}</el-title>
          <div id='myChart1' style='width:100%;height:120px;'></div>          
        </div>

        <div>
            <el-title type="text" icon >{{$t('m.dashboard.node')}}</el-title>
          <el-button type="text" icon="el-icon-view"  @click="moveDialogVisible=true;">{{$t('m.view')}}</el-button>
          <div id='myChart3' style='width:100%;height:240px;'></div>
        </div>

        <div>
            <el-title type="text">{{$t('m.dashboard.namespace')}}</el-title>
          <el-button type="text" icon="el-icon-view"  @click="moveDialogVisible1=true;">{{$t('m.view')}}</el-button>
          <div id='myChart2' style='width:100%;height:240px;'></div>
        </div>          
					  
      </section>

      <el-dialog class="tree-dialog" width="90%" :visible.sync="moveDialogVisible" center>
        <NodeDetail></NodeDetail>
      </el-dialog>

      <el-dialog class="tree-dialog" width="90%" :visible.sync="moveDialogVisible1" center>
        <NamespaceDetail></NamespaceDetail>
      </el-dialog>

   
    </main>
</template>

<script>

import Lib from "../../assets/js/Lib.js";
import gateone from '../../assets/js/gateone.js'
import com from "../../assets/js/common.js";

import echarts from 'echarts';
import NodeDetail from './NodeDetail.vue'
import NamespaceDetail from './NamespaceDetail.vue'
export default {
  components: {
    NodeDetail,
    NamespaceDetail
  },
  data() {
      return{
          moveDialogVisible: false, // 移动到/赋值到 对话框
          moveDialogVisible1: false, // 移动到/赋值到 对话框
          startFrom:'',
          allZones:[],
    };
  },
   beforeCreate(){
    this.$i18n.locale = localStorage.getItem("locale"); 
  },
  created() {
      this.getZones();
     
  },
  mounted(){
  },
  beforeDestory(){},
  methods: {

 // 切换语言
    changeLang() {
      this.$i18n.locale = localStorage.getItem("locale"); 
      this.startFrom = new Date();
      this.startFrom = this.startFrom.getFullYear() + '-'+(this.startFrom.getMonth()/1+1)+'-'+this.startFrom.getDate()+'T00:00:00Z';

    },  

      buildGauge(naemVal,centerVal,dataVal){
          return  {
            name: naemVal,
            type: 'gauge',
            detail: {formatter:'{value}%',fontSize:'12'},
            center: centerVal,    // 默认全局居中
            radius: '80%',
            data: [{value: dataVal}],
             axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    width: 8
                }
						},
						splitLine: {           // 分隔线
                length: 15,         // 属性length控制线长
                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                    color: 'auto'
                }
            },
             axisLabel: {
                formatter:function(v){
                    switch (v + '') {
                        case '50' : return naemVal;
                    }
                }
            },
            axisTick: {            // 坐标轴小标记
                splitNumber: 5,
                length: 10,        // 属性length控制线长
                lineStyle: {        // 属性lineStyle控制线条样式
                    color: 'auto'
                }
            },
            title : {
                // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                fontWeight: 'bolder',
                fontSize: 8,
            },
             pointer: {
                width:2
            },
        };
      },
      buildContainerPie(running,scheduled,terminated,paused){
          return {
            name:this.$t('m.dashboard.job'),
            id:'job',
            type:'pie',
            center: ['90%', '48.5%'],   
            radius: ['40%', '60%'],
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: true,
                    // position: 'center'
                },
                emphasis: {
                    show: true,
                    textStyle: {
                        fontSize: '10',
                        fontWeight: 'bold'
                    }
                }
            },
            labelLine: {
                normal: {
                    show: true
                }
            },
            data:[
                {value:running, name:this.$t('m.dashboard.running')},
                {value:scheduled, name:this.$t('m.dashboard.scheduled')},
                {value:terminated, name:this.$t('m.dashboard.terminated')},
                {value:paused, name:this.$t('m.dashboard.paused')}  
            ]
        }
      },


    getSummary(){
         this.startFrom = new Date();
      this.startFrom = this.startFrom.getFullYear() + '-'+(this.startFrom.getMonth()/1+1)+'-'+this.startFrom.getDate()+'T00:00:00Z';
        // return  this.$axios.get(`/api/job/jobs/summary?startFrom=${time}`);
        return  this.$axios.get(Lib.API().dashboard.summery1+`?startFrom=${this.startFrom}`);                          
    },
    getVolumes(){
        // return  this.$axios.get('/api/storage/volumes');
        return  this.$axios.get(Lib.API().dashboard.volumes);
    },
    getClusterInfo(){
        // return  this.$axios.get('/api/monitor/cluster/item?keys=dashboardClusterInfo');
        return  this.$axios.get(Lib.API().dashboard.cluesterInfo);
    },
    getNodesInfo(){
        // return  this.$axios.get('/api/monitor/cluster/item?keys=dashboardNodesInfo');
        return  this.$axios.get(Lib.API().dashboard.nodesInfo);
    },
    getNamespaceInfo(){
        var zones=[];
        for(var i=0;i<this.allZones.length;i++){
            zones.push({"name":this.allZones[i].name,"cpu":this.allZones[i].quotas.CPU,"gpu":this.allZones[i].quotas.GPU});
        }
        var namespaces=encodeURI(JSON.stringify(zones));
        // return  this.$axios.get('/api/monitor/cluster/item?keys=dashboardNamespaceInfo');
        return  this.$axios.get(Lib.API(namespaces).dashboard.nameSpaceInfo);
    },
    
    getZones(){
         this.$axios.get(Lib.API().zone.getZoneList)
      .then(res => {
        const data = res.data;
        if (data.success) {   
          this.allZones=data.results;
            this.bindData();
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loading = false;
      });
    },

        getMiB(numStr){
            var nums=numStr.split(" ");
            if(nums[1]=='GB'){
                return parseFloat(nums[0])*1000;
            }else{
                return parseFloat(nums[0]);
            }
        },
        bindData(){
            this.total = {};
            this.list = [];

            this.captials=[];
            this.captials_total=0;
            this.captials_allocate=0;
            this.captials_pct=0;

            this.$axios.all([this.getSummary(),
                            this.getVolumes(),
                            this.getClusterInfo(),
                            this.getNodesInfo(),
                            this.getNamespaceInfo()])
                .then(this.$axios.spread(( summary,
                                        volumes ,
                                        clusterInfo,
                                        nodesInfo ,
                                        namespaceInfo)=>{
                    //summary
                    this.total = summary.data.total;
                     var namespaceSummery=[];
                    namespaceSummery.push(["product","cpu_use","mem_usage","gpu_use"]);

                    this.list.push(['product', 'job_running','job_scheduled' ,'job_terminated','job_paused']);
                    console.log(this.allZones);
                    //循環分區列表
                    for (let i = 0; i < this.allZones.length; i++) {
                        var flag=true;
                        //循環任務統計中的分區
                        summary.data.items.forEach(element => {
                            //如果任務統計中存在該分區
                            if(element.Name===this.allZones[i].name){
                                this.list.push([element.Name,element.Running,element.Scheduled,element.Terminated,element.Paused]);
                                if(namespaceInfo.data.namespaceInfo[element.Name]!=null){
                                    namespaceSummery.push(namespaceInfo.data.namespaceInfo[element.Name]);
                                } else{
                                    namespaceSummery.push([element.Name,0,0,0]);
                                } 
                                flag=false;
                            }
                        });
                        if(flag){
                            this.list.push([this.allZones[i].name,0,0,0,0]);
                            namespaceSummery.push([this.allZones[i].name,0,0,0]);
                        }
                    }
                
                    //volumes
                    this.captials.push(['product', 'captial_use','captial_free']);
                    volumes.data.volumeInfos.forEach(element => {

                        var unallocate=this.getMiB(element.unallocatedSpace);
                        var allocate=this.getMiB(element.totalSpace)-unallocate;
                        this.captials_total+=unallocate;
                        this.captials_total+=allocate;
                        this.captials_allocate+=allocate;
                        this.captials.push([element.volumeName,allocate,unallocate]);    
                    });
                    // console.log(this.captials);
                    if(this.captials_total!=0){
                        this.captials_pct=(this.captials_allocate/this.captials_total*100).toFixed(2);
                    }
                    //clusterInfo
                    this.options = {
                        tooltip : {
                            formatter: "{a}</br>{b} : {c}"
                        },
                        toolbox: {
                            feature: {
                                // restore: {},
                                // saveAsImage: {}
                            }
                        },
                        title: [ {
                            subtext: this.$t('m.dashboard.job'),
                            top:'38',
                            left: '90.6%',
                            textAlign: 'right',
                            subtextStyle:{
                                color:'#63869d'
                            }
                        }],
                        legend: {
                            id:'job',
                            top: 150,
                            left: 'right',
                            data: ['success', 'run','fail']
                        },
                        series: [
                            this.buildGauge('cpu',['10%', '50%'],clusterInfo.data.clusterInfo===null?0:clusterInfo.data.clusterInfo.cpuUsed),
                            this.buildGauge(this.$t('m.dashboard.mem'),['30%', '50%'],clusterInfo.data.clusterInfo===null?0:clusterInfo.data.clusterInfo.memUsed),
                            this.buildGauge('gpu',['50%', '50%'],clusterInfo.data.clusterInfo===null?0:clusterInfo.data.clusterInfo.gpuUsed),
                            this.buildGauge(this.$t('m.dashboard.capitial'),['70%', '50%'],this.captials_pct),
                            this.buildContainerPie(this.total.Running,this.total.Scheduled,this.total.Terminated,this.total.Paused),
                        ]
                    };
                    var  myChart = echarts.init(document.getElementById('myChart1'));
                    myChart.setOption(this.options);

                    //nodesInfo
                    this.option3 = {
                title: [{
                    text: 'cpu(%)',
                    right:'78%',left:'4%',top: '8%'
                }, {
                    text: this.$t('m.dashboard.mem')+'(Mib)',
                right:'52%',left:'24%',top: '8%'
                }, {
                    text: 'gpu(Mib)',
                    right:'26%',left:'44%',top: '8%'
                }, {
                    text: this.$t('m.dashboard.net')+'(bps)',
                    right:'2%',left:'64%',top: '8%'
                }, {
                    text: this.$t('m.dashboard.docker')+'('+this.$t('m.dashboard.number')+')',
                    right:'2%',left:'84%',top: '8%'
                }],
                // legend: {},
                tooltip: {},
                dataset: {
                    source: nodesInfo.data.nodesInfo
                },
                yAxis: [
                    {type: 'category', gridIndex: 0},
                    {type: 'category', gridIndex: 1},
                    {type: 'category', gridIndex: 2},
                    {type: 'category', gridIndex: 3},
                    {type: 'category', gridIndex: 4}

                ],
                xAxis: [
                    {gridIndex:0},
                    {gridIndex: 1},
                    {gridIndex:2},
                    {gridIndex: 3},
                    {gridIndex: 4}
                ],
                grid: [
                    {right:'96%',left:'16%',bottom: '10%'},
                    {right:'76%',left:'36%',bottom: '10%'},
                    {right:'56%',left:'56%',bottom: '10%'},
                    {right:'36%',left:'76%',bottom: '10%'},
                    {right:'16%',left:'96%',bottom: '10%'}
                ], 
                barMaxWidth:'25px',
                series: [
                    {type: 'bar', xAxisIndex: 0, yAxisIndex: 0, encode:{y:'product',x:'cpu_use'}, stack: '总量',name:"cpu_use"},
                
                    {type: 'bar', xAxisIndex: 1, yAxisIndex: 1, encode:{y:'product',x:'mem_use'},stack: '总量1',name:"mem_use"},
                    {type: 'bar', xAxisIndex: 1, yAxisIndex: 1, encode:{y:'product',x:'men_free'},stack: '总量1',name:"men_free"},
                    
                    {type: 'bar', xAxisIndex: 2, yAxisIndex: 2, encode:{y:'product',x:'gpu_use'},stack: '总量2',name:"gpu_use"},
                    {type: 'bar', xAxisIndex: 2, yAxisIndex: 2, encode:{y:'product',x:'gpu_free'},stack: '总量2',name:"gpu_free"},

                    {type: 'bar', xAxisIndex: 3, yAxisIndex: 3, encode:{y:'product',x:'net_in'},stack: '总量3',name:"net_in"},
                    {type: 'bar', xAxisIndex: 3, yAxisIndex: 3, encode:{y:'product',x:'net_out'},stack: '总量3',name:"net_out"},
                    
                    {type: 'bar', xAxisIndex: 4, yAxisIndex: 4, encode:{y:'product',x:'docker_running'},stack: '总量4',name:"docker_running"},
                    {type: 'bar', xAxisIndex: 4, yAxisIndex: 4, encode:{y:'product',x:'docker_waiting'},stack: '总量4',name:"docker_waiting"},
                    {type: 'bar', xAxisIndex: 4, yAxisIndex: 4, encode:{y:'product',x:'docker_terminated'},stack: '总量4',name:"docker_terminated"},
                
                ],
                color:['#91c7ae','#91c7ae','#D3D3D3','#91c7ae','#D3D3D3','#91c7ae','#D3D3D3','#91c7ae','#c23531','#D3D3D3']
            };
            var DivChart3 = document.getElementById('myChart3');
            if((this.option3.dataset.source.length-1)*15+40 > parseInt(getComputedStyle(DivChart3).height)){
              DivChart3.style.height = ((this.option3.dataset.source.length-1)*15+40) + 'px'
            }
            var  myChart3 = echarts.init(DivChart3);
            myChart3.setOption(this.option3);

            //namespaceInfo
            this.option1 = {
                    title: [{
                        text: 'cpu(%)',
                        right:'78%',left:'4%',top: '8%'
                    }, {
                        text: this.$t('m.dashboard.mem')+'(Mib)',
                    right:'52%',left:'24%',top: '8%'
                    }, {
                        text: 'gpu(Mib)',
                        right:'26%',left:'44%',top: '8%'
                    }, {
                        text: this.$t('m.dashboard.capitial')+'(Mib)',
                        right:'2%',left:'64%',top: '8%'
                    }, {
                        text: this.$t('m.dashboard.job')+'('+this.$t('m.dashboard.number')+')',
                        right:'98%',left:'84%',top: '8%'
                    }],
                    // legend: {},
                    tooltip: {},
                    dataset: 
                    [{
                        source: namespaceSummery
                    },{
                        source: this.captials
    
                    },{
                        source: this.list
    
                    }],
                    yAxis: [
                        {type: 'category', gridIndex: 0},
                        {type: 'category', gridIndex: 1},
                        {type: 'category', gridIndex: 2},
                        {type: 'category', gridIndex: 3},
                        {type: 'category', gridIndex: 4}

                    ],
                    xAxis: [
                        {gridIndex:0},
                        {gridIndex: 1},
                        {gridIndex:2},
                        {gridIndex: 3},
                        {gridIndex: 4}
                    ],
                    grid: [
                        {right:'96%',left:'16%',bottom: '15%'},
                        {right:'76%',left:'36%',bottom: '15%'},
                        {right:'56%',left:'56%',bottom: '15%'},
                        {right:'36%',left:'76%',bottom: '15%'},
                        {right:'16%',left:'96%',bottom: '15%'}
                    ],
                    barMaxWidth:'25px',
                    series: [
                        {type: 'bar', datasetIndex:0,encode:{y:'product',x:'cpu_use'}, stack: '总量',name:"cpu_use"},
                    
                        {type: 'bar', datasetIndex:0,xAxisIndex: 1, yAxisIndex: 1, encode:{y:'product',x:'mem_usage'},stack: '总量1',name:"mem_usage"},
                        
                        {type: 'bar', datasetIndex:0,xAxisIndex: 2, yAxisIndex: 2, encode:{y:'product',x:'gpu_use'},stack: '总量2',name:"gpu_use"},

                        {type: 'bar', datasetIndex:1,xAxisIndex: 3, yAxisIndex: 3, encode:{y:'product',x:'captial_use'},stack: '总量3',name:"captial_use"},
                        {type: 'bar', datasetIndex:1,xAxisIndex: 3, yAxisIndex: 3, encode:{y:'product',x:'captial_free'},stack: '总量3',name:"captial_free"},

                        {type: 'bar', datasetIndex:2,xAxisIndex: 4, yAxisIndex: 4, encode:{y:'product',x:'job_running'},stack: '总量4',name:"job_running"},
                        {type: 'bar', datasetIndex:2,xAxisIndex: 4, yAxisIndex: 4, encode:{y:'product',x:'job_scheduled'},stack: '总量4',name:"job_scheduled"},
                        {type: 'bar', datasetIndex:2,xAxisIndex: 4, yAxisIndex: 4, encode:{y:'product',x:'job_terminated'},stack: '总量4',name:"job_terminated"},
                        {type: 'bar', datasetIndex:2,xAxisIndex: 4, yAxisIndex: 4, encode:{y:'product',x:'job_paused'},stack: '总量4',name:"job_paused"},

                    ],
                    color:['#91c7ae','#91c7ae','#91c7ae','#91c7ae','#D3D3D3','#91c7ae','#FFEC8B','#c23531','#D3D3D3']

                };
              var DivChart2 = document.getElementById('myChart2');
            if((this.option1.dataset[0].source.length-1)*15+40 > parseInt(getComputedStyle(DivChart2).height)){
                DivChart2.style.height = ((this.option1.dataset[0].source.length-1)*15+40) + 'px'
            }
            var  myChart2 = echarts.init(DivChart2);
            myChart2.setOption(this.option1);

                })) 
        }
  }

};
</script>

<style lang="less" scoped>
section.dash-board {
  > div {
    background-color: #fff;
    margin-bottom: 10px;
    border-radius: 5px;
    box-shadow: 2px 2px 2px #cccccc;
    position: relative;
    padding: 25px 10px;
  }
  button{
    position: absolute;
    top: 5px;
    right: 30px; 
    z-index: 2;
    &:hover{
      text-decoration: underline #91c7ae;
    }
  }
  title{
    position: absolute;
    top: 5px;
    left: 30px; 
    z-index: 2;
    &:hover{
      text-decoration: underline #91c7ae;
    }
  }
}
</style>

