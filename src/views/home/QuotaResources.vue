<template>
  <div class="item-wrap quota-resources">
    <div class="quota">
      <h2>
        {{$t('m.zone.applied')}}       
        <el-tooltip class="item" effect="light" :content="$t('m.zone.clusterAppliedInfo')" placement="right">
          <svg class="icon" aria-hidden="true" id="quotaresources_quota_info">
            <use xlink:href="#icon-shuoming"></use>
          </svg>
        </el-tooltip>
      </h2>
      <div>
        <ul>
          <li>
            <span class="icon">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-GPU"></use>
              </svg>
            </span>
            <span class="num"> &nbsp;{{gpuPer}}</span>
            <span>%</span>
          </li>
          <li class="details">
            <span>GPU: </span><span>{{quotas.gpuUsed}}/{{quotas.gpu}}</span><span> Core</span>
          </li>
        </ul>       
        <ul>
          <li>
            <span class="icon">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-cpu1"></use>
              </svg>
            </span>
            <span class="num">{{cpuPer}}</span>
            <span>%</span>
          </li>
          <li class="details">
            <span>CPU: </span><span>{{quotas.cpuUsed}}/{{quotas.cpu}}</span><span> Core</span>
          </li>
        </ul>
        <ul>
          <li>
            <span class="icon">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-aistubiaokuozhan-"></use>
              </svg>
            </span>
            <span class="num">{{memPer}}</span>
            <span>%</span>
          </li>
          <li class="details">
            <span>{{$t('m.memory')}}: </span><span>{{quotas.memUsed}}/{{quotas.memory}}</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="resources">
      <h2>
        {{$t('m.zone.used')}}
        <el-tooltip class="item" effect="light" :content="$t('m.zone.alreadyUsed')" placement="right">
          <svg class="icon" aria-hidden="true" id="quotaresources_resources_info">
            <use xlink:href="#icon-shuoming"></use>
          </svg>
        </el-tooltip>
      </h2>
      <div class="info">
        <div>
          <h3>GPU</h3>
          <el-progress type="circle" :percentage="clusterUsed.gpuuseper"></el-progress>
        </div>  
        <div>
          <h3>CPU</h3>
          <el-progress type="circle" :percentage="clusterUsed.cpuuseper"></el-progress>
        </div>     
        <div>
          <h3>{{$t('m.memory')}}</h3>
          <el-progress type="circle" :percentage="clusterUsed.memuseper"></el-progress>
        </div>        
      </div>
    </div>
  </div>
</template>

<script>
// import Header from "components/Header";
// import Nav from "components/Nav";
import Lib from "../../assets/js/Lib";
// import { Message } from "element-ui";

export default {
  data() {
    return {
      timer:0,
      quotas:{        
        gpuPer: 0, // 分配率
        memPer: 0,
        cpuPer: 0,
        gpu: 0, // gpu 总配额
        memory: 0,
        memoryGB:0,
        cpu: 0,
        gpuUsed: 0, // gpu 分配出去的配额
        memUsed: 0,
        memUsedGB:0,
        cpuUsed: 0
      },
      clusterUsed:{
        gpuuseper:0,
        cpuuseper:0,
        memuseper:0
      }
    };
  },
  computed:{
    memPer: function(){   
      return this.quotas.memoryGB?Math.round((this.quotas.memUsedGB/this.quotas.memoryGB)*100):0;
    },
    cpuPer: function(){
      return this.quotas.cpu?Math.round((this.quotas.cpuUsed/this.quotas.cpu)*100):0
    },
    gpuPer: function(){
      return this.quotas.gpu?Math.round((this.quotas.gpuUsed/this.quotas.gpu)*100):0
    }
  },
  created() {
     this.getClusterUsed();
     this.getQuotas();
     this.freshClusterUsed();
  },
  destroyed(){
    this.clearTimer();
  },
  methods:{
    // 获取集群的配额，也就是各分区配额之和
    getQuotas(){
      this.$axios // 使用说明
        .get(Lib.API().zone.getZoneList)
        // .get("http://rap2api.taobao.org/app/mock/2311//api/zone/zones")
        .then(res => {
          const data = res.data;
          if (data.success) { 
            // 平行组件传参， 参数必须是 string 类型
            Lib.bus.$emit('zoneList',JSON.stringify(data.results));

            // 后台直接添加的分区，　没有 quotes 字段，＝》过滤
            // Object.values(objName) Object.values()方法返回一个给定对象自身的所有可枚举属性值的数组
            data.results = data.results.filter(ele => {
              return Object.values(ele.quotas).length;
            })

            data.results.forEach(element => {
              // 1, 赋值
              this.quotas.gpuUsed = this.quotas.gpuUsed + parseInt(element.quotas.GPU);
              this.quotas.cpuUsed = this.quotas.cpuUsed + parseInt(element.quotas.CPU);
              
              // 2, 内存单位 都转换成 GB，并计算, 以 GB 为主
              if(element.quotas.memory.replace(/[\d.]/g,'').toUpperCase() == ('GB'||'G')){
                element.quotas.memory = parseInt(element.quotas.memory);
              }else{
                element.quotas.memory = parseInt(element.quotas.memory)/1024
              }
              this.quotas.memUsedGB = this.quotas.memUsedGB + element.quotas.memory;
            });

            // 3, 加单位
            if(this.quotas.memUsedGB == 0){
              this.quotas.memUsed = 0;
            }else if(this.quotas.memUsedGB > 1){
              this.quotas.memUsed = Math.round(this.quotas.memUsedGB) + 'GB'
            }else{
              this.quotas.memUsed = Math.round(this.quotas.memUsedGB * 1024) + 'MB'
            }

          } else {
            var messageTex = data.message || "default";
            var messageParams = data.messageParams || "";
            messageTex = this.$t("m.responseErrorMessage." + messageTex) || "";
            Lib.Common.errorMessage(messageTex,messageParams);
          }
        })
    },

    getClusterUsed() {
      this.$axios
        // .get(`http://192.168.121.2:8080/app/mock/1/ddddd`)
        .get(`/api/monitor/cluster/item?keys=clusterInfo`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.clusterUsed.gpuuseper = Number(data.item.gpuuseper);
            this.clusterUsed.cpuuseper = Number(data.item.cpuuseper);
            this.clusterUsed.memuseper = Number(data.item.memuseper);
            this.quotas.cpu = Number(data.item.cpuproc);
            this.quotas.gpu = Number(data.item.gpuphy);
            this.quotas.memoryGB = data.item.memtotal/1024/1024/1024; // 单位 b(原始单位) => GB
            if(this.quotas.memoryGB == 0){
              this.quotas.memory = 0;
            }else if(this.quotas.memoryGB > 1){
              this.quotas.memory = parseInt(this.quotas.memoryGB) + 'GB'
            }else{
              this.quotas.memory = parseInt(this.quotas.memoryGB * 1024) + 'MB'
            }
          }else{
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams,'interval');
          }
        }
        )
    },
    freshClusterUsed(){
      this.timer=setInterval(() => {
        this.getClusterUsed();
      }, 10000 );
    },

    clearTimer(){
      if(this.timer){
        clearInterval(this.timer)
      }
    }

  }
};
</script>

<style lang="less"  scoped>
.quota {
  div {
    svg.icon {
      color: #1a99a5;
    }
  }  
}

.quota-resources {
  .el-progress__text {
    font-weight: 400;
  }
  h2 svg {
    color: #cccccc;
    font-size: 12px;
  }
}
.quota {
  background-color: #e9f5f8;
  padding: 10px;
  > div {
    display: flex;
    justify-content: space-between;

    ul li {
      padding: 4px 40px;
    }
  }
  span.icon {
    font-size: 40px;
    color: #1a99a5;
    font-weight: 400;
  }
  span.num {
    font-size: 30px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  li.details {
    color: #666666;
    // font-size: 12px;
  }
}
.resources {
  background-color: #ffffff;
  padding: 10px;
  > div {
    display: flex;
    text-align: center;
    > div {
      flex-basis: 33%;
    }
  }
}

.resources .info > div:nth-child(1){
    .el-progress__text {
      color:rgb(75, 184, 138);
    }    
    .el-progress-circle > svg > path:nth-child(2){
      stroke: rgb(75, 184, 138);
    }
  }
  .info > div:nth-child(2){
    .el-progress__text {
      color:rgb(78, 186, 236);
    }
  }
  .info > div:nth-child(3){
    .el-progress__text {
      color:rgb(113, 75, 184);
    }
    .el-progress-circle > svg >path:nth-child(2){
      stroke: rgb(113, 75, 184);
    }
  }

</style>


