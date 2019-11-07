<template>
<main>  
  <div style="margin-bottom:2px; padding:10px 0;">
    <router-link :to="'/image/download?activeName='+activeName" id="image-download-version"> <i class="el-icon-back"></i>   {{$t('m.image.ImageName')}} {{image.name}} </router-link>
  </div>
  <section class="show-info">
    <div class="image-info">
      <span v-if="activeName==='dockerhub'">{{$t('m.image.downloadTimes')}}: {{image.starCount}}</span>      
      <span>{{$t('m.image.isOfficial')}}: {{image.official ? $t('m.yes') : $t('m.no')}}</span>
      <span>{{$t('m.image.isAutomated')}}: {{image.automated ? $t('m.yes') : $t('m.no')}}</span>
      <span>{{$t('m.desc')}}: {{image.description}}</span>
    </div>
    
    <table v-if="activeName==='dockerhub'" v-loading="loading || $store.state.imagePageLoading" :element-loading-text="$t('m.loading')" >
      <thead>
        <tr>
          <th style="padding-top:13px; padding-bottom:13px;">{{$t('m.image.version')}}</th>
          <th>{{$t('m.image.imageSize')}}(MB)</th>          
          <th>{{$t('m.creator')}}</th>
          <th>{{$t('m.modifiedTime')}}</th>
          <th>{{$t('m.image.architecture')}}</th>
          <th>{{$t('m.system')}}</th>
          <th>{{$t('m.operating')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item,index) in list" :key="index">
          <td>{{item.name}}</td>
          <td>{{item.fullSize}}</td>
          <td>{{item.creator}}</td>
          <td>{{item.lastUpdated | toDate}}</td>
          <td>{{item.architecture}}</td>
          <td>{{item.os}}</td>
          <td class="operation">
            <el-switch v-if="role=='viewer'"  v-model="item.isPublic" :active-text="$t('m.image.toPublicRepository')" :inactive-text="$t('m.image.toPrivateRepository')">
            </el-switch> 
            <el-button type="text" icon="el-icon-download" @click="downloadHandle(item.isPublic,item.name)" >
              {{$t('m.download')}}
            </el-button>
          </td>
        </tr>
      </tbody>
    </table>

    <table v-if="activeName==='ali'" v-loading="loading || $store.state.imagePageLoading" :element-loading-text="$t('m.loading')" >
      <thead>
        <tr>
          <th style="padding-top:13px; padding-bottom:13px;">{{$t('m.image.version')}}</th>
          <th>{{$t('m.image.imageSize')}}</th>          
          <th>{{$t('m.status')}}</th>
          <th>{{$t('m.digest')}}</th>
          <th>{{$t('m.operating')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item,index) in listAli" :key="index">
          <td>{{item.tag}}</td>
          <td>{{item.imageSize}}</td>
          <td>            
            <span v-if="item.status==='NORMAL'">
              <i class="el-icon-circle-check good"></i>
            </span>
            <span v-else>
              <i class="el-icon-warning warning"></i>
            </span>
          </td>
          <td :title="item.Digest">{{item.Digest.slice(0,8)+'...'}}</td>
          <td class="operation">
            <el-switch v-if="role=='viewer'"  v-model="item.isPublic" :active-text="$t('m.image.toPublicRepository')" :inactive-text="$t('m.image.toPrivateRepository')">
            </el-switch> 
            <el-button type="text" icon="el-icon-download" @click="downloadHandle(item.isPublic,item.tag)" >
              {{$t('m.download')}}
            </el-button>
          </td>
        </tr>
      </tbody>
    </table>


    <!-- 分页 -->
    <div class="page-block">    
      <span>{{$t('m.total')}} {{page.total}} {{$t('m.tiao')}}</span>      
      <el-pagination v-if="activeName==='dockerhub'" @current-change="getVersions"
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

export default {
  data() {    
    return { 
      image:{}, // 哪个镜像对象
      list:[],　// 版本列表
      listAli:[],
      role:'',
      timerId:'',
      // repositoryName:'', // 仓库名 / 镜像名 
      loading: false, // 
      page: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10
      },
      activeName: '',
    };
  },
  created(){
    this.role = localStorage.getItem("rolesImage") ? localStorage.getItem("rolesImage") : 'viewer';

      // 获取　image 的信息，　从　localStorage 里
    this.image = JSON.parse(localStorage.getItem('toImageDownloadVersion'));
    this.activeName = this.$route.query.activeName;
    if(this.activeName==='dockerhub'){
      this.getVersions(); 
    }if(this.activeName==='ali'){
      this.getVersionsAli();
    }
      
  },

  methods: {
    // 向 footer 传参
    downloadHandle(isPublic,tagName){
      this.$store.commit('imageToChange');
      isPublic = isPublic ? 1 : 0;
      Lib.bus.$emit('imageDownload',{repositoryName:this.role == 'admin' ? 'public' : Lib.Common.getCookies("username"), isPublic, imageName:this.image.name, tagName,isAli:this.activeName==='dockerhub' ? 0 : 1}); 
    },

    // 获取 dockerhub version 列表
    getVersions() {    
      
      this.loading = true;
      this.$axios
        // /api/image/images/search 
      .get(Lib.API().image.getRemoteImagesVersions + `?imageName=${this.image.name}&page=${this.page.currentPage}&page_size=${this.page.pageSize}`)
      .then(res => {
        let data = res.data;
        if (data.success) {
          if(data.version && data.version.count){
            this.page.total = data.version.count;  
            data.version.imageTags.forEach( ele => {
              ele.isPublic = (this.role === 'admin') ? true : false;
            })
            this.list = data.version.imageTags; //
          }          
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loading = false;
      });
    },

    // 获取 ali version 列表
    getVersionsAli() {    
      
      this.loading = true;
      this.$axios
      .get(Lib.API().image.imagesVersionsAli + `?imageName=${this.image.name}&page=1`)
      .then(res => {
        let data = res.data;
        if (data.success) {

          if(!data.list){  // null
            this.listAli = [];
            return false;
          }
          this.page.total = data.list.length;
          data.list.forEach( ele => {
            ele.isPublic = (this.role === 'admin') ? true : false;
          })
          this.listAli = data.list; //

        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loading = false;
      });
    },
    
    
    
  }
};
</script>

<style lang="less" scoped>
.image-info {
  display: flex;
  justify-content: space-around;
  padding: 20px 10px 25px 10px;
  box-shadow: 0px 3px 3px #cccccc;
  color: #777777;
  span {
    display: inline-block;
    text-align: left;
    padding: 0 20px;
    min-width: 150px;
  }
  span:last-child{
    flex-grow:1
  }   
}


</style>
