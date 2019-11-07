<template>
    <main>
      <div class="main-btn-wrap">   
        <div>
          <router-link to="/modeltraining/visual/submit?appType=visual">
            <el-button size="medium" type="primary" id="visual_list_new"  plain icon="el-icon-plus">{{$t('m.create')}}</el-button>
          </router-link>  &nbsp; &nbsp; 

          <el-dropdown  trigger="click"  v-if="templateList.length">
            <el-button size="medium" type="primary" plain icon="el-icon-plus">
              {{$t('m.templateCreate')}}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="item in templateList" :key="item.templateName">
                <router-link
                  :to="'/modeltraining/visual/submit?appType=visual&istemplate=1&templateName='+item.templateName"
                >{{item.templateName}}</router-link>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>  
        <div> 
          <el-input id="visual_list_query" v-model="query" :placeholder="$t('m.pleaseEnter')+$t('m.visualName')" clearable ></el-input> &nbsp; 
          <el-button  id="visual_list_search" size="medium" type="primary" icon="el-icon-search" @click="getList">{{$t('m.search')}}</el-button>
        </div>        
      </div>

      
     
      
      <section class="show-info">
       
         <table  v-loading="loading"  :element-loading-text="$t('m.loading')">
           <thead>
             <tr>
               <th>{{$t('m.visualName')}}</th>
               <th>{{$t('m.store.type')}}</th>               
               <th>{{$t('m.createTime')}}</th>
               <th class="operation" style="padding-left:7px;">{{$t('m.operating')}}</th>
             </tr>
           </thead>           
           <tbody v-if="list.length">
             <tr v-for="(item,index) in list" :key="item.id" v-loading="item.loading"  :element-loading-text="$t('m.loading')">

               <td>{{item.jobName}}</td> 
               <td>
                 <span v-if="role==='viewer'">{{item.type}}</span>
                 <span v-else>{{item.workItemInfo.executor}}</span>
               </td>
               <td>
                 <span v-if="role==='viewer'">{{item.createTime | toDate()}}</span>
                 <span v-else>{{item.jobStatus.startedTime | toDate()}}</span>
               </td>  
               <td class="operation" >
                 
                  <!-- 详情 -->
                  <span v-if="role==='viewer'">
                    <router-link v-if="item.type==='caffe'" :to="'/modeltraining/visual/detailCaffe?id='+item.id+'&jobName='+item.jobName"> 
                      <el-button type="text" icon="el-icon-view" > {{$t('m.detail')}}</el-button>
                    </router-link>
                    <router-link v-if="item.type==='tensorboard'" :to="'/modeltraining/visual/detailTensorflow?port='+item.url.split(':')[2]+'&id='+item.id+'&jobName='+item.jobName"> 
                      <el-button type="text" icon="el-icon-view" > {{$t('m.detail')}}</el-button>
                    </router-link>
                  </span>
                  

                  <!-- 删除 -->
                  <el-popover
                    placement="bottom"
                    width="360"
                    v-model="item.isDeleteVisible" >
                      <div>
                        <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' + item.jobName + '?'}}</p>
                        <div style="text-align: right; margin: 0">  
                          <el-button size="mini" @click="item.isDeleteVisible = false">{{$t('m.cancel')}}</el-button>                      
                          <el-button type="primary" size="mini" @click="item.isDeleteVisible=false;removeVisual(item.id,index)">{{$t('m.confirm')}}</el-button>
                          
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
            <span>{{$t('m.total')}} {{page.total}} {{$t('m.tiao')}}</span>      
            <el-pagination
              @current-change="getList"
              :current-page.sync="page.currentPage"
              :page-size="page.pageSize"
              layout="prev, pager, next"
              :total="page.total"  id="visual_list_page">
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
      query: '', // 
      list:  [], 
      templateList: [],
      page: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10 // 一页显示多少条
      },  
      volumeName:'',
      username:'',
      loading: false, // 
      role: '',
      ownerQuery: '',
    };
  },

  created() {
    this.role = localStorage.getItem('rolesJob')?localStorage.getItem('rolesJob'):'viewer';
    this.username = Lib.Common.getCookies("username")?Lib.Common.getCookies("username"):null; 
    this.volumeName = this.volumeName = localStorage.getItem('volumeName')?localStorage.getItem('volumeName'):'nfs';
    this.getList();
    this.getTemplateList();
  },


  methods: {    
    // 获取模板列表
    getTemplateList() {
      this.loading = true;
      this.$axios({
        method: "get",
        url: Lib.API().job.templateList
      }).then(res => {
        let data = res.data;
        if (data.success) {
          // 过滤
          this.templateList = data.data.filter(ele => {
            return ele.appType == 'visual';
          })
        } else {
          Lib.Common.errorMessage(
            this.$t("m.responseErrorMessage." + data.message || "default"),
            data.messageParams
          );
        }
        this.loading = false;
      });
    },

    // 获取列表 
    getList(){
      // 只有定时器才会传　interval 这个参数
      this.loading = true; 
      this.$axios
        .get(Lib.API().job.visualsList + `?pageSize=${this.page.pageSize}&pageNum=${this.page.currentPage}&owner=${this.username}&jobName=${this.query}`) 
        .then(res => {
          const data = res.data;
          if (data.success) {    
            
              data.list.forEach(ele => {
                ele.isDeleteVisible = false; //
                ele.loading = false;          
              })
              this.list = data.list; 
            
            this.page.total = data.total ? Number(data.total) : 0; 
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams, interval);
          }
          this.loading = false;
      })
    },

    //删除可视化服务
    removeVisual(id,index){
      this.list[index].loading = true;
      this.$axios
        .delete(Lib.API(id).job.visualDelete) 
        // .delete(`/api/job/visual/${id}`) 
        .then(res => {
          const data = res.data;
          if (data.success) { 
            this.$message({
              showClose: true,
              message:  " " + this.$t("m.deleted"),
              type: "success",
              duration: Lib.Common.messageDuration
            });
            this.getList();
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
            
          }
          this.list[index].loading = false; // 如果删除失败，取消加载状态，删除成功会重新获取数据
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
  td:last-child {
    min-width: 100px; 
  }
}

</style>