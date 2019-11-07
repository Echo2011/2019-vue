<template>
    <div  v-loading="loading" :element-loading-text="$t('m.loading')">
        <div style="text-align:right">
            <el-form :inline="true" :model="updateForm"  ref="updateForm" class="outer-dialog-form">
                <el-form-item :label="$t('m.zone.name')"  prop="tag">
                <el-select v-model="updateForm.allZones1" multiple placeholder="请选择">
                    <el-option
                    v-for="item in updateForm.allZones"
                    :key="item.name"
                    :label="item.name"
                    :value="item.name">
                    </el-option>
                </el-select>
                </el-form-item>
                <el-button type="primary" @click="createPage('updateForm')">{{$t('m.confirm')}}</el-button>
            </el-form>
        </div>
        <div v-for="(value,key,index) in namespaceDockerInfo" :key="index" class="echarts-wrap">
            <div class="left">
                <ul class="progress" v-if="zones[key].name">
                    <li>           
                        <el-progress type="circle" :percentage="Number(zones[key].utilization.GPU)"  width=70 :stroke-width="4"></el-progress>
                        <span>GPU <span>{{$t('m.zone.quota')}}{{zones[key].quotas.GPU}}</span></span>
                    </li>
                    <li>           
                        <el-progress type="circle" :percentage="Number(zones[key].utilization.CPU)" width=70 :stroke-width="4"></el-progress>
                        <span>CPU <span>{{$t('m.zone.quota')}}{{zones[key].quotas.CPU}}</span></span>
                    </li>
                    <li>             
                        <el-progress type="circle" :percentage="Number(zones[key].utilization.MEM)" width=70 :stroke-width="4"></el-progress>
                        <span>{{$t('m.memory')}} <span>{{$t('m.zone.quota')}}{{parseInt(zones[key].quotas.memory)}}{{zones[key].quotas.memory | memoryUnit}}</span></span>
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
                    <tbody>
                        <tr v-for="(item,i) in value" :key="i">
                        <td :title="item.name">{{item.name}}</td>
                        <td :title="item.cpu.usage.limit.pct">{{(item.cpu.usage.limit.pct*100).toFixed(4)}}%</td>
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
            namespaceHistory: {},
            namespaceDockerInfo: {},
            // namespaceInfo:{},
            zones:{},
            startFrom:'',
            // list:{},
            spaceInfos:{},
            updateForm: {
                allZones:{},
                allZones1:{},
            },
        }
    },
    created() {
        // this.bindData1();
        this.getAllZones();
    },
    mounted() {},
    beforeDestory() {},
    methods: {
        // ????
        changeLang() {
            this.$i18n.locale = localStorage.getItem("locale"); 
            this.startFrom = new Date();
            this.startFrom = this.startFrom.getFullYear() + '-'+(this.startFrom.getMonth()/1+1)+'-'+this.startFrom.getDate()+'T00:00:00Z';
        }, 

        getSummary1(){
            this.startFrom = new Date();
            this.startFrom = this.startFrom.getFullYear() + '-'+(this.startFrom.getMonth()/1+1)+'-'+this.startFrom.getDate()+'T00:00:00Z';
            return  this.$axios.get(Lib.API().dashboard.summery1+`?startFrom=${this.startFrom}`);   
        },

        getNamespaceDockerInfo(namespaces){
            return  this.$axios.get(Lib.API(namespaces).dashboard.namespaceDockerInfo);
        },

        getNamespaceHistory(namespaces){
            return  this.$axios.get(Lib.API(namespaces).dashboard.namespaceHistory);
        },

        getZoneList(namespaces){
            return this.$axios.get(Lib.API(namespaces).zone.getZoneList);
        },
        bindData1(){

            this.historyTemplete = {
                title: {
                    text: "",
                    left: "5%",
                    padding: 0
                },
                legend: { right: "26%" },
                tooltip: { trigger: "axis" },
                dataset: {
                    source: []
                },
                xAxis: [
                    { type: "category", gridIndex: 0, boundaryGap: false, show: false },
                    { type: "category", gridIndex: 1, boundaryGap: false, show: false },
                    { type: "category", gridIndex: 2, boundaryGap: false, show: false }
                ],
                yAxis: [{
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
                        name: this.$t('m.dashboard.mem')+" (MB)",
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
                        name: "gpu (%)",
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
                    { top: "14%", left: "10%", right: "1%", bottom: "62%" },
                    { top: "44%", left: "10%", right: "1%", bottom: "32%" },
                    { top: "74%", left: "10%", right: "1%", bottom: "2%" }
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
                    // {
                    //     type: "line",
                    //     xAxisIndex: 1,
                    //     yAxisIndex: 1,
                    //     stack: "mem",
                    //     seriesLayoutBy: "row",
                    //     symbolSize: "0"
                    // },

                    {
                        type: "line",
                        xAxisIndex: 2,
                        yAxisIndex: 2,
                        stack: "gpu",
                        seriesLayoutBy: "row",
                        symbolSize: "0"
                    }
                ]
            };
            var zones=[];
            var zonelist=[];

            for(var k=0;k<this.updateForm.allZones.length;k++){
                for(var i=0;i<this.updateForm.allZones1.length;i++){
                    if(this.updateForm.allZones[k].name===this.updateForm.allZones1[i]){
                        zones.push({"name":this.updateForm.allZones[k].name,"cpu":this.updateForm.allZones[k].quotas.CPU,"gpu":this.updateForm.allZones[k].quotas.GPU});
                        zonelist.push(this.updateForm.allZones[k]);
                    }
                }
            }
            if(zones.length>0){//选中了一个或多个分区
                var namespaces=encodeURI(JSON.stringify(zones));
                this.$axios.all([ 
                                this.getNamespaceDockerInfo(namespaces),
                                this.getNamespaceHistory(namespaces)
                                ])
                                .then(this.$axios.spread((
                                            dockerInfo,
                                            history)=>{
                    this.namespaceDockerInfo={};
                    zonelist.forEach(e => {
                            this.zones[e['name']]=e;
                            //dockerInfo
                            var dockers=dockerInfo.data.namespaceDockerInfo;
                        
                            //沒有docker的分區也展示出來，html中循環dockerinfo
                            // if(this.namespaceDockerInfo==null){
                            //     this.namespaceDockerInfo=[];
                            // }
                            if(dockers[e['name']]==null){
                                this.$set(this.namespaceDockerInfo,e['name'],[]);
                            } else{
                                this.$set(this.namespaceDockerInfo,e['name'],dockers[e['name']]);
                            }
                        });   
                        // //history           
                        this.namespaceHistory=history.data.namespaceHistory;
                        this.$nextTick(function() {
                            zonelist.forEach(e => {
                                var flag1=true;
                                for (var prop in this.namespaceHistory) {
                                
                                    if(prop===e['name']){
                                        if(document.getElementById(prop)!=null){
                                            this.historyTemplete.title.text = prop;
                                            this.historyTemplete.dataset.source = this.namespaceHistory[prop];
                                            var myChart3 = echarts.init(document.getElementById(prop));
                                            myChart3.setOption(this.historyTemplete);

                                        }
                                        flag1=false;
                                    }
                                }
                                if(flag1){
                                    this.historyTemplete.title.text = e['name'];
                                    this.historyTemplete.dataset.source = [['product',0],['cpu_pct',0],['mem_usage',0],['gpu_use',0]];
                                    var myChart3 = echarts.init(document.getElementById(e['name']));
                                    myChart3.setOption(this.historyTemplete);
                                }
                                        this.loading = false;
                            });
                        })

                    }))
            }else{//没有选中分区
                this.namespaceDockerInfo={};
                this.loading = false;
            }
        },
        getAllZones(){
            this.$axios
            .get(Lib.API().zone.getZoneList)
            .then(res => {
                const data = res.data;
                if (data.success) {   
                this.updateForm.allZones=data.results;
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
                if(this.updateForm.allZones1.length > 3){
                    this.$message({          
                        showClose: true,
                        message: this.$t('m.image.makeNotExceed3'),
                        type: "warning",
                        duration: Lib.Common.messageDuration              
                    });
                    return false;
                }
                this.loading = true;
                this.bindData1();
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
          span {
            font-size: 10px;
            color: #aaa;
          }
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
        max-height: 155px;
        overflow-y: auto;
      }
    }
  }

  div.right {
    width: 1000px;
    height: 320px;
    flex-basis: 60%;
  }
}
</style>

