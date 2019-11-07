<template>
    <main>
      <div v-if="standaloneOrCluster!=='standalone'">
        <router-link to="/cluster/nodeadd" id="nodelist_a_toNodeadd">
          <el-button size="medium" type="primary"  plain icon="el-icon-plus">{{$t('m.node.autoAdd')}}</el-button>     
        </router-link>         
      </div>

      <section class="search-info" style="padding:0;"  v-if="standaloneOrCluster!=='standalone'">
        <el-collapse accordion v-model="activeName" >
          <el-collapse-item name="1">
            <template slot="title">
              <transition  mode="out-in">
                <span v-bind:key="activeName">
                  <span style="padding-left:20px;" v-html="activeNameTitle"></span>
                </span>
              </transition>              
            </template>
            <form action="">
              <div>
                <label for="nodename">{{$t('m.node.nodeName')}} </label>
                <input type="text"  v-model="form.nodeName" id="nodelist_input_nodename">
              </div>
              <div>
                <label for="">{{$t('m.node.nodeMark')}} </label>
                <input type="text"  v-model="form.nodeFlag" id="nodelist_input_nodeflag"><br />
              </div>
              <div>
                <label for="">GPU</label>
                <input type="text"  v-model="form.gpucount" id="nodelist_input_gpucount"> 
              </div>
              <div>
                <label for="">CPU</label>
                <input type="text"  v-model="form.cpucount" id="nodelist_input_cpucount"> <br />
              </div>
                      
              <div style="margin-left:95px; display:block;">
                 <el-button type="primary"  icon="el-icon-search"  size="small" @click="getNodesList" id="nodelist_button_search">{{$t('m.search')}}</el-button>
              </div>
             
            </form>
          </el-collapse-item>
        </el-collapse>
               
      </section>
      
      <section class="show-info">
        <p v-show="resultsNullVisible" class="resultsNullVisible" id="nodelist_p_resultsNullVisible">{{$t('m.results0')}}</p>
         <table >
           <thead>
             <tr>
               <th>{{$t('m.node.nodeName')}}</th>
               <th>IP</th>
               <th>GPU</th>
               <th>CPU</th>
               <th>{{$t('m.memory')}}</th>
               <th>{{$t('m.disksize')}}</th>
               <th>{{$t('m.node.serviceStatus')}}</th>
               <th>{{$t('m.node.healthStatus')}}</th>
               <th>{{$t('m.node.nodeMark')}}</th>
               <th>{{$t('m.node.runTime')}}</th>
               <th class="operation"> &nbsp;{{$t('m.operating')}}</th>
             </tr>
           </thead>
           <tbody v-if="list.length"  v-loading="loading" :element-loading-text="$t('m.loading')">
             <tr v-for="(item,index) in list" :key="item.nodeName" >
               <td><router-link :to="'/cluster/nodedetail/'+item.nodeName">{{item.nodeName}}</router-link></td>
               <td>{{item.ip}}</td>
               <td>{{item.gpucount ? item.gpucount : ''}}</td>
               <td>{{item.cpucount ? item.cpucount : 0}}Core</td>
               <td>{{item.memory}} </td>
               <td>
                 <span v-if="item.disksize" >
                   <span v-for="(one,index) in item.disksize" :key="index">{{one}} &nbsp; <i v-if="index%2!=0"><br/></i></span>                   
                </span>
               </td>
               <td>
                 <span v-if="item.serviceStatus===1" class="nodelist_serviecstatus1">
                    <i class="el-icon-circle-check good"></i>
                 </span>
                 <span v-else-if="item.serviceStatus === 0" class="nodelist_servicestatus0">
                    <i class="el-icon-warning warning"></i>
                 </span>
               </td>
               <td>
                 <span v-if="item.healthStatus===1" class="nodelist_healthstatus1">
                    <i class="el-icon-circle-check good"></i>
                 </span>
                 <span v-else-if="item.healthStatus === 0" class="nodelist_healthstatus0">
                    <i class="el-icon-warning warning"></i>
                 </span>
               </td>
               <td>
                 <input type="text" v-model="item.nodeFlag" placeholder="+" v-on:keyup.enter="editNodeFlag(item.nodeName,item.nodeFlag)" class="nodeFlag" :class="{nodeFlagMessageError:item.isNodeFlagMessage}">
                 <p v-show="item.isNodeFlagMessage" class="flag-message">{{$t('m.node.nodeMark')+$t('m.rules.regularUnordered')}} </p>
              　</td>
               <td>
                 <span v-if="item.statustime==''">0</span>
                 <span v-else>
                   <!-- item.statustime 字符串，单位 毫秒数， new Date() 毫秒 -->
                   {{ (new Date()-item.statustime)/1000 | statustime }}
                 </span>
                 
                 </td>
               <td class="operation" v-loading="item.loading" :element-loading-text="$t('m.loading')">
                 <!-- item.action的值 ， 0：已开机, 1：已关机, 2：未装系统  -->
                  <span v-if="item.action != '2'">
                    
                    <span  v-if="item.action === '1'" > 
                      <el-button type="text" @click="powerOn(item.nodeName,index)">
                        <svg class="icon" aria-hidden="true" >
                          <use xlink:href="#icon-start"></use>
                        </svg> 
                        {{$t('m.node.powerOn')}}
                      </el-button>
                    </span>

                    <span v-else-if="item.action === '0'"> 
                      <el-button type="text" @click="item.deleteVisible=!item.deleteVisible; whatOperation = 'shutDown'">
                        <svg class="icon" aria-hidden="true" >
                          <use xlink:href="#icon-guanji"></use>
                        </svg>  
                        {{$t('m.node.shutDown')}} 
                      </el-button> 
                      <el-button type="text" @click="item.deleteVisible=!item.deleteVisible; whatOperation = 'restart'">
                        <svg class="icon" aria-hidden="true" >
                          <use xlink:href="#icon-lvzhou_zhongqi"></use>
                        </svg> 
                        {{$t('m.node.restart')}} 
                      </el-button> 
                    </span>

                    <el-button type="text" @click="item.deleteVisible=!item.deleteVisible; whatOperation = 'delete'" v-show="standaloneOrCluster!=='standalone'">
                      <svg class="icon" aria-hidden="true" >
                        <use xlink:href="#icon-delete"></use>
                      </svg>
                      {{$t('m.delete')}}
                    </el-button>
                    
                  </span>
                  
                  <span v-else-if="item.action === '2'"> 
                    {{$t('m.node.notInstalled')}}
                  </span> 

                  <!-- 删除框 -->
                  <transition name="deleteTransition">
                    <div class="delete-message operation-message" v-show="item.deleteVisible">
                      <p>{{$t('m.doYouDecide') + ' '+$t('m.node.'+whatOperation).toLowerCase() + ' ' + item.nodeName + '?'}}</p>
                      <div style="text-align: right; margin: 0">
                        <el-button size="mini" @click="item.deleteVisible = false">{{$t('m.cancel')}}</el-button>
                        <el-button type="primary" size="mini" @click="item.deleteVisible=false;operationHandle(item.nodeName,whatOperation,index)">{{$t('m.confirm')}}</el-button>
                      </div>
                    </div>
                  </transition> 

                  <!-- 暂时隐藏，打污点，取消污点 -->
                  <!-- <el-switch size="mini" 
                    v-model="item.disable"
                    :active-text="$t('m.node.addTaint')"
                    :inactive-text="$t('m.node.removeTaint')" @change="disableChange(index)">
                  </el-switch> -->
               </td>
             </tr>           
           </tbody>
           
         </table>
         

         <div class="page-block">  
            <span>{{$t('m.total')}} {{page.total}} {{$t('m.tiao')}}</span>        
            <el-pagination
              @current-change="getNodesList"
              :current-page.sync="page.currentPage"
              :page-size="page.pageSize"
              layout="prev, pager, next"
              :total="page.total">
            </el-pagination>
        </div>
        
        
      </section>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";
import { Message } from "element-ui";

export default {
  data() {
    return {
      activeName:'',
      list: [ ],
      page: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10 // 一页显示多少条
      },
      dialogFormVisible: false, // ”手动添加节点“ 弹出框dialog 的显示/隐藏
      form: {
        nodeName: "",
        nodeFlag: "",
        gpucount: "",
        cpucount: ""
      },
      message: {
        // 给用户的反馈信息， type: success | error
        text: "",
        type: ""
      },
      isShowConfirmDelete: false,
      resultsNullVisible: false,
      whatOperation: "", // 对节点做的什么操作：　关机/重启/删除
      loading: false, 
      standaloneOrcluster: '', // 单机还是集群
      loading: false,
    };
  },              
  
  computed: {
    activeNameTitle: function (){
      switch (this.activeName){
        case '': return '<i class="header-icon el-icon-search" v-if="!activeName"></i>'
        case '1': return '<span v-else>' + this.$t('m.query') + '</span>'
      }
    }
  },

  created() {
    this.standaloneOrCluster = localStorage.getItem('standaloneOrCluster')?localStorage.getItem('standaloneOrCluster'):'';
    this.getNodesList();
  },

  methods: {
    // 打污点 or 取消污点
    disableChange(index){
      this.list[index].loading = true;
      let item = this.list[index], url = '';
      if(item.disable){ // disable 为 true，打污点
        url = Lib.API(item.nodeName).node.unschedule + `?nodeIp=${item.ip}`
      }else{
        url = Lib.API(item.nodeName).node.schedule + `?nodeIp=${item.ip}`
      }

      this.$axios
        .put(url)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.getNodesList();
          } else {
            this.list[index].disable = !this.list[index].disable; // 操作失败，回到原来状态
            // 操作反馈信息： 失败
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.list[index].loading = false;
          
        });
    },
   
    // 操作反馈信息
    openMessage() {
      this.$message({
        showClose: true,
        message: this.message.text,
        type: this.message.type,
        duration: Lib.Common.messageDuration
      });
    },

    // 获取所有节点列表
    getNodesList() {
      this.loading = true;
      this.$axios
        .get(Lib.API().node.nodeList +
            `?keyWord=${this.form.nodeName}&nodeFlag=${
              this.form.nodeFlag
            }&gpucount=${this.form.gpucount}&cpucount=${
              this.form.cpucount
            }&pageNum=${this.page.currentPage}&pageSize=${this.page.pageSize}`
        )
        .then(res => {
          const data = res.data;
          if (data.success) {
            
            for (let i = 0; i < data.results.length; i++) {
              data.results[i].deleteVisible = false;
              data.results[i].loading = false;
              data.results[i].isNodeFlagMessage = false;
              // disksize 原始数据类型 "sda:2000GB,sdb:450GB,sdc:120G" =》数组
              data.results[i].disksize = data.results[i].disksize?data.results[i].disksize.split(','):[];
            }
            this.page.total = data.total;
            this.list = data.results; // 获取到的信息传给当前页面作为数据
            if (data.results.length == 0) {
              this.resultsNullVisible = true; // 显示提示　－　没有找到结果
            } else {
              this.resultsNullVisible = false; // 隐藏提示　－　没有找到结果
            }
          
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loading = false;
        });
    },

    // 关机
    powerOff(nodeName,index) {
      this.list[index].loading = true;
      this.$axios
        .put(Lib.API(nodeName).node.poweroff)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.getNodesList();
          } else {
            // 操作反馈信息： 失败
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.list[index].loading = false;
          
        });
    },

    // 开机
    powerOn(nodeName,index) {
      this.list[index].loading = true;
      this.$axios
        // .put(Lib.URL.nodeOn)
        .put(Lib.API(nodeName).node.poweron)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.getNodesList();
            // 操作反馈信息： 成功
            this.message.text = nodeName + this.$t("m.node.switched") + this.$t("m.successAdv");
            this.message.type = "success";
            this.openMessage();
          } else {
            // 操作反馈信息： 失败
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
            this.loading = false;
          }
          
        });
    },

    // 重启
    powerReset(nodeName,index) {
      this.list[index].loading = true;
      this.$axios({
        method: "put",
        url: Lib.API(nodeName).node.restart
      }).then(res => {
        const data = res.data;
        if (data.success) {
          this.getNodesList();
          this.message.text = nodeName + " " + this.$t("m.node.restarted") + this.$t("m.successAdv");
          this.message.type = "success";
          this.openMessage();
        } else {
          // 操作反馈信息： 失败
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
          this.loading = false;
        }
        
      });
    },

    // 移除
    nodeDelete(nodeName,index) {
      this.isShowConfirmDelete = false;
      this.list[index].loading = true;
      this.$axios({
        method: "delete",
        url:  Lib.API(nodeName).node.deleteNode + `?nodeIp=${this.list[index].ip}`
      }).then(res => {
        const data = res.data;
        if (data.success) {
          this.message.text = nodeName + this.$t("m.node.deleted") + this.$t("m.successAdv");
          this.message.type = "success";
          this.openMessage(); // 操作结果提示
          setTimeout(this.getNodesList, 1000); // 延迟执行获取列表
          // 重新获取列表
        } else {
          // 操作反馈信息： 失败
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
          this.loading = false;
        }
        
      });
    },

    // 确认哪个操作，并发送请求
    operationHandle(nodeName, operation,index) {
      if (operation == "delete") {
        this.nodeDelete(nodeName,index);
      } else if (operation == "shutDown") {
        this.powerOff(nodeName,index);
      } else if (operation == "restart") {
        this.powerReset(nodeName,index);
      }
    },

    // // 点击 enter 时, input 框失去焦点, 并发送请求
    editNodeFlag(nodeName, nodeFlag) {
      let inputs = document.getElementsByClassName("nodeFlag");
      let index = this.list.findIndex(item => item.nodeName === nodeName);
      inputs[index].blur();

      var index2 = null;
      for (var i = 0; i < this.list.length; i++) {
        if (this.list[i].nodeName == nodeName) {
          index2 = i;
        }
      }
      if (nodeFlag.trim().length > 0) {
        if (!/^[-_a-zA-Z0-9]{1,6}$/.test(nodeFlag.trim())) {
          this.list[index2].isNodeFlagMessage = true;
          return false;
        } else {
          this.list[index2].isNodeFlagMessage = false;
        }
      } else if (nodeFlag.trim().length == 0) {
        nodeFlag = "cleantag";
        this.list[index2].isNodeFlagMessage = false;
      }
      nodeFlag = nodeFlag.trim();
      this.$axios
        .put(`/api/node/nodes/${nodeName}/${nodeFlag}`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.getNodesList();
            // 操作反馈信息： 成功
            this.message.text = this.$t("m.node.nodeMarkModifiedSucc"); // “标识修改成功”
            this.message.type = "success";
            this.openMessage();
          } else {
            // 操作反馈信息： 失败
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
        });
    }
  }
};
</script>

<style  lang="less"  scoped >
// 动画效果
.deleteTransition-enter-active,
.deleteTransition-leave-active {
  transition: all 0.4s;
}
// 进场，　出场状态
.deleteTransition-enter,
.deleteTransition-leave-to {
  opacity: 0;
}

.block {
  text-align: right;
  padding: 16px 0;
}
main > div {
  margin-bottom: 10px;
}
main section {
  width: 100%;
  background-color: #ffffff;
  position: relative;
}
section.search-info form {
  > div{
    display: inline-block;
  }
  button {
    display: block;
    margin-left: 20px;
  }
}
section.search-info form input,
section.search-info form select {
  margin: 10px 30px 10px 10px;
  height: 32px;
  line-height: 32px;
  color: #666666;
  border-radius: 5px;
  border: 1px solid #cccccc;
  padding: 0 5px;
  width:240px;
}
main section.search-info {
  box-shadow: 0px 3px 3px #cccccc;
  z-index: 2;
  padding: 20px 10px;
  p {
    padding-left: 10px;
    font-weight: 600;
  }
}
label {
  color: #999999;
  width: 100px;
  display: inline-block;
  text-align: right;
}
section.show-info {
}

section.show-info table {
  td {
    position: relative;
    input {
      width: 80px;
      border: none;
      font-size: 13px;
    }
    input:focus {
      border: 1px solid #eee;
    }
  }
  tbody .item {
    margin: 0 10px;
    // color: #34495e;
  }
  tbody .item:hover {
    color:#1a99a5;
  }
}
// nav 菜单 选中 状态
nav ul.el-menu  li.nav-node {
  color: #1a99a5;
}
.result-message {
  width: 450px;
  position: fixed;
  z-index: 10;
  right: 10px;
  top: 10px;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  box-shadow: 0px 0px 5px #eeeeee;
  display: inline-block;
  padding: 20px;
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
    margin: 25px 0;
  }
  .dialog-footer {
    text-align: right;
  }
}
td.operation {
  position: relative;
}
.delete-message {
  min-width: 200px;
  background-color: #fff;
  padding: 20px;
  border: 1px solid #dddddd;
  box-shadow: 3px 3px 3px #dddddd;
  position: absolute;
  top: 55px;
  right: 10px;
  border-radius: 5px;
  z-index: 2;
}
p.resultsNullVisible {
  color: #e24949;
  text-align: center;
  margin: 0;
  padding: 10px 0 0 0;
}
span.nodeFlag:focus {
  padding: 6px 2px;
  border: 1px solid #cccccc;
  border-radius: 5px;
  outline: none;
}
span.nodeFlagNull i {
  color: #cccccc;
  font-size: 22px;
}
.flag-message {
    color: #e74e4e;
    position: absolute;
    z-index: 3;
    width: 300px;
    background-color: #f9e9e9;
    padding: 5px 10px;
    border-radius: 3px;
    left: -88px;
    top: 34px;
}
input.nodeFlag{
  padding:5px;
  border-radius: 3px;
}
.nodeFlagMessageError{
  border:1px solid #f2b4b4 !important;
}
section.search-info {
  .el-collapse-item__header {
    padding-left: 30px;
    font-size: 14px;
  }
  .el-collapse-item__header:hover {
    color: #1a99a5;
  }
}
</style>
