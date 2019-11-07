<template>
    <main>
      <div class="main-btn-wrap">   
        <div>
          <router-link to="/authority/group/add" id="grouplist_creategroup">
            <el-button size="medium" type="primary"  plain icon="el-icon-plus">{{$t('m.authority.createGroup')}}</el-button>
          </router-link>                   
        </div>  
        <div> 
          <el-input id="grouplist_query" v-model="query" :placeholder="$t('m.pleaseEnter')+$t('m.authority.userGroup')" ></el-input>
          <el-button  id="grouplist_search" size="medium" type="primary" icon="el-icon-search" @click="searchHandle">{{$t('m.search')}}</el-button>
          <el-button size="medium" @click="query='';getList" type="text" >{{$t('m.reset')}}</el-button>
        </div>        
      </div>      

      <section class="show-info">
       
         <table  v-loading="loading" :element-loading-text="$t('m.loading')">
           <thead>
             <tr>
               <th>{{$t('m.authority.userGroup')}}</th>
               <th>{{$t('m.authority.numberUsers')}}</th>
               <th>{{$t('m.authority.createTime')}}</th>
               <th>{{$t('m.authority.creator')}}</th>
               <th  class="operation">{{$t('m.operating')}}</th>
             </tr>
           </thead>           
           <tbody v-if="list.length">
             <tr v-for="(item,index) in list" :key="item.groupname" >
               <td>{{item.groupname}}</td>
               <td>{{item.userCount}}</td>
               <td>{{item.createTime | toDate('date')}}</td>
               <td>{{item.creator}}</td>   
               <td class="operation" >
                  <ul style="justify-content: flex-start;">
                    <li @click="item.isViewRoles=true;item.isMore=false">
                      <el-button type="text" icon="el-icon-view">
                        {{$t('m.authority.viewAssociatedRoles')}}
                      </el-button>
                      <!-- <i class="el-icon-view"></i> -->
                    </li>
                    <!-- <li class="split" v-if="item.userCount">|</li> -->
                    <li v-if="item.userCount">
                      <router-link :to="'/authority/user/list?groupId='+item.id+'&groupname='+item.groupname">
                        <el-button type="text" icon="el-icon-view">
                          {{$t('m.authority.viewUsers')}}
                        </el-button>
                      </router-link>
                    </li>
                    <!-- <li class="split" v-show="!item.userCount">|</li> -->
                    <li v-if="!item.userCount" @click="item.isDelete=true;item.isMore=false">
                      <el-button type="text" icon="el-icon-delete">
                        {{$t('m.delete')}}
                      </el-button>
                      <!-- <i class="el-icon-delete"></i>{{$t('m.delete')}} -->
                    </li>
                  </ul>

                  <!-- isViewRoles -->
                  <transition name="operationTransition">
                  <div class="box-cart view-quote" v-show="item.isViewRoles">
                    <div class="title">
                      <span>{{$t('m.authority.associatedRoles')}}</span>                      
                    </div>
                    <span class="close-wrap" @click="item.isViewRoles=false"><i class="el-icon-close"></i></span>               
                    <ul>
                      <li v-for="role in item.roles" :key="role.id"><span>{{$t('m.nav.'+role.roleName.split('_')[0])}}:</span> {{$t('m.authority.'+role.roleName.split('_')[1])}}</li>
                    </ul>
                  </div>
                  </transition>

                  <!-- 删除框 -->
                  <transition name="operationTransition">
                    <div class="box-cart operation-message" v-show="item.isDelete">
                      <span class="close-wrap" @click="item.isDelete=false"><i class="el-icon-close"></i></span>
                      <div class="content">
                        <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' + item.groupname + '?'}}</p>
                        <div style="text-align: right; margin: 0"> 
                          <el-button size="small"   @click="item.isDelete = false">{{$t('m.cancel')}}</el-button>                       
                          <el-button type="primary" size="small" @click="item.isDelete=false;deleteHandle(item.id,item.groupname,index)">{{$t('m.confirm')}}</el-button>
                        </div>
                      </div>                      
                    </div>
                  </transition> 

               </td>
             </tr>           
           </tbody>
         </table>       

      </section>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {    
    return {  
      backupList:[],
      list: [  ], 
      query:'',
      groupId:'', // 选择的用户组　，　查看用户时传的    
      loading: false, //         
    };
  },

  created() {
    this.getList(); 
  },

  methods: {

    // 获取列表 
    getList(){
      this.loading = true;
      this.$axios
        // .get(`/api/group/groups`)
        .get(Lib.API().auth.getGroupList) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            
            data.results.map(ele => {
              ele.isMore = false; // 显示所有操作
              ele.isViewRoles = false;　// 关联角色
              ele.isDelete = false; // 
            })
            this.list = data.results; 
            this.backupList = data.results;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loading = false;
      })
    },

    // 查询
    searchHandle(){
      if(this.query.trim() === ''){
        this.list = this.backupList;
      }else{
        this.list = this.backupList.filter( ele => {
          return ele.groupname.includes(this.query)
        })
      }     
    },

    // 删除
    deleteHandle(groupId,groupname,index){
      this.loading = true;
      this.$axios
        // .delete(`/api/group/groups/${groupId}`)
        .delete(Lib.API(groupId).auth.deleteGroup) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.$message({
              showClose: true,
              message: groupname + " " + this.$t("m.deleted"),
              type: "success",
              duration: Lib.Common.messageDuration
            });
            this.list.splice(index, 1);
            this.loading = false;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
      })
    },
  }
};
</script>

<style  lang="less" scoped>

// 动画效果
.operationTransition-enter-active,
.operationTransition-leave-active {
  transition: all 0.4s;
}
// 进场，　出场状态
.operationTransition-enter,
.operationTransition-leave-to {
  opacity: 0;
}
section.show-info table {
  tbody tr td,th {
    text-align: left;
  }
}
td:first-child,th:first-child {
  padding-left: 30px;
}
td:last-child {
  position: relative;
  div.box-cart {
    left: 0;
    top: 50px;
  }
  > ul {
    display: flex;
    li {
      cursor: pointer;
      i {
        padding: 0 2px 0 0;
        color: #999999;
      }
    }
    li:last-child {
      padding-right: 0;
    }
    li.split {
      color: #cccccc;
      padding: 0 10px;
    }
    li:hover {
      color: #1a99a5;
      i {
        color: #1a99a5;
      }
    }
  }
  i {
    padding: 8px;
  }
  i:hover {
    color: #1a99a5;
  }
  div.view-more {     
    ul li:hover {
      color: #1a99a5;
    }
  }
  > div.view-quote {
    li span {
      display: inline-block;
      width: 110px;
      text-align: right;
    }
    
  }
  div.reset-password {
    width: 550px;
    .el-tabs__nav {
      margin-left:20px;
    }
    .el-tabs__content {
      margin: 0 20px;
    }
  }
}
td.operation {
  min-width:270px;
}
</style>
