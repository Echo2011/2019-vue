<template>
    <main>
      <div class="main-btn-wrap"   v-if="role=='viewer'" style="height:40px;">
        <div>
          <router-link to="/modeltraining/job/submit?appType=job">
            <el-button size="medium" type="primary" id="joblist_newjob"  plain icon="el-icon-plus">{{$t('m.create')}}</el-button>
          </router-link> &nbsp; &nbsp; 

          <el-dropdown  trigger="click" v-if="templateList.length">
            <el-button size="medium" type="primary" plain icon="el-icon-plus">
              {{$t('m.templateCreate')}}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="item in templateList" :key="item.templateName">
                <router-link
                  :to="'/modeltraining/job/submit?appType=job&istemplate=1&templateName='+item.templateName"
                >{{item.templateName}}</router-link>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          
        </div>
      </div> 
      
      <!-- 查询条件 -->
      <section :class="{'search-info':true, 'is-show-conditions':!isConditionsMore}" v-if="role==='viewer'">
        <el-form ref="form" :model="form" label-width="130px"  size="small">

          <el-form-item :label="$t('m.job.operatingStatus')">
            <el-checkbox-group v-model="form.status" id="joblist_checkbox-group-status">
              <el-checkbox label="Scheduled"  id="joblist_checkbox_scheduled">{{$t('m.job.scheduled')}}</el-checkbox>
              <el-checkbox label="Running"   id="joblist_running">{{$t('m.job.running')}}</el-checkbox>
              <el-checkbox label="Terminated"   id="joblist_terminated">{{$t('m.job.terminated')}}</el-checkbox>
              <el-checkbox label="Paused" id="joblist_paused">{{$t('m.job.paused')}}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <!-- more conditions -->
          <div v-show="isConditionsMore">
            <el-form-item :label="$t('m.job.jobResult')">
              <el-checkbox-group v-model="form.state" id="joblist_checkbox_group_state">
                <el-checkbox label="Succeeded" id="joblist_checkbox_succeeded">{{$t('m.job.succeeded')}}</el-checkbox>
                <el-checkbox label="Failed" id="joblist_failed">{{$t('m.job.failed')}}</el-checkbox>
              </el-checkbox-group>
            </el-form-item> 
            <div class="input-wrap">
              <div>
                <el-form-item :label="$t('m.job.jobName')">
                  <el-input v-model="form.jobName"  id="joblist_jobName"></el-input>
                </el-form-item>
                <el-form-item :label="$t('m.zone.name')">
                  <el-input v-model="form.zoneName" id="joblist_zoneName"></el-input>
                </el-form-item>
                <el-form-item :label="$t('m.job.jobStartTime')">
                  <el-date-picker
                    v-model="dateArrStart" 
                    value-format="yyyy-MM-dd"
                    type="daterange" 
                    range-separator="--"
                    :start-placeholder="$t('m.startDate')"
                    :end-placeholder="$t('m.endDate')" 
                    @change="jobStartHandle"
                    id="joblist_jobStartTime">
                  </el-date-picker>
                </el-form-item>
              </div>
              
              <div>
                <el-form-item :label="$t('m.image.imageName')">
                  <el-input v-model="form.image" id="joblist_imageName"></el-input>
                </el-form-item>
                <el-form-item v-if="role === 'admin'" :label="$t('m.username')">
                  <el-input v-model="form.owner" id="joblist_username"></el-input>
                </el-form-item>
                <el-form-item :label="$t('m.job.jobEndTime')">
                  <el-date-picker
                    v-model="dateArrEnd" 
                    value-format="yyyy-MM-dd"
                    type="daterange" 
                    range-separator="--"
                    :start-placeholder="$t('m.startDate')"
                    :end-placeholder="$t('m.endDate')" 
                    @change="jobEndHandle"
                    id="joblist_jobEndTime">
                  </el-date-picker>
                </el-form-item> 
              </div>
            </div>
            <!-- button -wrap -->
            <el-form-item >
              <el-button type="primary"  id="joblist_btn_search" icon="el-icon-search" @click="getList();storageQuery()">{{$t('m.search')}}</el-button> &nbsp; &nbsp; &nbsp;
            </el-form-item>

          </div>
        </el-form>


        <div style="position: absolute; right:15px; top:20px; height:44px;vertical-align: middle;"> 
          <transition>
            <el-button type="primary" v-show="!isConditionsMore"  size="small" id="joblist_btn_conditions" icon="el-icon-search" @click="getList();storageQuery()">{{$t('m.search')}}</el-button>
          </transition>  &nbsp; &nbsp; &nbsp; 
          <span @click="isConditionsMore = !isConditionsMore" class="more-confition-text"> 
            
            <span v-show="!isConditionsMore">{{$t('m.job.moreConditions')}} <i class="el-icon-arrow-right"></i></span>

            <span v-show="isConditionsMore">{{$t('m.job.lessConditions')}} <i class="el-icon-arrow-down"></i></span>
          </span>
        </div>

      </section>

      <!-- 查结果 -->
      <section class="show-info">
       
         <table v-loading="loading"  :element-loading-text="$t('m.loading')">
           <thead >
             <tr>
               <th style="width:60px;"></th>
               <th>{{$t('m.job.jobName')}}</th>
               <th v-if="role=='admin'">{{$t('m.username')}}</th>               
               <th v-if="role=='admin'">executor{{$t('m.username')}}</th>               
               <th v-if="role=='admin'">{{$t('m.job.quotas')}}</th>               
               <th>{{$t('m.zone.name')}}</th>
               <th v-if="role=='viewer'">{{$t('m.image.imageName')}}</th>
               <th>{{$t('m.job.operatingStatus')}}</th>
               <th>{{$t('m.job.jobResult')}}</th>               
               <th>{{$t('m.startDate')}}</th>
               <th>{{$t('m.endDate')}}</th>
               <th class="operation" colspan="2" style="min-width:100px;padding-left:10px;">{{$t('m.operating')}}</th>
             </tr>
           </thead>           
           <tbody v-for="(item,index) in list" :key="item.jobName" >
             
             <tr  v-loading="item.loading"  :element-loading-text="$t('m.loading')">

               <td v-if="item.children" :title="item.isShowChildren?$t('m.re-expand'):''" @click="getJobChildren(item.simpleJobName,index)" class="has-first"><i v-if="item.children" :class="item.isShowChildren?'el-icon-arrow-down':'el-icon-arrow-right'"></i></td>
               <td v-else></td>

               <td>{{item.simpleJobName}}</td>
                <td v-if="role=='admin'">{{item.owner}}</td>
                <td v-if="role=='admin'">{{item.workItemInfo.executor}}</td>
                <td v-if="role=='admin'">
                  <ul>
                    <li>GPU: {{quotas.GPU.amount}}Core</li>
                    <li>CPU: {{quotas.CPU.amount}}Core</li>
                    <li>{{$t('m.memory')}}: {{quotas.MEM.amount+quotas.MEM.unit}}</li>
                  </ul>
                </td>
               <td>{{item.zoneName}}</td>
               <td v-if="role=='viewer'">{{item.imageName}}</td>
               <td><span v-if="!item.children"><span v-if="item.jobStatus.runningStatus!='Unknown'">{{$t('m.job.'+item.jobStatus.runningStatus.toLowerCase())}}</span></span></td>
               <td><span v-if="!item.children"><span v-if="item.jobStatus.runningStatus == 'Terminated'">{{$t('m.job.'+item.jobStatus.state.toLowerCase())}}</span></span></td>   
               <td><span v-if="!item.children">{{item.jobStatus.startedTime | toDate('date')}}</span></td>  
               <td><span v-if="!item.children">{{item.jobStatus.completedTime | toDate('date')}}</span></td>      
               <td class="operation"  colspan="2">
                  <!-- 删除，已完成　or 已取消 不可删除 -->
                  <el-button type="text" icon="el-icon-delete" v-if="(item.children && item.canDelete)||(!item.children && (item.jobStatus.runningStatus != 'Terminated')　&& (item.jobStatus.runningStatus != 'Canceled'))" @click="item.isDeleteVisible=true"> {{$t('m.delete')}}</el-button>
                  
                  <!-- 查看详情 -->
                  <router-link  v-if="!item.children" :to="'/modeltraining/job/detail?uid='+item.uid+'&zoneName='+item.zoneName+'&jobName='+item.jobName+'&startedTime='+item.jobStatus.startedTime+'&completedTime='+item.jobStatus.completedTime">
                    <el-button type="text"  icon="el-icon-view"> {{$t('m.detail')}}</el-button>
                  </router-link>

                  <!-- 暂停 -->
                  <el-button type="text" v-show="(item.children&&item.runningStatusResult == 'Running') || (!item.children && item.jobStatus.runningStatus == 'Running')"  @click="pause(item.uid,item.zoneName,index,item.simpleJobName)" style="position:relative;left:-13px;"> 
                    <svg class="icon" aria-hidden="true" >
                      <use xlink:href="#icon-zanting"></use>
                    </svg> 
                    {{$t('m.pause')}}
                  </el-button>

                  <!-- 恢复 -->
                  <el-button type="text" icon="el-icon-caret-right"   @click="resume(item.uid,item.zoneName,index,item.simpleJobName)" v-show="(item.children&&item.runningStatusResult == 'Paused') || (!item.children && item.jobStatus.runningStatus == 'Paused')"> {{$t('m.resume')}}</el-button>

                  <!-- 克隆 ==》新建任务-->
                  <router-link  v-if="!item.children" :to="'/modeltraining/job/detail?uid='+item.uid+'&zoneName='+item.zoneName+'&jobName='+item.jobName+'&startedTime='+item.jobStatus.startedTime+'&completedTime='+item.jobStatus.completedTime">
                    <el-button type="text"  icon="el-icon-document-copy"> {{$t('m.job.clone')}}</el-button>
                  </router-link>

                  <!-- 保存为模板 ==》 新建模板-->
                  <!-- <router-link  :to="'/modeltraining/template/submit?appType=job&istemplate=1'+item.uid+'&zoneName='+item.zoneName+'&jobName='+item.jobName+'&startedTime='+item.jobStatus.startedTime+'&completedTime='+item.jobStatus.completedTime"> -->
                    <el-button type="text"  icon="el-icon-document-copy" @click="saveAsTemplate(item)"> {{$t('m.job.saveAsTemplate')}}</el-button>
                  <!-- </router-link> -->

                  <!-- 删除框 -->
                  <transition name="operationTransition">
                    <div class="box-cart operation-message" v-show="item.isDeleteVisible">
                      <span class="close-wrap" @click="item.isDeleteVisible=false"><i class="el-icon-close"></i></span>
                      <div class="content">
                        <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' + item.simpleJobName + '?'}}</p>
                        <div style="text-align: right; margin: 0"> 
                          <el-button size="small" @click="item.isDeleteVisible =false">{{$t('m.cancel')}}</el-button>                       
                          <el-button type="primary" size="small" @click="item.isDeleteVisible=false;deleteHandle(item.uid,item.zoneName,item.jobName,item.simpleJobName)">{{$t('m.confirm')}}</el-button>
                        </div>
                      </div>                      
                    </div>
                  </transition> 
               </td>
             </tr>
             <!-- 分布式里的子任务 -->
             <tr v-if="item.isShowChildren" v-for="child in item.children" :key="child.jobName" class="tr-children" >
               <td></td>
               <td>{{child.simpleJobName}}</td>
               <td v-if="role=='admin'">{{child.owner}}</td>
               <td>{{child.zoneName}}</td>
               <td>{{child.imageName}}</td>
               <td><span v-if="child.jobStatus.runningStatus!='Unknown'">{{$t('m.job.'+child.jobStatus.runningStatus.toLowerCase())}}</span></td>
               <td><span v-if="child.jobStatus.runningStatus == 'Terminated'">{{$t('m.job.'+child.jobStatus.state.toLowerCase())}}</span></td>   
               <td>{{child.jobStatus.startedTime | toDate('date')}}</td>  
               <td>{{child.jobStatus.completedTime | toDate('date')}}</td>      
               <td class="operation" >
                  <!-- 查看详情 -->
                  <router-link :to="'/modeltraining/job/detail?uid='+child.uid+'&zoneName='+child.zoneName+'&jobName='+child.jobName+'&startedTime='+child.jobStatus.startedTime+'&completedTime='+child.jobStatus.completedTime">
                    <el-button type="text"  icon="el-icon-view"> {{$t('m.detail')}}</el-button>
                  </router-link>
               </td>
               <td></td>
             </tr>
             
           </tbody>
         </table>
        
         <!-- 分页 -->
        <div class="page-block">  
            <span>{{$t('m.total')}} {{page.total}} {{$t('m.tiao')}}</span>      
            <el-pagination
              @current-change="getList"
              :current-page.sync="page.currentPage"
              :page-size="page.pageSize"
              layout="prev, pager, next"
              :total="page.total"  id="joblist_page">
            </el-pagination>
        </div>       
      </section>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
    return {   
      isConditionsMore: false,
      role:'',
      // visualList:[],
      list:  [], 
      dateArrStart: [],
      dateArrEnd: [],
      form: {
        owner:'',
        zoneName: '',
        jobName: '',
        image: '',
        status: ['Running'],
        state: [],
        jobStart: '',
        jobEnd: '',
        startFrom: '',
        startTo: '',
        endFrom: '',
        endTo: ''
      },
      page: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10 // 一页显示多少条
      },  
      volumeName:'',
      username:'',
      // visualTri:'el-icon-arrow-down',
      timer:'',
      jobTimer:'',
      loading: false,
      templateList: [],
    };
  },

  created() {
    this.changeLang();
    this.getList(); 
    this.refreshJobList();
    this.getTemplateList();
  },

  destroyed(){
    this.clearTimer()
  },


  methods: {

    saveAsTemplate(item){
      console.log(item);
      // 处理数据
      // let t = {
      //   templateName: this.form.jobName,
      //   imageTag: this.form.imageTag,
      //   quotas: JSON.stringify(this.$refs['quotas'].$data.form),
      //   hyperParameters: this.superParamArr,
      //   description: this.form.desc,
      //   appType: this.appType,
      //   executor: this.form.executor,
      //   lib: this.form.executor,
      //   entryFile: this.appType==='job' ? this.form.entryFile : this.form.workSpace,
      //   workDirectory: this.form.workDirectoryJob,
      //   logPath: this.form.logPath, // 不用验证，/dd/tt 这个 tt 是 logpath 的值， 这个是用户输入的目录名， 不存在有没有现在，/dd/是入口文件目录，在 entryFile 中验证即可
      //   gputype: this.form.gputype
      // }

      // 单机版
      if(item.quotas.MEM.unit == 'MB'){
        item.quotas.MEM.unit = parseInt(item.quotas.MEM.unit / 1024);
      }
      let data = {
        imageTag: item.imageName + ':' + item.imageTag,
        quotas: {    
          cpu: item.quotas.CPU.amount,
          gpu: item.quotas.GPU.amount,
          amount: item.quotas.MEM.amount,
          unit: item.quotas.MEM.unit,
          gpuType: labels.gputype || '',
          parameterServerQuotas: {
            count: 1,
            cpu:1,
            amount:1,
            unit:'GB',
          },
          workerQuotas: {
            count:1 ,
            cpu:1,
            gpu:0,
            amount:1,
            unit:'GB',
          },
        },
      }

      // 分布式




      item = JSON.stringify(item);
      item = encodeURI(item);
      this.$router.push({
        path: `/modeltraining/template/submit?appType=job&istemplate=1&saveTemplate=1item=${item}`,
      });
    },

    // 获取模板列表
    getTemplateList() {
      this.loading = true;
      this.$axios({
        method: "get",
        url: Lib.API().job.templateList
      }).then(res => {
        let result = res.data;
        if (result.success) {
          // 过滤
          this.templateList = result.data.filter(ele => {
            console.log()
            return ele.appType == 'job';
          })
          
        } else {
          Lib.Common.errorMessage(
            this.$t("m.responseErrorMessage." + result.message || "default"),
            result.messageParams
          );
        }
        this.loading = false;
      });
    },

    // 获取该分布式式创建的所有任务 / 子任务
    getJobChildren(jobName,index){
      // 如果本来是显示，点击后隐藏
      if(this.list[index].isShowChildren){
        this.list[index].isShowChildren = !this.list[index].isShowChildren;
        this.list[index].canDelete = false;  // 恢复初始状态
        this.list[index].runningStatusResult = '';    // 恢复初始状态    
        return false;
      }

      // 如果本来是隐藏，先获取数据，然后显示
      this.list[index].loading = true;
      this.$axios
        .get(Lib.API().job.joblist + `?pageSize=100&pageNum=1&owner=${this.form.owner}&zoneName=${this.form.zoneName}&jobName=${jobName}&image=${this.form.image}&status=${this.form.status.length?JSON.stringify(this.form.status):''}&state=${this.form.state.length?JSON.stringify(this.form.state):''}&startFrom=${this.form.startFrom}&startTo=${this.form.startTo}&endFrom=${this.form.endFrom}&endTo=${this.form.endTo}&appType=job`) 
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
            this.list[index].canDelete = data.jobs.some(ele => {
              return ele.jobStatus.runningStatus == 'Scheduled' || ele.jobStatus.runningStatus == 'Paused' || ele.jobStatus.runningStatus == 'Running'
            })
            // 暂停，恢复　图标　是否可以显示
            /**
             * 1, 如果有一个是　已计划　Scheduled，设置　runningStatusResult 为空　'',　即不出现　暂停/恢复
             * 2, 如果有一个是　暂停　Paused,设置　runningStatusResult 为　Paused, 即出现　恢复　图标
             * ３, 如果有一个是　暂停　Running,设置　runningStatusResult 为　Running, 即出现　暂停　图标
             */
            data.jobs.forEach(ele => {
              if(ele.jobStatus.runningStatus == 'Scheduled'){
                this.list[index].runningStatusResult = '';
                return false;
              }else if(ele.jobStatus.runningStatus == 'Paused'){
                this.list[index].runningStatusResult = 'Paused';
                return false;
              }else if(ele.jobStatus.runningStatus == 'Running'){
                this.list[index].runningStatusResult = 'Running';
                return false;
              }
            })

            this.list[index].children = data.jobs; 
            this.list[index].isShowChildren = !this.list[index].isShowChildren; // 显示子任务
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.list[index].loading = false;
      })
    },

    // 切换语言
    changeLang() {
      this.$i18n.locale = localStorage.getItem("locale"); // 切换语言
      
      this.role =  localStorage.getItem("rolesJob")?localStorage.getItem("rolesJob"):null; 
      this.username = Lib.Common.getCookies("username")?Lib.Common.getCookies("username"):null;

      // 获取角色
      if(this.role == 'viewer'){
        this.form.owner = this.username; // 获取用户名
        // console.log(this.form.owner);
      }
      this.volumeName = localStorage.getItem('volumeName')?localStorage.getItem('volumeName'):'nfs';
      
      // 遍历赋值
      var formQueryJoblist = JSON.parse(localStorage.getItem(this.username+'formQueryJoblist'));
      for(let prop in formQueryJoblist){
        this.form[prop] = formQueryJoblist[prop];
      }
    },  


    // 任务开始时间
    jobStartHandle(){
      if(this.dateArrStart){
        this.form.startFrom = this.dateArrStart[0]+'T00:00:00Z';
        this.form.startTo = this.dateArrStart[1]+'T00:00:00Z';
      }else{
        this.form.startFrom = '';
        this.form.startTo = '';
      }      
    },

    // 任务结束时间
    jobEndHandle(){
      if(this.dateArrEnd){
        this.form.endFrom = this.dateArrEnd[0]+'T00:00:00Z';
        this.form.endTo = this.dateArrEnd[1]+'T00:00:00Z';
      }else{
        this.form.endFrom = '';
        this.form.endTo = '';
      }      
    },

    


    // 获取列表 
    getList(interval){
      // 只有定时器才会传　interval 这个参数
      this.loading = interval ? false : true;
      this.$axios
        .get(Lib.API().job.joblist + `?pageSize=${this.page.pageSize}&pageNum=${this.page.currentPage}&owner=${this.form.owner}&zoneName=${this.form.zoneName}&jobName=${this.form.jobName}&image=${this.form.image}&status=${this.form.status.length?JSON.stringify(this.form.status):''}&state=${this.form.state.length?JSON.stringify(this.form.state):''}&startFrom=${this.form.startFrom}&startTo=${this.form.startTo}&endFrom=${this.form.endFrom}&endTo=${this.form.endTo}&appType=job`) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            // 比较新获取到的数据与旧数据，如果相同，则不刷新
            if(this.list.length && (this.page.total == data.total)){ // 如果原来有值，并且２次获取的 total 相同，则走入比对
              // 循环
              // 按顺序比对，因为列表是按时间顺序排列的，
              // 比对　８　个字段：　任务名，用户名，分区名，镜像名，运行状态，运行结果，开始日期，结束日期
              // 全部相同，则不刷新
              var isTheSame = this.list.every((ele,i)=>{
                return (this.list[i].jobName == data.jobs[i].jobName) &&
                  (this.list[i].owner == data.jobs[i].owner) &&
                  (this.list[i].zoneName == data.jobs[i].zoneName) &&
                  (this.list[i].imageName == data.jobs[i].imageName) &&
                  (this.list[i].jobStatus.runningStatus == data.jobs[i].jobStatus.runningStatus) &&
                  (this.list[i].jobStatus.state == data.jobs[i].jobStatus.state) &&
                  (this.list[i].jobStatus.startedTime == data.jobs[i].jobStatus.startedTime) && 
                  (this.list[i].jobStatus.completedTime == data.jobs[i].jobStatus.completedTime);
              });

              if(isTheSame){
                this.loading = false;
                return false;
              }
            }

            data.jobs.forEach(ele => {
              ele.isDeleteVisible = false; //
              ele.isShowChildren = false; // 是否展示　分布式　的子内容
              ele.loading = false; // 用于　获取子的渲染时展示
              
              ele.simpleJobName = ele.jobName.split('-')[0]; // 分布式　总的任务名，只用于展示
              if(ele.jobName.includes('-')){
                ele.children = [];
                ele.canDelete = false;  // true or false, 默认　false, 用于判断分布式父级是否出现　删除　按钮
                ele.runningStatus = ''; // 'Paused' or 'Running' 用于判断分布式父级是否出现　暂停　或者　恢复　按钮
              }  
            })

            this.list = data.jobs; 
            this.page.total = data.total?data.total:0; 
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams, interval);
          }
          if(!interval){
            this.loading = false;
          }
          
      })
    },

    // auto refresh list
    refreshJobList(){
      // clearInterval(this.jobTimer);
      this.jobTimer=setInterval(() => {
        this.getList('interval');
      }, 15000 );  // 15 seconds
    },


    // 暂停任务
    pause(uid,zoneName,index,jobName){
      this.loading = true;
      this.$axios
      .put(Lib.API(uid).job.pauseItem + `?zoneName=${zoneName}`)
      // /api/job/jobs/${uid}/pause
      // .put(`http://rap2api.taobao.org/app/mock/2311//api/jobs/%7Buid%7D/pause?uid=${uid}`)
      .then( res => {
        const data = res.data;
        if(data.success){
          this.$message({
            showClose: true,
            message: jobName + " " + this.$t("m.pause"),
            type: "success",
            duration: Lib.Common.messageDuration
          });
          if(this.list[index].children){ // 分布式
            this.getJobChildren(jobName,index);
          }else{ // 单机版
            this.list[index].jobStatus.runningStatus = 'Paused';
          }
          
          
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loading = false;
      })
    },

    // 恢复任务
    resume(uid,zoneName,index,jobName){
      this.loading = true;
      this.$axios
      .put(Lib.API(uid).job.resumeItem + `?zoneName=${zoneName}`)
      // /api/job/jobs/${uid}/resume
      // .put(`http://rap2api.taobao.org/app/mock/2311//api/jobs/%7Buid%7D/resume?uid=${uid}`)
      .then( res => {
        const data = res.data;
        if(data.success){
          this.$message({
            showClose: true,
            message: jobName + " " + this.$t("m.resume"),
            type: "success",
            duration: Lib.Common.messageDuration
          });
          
          if(this.list[index].children){ // 分布式
            this.getJobChildren(jobName,index);
          }else{ // 单机版
            this.list[index].jobStatus.runningStatus = 'Running';
          }
          // this.list[index].jobStatus.runningStatus = 'Running';
          // this.getJobChildren(jobName,index);
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loading = false;
      })
    },

    // 删除
    deleteHandle(uid,zoneName,jobName,simpleJobName){

      this.loading = true;
      this.$axios
        // .delete("http://rap2api.taobao.org/app/mock/2311//api/jobs/%7Buid%7D")
        // `/api/job/jobs/${uid}?zoneName=${zoneName}`
        .delete(Lib.API(uid).job.deleteItem + `?zoneName=${zoneName}`) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.$message({
              showClose: true,
              message: simpleJobName + " " + this.$t("m.deleted"),
              type: "success",
              duration: Lib.Common.messageDuration
            });
            // 延迟　1　秒发请求，否则有缓存
            setTimeout(this.getList, 1000); // 延迟执行获取列表
          } else {
            this.loading = false;
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
      })
    },

    clearTimer(){
      if(this.jobTimer){
        clearInterval(this.jobTimer);
      }
    },

    // 点击查询时， 把 查询条件存在 localStorage 里， 下次进入该页面从 storage 里直接取值。 在用户登录时删除该 storage， 
    // 存储时 key 值加上用户名， 避免同一个浏览器同时多个用户登录 覆盖问题
    storageQuery(){
      // console.log('storageQuery')
      // 1, 遍历对象 this.form 
      var formQueryJoblist = {}
      for(let prop in this.form) {
        formQueryJoblist[prop] = this.form[prop];
      }
      // 2, 存储
      localStorage.setItem(this.username+'formQueryJoblist',JSON.stringify(formQueryJoblist))
    }
  }
};
</script>

<style lang="less" scoped>
main {
  position: relative;
}

section.search-info {
  > div.title {
    margin: 5px 0 10px 0;
    font-weight: bold;
    padding-bottom: 10px;
  }
  form {    
    > div.input-wrap{
      display: flex;
      margin-right: 40px;
      > div {
        flex-basis: 50%;
        margin: 0 auto;
      }
    }
    
  }
}
table{  

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
</style>