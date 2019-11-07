<template>
    <main>  
      <!-- 添加结果提示列表 -->
      <div class="addLoading" v-show="isShowAddLoading" id="nodeadd_div_isShowAddLoading">
        <p>{{$t('m.node.addingNode')}} <i class="el-icon-loading"></i></p>
        <i class="el-icon-close" @click="isShowAddLoading=!isShowAddLoading" id="nodeadd_i_isShowAddLoading"></i>
        <p class="nodelists">
          {{$t('m.node.addingNode')}}:{{installingList?installingList.join(","):''}}<br/>
          {{$t('m.successAdv')}}: {{successList?successList.join(","):''}}<br/>
          {{$t('m.failAdv')}}: {{errorList?errorList.join(","):''}}
        </p>
        <p class="tip">
          {{$t('m.tip')}}: 
           {{$t('m.node.addTip')}}
           
        </p>        
      </div> 

      <section  v-loading="loading" :element-loading-text="$t('m.loading')"> 
        <p class="list-length">{{$t('m.nav.node')}}</p>
        <div class="add-list" v-if="list.length > 0">
          <ul  v-for="item in list" :key="item.nodeName"  v-bind:class="{'choose':item.isChoose}">
            <li>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-jiedian-"></use>
              </svg>
              <span class="nodeadd-nodename">{{item.nodeName}}</span>
            </li>
            <li><span>GPU:</span> <span>{{item.gpucount?item.gpucount:''}}</span> </li>
            <li><span>CPU:</span> <span>{{item.cpucount?item.cpucount:0}}Core
              </span></li>
            
            <li><span>{{$t('m.memory')}}:</span> <span>{{item.memory}}</span> </li>
            <!-- <li><span>mac:</span> <span>{{item.mac}}</span></li> -->
            <li><span>{{$t('m.disksize')}}:</span> 
                <span class="disksize">
                  <span v-for="(one,index) in item.disksize" :key="index">{{one}}<br/></span>
                </span>
            </li>
            <li v-if="item.currstate === '2'" class="red-text" style="text-align:center">{{$t('m.node.failedNode')}}</li>
            <li>
              <span @click="item.isChoose=!item.isChoose">                
                <span v-if="item.isChoose" class="blue-icon">
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-ok"></use>
                  </svg>
                </span>
                <span  class="gray-icon" v-else ></span>
              </span>              
            </li>
          </ul>  
        </div>  
        <!-- 分页 -->
        <div class="page-block">  
            <span>{{$t('m.total')}} {{page.total}} {{$t('m.tiao')}}</span> 
            <el-button   type="text" v-show="list.length<page.total"  @click="page.currentPage++;getAutoNodesList()" size="medium">{{$t('m.more')}}</el-button>
        </div> 
        <!-- <div>
          <p>{{$t('m.node.selectedNodes')}}:
            <span v-for="item in list" :key="item.nodeName" style="color:#1a99a5">{{item.nodeName}} &nbsp;  &nbsp; </span>
          </p>
        </div>                             -->
        <div class="btn-wrap">                    
          <el-button type="primary" @click="addAutoNode" :disabled="!chooseList.length" id="nodeadd_button_add">{{$t('m.node.add')}}</el-button>
          <router-link class="el-button el-button--default" to="/cluster/nodelist" id="nodeadd_button_cancel">{{$t('m.cancel')}}</router-link>
        </div>       
      </section>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";  // 公共库
// import { setTimeout } from 'timers';

export default { 
  data() {
    return {
      list: [], // 获取到的节点
      // requestParametersList:[], // 请求参数
      // historyAndNowList:[
        // {
        //   pageNum:1,
        //   list:[
        //     {
        //       nodeName:'',
        //       ip:'',
        //     }
        //   ]
        // }
      // ], // 所有选中的节点列表
      addInfo:'',
      dialogIsShow: false,
      addIconType: '',
      page: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize:10 // 一页显示多少条
      },
      successList: [], // 安装成功的list
      installingList:[], // 正在安装的节点list
      errorList: [], // 添加失败的节点list, 将显示在结果的div
      // isDisabled: false, // “添加节点”按钮是否禁止点击， false：可以点击； true：禁止点击
      timerId: null, // 定时器ID
      isShowAddLoading:false, // 正在添加节点
      loading: false,
    };
  },
  computed:{
    chooseList: function(){
      let tem = this.list.filter(ele => {
        return ele.isChoose;
      })
      return tem;
    }
  },
  created() {    
    this.getAutoNodesList('first'); // 获取未添加的节点列表
    // this.getLang(); // 调用 语言
    this.getIsInstallingNode(); // 查看有没有正在添加的节点
  },
  methods: {        
    // 调用 语言
    // getLang(){
    //   this.$i18n.locale = localStorage.getItem('locale');
    // },

    //  // 点击页码数发送请求
    // handleCurrentChange() {
    //   this.getAutoNodesList();  
    // },

    // 点击ul/ul右上角选择勾，获取选中的节点
    // 选中状态切换 + 选中状态的 nodeName 列表
    // handleIsShow(nodeName){
    //   this.requestParametersList = [];
    //   for (var i = 0; i < this.list.length; i++) {
    //     if (this.list[i].nodeName == nodeName) { // 如果点击了该节点
    //       this.list[i].isChoose = !this.list[i].isChoose;
    //       if(this.list[i].isChoose == true){ // 给该节点的右上角显示 对勾
    //         // this.list[i].isChoose = 'choose' // 显示 ul 的选中状态
    //       // }else{
    //         // this.list[i].isChoose = ''
    //       }
    //     }
    //     // 重置请求参数
    //     if(this.list[i].isChoose == true){
    //       this.requestParametersList.push({nodeName:this.list[i].nodeName,ip:this.list[i].ip});
    //     }
    //   }
    // },

    // 获取　需要自动添加的　节点列表
    getAutoNodesList(isToList) {  
      // this.historyAndNowList.some(ele => {
      //   return ele.pageNum === this.page.pageNum;
      // })
      if(isToList){
        this.page.currentPage = 1;
      }
      this.$axios  
        .get(Lib.API().node.getAutoNodes + `?status=discovered&pageNum=${this.page.currentPage}&pageSize=${this.page.pageSize}`)
        // /api/node/nodes 
        .then(res => {
          const data = res.data;         
          if (data.success) {
            if(data.results){
              data.results.forEach(element => {
                // disksize 原始数据类型 "sda:2000GB,sdb:450GB,sdc:120G" =》数组
                element.disksize = element.disksize?element.disksize.split(','):[];
                element.isChoose = true;
              });
              if(isToList === 'first' || isToList === 'isToList'){
                this.list = data.results;
              }else{
                this.list = [...this.list, ...data.results];
              }
               
              this.page.total = data.total;

              // // 1
              // let historyAndNowList = this.list.filter(ele => {
              //   return ele.isChoose;
              // })

              // // 2 循环查看是否已经添加了同一个页面
              // this.historyAndNowList.some
              // this.historyAndNowList.push(
              //   {
              //     pageNum:this.page.pageNum,
              //     list:historyAndNowList,
              //   }
              // )
              // this.page.currentPage = data.pageNum;
              // this.page.pageSize = data.pageSize;
              // 要全部循环， 添加样式
              // this.requestParametersList = [];
              // for(var i = 0; i < this.list.length; i++){
              //   this.$set(this.list[i],'isChoose',true);
              //   // this.$set(this.list[i],'isChoose','choose');                
              //   this.requestParametersList.push({nodeName:this.list[i].nodeName,ip:this.list[i].ip});
              // }
              
              // 添加成功后会重新获取这个列表，判断是否跳转到 节点列表 页
              if(isToList === 'isToList'){
                var isTo = this.list.some( ele => {
                  return ele.currstate === '2';
                })
                if(!isTo){
                  this.$router.push({path:'/cluster/nodelist'});
                }
              }

            }else{
              // this.isDisabled = true; // 禁止点击
              this.list = [];
              if(isToList){
                var isTo = this.list.some( ele => {
                  return ele.currstate === '2';
                })
                if(!isTo){
                  this.$router.push({path:'/cluster/nodelist'});
                }
              }
            }                      
          }else{
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }
        })
    },

    // 获取是否有正在添加的节点，　和定时器同一个请求，　只是仅发一次
    getIsInstallingNode(){
      setTimeout(() => {
        this.$axios.get(Lib.API().node.getIsInstallingNode + '?timer=AAA')
      // `/api/node/nodes?timer=AAA`
        .then(res => {
          const data = res.data;
          if(data.success){ 
            if(data.results.length) { // 只有有值，说明有正在安装的

              this.isShowAddLoading = true; // 显示添加的提示 

              var allNodeList = data.results;
              // // 1.安装成功 0.正在安装 2.安装出现异常            
              this.successList.length = 0;
              this.installingList.length = 0;
              this.errorList.length = 0;
              for(let i=0; i < allNodeList.length; i++){              

                // 安装成功的节点
                if(allNodeList[i].currstate === '1'){
                  this.successList.push(allNodeList[i].nodeName);              
                }
                // 正在安装的节点
                if(allNodeList[i].currstate === '0'){              
                  this.installingList.push(allNodeList[i].nodeName);                
                }
                // 安装失败的节点
                if(allNodeList[i].currstate === '2'){
                  this.errorList.push(allNodeList[i].nodeName);
                } 
              } 
              this.getCurrstate(); // 开启定时器
            }else{　// 安装完成，可能有成功的，失败的
              this.isShowAddLoading = false; 
              
            }            
          }else{
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }  
        })
      },2000)      
    },

    // 提交 / 添加节点
    addAutoNode(){
      // 判断是否选中了节点
      // if(this.requestParametersList.length > 0){
        let requestParametersList = []; // 要传的列表
        this.chooseList.forEach( ele => {
          requestParametersList.push({nodeName:ele.nodeName,ip:ele.ip})
        })

        this.loading = true;
        this.$axios.post(Lib.API().node.addAutoNode ,requestParametersList)
        // '/api/node/nodes'
        .then(res => {
          const data = res.data;
          if(data.success){
            this.isShowAddLoading = true; // 点击提交就立马显示添加提示
            this.getIsInstallingNode(); // 获取正在添加的列表
            this.getCurrstate(); // 开启定时器请求, 定时器中也是获取正在添加的列表，但是因为定时器设置的是　5 分钟后开启，　所以，在上一行先立即发送了请求
            this.getAutoNodesList('first'); // 重新获取“未添加列表”，　因为刚添加过的就不在“未添加列表”里了
          }else{
            // 如果添加异常
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }
          this.loading = false;
        })
      // }      
    },

    // 定时器获取节点添加的状态
    getCurrstate(){
      // 关闭上一次的定时器, 避免重新打开这个页面时， 重复发送定时器请求  
      clearInterval(this.timerId);
      // 开启新的定时器
      this.timerId = setInterval(() => {
        // 发送请求， 获取添加结果
        this.$axios.get(Lib.API().node.getIsInstallingNode + '?timer=AAA')
        // this.$axios.get('http://rap2api.taobao.org/app/mock/data/22288')
        .then(res => {
          const data = res.data;
          if(data.success){ 
            if(data.results.length) { // 只有有值，说明有正在安装的
              this.isShowAddLoading = true; // 显示添加的提示 
              // 
              var allNodeList = data.results;
              // 清空
              this.successList.length = 0;
              this.installingList.length = 0;
              this.errorList.length = 0;
              // // 1.安装成功 0.正在安装 2.安装出现异常             
              for(let i=0; i < allNodeList.length; i++){             
                // 安装成功的节点
                if(allNodeList[i].currstate === '1'){
                  this.successList.push(allNodeList[i].nodeName);              
                }
                // 正在安装的节点
                if(allNodeList[i].currstate === '0'){              
                  this.installingList.push(allNodeList[i].nodeName);                
                }
                // 安装失败的节点
                if(allNodeList[i].currstate === '2'){
                  this.errorList.push(allNodeList[i].nodeName);
                }            
              } 
              if(this.installingList.length == 0){ // 正在添加的为　０，说明已完成
                
                this.isShowAddLoading = false; 
                
                this.stopTimer(); // 关闭定时器
                
                // this.getAutoNodesList(); //???? 重新获取未安装列表，可能有安装失败的，安装失败的也在安装列表里
                this.$message({
                  showClose: true,
                  message: this.$t("m.node.addNodeCompleted"),
                  type: "success", // 可能成功，　可能失败
                  duration: Lib.Common.messageDuration
                });
                this.getAutoNodesList('isToList');
                // setTimeout(()=>{
                //   this.$router.push({path:'/cluster/nodelist'});
                // },2000)
                
              }
            }else{　// 安装完成，可能有成功的，失败的
              this.isShowAddLoading = false; 
              this.stopTimer(); // 关闭定时器
              // this.getAutoNodesList(); //？？？？ 重新获取未安装列表，可能有安装失败的，安装失败的也在安装列表里
              this.$message({
                showClose: true,
                message: this.$t("m.node.addNodeCompleted"),
                type: "success", // 可能成功，　可能失败
                duration: Lib.Common.messageDuration
              });
              this.getAutoNodesList('isToList');
              // setTimeout(()=>{
              //   this.$router.push({path:'/cluster/nodelist'});
              // },2000)
            }            
          }else{
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams,'interval');
          }  
        })               
      }, 60000)  // 60000毫秒-> 1 分钟发一次请求　　// 测试用　半分钟发送一次请求
    },

    // 关闭定时器
    stopTimer: function () {
      clearInterval(this.timerId);
      // console.log('关闭了定时器');
    },
  }
};
</script>

<style  lang="less"  scoped >

main section {
  padding:10px;
}
.add-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.add-list ul.choose {
  border: 1px solid #1a99a5;
  color: #1a99a5;
}
.add-list ul {
  border: 1px solid #dddddd;
  border-radius:5px;
  width: 230px;
  padding: 10px;
  margin: 10px;
  position: relative;
  color: #999999;
  li {
    padding: 5px 0;
    // display:flex;
    >span:nth-child(1) {
      width: 70px;
      text-align: right;
      display: inline-block;
    }
    span:nth-child(2) {
      display: inline-block;
      vertical-align: top;
    }
  }
  span.disksize {
    width: 130px;
    > span {
      text-align: left;
    }
  }
  li:nth-child(1){
    border-bottom:1px solid #eeeeee;
    text-align: center;
    margin-bottom: 5px;
  }
  li:last-child {
    padding: 0;
    position: absolute;
    right: -8px;
    top: -8px;
    background-color: #fff;
    line-height: 0;
    span:nth-child(1){
      width: 18px;
    }
  }
  li span.is-show {
    display: inline-block;
    width: 18px;    
    span.blue-icon .icon {
      color: #1a99a5;
    }
  }
  span.gray-icon{
      display: inline-block;
      width: 18px;
      height: 18px;
      padding: 0;
      margin: 0;
      border-radius: 100%;
      border: 1px solid #dddddd;
    }
}
div.btn-wrap {
  text-align: center;
  padding: 15px 0;
  border-top: 1px solid #dddddd;
  margin-top: 20px;
}
.list-length {
  padding-left: 10px;
  color: #666666;
  border-bottom: 1px solid #eeeeee;
  padding-bottom: 2px;
}
.page-block {
  text-align: right;
}
div.addLoading {
  border: 1px solid #94b0e7;
  background-color: #f9fcff;
  margin-bottom: 10px;
  padding: 10px 15px;
  color: #666;
  position: relative;
  // border-radius: 5px;
  p:first-child {
    border-bottom: 1px solid rgb(207, 231, 250);
    margin:0;
    i {
      color: #1a99a5;
      font-size: 27px;
    }
  }
  .nodelists {
    margin-left: 30px;
  }
  .tip {
    color: #999999;
    margin-bottom: 0;
    padding-bottom: 0;
    font-size: 13px;
  }
  .el-icon-close{
    position: absolute;
    right: 10px;
    top: 10px;
  }
}

</style>
