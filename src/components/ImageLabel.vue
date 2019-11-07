<template>
  <el-tabs v-model="activeName" style="display:block;" class="image-label">
    <!-- 公共镜像列表 -->
    <el-tab-pane :label="$t('m.image.publicImage')" name="publicImages">
      <table  v-loading="loadingPublicImages" :element-loading-text="$t('m.loading')">
        <thead>
          <tr>
            <!-- <th></th> -->
            <th style="padding-left:4em;">{{$t('m.image.imageName')}}</th>
            <th>{{$t('m.tag')}}</th>
            <th>{{$t('m.os')}}</th> 
            <th>{{$t('m.os')}} {{$t('m.version').toLowerCase()}}</th>
            <th>Python {{$t('m.version').toLowerCase()}}</th>
            <th>Python3 {{$t('m.version').toLowerCase()}}</th>
          </tr>
        </thead>
        <tbody v-for="(item,index) in publicImagesList" :key="item.name">
          <tr>
            <td><el-radio v-model="form.imageTag" :label="'registry.cluster.local/public/'+item.imageName+':'+item.tagName" @change="$emit('imageTagValue',form.imageTag)" >{{item.imageName}}</el-radio> </td>
            <!-- <td>{{item.imageName}}</td> -->
            <td>{{item.tagName}}</td>
            <td>{{item.dist}}</td>
            <td>{{item.distVersion}}</td>
            <td>{{item.python}}</td>
            <td>{{item.python3}}</td>
          </tr>
        </tbody>                   
      </table>
      <div  class="is-more">
        <el-button v-show="isPublicMore"  type="primary" plain  @click="getImages('public','more')"  id="submitjob_btn_getPublicImages" >{{$t('m.job.morePublicImages')}}</el-button>
      </div>
      
    </el-tab-pane>

    <!-- 私有镜像列表 -->
    <el-tab-pane :label="$t('m.image.privateImage')" name="privateImages">
      <table  v-loading="loadingPrivateImages" :element-loading-text="$t('m.loading')">
        <thead>
          <tr>
            <!-- <th></th> -->
            <th style="padding-left:4em;">{{$t('m.image.imageName')}}</th>
            <th>{{$t('m.tag')}}</th>
            <th>{{$t('m.os')}}</th> 
            <th>{{$t('m.os')}} {{$t('m.version').toLowerCase()}}</th>
            <th>Python {{$t('m.version').toLowerCase()}}</th>
            <th>Python3 {{$t('m.version').toLowerCase()}}</th>
          </tr>
        </thead>
        <tbody v-for="(item,index) in privateImagesList" :key="item.name">
          <tr>
            <td><el-radio v-model="form.imageTag" :label="'registry.cluster.local/user_'+username+'/'+item.imageName+':'+item.tagName" @change="$emit('imageTagValue',form.imageTag)" >{{item.imageName}}</el-radio> </td>
            <!-- <td>{{item.imageName}}</td> -->
            <td>{{item.tagName}}</td>
            <td>{{item.dist}}</td>
            <td>{{item.distVersion}}</td>
            <td>{{item.python}}</td>
            <td>{{item.python3}}</td>
          </tr>
        </tbody>                   
      </table>
      <div  class="is-more" >
        <el-button  id="submitjob_btn_getPrivateImages"  type="primary" plain v-show="isPrivateMore"  @click="getImages('private','more')" >{{$t('m.job.morePrivateImages')}}</el-button>
      </div>
    </el-tab-pane>
  </el-tabs> 
</template>

<script>
  import Lib from "../assets/js/Lib";

  export default {
    name:'ImageLabel',
    props: {
      label: {
        type: Object,
      },
      isclear: {
        type: Boolean,
        default: false,
      }
    },
    data: function() {  
      return {
        username: '', 
        activeName: 'publicImages',
        isPublicMore: true,
        isPrivateMore: true, 
        loadingPublicImages: false, // 公共镜像列表　加载图标
        loadingPrivateImages: false, // 私有镜像列表　加载图标
        pagePublic: {  // 公共镜像页码
          currentPage: 1, // 当前页码
          total: 0, // 一共多少条数据
          pageSize: 10 // 一页显示多少条
        },  
        pagePrivate: { // 私有镜像页码                                                                                                                                                                                        
          currentPage: 1, // 当前页码
          total: 0, // 一共多少条数据
          pageSize: 10 // 一页显示多少条
        },    
        publicImagesList:[],
        privateImagesList:[],
        form:{
          imageName:'',
          imageTag:'',
        }
      }
    },

    // computed: {
    //   // getter
    //   get: function () {
    //     return false;
    //   },
    //   isclear: {
    //     // setter
    //     set: function (newValue) {
    //       console.log(newValue);
          
    //       if(newValue){
    //         this.form.imageTag = '';
    //       }
    //     }
    //   }
    // },

    watch:{
      label(){
        console.log('watch label =' + this.label);
        
        this.pagePrivate.currentPage = 1;
        this.pagePublic.currentPage = 1;
        this.isPublicMore = true;
        this.isPrivateMore = true;
        this.getImages('public');
        this.getImages('private');
      },
      isclear(newValue){
         if(newValue){
            this.form.imageTag = '';
          }
      }
    },
    created(){
      this.username = Lib.Common.getCookies("username")?Lib.Common.getCookies("username"):null; // 获取用户名
      
    },
    
    mounted(){
      this.getImages('public');
      this.getImages('private');
    },

    methods: {

        // 获取镜像列表    
      getImages(which,isMore) {
        
        let query = '', pageSize = 0, page = 1,label = '';

        if(isMore){ // isMore有值， 获取更多， label 设置为空
          label = '';
          pageSize = 0; 
          
        }else{ // isMore为空，label 有值，定向查询
          pageSize = 0;
          // page = null;
          label = JSON.stringify(this.label);
          label = encodeURI(label);
        }
        
        if(which === 'public'){
          query = `?label=${label}&pageSize=${pageSize}&page=1&type=1`;
          this.loadingPublicImages = true;
          // if(this.form.imageTag.includes('public')){ // 当页码改变时，清空选中的镜像
          //   this.form.imageTag = '';
          // }
        }else{
          query = `?label=${label}&pageSize=${pageSize}&page=1&type=0`;
          this.loadingPrivateImages = true;
          // if(this.form.imageTag.includes('user_')){ // 当页码改变时，清空选中的镜像
          //   this.form.imageTag = '';
          // }
        }

        this.$axios
          .get(Lib.API().image.imagesForjob + query)
          .then(res => {
            let data = res.data;
            if(data.success){
              
              if(which === 'public'){   // 公共镜像
                if(isMore){ // 点击加载更多，label 为空，带分页
                  this.isPublicMore = false; // 不再显示 “显示更多”
                  this.publicImagesList = data.imagesForjob;
                  this.pagePublic.total = data.count;
                }else{ // label 有值，不带分页
                  this.publicImagesList = data.imagesForjob;
                  this.isPublicMore = true;
                }
              }else{ // 私有镜像
                if(isMore){ // 点击加载更多，label 为空，带分页
                  this.isPrivateMore = false; // 不太显示 “显示更多”
                  this.privateImagesList = data.imagesForjob;
                  this.pagePrivate.total = data.count;
                }else{ // label 有值，不带分页
                  this.privateImagesList = data.imagesForjob;
                  this.isPrivateMore = true;
                }
              }
            } else {
              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText, data.messageParams);
            }
            if(which === 'public'){
              this.loadingPublicImages = false;
            }else{
              this.loadingPrivateImages = false;
            }          
          })

      },

    }
    
  }
</script>

<style lang="less" scoped>
  .is-more {
    margin-top:20px;
    color: #666;
    display: block;
    width: 100%;
    font-size: 14px;
    text-align: right;
    &:hover{
      color: #1a99a5;
    }
  }
</style>

