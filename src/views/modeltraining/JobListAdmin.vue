<template>
    <main style="padding-top:5px;">
      <!-- <BaseMainHeader>    
        
        <template slot="search-input">
          
        </template>    
      </BaseMainHeader> -->
      <div style="position:absolute; top:10px; right:5px; z-index:2; width:400px;">
        <el-input :placeholder="$t('m.pleaseEnter')+$t('m.username')"  v-model.trim="queryOwner" id="joblistadmin_input_search" @keyup.enter.native="getList" clearable > 
          <i slot="prefix" class="el-input__icon el-icon-search" @click="getList"></i>
        </el-input>
      </div>
      

      <!-- 查结果 -->
      <section class="show-info" style="background-color:#f1f1f1;">

        <!-- 交互式开发   -->
        <el-tabs v-model="activeName" >
          <el-tab-pane :label="$t('m.nav.interactiveDevelopment')" name="interactive">
            <table  v-loading="loadingInteractive"  :element-loading-text="$t('m.loading')">
              <thead>
                <tr>
                  <th>{{$t('m.job.jobName')}}</th> 
                  <th>{{$t('m.username')}}</th>　           
                  <th>{{$t('m.job.executor')}}</th>
                  <th>{{$t('m.zone.name')}}</th>
                  <th>{{$t('m.job.quotas')}}</th>
                  <th>{{$t('m.creationTime')}}</th>　
                  <th>{{$t('m.job.operatingStatus')}}</th>
                  <th class="operation" style="padding-left:7px;">{{$t('m.operating')}}</th>　
                </tr>
              </thead>           
              <tbody v-if="listInteractive.length">
                <tr v-for="item in listInteractive" :key="item.uid"   >
                  <td>{{item.jobName}}</td>               
                  <td>{{item.owner}}</td>               
                  <td>{{item.workItemInfo.executor}}</td>               
                  <td>{{item.zoneName}}</td>   
                  <td>
                    <ul>
                      <li>GPU: {{item.quotas.GPU.amount}}Core</li>
                      <li>CPU: {{item.quotas.CPU.amount}}Core</li>
                      <li>{{$t('m.memory')}}: {{item.quotas.MEM.amount+item.quotas.MEM.unit}}</li>
                    </ul>
                </td>            
                  <td>{{item.jobStatus.startedTime | toDate('date')}}</td>  
                  <td>{{$t('m.job.'+item.jobStatus.runningStatus.toLowerCase())}}</td>
                  <td class="operation">                  
                      
                      <!-- 删除 -->
                      <el-popover
                        placement="bottom"
                        width="280"
                        v-model="item.isDeleteVisible" >
                          <div>
                            <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' +'?'}}</p>
                            <div style="text-align: right; margin: 0">  
                              <el-button size="mini" @click="item.isDeleteVisible = false">{{$t('m.cancel')}}</el-button>                      
                              <el-button type="primary" size="mini" @click="item.isDeleteVisible=false;deleteHandle('interactive',item.uid,item.zoneName)">{{$t('m.confirm')}}</el-button>
                              
                            </div>
                          </div>
                        <el-button slot="reference" type="text" icon="el-icon-delete" >
                        {{$t('m.delete')}}
                        </el-button>
                      </el-popover>

                  </td>
                </tr>           
              </tbody>
            </table>
            
            <!-- 分页 -->
            <div class="page-block">  
              <span>{{$t('m.total')}} {{pageInteractive.total}} {{$t('m.tiao')}}</span>   
              <!-- 不分页    -->
            </div>
          </el-tab-pane>

          <!-- 任务训练 -->
          <el-tab-pane :label="$t('m.nav.jobTraining')" name="job">
            <table v-loading="loadingJob"  :element-loading-text="$t('m.loading')">
              <thead >
                <tr>
                  <th style="width:40px;"></th>
                  <th>{{$t('m.job.jobName')}}</th>
                  <th >{{$t('m.username')}}</th>              
                  <th >{{$t('m.job.executor')}}</th>               
                  <th >{{$t('m.job.quotas')}}</th>               
                  <th>{{$t('m.zone.name')}}</th>
                  <th>{{$t('m.job.operatingStatus')}}</th>
                  <th>{{$t('m.job.jobResult')}}</th>               
                  <th>{{$t('m.startDate')}}</th>
                  <th class="operation" colspan="2" style="min-width:100px;padding-left:10px;">{{$t('m.operating')}}</th>
                </tr>
              </thead>           
              <tbody v-for="(item,index) in listJob" :key="index" v-loading="item.loading"  :element-loading-text="$t('m.loading')">
                
                <tr>

                    <td v-if="item.children" :title="item.isShowChildren?$t('m.re-expand'):''" @click="getJobChildren(item.simpleJobName,index)" class="has-first"><i v-if="item.children" :class="item.isShowChildren?'el-icon-arrow-down':'el-icon-arrow-right'"></i></td>
                    <td v-else></td>

                    <td>{{item.simpleJobName}}</td>
                    <td >{{item.owner}}</td>
                    <td >{{item.workItemInfo.executor}}</td>
                    <td >
                      <ul v-if="!item.children">
                        <li>GPU: {{item.quotas.GPU.amount}}Core</li>
                        <li>CPU: {{item.quotas.CPU.amount}}Core</li>
                        <li>{{$t('m.memory')}}: {{item.quotas.MEM.amount+item.quotas.MEM.unit}}</li>
                      </ul>
                    </td>
                    <td>{{item.zoneName}}</td>
                    <td><span v-if="!item.children">{{$t('m.job.'+item.jobStatus.runningStatus.toLowerCase())}}</span></td>
                    <td><span v-if="!item.children"><span v-if="item.jobStatus.runningStatus == 'Terminated'">{{$t('m.job.'+item.jobStatus.state.toLowerCase())}}</span></span></td> 

                    <td>{{item.jobStatus.startedTime | toDate('date')}}</td>  

                    <td class="operation"  colspan="2">
                      <!-- 删除，已完成　or 已取消 不可删除 -->
                      
                      <el-popover
                        placement="bottom"
                        width="280"
                        v-model="item.isDeleteVisible" >
                          <div>
                            <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' +'?'}}</p>
                            <div style="text-align: right; margin: 0">  
                              <el-button size="mini" @click="item.isDeleteVisible = false">{{$t('m.cancel')}}</el-button>                      
                              <el-button type="primary" size="mini" @click="item.isDeleteVisible=false;deleteHandle('job',item.uid,item.zoneName)">{{$t('m.confirm')}}</el-button>
                              
                            </div>
                          </div>
                        <el-button v-if="(item.children && item.canDelete)||(!item.children && (item.jobStatus.runningStatus != 'Terminated')　&& (item.jobStatus.runningStatus != 'Canceled'))" slot="reference" type="text" icon="el-icon-delete" >
                        {{$t('m.delete')}}
                        </el-button>
                      </el-popover>

                  </td>
                </tr>
                <!-- 分布式里的子任务 -->
                <tr v-if="item.isShowChildren" v-for="child in item.children" :key="child.jobName" class="tr-children" >
                    <td></td>
                    <td>{{child.simpleJobName}}</td>
                    <td >{{child.owner}}</td>
                    <td >{{item.workItemInfo.executor}}</td>
                    <td >
                    <ul>
                      <li>GPU: {{item.quotas.GPU.amount}}Core</li>
                      <li>CPU: {{item.quotas.CPU.amount}}Core</li>
                      <li>{{$t('m.memory')}}: {{item.quotas.MEM.amount+item.quotas.MEM.unit}}</li>
                    </ul>
                    </td>
                    <td>{{child.zoneName}}</td>
                    <td><span v-if="child.jobStatus.runningStatus!='Unknown'">{{$t('m.job.'+child.jobStatus.runningStatus.toLowerCase())}}</span></td>
                    <td><span v-if="child.jobStatus.runningStatus == 'Terminated'">{{$t('m.job.'+child.jobStatus.state.toLowerCase())}}</span></td>   
                    <td>{{child.jobStatus.startedTime | toDate('date')}}</td>  
                    <td class="operation" ></td>
                    <td></td>
                </tr>
                
              </tbody>
            </table>

            <div class="page-block">  
                <span>{{$t('m.total')}} {{pageJob.total}} {{$t('m.tiao')}}</span>      
                <el-pagination
                  @current-change="getListJob"
                  :current-page.sync="pageJob.currentPage"
                  :page-size="pageJob.pageSize"
                  layout="prev, pager, next"
                  :total="pageJob.total"  id="joblistadmin_visual_list_page">
                </el-pagination>
            </div>
          </el-tab-pane>

          <!-- 可视化 -->
          <el-tab-pane :label="$t('m.nav.visual')" name="visual">
            <table  v-loading="loadingVisual"  :element-loading-text="$t('m.loading')">
              <thead>
                <tr>
                  <th>{{$t('m.visualName')}}</th>
                  <th>{{$t('m.username')}}</th>
                  <th>{{$t('m.store.type')}}</th>               
                  <th>{{$t('m.job.quotas')}}</th>
                  <th>{{$t('m.createTime')}}</th>
                  <th class="operation" style="padding-left:7px;">{{$t('m.operating')}}</th>
                </tr>
              </thead>           
              <tbody v-if="listVisual.length">
                <tr v-for="(item,index) in listVisual" :key="index" >

                  <td>{{item.jobName}}</td> 
                  <td>{{item.owner}}</td>
                  <td>{{item.type}}</td>
                  <td>CPU: {{item.cpuAmount}}Core&nbsp;  &nbsp;  &nbsp; 
                      {{$t('m.memory')}}: {{item.memAmount}}GB</td>
                  <td>{{item.createTime | toDate('date')}}</td>  
                  <td class="operation" >
                      <!-- 删除 -->
                      <el-popover
                        placement="bottom"
                        width="280"
                        v-model="item.isDeleteVisible" >
                          <div>
                            <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' +'?'}}</p>
                            <div style="text-align: right; margin: 0">  
                              <el-button size="mini" @click="item.isDeleteVisible = false">{{$t('m.cancel')}}</el-button>                      
                              <el-button type="primary" size="mini" @click="item.isDeleteVisible=false;deleteHandle('visual',item.id)">{{$t('m.confirm')}}</el-button>
                              
                            </div>
                          </div>
                        <el-button slot="reference" type="text" icon="el-icon-delete" >
                        {{$t('m.delete')}}
                        </el-button>
                      </el-popover>

                  </td>
                </tr>           
              </tbody>
            </table>
            
            <div class="page-block">  
              <span>{{$t('m.total')}} {{pageVisual.total}} {{$t('m.tiao')}}</span>      
              <el-pagination
                @current-change="getListVisual"
                :current-page.sync="pageVisual.currentPage"
                :page-size="pageVisual.pageSize"
                layout="prev, pager, next"
                :total="pageVisual.total"  id="joblistadmin_visual_list_page">
              </el-pagination>
            </div>
          </el-tab-pane>

          <!-- 模型部署 -->
          <el-tab-pane :label="$t('m.nav.modelDeployment')" name="model">
            <table  v-loading="loadingModel"  :element-loading-text="$t('m.loading')">
              <thead>
                <tr>
                  <th>{{$t('m.job.jobName')}}</th> 
                  <th>{{$t('m.username')}}</th>　           
                  <th>{{$t('m.job.executor')}}</th>
                  <th>{{$t('m.zone.name')}}</th>
                  <th>{{$t('m.job.quotas')}}</th>
                  <th>{{$t('m.creationTime')}}</th>　
                  <th>{{$t('m.job.operatingStatus')}}</th>
                  <th class="operation" style="padding-left:7px;">{{$t('m.operating')}}</th>　
                </tr>
              </thead>           
              <tbody v-if="listModel.length">
                <tr v-for="item in listModel" :key="item.uid"   >
                  <td>{{item.jobName}}</td>               
                  <td>{{item.owner}}</td>               
                  <td>{{item.workItemInfo.executor}}</td>               
                  <td>{{item.zoneName}}</td>   
                  <td>
                    <ul>
                      <li>GPU: {{item.quotas.GPU.amount}}Core</li>
                      <li>CPU: {{item.quotas.CPU.amount}}Core</li>
                      <li>{{$t('m.memory')}}: {{item.quotas.MEM.amount+item.quotas.MEM.unit}}</li>
                    </ul>
                </td>            
                  <td>{{item.jobStatus.startedTime | toDate('date')}}</td>  
                  <td>{{$t('m.job.'+item.jobStatus.runningStatus.toLowerCase())}}</td>
                  <td class="operation">                    

                      <!-- 删除 -->
                      <el-popover
                        placement="bottom"
                        width="280"
                        v-model="item.isDeleteVisible" >
                          <div>
                            <p style="text-align:left;">{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' + '?'}}</p>
                            <div style="text-align: right; margin: 0">  
                              <el-button size="mini" @click="item.isDeleteVisible = false">{{$t('m.cancel')}}</el-button>                      
                              <el-button type="primary" size="mini" @click="item.isDeleteVisible=false;deleteHandle('model',item.uid,item.zoneName)">{{$t('m.confirm')}}</el-button>
                            </div>
                          </div>
                        <el-button slot="reference" type="text" icon="el-icon-delete" >
                          {{$t('m.delete')}}
                        </el-button>
                      </el-popover>

                  </td>
                </tr>           
              </tbody>
            </table>
            
            <!-- 分页 -->
            <div class="page-block">  
              <span>{{$t('m.total')}} {{pageModel.total}} {{$t('m.tiao')}}</span>   
              <!-- 不分页    -->
            </div>
          </el-tab-pane>
        </el-tabs>

      </section>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";
// import BaseMainHeader from '../../components/BaseMainHeader.vue';

export default {
  // components: {
  //   BaseMainHeader
  // },
  data() {
    return {   
      activeName: 'interactive',
           
      listJob: [],
      listInteractive: [],
      listModel: [],
      listVisual: [],
      queryOwner: '',
      pageJob: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10 // 一页显示多少条
      }, 
      pageInteractive: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10 // 一页显示多少条
      },
      pageModel: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10 // 一页显示多少条
      },
      pageVisual: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10 // 一页显示多少条
      }, 
      loadingJob: false,
      loadingVisual: false,
      loadingInteractive: false,
      loadingModel: false,
    };
  },

  created() {
    this.getList();
    
  },



  methods: {
    
    getList(){
      this.getListInteractive();
      this.getListModel();
      this.getListJob();
      this.getListVisual();
    },


    // 交互式开发
    getListInteractive(){
      
      this.loadingInteractive = true;
      this.$axios({
        method: 'get',
        url: Lib.API().job.interactiveListAndDetail + `?owner=${this.queryOwner}&appType=interactive`,           
      }).then(res =>{
        const data = res.data;
        if(data.success){

          data.jobs.forEach(ele => {
            ele.isDeleteVisible = false;
          })
          
          this.listInteractive = data.jobs; 
          this.pageInteractive.total = data.total ? Number(data.total) : 0; 

        }else{         
          var messageCode = data.message || 'default';
          var messageText = this.$t('m.responseErrorMessage.' + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loadingInteractive = false;
      })
    },

    // 任务训练
    getListJob(){
      this.loadingJob = true;
      this.$axios
        .get(Lib.API().job.joblist + `?pageSize=${this.pageJob.pageSize}&pageNum=${this.pageJob.currentPage}&owner=${this.queryOwner}&appType=job`) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            
            data.jobs.forEach(ele => {
              ele.isDeleteVisible = false; //
              ele.isShowChildren = false; // 是否展示　分布式　的子内容
              ele.loading = false; // 用于　获取子的渲染时展示
              
              ele.simpleJobName = ele.jobName.split('-')[0]; // 分布式　总的任务名，只用于展示
              if(ele.jobName.includes('-')){
                ele.children = [];
                ele.canDelete = false;  // 判断分布式父级是否出现　删除　按钮
                ele.runningStatus = ''; // 'Paused' or 'Running' 用于判断分布式父级是否出现　暂停　或者　恢复　按钮
              }  
            })
            this.pageJob.total = data.total;
            this.listJob = data.jobs;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loadingJob = false;
          
      })
    },

    // 获取job分布式创建的所有任务 / 子任务
    getJobChildren(jobName,index){
      // 如果本来是显示，点击后隐藏
      if(this.listJob[index].isShowChildren){
        this.listJob[index].isShowChildren = !this.listJob[index].isShowChildren;
        this.listJob[index].canDelete = false;  // 恢复初始状态
        this.listJob[index].runningStatusResult = '';    // 恢复初始状态    
        return false;
      }

      // 如果本来是隐藏，先获取数据，然后显示
      this.listJob[index].loading = true;
      this.$axios
        .get(Lib.API().job.joblist + `?pageSize=100&pageNum=1&owner=${this.queryOwner}&jobName=${jobName}&appType=job`) 
        .then(res => {
          const data = res.data;
          if (data.success) {            
            data.jobs.forEach(ele => {
              // ele.isDeleteVisible = false; //
              ele.simpleJobName = ele.jobName.split('-');
              ele.simpleJobName.shift();
              ele.simpleJobName = ele.simpleJobName.join('-');         
            })
            // 可以删的情况　　(item.jobStatus.runningStatus != 'Terminated')　&& (item.jobStatus.runningStatus != 'Canceled')
            // 即　['Scheduled', 'Running', 'Terminated', 'Paused','Canceled']
            this.listJob[index].canDelete = data.jobs.some(ele => {
              return ele.jobStatus.runningStatus == 'Scheduled' || ele.jobStatus.runningStatus == 'Paused' || ele.jobStatus.runningStatus == 'Running'
            })
            // 暂停，恢复　图标　是否可以显示
            /**
             * 1, 如果有一个是　已计划　Scheduled，设置　runningStatusResult 为空　'',　即不出现　暂停/恢复
             * 2, 如果有一个是　暂停　Paused,设置　runningStatusResult 为　Paused, 即出现　恢复　图标
             * ３, 如果有一个是　暂停　Running,设置　runningStatusResult 为　Running, 即出现　暂停　图标
            //  */
            // data.jobs.forEach(ele => {
            //   if(ele.jobStatus.runningStatus == 'Scheduled'){
            //     this.listJob[index].runningStatusResult = '';
            //     return false;
            //   }else if(ele.jobStatus.runningStatus == 'Paused'){
            //     this.listJob[index].runningStatusResult = 'Paused';
            //     return false;
            //   }else if(ele.jobStatus.runningStatus == 'Running'){
            //     this.listJob[index].runningStatusResult = 'Running';
            //     return false;
            //   }
            // })

            this.listJob[index].children = data.jobs; 
            this.listJob[index].isShowChildren = !this.listJob[index].isShowChildren; // 显示子任务
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.listJob[index].loading = false;
      })
    },


    // 模型部署     
    getListModel(isFirst){
      this.loadingModel = true;

      this.$axios({
        method: 'get',
        url: Lib.API().job.interactiveListAndDetail + `?owner=${this.queryOwner}&appType=model`,           
      }).then(res =>{
        const data = res.data;
          if (data.success) {            
            data.jobs.forEach(ele => {
              ele.isDeleteVisible = false; //
              // ele.isActiving = false;
            })
            this.listModel = data.jobs; 
            this.pageModel.total = data.total ? Number(data.total) : 0; 
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loadingModel = false;
      })
    },


    // 可视化
    getListVisual(){
      this.loadingVisual = true; 

      this.$axios
        .get(Lib.API().job.visualsList + `?pageSize=${this.pageVisual.pageSize}&pageNum=${this.pageVisual.currentPage}&owner=${this.queryOwner}`) 
        .then(res => {
          const data = res.data;
          if (data.success) {    
            data.list.forEach(ele => {
              ele.isDeleteVisible = false; //
            })
            this.listVisual = data.list; 
            this.pageVisual.total = data.total ? Number(data.total) : 0; 
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loadingVisual = false;
      })
    },

    // 删除
    deleteHandle(which,uidOrId,zoneName){
      // console.log('delete');
      
      let url = '';
      if(which === 'model'){ // 模型部署
        url = Lib.API('hand'+uidOrId).job.deleteDeployment + `?zoneName=${zoneName}`;
        this.loadingModel = true;
      }else if(which === 'interactive'){ // 交互式开发
        url = Lib.API('hand'+uidOrId).job.deleteDeployment + `?zoneName=${zoneName}`;
        this.loadingInteractive = true;
      }else if(which === 'visual'){ // 可视化
        url = Lib.API(uidOrId).job.visualDelete;
        this.loadingVisual = true;
      }else if(which === 'job'){ // job任务
        url = Lib.API(uidOrId).job.deleteItem + `?zoneName=${zoneName}`;
        this.loadingJob = true;
      }

      this.$axios
        .delete(url) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.$message({
              showClose: true,
              message: this.$t("m.deleted"),
              type: "success",
              duration: Lib.Common.messageDuration
            });
            // 延迟　1　秒发请求，否则有缓存
            
            if(which === 'model'){ // 模型部署
              setTimeout(this.getListModel, 1000); // 延迟执行获取列表
            }else if(which === 'interactive'){ // 交互式开发
              setTimeout(this.getListInteractive, 1000); // 延迟执行获取列表
            }else if(which === 'visual'){ // 可视化
              setTimeout(this.getListVisual, 1000); // 延迟执行获取列表
            }else if(which === 'job'){ // job任务
              setTimeout(this.getListJob, 1000); // 延迟执行获取列表
            }

          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }

          if(which === 'model'){ // 模型部署
            this.loadingModel = false;
          }else if(which === 'interactive'){ // 交互式开发
            this.loadingInteractive = false;
          }else if(which === 'visual'){ // 可视化
            this.loadingVisual = false;
          }else if(which === 'job'){ // job任务
            this.loadingJob = false;
          }
      })
    },

    
  }
};
</script>

<style lang="less" scoped>
main {
  position: relative;
}

table{  
  background-color: #fff;
  th {
    height: 40px;
  }
  td:nth-child(2),th:nth-child(2){
    padding-left:5px;
  }
}

.is-show-conditions {
  .el-form-item {
    margin-bottom: 0px;
  }
}
.more-confition-text {
  display: inline-block; 
  height: 44px;
  line-height: 48px;
}
.more-confition-text:hover {
  color:#1a99a5;
  cursor: pointer;
}
.has-children {
  // border:1px solid red !important;
}
tr.tr-children {
  background-color: #f9f9f9;
  td {
    padding: 3px 0;
  }
  &:hover {
    background-color: #f8feff;
    td:first-child {
      background-color: #f9f9f9;
    }
    td:last-child {
      background-color: #f9f9f9;
    }
  }
  td:first-child {
    border-bottom: 1px solid #f9f9f9;
  }
  td:last-child {
    width:50px;
    border-bottom: 1px solid #f9f9f9;
    border-left:1px solid #eeeeee;
    &:hover {
      background-color: #f9f9f9;
    }
  }
  td:nth-child(2) {
    padding: 4px 0 4px 5px;
    border-left:1px solid #eeeeee;
  }
}
td.has-first {
  &:hover {
    color: #1a99a5;
    cursor: pointer;
  }
}
.el-tabs__content {
  background-color: #fff;
}
</style>