<template>

<div  v-loading="loading" :element-loading-text="$t('m.loading')">
    <div style="text-align:right">
        <el-form :inline="true" :model="updateForm"  ref="updateForm" class="outer-dialog-form" >
            <el-form-item :label="$t('m.node.nodeName')"  prop="tag">
              <el-select v-model="updateForm.allNodes1" multiple placeholder="请选择">
                <el-option
                  v-for="item in updateForm.allNodes"
                  :key="item.nodeName"
                  :label="item.nodeName"
                  :value="item.nodeName">
                </el-option>
              </el-select>
            </el-form-item>
            <el-button type="primary" @click="createPage('updateForm')">{{$t('m.confirm')}}</el-button>
          </el-form>
    </div>
      <div v-for="(value,key,index) in nodeDockerInfo" :key="index" class="echarts-wrap">
        <div class="left">
          <ul class="overview">
            <li>IP:{{nodeConfigs[key].ip}}</li>
              <!-- item.statustime 字符串，单位 毫秒数， new Date() 毫秒 -->
            <li>{{$t('m.node.runTime')}}：{{ (new Date()-nodeConfigs[key].statustime)/1000 | statustime }}
            </li>
            <li>
              {{$t('m.node.serviceStatus')}}：
              <span v-if="nodeConfigs[key].healthStatus===1">
                <i class="el-icon-circle-check good"></i>
              </span>
              <span v-else>
                <i class="el-icon-warning warning"></i>
            　 </span>
            </li>
            <li>
              {{$t('m.node.healthStatus')}}：
              <span v-if="nodeConfigs[key].serviceStatus===1">
                <i class="el-icon-circle-check good"></i>
              </span>
              <span v-else>
                <i class="el-icon-warning warning"></i>
              </span>
            </li>
          </ul>
          <ul class="progress">
            <li>
              <span>GPU</span>
              <el-progress type="circle" :percentage="nodeUsedPer[key]['GPU Used']" color="#000000" :width="70" :stroke-width="4"></el-progress>
              <span>{{$t('m.zone.quota')}}：{{nodeConfigs[key].gpucount==''?0:nodeConfigs[key].gpucount}}</span>
              <span>used: {{nodeInfos[key].gpu_use}}MB</span>
            </li>
            <li>
              <span>CPU</span>
              <el-progress type="circle" :percentage="nodeUsedPer[key]['CPU Used']" :width="70" :stroke-width="4"></el-progress>
              <span>{{$t('m.zone.quota')}}：{{nodeConfigs[key].cpucount}}</span>
              <span>used: {{nodeInfos[key].cpu_use}}%</span>
            </li>
            <li>
              <span>{{$t('m.memory')}}</span>
              <el-progress type="circle" :percentage="nodeUsedPer[key]['Mem Used']" :width="70" :stroke-width="4"></el-progress>
              <span>{{$t('m.zone.quota')}}：{{parseInt(nodeConfigs[key].memory)}}{{nodeConfigs[key].memory | memoryUnit}}</span>
              <span>used: {{nodeInfos[key].mem_use}}MB</span>

            </li>

          </ul>

          <table :id="key+'container'">
            <thead>
              <tr>
                <th>{{$t('m.dashboard.dockerName')}}</th>
                <th>{{$t('m.dashboard.cpuPct')}}</th>
                <th>{{$t('m.dashboard.memUse')}}</th>
                <th>{{$t('m.dashboard.startTime')}}</th>
              </tr>
            </thead>
            <tbody v-if="value">
              <tr v-for="(item,i) in value" :key="i">
                <td :title="item.name">{{item.name}}</td>
                <td :title="item.cpu.usage.node.pct">{{(item.cpu.usage.node.pct*100).toFixed(4)}} %</td>
                <td :title="item.memory.usage.bytes">{{(item.memory.usage.bytes/1024/1024).toFixed(2)}}Mib</td>
                <td :title="item.start_time">{{item.start_time|toDate()}}</td>
              </tr>
            </tbody>
          </table>

        </div>

        <div class="right" :id="key"></div>
      </div>
  </div>
</template>
<script>
import Lib from "../../assets/js/Lib.js";
import echarts from "echarts";

export default {
  components: {},
  data() {
    return {
      loading: false, // 
      nodeDockerInfo: {},
      nodesHistory:{},
      nodeUsedPer: {},
      nodeConfigs:{},
      nodeInfos:{},
      standaloneOrCluster:'',
      updateForm: {
        allNodes:{},
        allNodes1:{},
      },
    };
  },
  created() {
    // this.bindData2();
    this.getAllNodes();
    this.standaloneOrCluster = localStorage.getItem('standaloneOrCluster');
  },

  beforeDestory() {},

  methods: {
      
        getNodesInfo2(nodes){
          return  this.$axios.get(Lib.API(nodes).dashboard.nodesInfoByNode);
        },

        getNodeDockerInfo(nodes){
          return  this.$axios.get(Lib.API(nodes).dashboard.nodesDockerInfo);
        },
         
        getNodesHistory(nodes){
          return  this.$axios.get(Lib.API(nodes).dashboard.nodesHistory);
        },


    bindData2(nodes){

      this.twooption3 = {
        title: {
          text: "",
          left: "5%",
          padding: 0
        },
        legend: { left: "25%" },
        tooltip: { trigger: "axis" },
        dataset: {
          source: []
        },
        xAxis: [
          { type: "category", gridIndex: 0, boundaryGap: false, show: false },
          { type: "category", gridIndex: 1, boundaryGap: false, show: false },
          { type: "category", gridIndex: 2, boundaryGap: false, show: false },
          { type: "category", gridIndex: 3, boundaryGap: false, show: false },
          { type: "category", gridIndex: 4, boundaryGap: false, show: false }
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
              show: true
            },
            axisLabel: {
              show: true
            }
          },
          {
            gridIndex: 1,
            name: this.$t('m.dashboard.mem')+" (MiB)",
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
            name: "gpu (MiB)",
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
            gridIndex: 3,
            name: this.$t('m.dashboard.net')+" (bps)",
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
          { top: "14%", left: "10%", right: "1%", bottom: "71%" },
          { top: "37%", left: "10%", right: "1%", bottom: "48%" },
          { top: "60%", left: "10%", right: "1%", bottom: "25%" },
          { top: "83%", left: "10%", right: "1%", bottom: "2%" }
          // { top: "82%", left: "10%", right: "1%", bottom: "3%" }
        ],
        series: [
          // These series are in the first grid.
          {
            type: "line",
            stack: "cpu",
            seriesLayoutBy: "row",
            symbolSize: "0"
          },
          // These series are in the second grid.
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
            xAxisIndex: 2,
            yAxisIndex: 2,
            stack: "gpu",
            seriesLayoutBy: "row",
            symbolSize: "0"
          },

          {
            type: "line",
            xAxisIndex: 3,
            yAxisIndex: 3,
            stack: "net",
            seriesLayoutBy: "row",
            symbolSize: "0"
          },

          {
            type: "line",
            xAxisIndex: 3,
            yAxisIndex: 3,
            stack: "net",
            seriesLayoutBy: "row",
            symbolSize: "0"
          }
        ]
      };

        var nodelist=[];
        var nodes=[];
         for(var k=0;k<this.updateForm.allNodes.length;k++){
                for(var i=0;i<this.updateForm.allNodes1.length;i++){
                    if(this.updateForm.allNodes[k].nodeName===this.updateForm.allNodes1[i]){
                        
                        nodelist.push(this.updateForm.allNodes[k]);
                        nodes.push({"name":this.updateForm.allNodes1[i]})
                    }
                }
            }
            
            if(nodes.length>0){//选中了一个或多个节点
              nodes=encodeURI(JSON.stringify(nodes));
           this.$axios.all([
                            this.getNodesInfo2(nodes),
                            this.getNodeDockerInfo(nodes),
                            this.getNodesHistory(nodes)])
                .then(this.$axios.spread((
                                        infos ,
                                        dockers,
                                        history)=>{
                //获取容器信息，以节点分组
                var dockers=dockers.data.nodeDockerInfo;
                this.nodeDockerInfo={};
                this.nodeConfigs={};

                //获取节点列表（ip,配额等）
                nodelist.forEach((element,index) => {

                  //如果是单机版
                  if('master'===element.nodeName){
                    this.nodeConfigs['admin.cluster.local']=element;
                    if(this.nodeDockerInfo['master']==null&&this.nodeDockerInfo['admin.cluster.local']==null){
                      this.nodeDockerInfo['admin.cluster.local']=[];
                    }
                  }else{
                 

                    this.nodeConfigs[element.nodeName]=element;
                    if(!dockers[element.nodeName]){
                      this.$set(this.nodeDockerInfo,element.nodeName,[]);

                      // this.nodeDockerInfo[element.nodeName]=[];
                    }else{
                      this.$set(this.nodeDockerInfo ,element.nodeName,dockers[element.nodeName]);
                    }
                  }
                });


                //获取所有的节点的实时监控数据
                //infos
                infos.data.nodesInfo.forEach((element,index) => {
                  if(index>0){
                        var nodeItem={"cpu_use":element[1].toFixed(2),"mem_use":element[2],"men_free":element[3],"gpu_use":element[4],"gpu_free":element[5],"net_in":element[6],"net_out":element[7]};
                        
                      this.$set(this.nodeInfos,element[0],nodeItem);
                      this.$set(this.nodeUsedPer,element[0],{});
                      
                      if(element[5]===0){
                        this.$set(this.nodeUsedPer[element[0]],'GPU Used',0);
                      }else{
                        this.$set(this.nodeUsedPer[element[0]],'GPU Used',(element[4]/(element[4]+element[5])*100).toFixed(2));
                      }
                      this.$set(this.nodeUsedPer[element[0]],'CPU Used',element[1].toFixed(2));
                      this.$set(this.nodeUsedPer[element[0]],'Mem Used',(element[2]/(element[2]+element[3])*100).toFixed(2));
                    } 
                });
                //history
                this.nodesHistory=history.data.nodesHistory;
                this.$nextTick(function() {
                  for (var prop in this.nodeConfigs) {
                    this.twooption3.title.text = prop;
                    
                    if(this.nodesHistory[prop]){
                      this.twooption3.dataset.source = this.nodesHistory[prop];
                    }else{
                        this.twooption3.dataset.source = [];
                    }
                    var myChart3 = echarts.init(document.getElementById(prop));
                    myChart3.setOption(this.twooption3);
                  }
                  this.loading = false;
                });
      }))
            }else{//没有选中节点
               this.nodeDockerInfo={};
                this.nodeConfigs={};
              this.loading = false;
            }
          
    },
    getAllNodes(){
      this.$axios
      .get(Lib.API().dashboard.nodes+`?keyWord=&nodeFlag=&gpucount=&cpucount=&pageNum=1&pageSize=100`)
      .then(res => {
        const data = res.data;
        if (data.success) {   
          this.updateForm.allNodes=data.results;
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loading = false;
      });
    },
    createPage(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if(this.updateForm.allNodes1.length > 3){
            this.$message({          
                showClose: true,
                message: this.$t('m.image.makeNotExceed3'),
                type: "warning",
                duration: Lib.Common.messageDuration              
            });
            return false;
          }
          this.loading = true;
          this.bindData2(this.updateForm.allNodes1);
        } else {
          return false;
        }
      });
    },

  }
};
</script>
<style lang="less" scoped>
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
    flex-direction: column;
    // margin-top: 26px;

    ul.overview {
      background-color: #f9f9f9;
      padding: 5px;
      margin-bottom: 5px;
      li {
        display: inline-block;
        padding-right: 20px;
      }
    }

    ul.progress {
      display: flex;
      margin: 10px 0;
      justify-content: space-around;
      li {
        display: block;
        text-align: center;
        > span {
          display: block;
        }
      }
    }

    p {
      border: 1px solid #ddd;
    }

    width: 39%;

    table {
      width: 100%;
      margin-top: 12px;
      th,
      td {
        text-align: left;
        word-break: break-all;
        border-bottom: 1px solid #ddd;
        padding: 2px 0 2px 10px;
        font-size: 13px;
      }
      th {
        border-top: 1px solid #ddd;
      }
      th:last-child {
        padding-right: 8px;
      }

      tr:last-child {
        border-bottom: none;
      }

      tr {
        display: flex;
      }

      th:nth-child(4),
      td:nth-child(4) {
        flex-grow: 1;
      }

      th:nth-child(1),
      td:nth-child(1) {
        flex-basis: 140px;
        padding-left:20px;
      }

      th:nth-child(2),
      td:nth-child(2) {
        flex-basis: 130px;
      }

      th:nth-child(3),
      td:nth-child(3) {
        flex-basis: 130px;
      }

      thead {
        display: block;
      }

      tbody {
        display: block;
        max-height: 200px;
        overflow-y: auto;
      }
    }
  }

  div.right {
    width: 1000px;
    height: 450px;
    flex-basis: 60%;
  }
}

</style>

