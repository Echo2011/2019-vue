<template>
<main style="position:relative;padding-top:28px;">
  <el-tabs v-model="activeName"  >
    <el-tab-pane name="dockerhub" style="background-color: #fff;">
      <span slot="label" id="image-download-tab-dockterhub">
        <svg class="icon" aria-hidden="true" style="font-size:1.2em;">
          <use xlink:href="#icon-docker1"></use>
        </svg> &nbsp;Dockter Hub
      </span>    
    </el-tab-pane>
    <el-tab-pane  name="ali">
      <span slot="label" id="image-download-tab-ali">
        {{$t('m.image.aimaxMLImage')}}
      </span> 
    </el-tab-pane>     
  </el-tabs>

  <!-- dockerhub -->
  <div v-if="activeName==='dockerhub'">
    <div :class="{'main-header':isResponse, begianSearch:!isResponse}" style="padding-top:10px;padding-right:15px;"> 
      <div><h1 v-if="!isResponse" style="padding-bottom:20px;">{{$t('m.image.searchImage')}}</h1></div>      
      <div class="search-form" style="padding-top:10px;padding-right:15px;"> 
        <el-input :placeholder="$t('m.pleaseEnter')+$t('m.image.imageName')"  v-model="query" id="imagelist_download_input" @keyup.enter.native="getImages" clearable > 
          <i slot="prefix" @click="getImages" class="el-input__icon el-icon-search" id="imagelist_download_search"></i>
        </el-input>
      </div>
    </div>
    
    <section class="show-info" v-if="isResponse" style="padding-top:20px;">   
      <table  v-loading="loading" :element-loading-text="$t('m.loading')">
        <thead>
          <tr>
            <th>{{$t('m.image.ImageName')}}</th>
            <th>{{$t('m.image.downloadTimes')}}</th>          
            <th>{{$t('m.image.isOfficial')}}</th>
            <th>{{$t('m.image.isAutomated')}}</th>
            <th>{{$t('m.desc')}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,index) in list" :key="index">
            <td @click="toVersions(item)"><span class="a">{{item.name}}</span></td>
            <td>{{item.starCount}}</td>
            <td>{{item.official ? $t('m.yes') : $t('m.no')}}</td>
            <td>{{item.automated ? $t('m.yes') : $t('m.no')}}</td>
            <td>{{item.description}}</td>
          </tr>
        </tbody>
      </table>
      <div class="page-block"> 
        <span>{{$t('m.total')}} {{list.length}} {{$t('m.tiao')}}</span>       
      </div>
    </section>
  </div>

  <!-- 阿里镜像 -->
  <div v-if="activeName==='ali'">
    <section class="show-info" style="padding-top:20px;">   
      <table  v-loading="loading" :element-loading-text="$t('m.loading')">
        <thead>
          <tr>
            <th>{{$t('m.image.ImageName')}}</th>
            <!-- <th>{{$t('m.image.downloadTimes')}}</th>           -->
            <th>{{$t('m.image.isOfficial')}}</th>
            <th>{{$t('m.image.isAutomated')}}</th>
            <th>{{$t('m.desc')}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,index) in listAli" :key="index">
            <td @click="toVersions(item)"><span class="a">{{item.name}}</span></td>
            <!-- <td>{{item.starCount}}</td> -->
            <td>{{item.official ? $t('m.yes') : $t('m.no')}}</td>
            <td>{{item.automated ? $t('m.yes') : $t('m.no')}}</td>
            <td>{{item.description}}</td>
          </tr>
        </tbody>
      </table>
      <div class="page-block"> 
        <span>{{$t('m.total')}} {{listAli.length}} {{$t('m.tiao')}}</span>       
      </div>
    </section>
  </div>

  
  
</main>     
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {    
    return { 
      list:[],
      listAli:[],
      isResponse: false, // 是否发起查询的请求
      query:'',
      loading: false, // 
      loadingAli: false, // 
      activeName: '',
      
    };
  },
  created(){
    // 版本列表后退到该页面，取值 this.$route.query.activeName
    this.activeName = this.$route.query.activeName ? this.$route.query.activeName : 'dockerhub';
    // 用户刷新的情况， 将从 localStorage 里取值
    this.query = localStorage.getItem("imageExternalQuery") ? localStorage.getItem("imageExternalQuery") : '';
    if(this.query){
      this.isResponse = true;
      this.getImages();
    };   
    this.getImagesAli();
  },
  methods: {

    toVersions(item){
      localStorage.setItem('toImageDownloadVersion',JSON.stringify(item));
      this.$router.push({ name: 'downloadVersions',query: { activeName: this.activeName }});
    },

    // dockerhub 镜像列表
    getImages() { 
      localStorage.setItem("imageExternalQuery", this.query);
      this.isResponse = Boolean(this.query);

      if(!this.query){
        return false;
      }
      
      this.loading = true;
      this.$axios
      .get(Lib.API().image.getRemoteImages + `?imageName=${this.query}`)
      .then(res => {
        const data = res.data;
        if (data.success) {   
          this.list = data.imageSearch ? data.imageSearch : []; //
          this.isResponse = true;
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loading = false;
      });
    },

    // 阿里镜像
    getImagesAli() { 
      
      this.loadingAli = true;
      this.$axios
      .get(Lib.API().image.imagesAli)
      .then(res => {
        const data = res.data;
        if (data.success) {   
          this.listAli = data.list ? data.list : []; //
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loadingAli = false;
      });
    },
    
  }
};
</script>

<style lang="less" scoped>
.begianSearch {
  background-color: #ffffff;
  min-width: 400px;
  text-align: center;
  padding: 50px;
  min-height: 500px;
  h1 {
    color: #1a99a5;
    font-size: 30px;
  }
  .search-form {
    width: 500px;
    margin: 0 auto;
    padding-bottom: 100px;
  }
}
.main-header {
  // display: flex;
  // flex-direction:row-reverse;
  position: absolute;
  z-index: 2;
  right: 0;
  top: -5px;
  .search-form {
    width: 267px; 
    // display: flex;
    // > div{
    //   width: 200px;
    //   margin-left:20px;
    // }    
  }
}
table {  
  th{
    padding-right: 20px;
    min-width: 100px;
  }
  // border-top: 1px solid #eeeeee;
  // thead tr {
  //   line-height: 30px;
  // }
  // .a {
  //   color: #1a99a5;
  //   // font-weight: bold;
  //   &:hover {
  //     text-decoration: underline #1a99a5;
  //   }
  // }
}
</style>
