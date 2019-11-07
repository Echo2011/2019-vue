<template>
<main>
  
  <BaseMainHeader>    
    <template>
      <router-link to="/image/upload">      
        <el-button  size="medium" type="primary" plain icon="el-icon-plus" id="imagelist_button_upload">{{$t('m.image.upload')}}</el-button> 
      </router-link>
    </template>
    <template slot="search-input">
      <el-input  :placeholder="$t('m.pleaseEnter')+$t('m.image.repositoryName')+'/'+$t('m.username')"  v-model="query" id="imagelist_repository_input" @keyup.enter.native="getRepository" clearable> 
        <i slot="prefix" @click="getRepository" class="el-input__icon el-icon-search" id="imagelist_repository_search"></i>
      </el-input>
    </template>    
  </BaseMainHeader>
  
  <section class="show-info" >
    <table v-loading="loadingImages" :element-loading-text="$t('m.loading')" >
      <thead>
        <tr>
          <th>{{$t('m.image.repositoryName')}}({{$t('m.username')}})</th>
          <th>{{$t('m.image.imageTotal')}}</th>
          <th>{{$t('m.creationTime')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in list" :key="item.name">
          <td class="imagelist_adminview_user"> 
            <router-link :to="'/image/list/private?username='+item.name">{{item.name}}</router-link>
          </td>
          <td>{{item.repoCount}}</td>
          <td>{{item.creationTime | toDate }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="page-block">    
      <span>{{$t('m.total')}} {{page.total}} {{$t('m.tiao')}}</span>      
      <el-pagination @current-change="getRepository"
        :current-page.sync="page.currentPage"
        :page-size="page.pageSize" layout="prev, pager, next"
        :total="page.total" id="imagelist_userlist_page">
      </el-pagination>
    </div>
  </section>
</main>     
</template>

<script>
import Lib from "../../assets/js/Lib";
import BaseMainHeader from '../../components/BaseMainHeader.vue';

export default { 
  components: {
    BaseMainHeader
  },
  data() {    
    return { 
      list:[],
      role:'',
      query:'',      
      page: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10
      },
      loadingImages: false,
    };
  },
  created(){
    this.getRepository();
  },

  methods: { 
    getRepository() {   
      this.loadingImages = true;
      this.$axios
        .get(Lib.API().image.publicImageList + `?q=${this.query}&page=${this.page.currentPage}`)
      // .get(`http://rap2api.taobao.org/app/mock/data/10613?q=${this.query}`)
      .then(res => {
        const data = res.data;
        if (data.success) {
          if (data.owners) {
            this.list = data.owners; // 用户列表
            this.page.total = data.ownersCount;
          }
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loadingImages = false;
      });
    },  
    
  }
};
</script>

<style lang="less" scoped>

</style>
