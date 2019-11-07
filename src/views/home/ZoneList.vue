<template>
  <div class="item-wrap zone-list">
    
    <div class="zone-list-title">       
      <div>
        <!-- 分区 -->
        <h2><router-link v-if="role" to="/cluster/zonelist" id="cluster_zonelist_aTag"> {{$t('m.nav.zone')}}({{listLength}}) </router-link><span v-else>{{$t('m.nav.zone')}}({{listLength}})</span></h2>
        <!-- 提示： 已用资源 -->
        <span>{{$t('m.zone.used')}}</span>
        
      </div>
      <div>
        <router-link v-if="role=='admin'" class="el-button" size="medium" plain to="/cluster/zoneadd?operation=create" id="cluster_zoneadd_aTag"><i class="el-icon-plus"></i> {{$t('m.zone.new')}}</router-link>
      </div>
    </div>
    
    <div class="zone-list-content"  v-loading="loading" :element-loading-text="$t('m.loading')" >
      <div v-for="(item,index) in list" :key="index" class="zone-item">
        <div>
          {{item.name}}
        </div>
        <div>          
          <span>GPU</span>
          <span>CPU</span>
          <span>{{$t('m.memory')}}</span>
        </div>
        <div class="zone-progress">  
          <div>
            <span>{{item.quotas['GPU Used']?item.quotas['GPU Used']:0}}/{{item.quotas.GPU?item.quotas.GPU:0}}Core</span>      
            <el-progress :show-text="false"  :percentage="parseInt((item.quotas['GPU Used']/item.quotas.GPU)*100)"></el-progress>
          </div>  
          <div>
            <span>{{item.quotas['CPU Used']?item.quotas['CPU Used']:0}}/{{item.quotas.CPU?item.quotas.CPU:0}}Core</span> 
            <el-progress  :show-text="false"  :percentage="parseInt((item.quotas['CPU Used']/item.quotas.CPU)*100)"></el-progress>
          </div>
          <div>
            <span>              
               <span v-if="!item.quotas['memory used']">0</span> <span v-else>{{parseInt(item.quotas['memory used'])}}{{item.quotas['memory used'] | memoryUnit}}</span>/<span v-if="item.quotas.memory">{{parseInt(item.quotas.memory)}}{{item.quotas.memory | memoryUnit}}</span>
                  <span v-if="!item.quotas.memory">0</span>
                  
            </span>             
            <el-progress  :show-text="false"  :percentage="item.quotas | getPercentage"></el-progress>
          </div>
          
        </div>        
      </div>      
    </div>

    <p class="view">
      <router-link class="a" v-if="role" to="/cluster/zonelist" id="cluster_zonelist_viewicon">
        <svg class="icon" aria-hidden="true" :title="$t('m.view')">
          <use xlink:href="#icon-view">view</use>
        </svg>
        {{$t('m.view')}}
      </router-link>
    </p>
    
  </div>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data(){
    return{
      listLength:0, // 所有分区的个数
      zoneAll:'',
      list:[ 
        // {
        //   name:'ddd',
        //   quotas:{
        //     'CPU':3,
        //     'GPU':2,
        //     'memory':'1GB',
        //     'CPU Used':1,
        //     'GPU Used':1,
        //     'memory used':'21MB'
        //   },
        //   utilization:{
        //     CPU:20,
        //     GPU:10,
        //     memory:22
        //   }
        // }
       ],    // 最多显示 3 个分区
      role:'', // 分区的角色
      loading: true, // 
    }
  },
  created(){
    // this.getZoneList();
    this.getRole();
    // 接受传过来的参数
    Lib.bus.$on("zoneList", arg => {      
      this.listLength = JSON.parse(arg).length;
      this.list = JSON.parse(arg);
      if(this.list.length > 3){
        this.list.length = 3;
      } 
      this.loading = false;
    });
  },
  watch:{
    list: function (){}
  },
  methods:{
    // 获取角色
    getRole(){
      this.role = localStorage.getItem("rolesZone")?localStorage.getItem("rolesZone"):null;
    },
  },
}
</script>

<style lang="less" scoped>
.zone-list {
  h2 {
    margin-bottom: 0;
    padding-bottom: 0;
  }
  > p {
    text-align: right;
    margin: 0 20px;
    border-top: 1px solid #eeeeee;
    padding: 10px 0;
  }
}

.zone-list-title {
  background-color: #fff;
  padding: 10px 10px 0 10px;
  display: flex;
  justify-content: space-between;
  span {
      font-size: 12px;
      color: #666666;
    }
  .el-button {
    border:1px solid #ffffff;
  }
  .el-button:hover {
    border:1px solid #4b96dd;
  }
}

.zone-list-content {
  color: #666666;  
  margin: 0 20px;
  .zone-item {
    display: flex;
    border-top: 1px solid #eeeeee;
    padding: 10px 0;
    > div:nth-child(1) {
      width: 61px;
      padding-top: 5px;
    }
    > div:nth-child(2){
      color: #999;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      padding: 5px 5px 0 5px;
      > span {
        height: 22px;
      };
    }
    > div:nth-child(3){
      min-width: 100px;
      flex-grow: 1;
      flex-shrink: 1;
      .el-progress {
        height: 14px;
      }
    }
    .zone-progress {      
      > div {
        position: relative;
        padding-top: 10px;
        >span {
          display: block;
          font-size: 12px;
          position: absolute;
          bottom: 9px;
          right: 0;
        }
      }
    }
  }
}
main a:hover, main .a:hover {
  text-decoration: none;
  border-bottom: none;
}
</style>


