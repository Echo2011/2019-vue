<template>
  <div class="item-wrap node">
    <div class="node-overview">
      <div>
        <h2>
          <router-link v-if="role=='admin'" to="/cluster/nodelist" id="nodeoverview_to_nodelist">{{$t('m.nav.node')}}（<span class="num">{{(overview.onlinecount + overview.offlinecount)}}</span>）</router-link>
          <span v-else>{{$t('m.nav.node')}}（<span class="num">{{overview.onlinecount + overview.offlinecount}}</span>）</span>
        </h2>
        <ul>
          <li>{{$t('m.node.online')}}: <span class="num">{{overview.onlinecount}}</span></li>
          <li>{{$t('m.node.offline')}}: <span class="num">{{overview.offlinecount}}</span></li>
          <li>{{$t('m.node.serviceStatus')}}: 
            <span v-if="overview.serviceStatus === 0"> 
              <i class="el-icon-warning warning"></i>
              <!-- <svg class="icon  warning" aria-hidden="true">
                <use xlink:href="#icon-warning"></use>
              </svg> -->
            </span>
            <span v-else-if="overview.serviceStatus === 1">
              <i class="el-icon-circle-check good"></i>
              <!-- <svg class="icon ok" aria-hidden="true">
                <use xlink:href="#icon-ok"></use>
              </svg> -->
            </span>            
          </li>
          <li>{{$t('m.node.healthStatus')}}:
            <span v-if="overview.healthStatus === 0"> 
              <i class="el-icon-warning warning"></i>
              <!-- <svg class="icon warning" aria-hidden="true">
                <use xlink:href="#icon-warning"></use>
              </svg> -->
            </span>
            <span v-else-if="overview.healthStatus === 1">
              <i class="el-icon-circle-check good"></i>
              <!-- <svg class="icon ok" aria-hidden="true">
                <use xlink:href="#icon-ok"></use>
              </svg> -->
            </span> 
          </li>
        </ul>
      </div>
      <p> <span v-if="role=='admin'"> </span>        
        <router-link class="a" v-if="role=='admin'" to="/cluster/nodelist" id="nodeoverview_view">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-view"></use>
          </svg>
          {{$t('m.view')}}
        </router-link>        
      </p>      
    </div>
    
    <div class="node-latest">
        <table  class="node-latest-detail"  v-loading="loading" :element-loading-text="$t('m.loading')" >
          <thead>
            <tr>
              <th>{{$t('m.node.nodeName')}}({{$t('m.node.recentlyAdded')}})</th>
              <th>GPU</th>              
              <th>CPU</th> 
              <th>{{$t('m.memory')}}</th>             
              <th>{{$t('m.disksize')}}</th>
            </tr>
          </thead>
          <tbody>
            <tr  v-for="item in twolist" :key="item.nodeName" >
              <td>
                <router-link v-if="role=='admin'" :to="'/cluster/nodedetail/'+item.nodeName" id="nodeoverview_to_nodedetail">{{item.nodeName}}</router-link>
                <span v-else>{{item.nodeName}}</span>
              </td>
              <td>{{item.gpucount ? item.gpucount : 0}}</td>
              <td>{{item.cpucount ? item.cpucount : 0}}Core</td> 
              <td>{{item.memory}}</td>                           
              <td>
                <span v-if="item.disksize" v-for="(disk,index) in item.disksize" :key="index">
                  {{disk}} <i v-if="index%2!=0"><br /></i>
                </span>
              </td>
            </tr>
          </tbody>
        </table>        
      <!-- </div>       -->
    </div>
  </div>
</template>

<script>
import Lib from "../../assets/js/Lib";
// import { setTimeout } from 'timers';

export default {
  created() {
    this.getOverview();
    this.getTwolist();
    this.getRole();
  },
  data() {
    return {
      overview: {
        onlinecount: 0,
        offlinecount: 0,
        serviceStatus: 0,
        healthStatus: 1,
      },
      role:'',
      twolist: [
      //   {
      //   memory:'0',
      //   gpucount:'0',
      //   cpucount:'0',
      //   disksize:'0',
      //   nodeName:'0'
      // },{
      //   memory:'0',
      //   gpucount:'0',
      //   cpucount:'0',
      //   disksize:'0',
      //   nodeName:'0'
      // }
      ],
      loading: false,
    };
  },
  methods: {
    // 获取角色
    getRole(){
      this.role = localStorage.getItem("rolesNode")?localStorage.getItem("rolesNode"):null;
    },

    getOverview() {
      this.$axios
        // .get('http://rap2api.taobao.org/app/mock/2311/GET/api/node')
        .get('/api/monitor/cluster/health')
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.overview = data.item;
          }else{
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }          
        })
    },

    getTwolist() {
      this.loading = true;
      this.$axios
      .get(Lib.API().node.getTwoNodes + '?latest=2')
      // /api/node/nodes?latest=2
      .then(res => {
        const data = res.data;
        if (data.success) {
          if(data.results){
            data.results.forEach(element => {
              element.disksize = element.disksize ? element.disksize.split(',') : [];
            });
            this.twolist = data.results;
          }            
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText,data.messageParams);
        }  
        this.loading = false;     
      })
           
    }   
  }
};
</script>

<style lang="less"  scoped>
.node {
  box-sizing: border-box;
  background-color: #ffffff;
  span.num {
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
    font-weight: bold;
  }

}
.node-overview {
  width: 100%;
  background-color: #f1f1f1;
  padding: 10px;
  display: flex;
  height: 92px;
}
.node-overview > div {
  flex-grow: 1;
}
.node-overview > p {
  flex-basis: 100px;
  text-align: center;
  align-self: center;
  > span {
    color: #cccccc;
    width: 5px;
    height: 30px;
    border-left: 1px solid #cccccc;
    display: inline-block;
    vertical-align: middle;
  }
}
.node-overview ul {
  height: 30px;
  line-height: 30px;
}
.node ul {
  display: flex;
  justify-content: space-between;
}
.node ul li {
  display: inline;
  
}
.node-latest {
  box-sizing: border-box;
  display: flex;
  background-color: #ffffff;
}
.node-latest > div {
  flex-basis: 50%;
  margin: 10px;
}
.node-latest > div > ul:nth-child(1) {
  margin-bottom: 10px;
}
.node {
  .node-latest {
    padding: 10px;
    div:nth-child(1) {
      padding-right: 10px;
    }
    div:nth-child(2) {
      padding-left: 10px;
    }
    table.node-latest-detail {
      td,th {
        padding: 5px 0;
        vertical-align: text-top;
      }
      tr {
        border-bottom: 1px solid #ffffff !important;
      }
    }
  }
}
main a:hover, main .a:hover {
  text-decoration: none;
  border-bottom: none;
}
</style>


