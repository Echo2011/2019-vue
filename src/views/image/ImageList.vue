<template>
<main>  

  <BaseMainHeader>    
    <template>
      <router-link to="/image/upload">      
        <el-button  size="medium" type="primary" plain icon="el-icon-plus" id="imagelist_button_upload">{{$t('m.image.upload')}}</el-button> 
      </router-link>
    </template>
    <template slot="search-input" style="width:500px">
      <!-- <div> -->
        <el-button type="text" style="width:400px;"  @click="getDoc" id="imagelist_doc"><i class="el-icon-download" ></i> {{$t('m.image.dockerInfo')}}</el-button> &nbsp;  &nbsp;  &nbsp; 
        <el-input :placeholder="$t('m.pleaseEnter')+$t('m.image.imageName')"  v-model="query" id="imagelist_input_search" @keyup.enter.native="publicOrPrivate" clearable > 
          <i slot="prefix" class="el-input__icon el-icon-search" @click="publicOrPrivate"></i>
        </el-input>
      <!-- </div> -->
      
    </template>    
  </BaseMainHeader>

  <!--   <- 仓库 user_jiangwen 下的镜像    -->
  <div v-if="this.$route.query.username" style="margin-bottom:2px; color:#666; padding:10px 0;">
    <!-- <router-link to="/repository"> <i class="el-icon-back"></i>  </router-link> &nbsp; &nbsp; -->
    <el-button @click="$router.back()" size="medium" type="text" icon="el-icon-back" id="imagelist_button_upload">{{$t('m.goBack')}}</el-button> 
    &nbsp; <span style="color:#aaa;">|</span>   &nbsp; 
    {{$t('m.image.repository')}} {{this.$route.query.username}}{{$t('m.image.sIamges')}}
  </div> 

  <section class="show-info" >
    
    <table class="image-list" v-loading="loadingImages" :element-loading-text="$t('m.loading')">
      <thead>
        <tr>
          <th></th>
          <th>{{$t('m.image.imageName')}}</th>
          <th>{{$t('m.image.numberOfTags')}}</th>
          <th>{{$t('m.creationTime')}}</th>
          <th v-if="isOperation"  style="padding-left:6px;">{{$t('m.operating')}}</th>
        </tr>
      </thead>
      <tbody v-for="(item,index) in list" :key="item.name">
        <tr>
          <td class="show-hidden" @click="item.tagListVisible=!item.tagListVisible;getImageDetail(item.name,index)">
            <i v-if="!item.tagListVisible" class="el-icon-arrow-right"></i>
            <i v-else class="el-icon-arrow-down"></i>
          </td>
          <td v-if="item.containerStatus==='1'"><el-badge is-dot class="item">{{item.name}}</el-badge></td>
          <td v-if="item.containerStatus!=='1'">{{item.name}}</td>
          <td>{{item.tagsCount}}</td>
          <td>{{ item.creationTime | toDate }}</td>
          <td v-if="isOperation" class="operation">
            
            <el-popover placement="bottom"  width="260" v-model="item.deleteVisible">
              <p>{{$t('m.doYouDecide') + $t('m.delete').toLowerCase() + ' ' + item.name + '?'}}</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click.stop="item.deleteVisible = false">{{$t('m.cancel')}}</el-button>
                <el-button type="primary" size="mini" @click.stop="item.deleteVisible=false;deleteHandle(item.name,index)">{{$t('m.confirm')}}</el-button>             
              </div>
              <el-button v-show="item.deleteDisable!=='disable'" type="text" icon="el-icon-delete" slot="reference" > {{$t('m.delete')}}</el-button>
            </el-popover>
          </td>
        </tr>
        <tr v-show="item.tagListVisible">
          <td colspan="5" class="colspan-td" style="padding-left:60px; padding-right:60px;">
            <table  v-loading="item.loadingTags" :element-loading-text="$t('m.loading')">
              <thead>
                <tr>
                  <th>
                    <el-popover placement="right"  width="300" v-model="item.addTagVisible">
                      <p>
                        <p class="addtag-title">{{$t('m.new')+$t('m.tag')}}</p>
                        <el-input v-model="addTagName" :placeholder="$t('m.tagName')"  size="small"></el-input>
                        <p class="red-text" v-show="addTagError">{{$t('m.tagName')+$t('m.rules.alreadyExists')}}</p>
                        <p class="red-text" v-show="addTagRegularError">{{$t('m.tagName')+$t('m.rules.regularDot')}}
                      </p>
                      <div style="text-align: right; margin: 10px">
                        <el-button size="mini" type="text" @click="item.addTagVisible = false;addTagError=false;addTagRegularError=false;addTagName=''">{{$t('m.cancel')}}</el-button>
                        <el-button type="primary" size="mini" @click="addTagHandle(item.tagList,item.name,index)">{{$t('m.confirm')}}</el-button>
                      </div>
                      <el-button type="text" style="margin:0;padding:0;" v-if="isOperation" slot="reference"  >
                        <i class="el-icon-plus"></i>
                      </el-button>
                    </el-popover>                  
                  </th>
                  <th>{{$t('m.tag')}}</th>
                  <th>{{$t('m.creationTime')}}</th>
                  <th>{{$t('m.image.dockerVersion')}}</th>
                  <th>{{$t('m.image.architecture')}}</th>
                  <th>{{$t('m.image.os')}}</th>
                  <th class="operation" style="padding-left:10px;">  {{$t('m.operating')}}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tagItem in item.tagList" :key="tagItem.name">
                  <td></td>
                  <td>{{tagItem.name}}</td>
                  <td>{{tagItem.created | toDate }}</td>
                  <td>{{tagItem.dockerVersion}}</td>
                  <td>{{tagItem.architecture}}</td>
                  <td>{{tagItem.os}}</td>
                  <td class="image-lastChild operation">
                    <router-link :to="'/image/make?imageName='+item.name+'&tagName='+tagItem.name+'&repositoryName='+repositoryName"  v-if="isOperation">
                      <el-button type="text" icon="el-icon-news"> {{$t('m.image.makeImage')}}</el-button>
                    </router-link>
                    <router-link :to="'/image/makeByCSL?imageName='+item.name+'&tagName='+tagItem.name+'&repositoryName='+repositoryName"  v-if="isOperation">
                        <el-badge v-if="tagItem.containerStatus==='1'" is-dot class="item">
                            <el-button  type="text" icon="el-icon-news"> {{$t('m.image.makeImage')}}（console）</el-button>
                        </el-badge>
                        <el-button v-if="tagItem.containerStatus!=='1'" type="text" icon="el-icon-news"> {{$t('m.image.makeImage')}}（console）</el-button>
                    </router-link>
                  
                    <router-link :to="'/image/detail?repositoryName='+repositoryName+'&imageName='+item.name+'&tagName='+tagItem.name+'&isOperation='+isOperation">
                      <el-button type="text" icon="el-icon-view"> {{$t('m.view')}}</el-button>
                    </router-link> 
                  </td>
                </tr>                               
              </tbody>
            </table>  
          </td>
        </tr>
      </tbody>
    </table>
    <!-- 分页 -->
    <div class="page-block">   
      <span>{{$t('m.total')}} {{page.total}} {{$t('m.tiao')}}</span>
      <el-pagination v-if="page.currentPage"  @current-change="publicOrPrivate"
        :current-page.sync="page.currentPage"
        :page-size="page.pageSize" layout="prev, pager, next"
        :total="page.total">
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
      username:'',
      queryUsername: '', // 管理员查看某用户私有镜像时的该用户名
      list:[],
      role:'',
      query:'',
      isOperation:false, // 是否可操作，删除
      addTagError: false, // tag添加时重名验证
      addTagRegularError: false, // tag添加时是否符合规则的验证
      addTagName: "", // 添加的标签名input的值   
      page: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10
      },
      isPublic: 1, // Number 0:私有，1:公开
      repositoryName: '', // 仓库名, 普通用户就传 用户名, 管理员就传 "public"(也可以不传)
      loadingImages: false, // 
    };
  },

  created(){
    this.operationHandle();
  },

  mounted(){
    Lib.bus.$on("refreshImageList", (arg) => {
      this.operationHandle();
    })
  },

  destroyed(){
    Lib.bus.$off('refreshImageList');
  },

  watch:{
    $route(){
      this.publicOrPrivate();
    }
  },
  
  methods: { 

    getDoc(isSecond){
      let aa = document.createElement('a');
      let href = `/api/image/images/pushImageTxt`; 

      aa.setAttribute('href',href);
      document.body.appendChild(aa);
      aa.click();
    },


    // 是否可操作
    operationHandle(){
      this.role = localStorage.getItem("rolesImage")?localStorage.getItem("rolesImage"):'viewer'; // 角色
      this.username = this.$route.query.username || Lib.Common.getCookies("username"); // 用户名 如果是从用户列表（管理员操作）跳转过去就是查看的该用户名，否则就是　操作员的用户名
      this.publicOrPrivate();
    },

    // 判断是 公共镜像 还是 私有镜像， -> 
    publicOrPrivate(){
      if(this.$route.params.publicorprivate == 'public'){
        this.isPublic = 1;
        this.repositoryName = 'public';

        if(this.role == 'admin'){
          this.isOperation = true;          
        }else{
          this.isOperation = false;
        } 
        this.getPublic(); 

        // this.$store.dispatch('pageNameAction',this.$t('m.image.publicImage')); // 告知哪个页面

      }else if(this.$route.params.publicorprivate == 'private'){
        this.isPublic = 0;
        this.repositoryName = this.username;

        if(this.role == 'admin'){
          this.isOperation = false;
        }else{
          this.isOperation = true;
          
        }
        this.getPrivate();  
      } 
    },

    // 获取共享镜像
    getPublic() {   
      this.loadingImages = true;
      this.$axios
        .get(Lib.API().image.publicImageList +`?loginName=${this.username}&q=${this.query}&publicPage=${this.page.currentPage}`)
        // .get(`http://rap2api.taobao.org/app/mock/data/10613`)
        .then(res => {
          const data = res.data;          
          if (data.success) {
            
            // 系统保留镜像, 即不可删除
            let notDeleteArr = ['tensorflow/serving','tensorflow-gpu','caffe','vnc'];

            for (let i = 0; i < data.publicImages.length; i++) {
              data.publicImages[i].deleteVisible = false;
              data.publicImages[i].addTagVisible = false;
              data.publicImages[i].tagListVisible = false;
              data.publicImages[i].loadingTags = false;
              data.publicImages[i].tagList = [];
              data.publicImages[i].deleteDisable = 'able';

              // item.deleteDisable!=='disable' 系统保留镜像，不可删
              notDeleteArr.forEach(ele => {
                if(data.publicImages[i].name === ele){
                  data.publicImages[i].deleteDisable = 'disable';
                }
              })
            }
            this.list = data.publicImages; // 公共镜像列表
            this.page.total = data.publicImagesCount;           
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loadingImages = false;
        });
    },  

    // 获取私有镜像
    getPrivate() {
      this.loadingImages = true;
      this.$axios
        .get(Lib.API(this.username).image.privateImageList + `?q=${this.query}&page=${this.page.currentPage}`)
        //  /api/image/images/${this.username} .get(`http://rap2api.taobao.org/app/mock/2311//api/image/images/%7Busername%7D?username=${this.username}`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            for (let i = 0; i < data.commonImages.length; i++) {
              data.commonImages[i].deleteVisible = false;
              data.commonImages[i].addTagVisible = false;
              data.commonImages[i].tagListVisible = false;
              data.commonImages[i].loadingTags = false;
              data.commonImages[i].tagList = [];
              data.commonImages[i].deleteDisable = 'able';
            }
            this.list = data.commonImages;
            this.page.total = data.commonImagesCount;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loadingImages = false;
        });
    },

    // 删除镜像
    deleteHandle(imageName) {
      this.$axios
        .delete(Lib.API(imageName).image.deleteImage + `?isPublic=${this.isPublic}`)
        // /api/image/images/${imageName}/tags
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.$message({
              showClose: true,
              message: imageName + " " + this.$t("m.deleted"),
              type: "success",
              duration: Lib.Common.messageDuration
            });
            this.publicOrPrivate();
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
        });
    },

    // 获取 镜像下的标签列表
    getImageDetail(imageName,index) {
      // 判断是否获取过详情/标签列表
      if(this.list[index].tagList.length){
        return false;
      }
      
      this.list[index].loadingTags = true;
      
      this.$axios
        .get(Lib.API(imageName).image.imageDetail + `?isPublic=${this.isPublic}&repositoryName=${this.repositoryName}&loginName=${this.username}`)
        // /api/image/images/${imageName}/tags
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.list[index].tagList = data.images;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.list[index].loadingTags = false;
        })
      },
        

    // 添加 tag
    addTagHandle(tagList,imageName,index) {
      // 循环，　判断是否重名
      for(var i=0; i< tagList.length; i++){
        if(this.addTagName.trim() == tagList[i].name){
          // 重名
          this.addTagError = true;
          this.addTagRegularError = false;
          return false;
        }else{
          this.addTagError = false;          
        }
      }
      // 判断是否符合命名规则
      if (!/^[a-zA-Z0-9]([-_.a-zA-Z0-9]{0,18}[a-zA-Z0-9])?$/.test(this.addTagName.trim())) {
        this.addTagRegularError = true;
        return false;
      }else{
        this.addTagRegularError = false;
      }

      this.list[index].addTagVisible=false;
      this.list[index].loadingTags = true;

      // 发送请求
      this.$axios
      .post(Lib.API(imageName).image.addTag +`?tagName=${this.addTagName}&oldTag=${tagList[0].name}&isPublic=${this.isPublic}&repositoryName=${this.repositoryName}`)
      // /api/image/images/${imageName}/tags
      .then(res => {
        const data = res.data;
        if (data.success) {            
          this.list[index].tagList = data.images;
          this.list[index].addTagVisible = false;                           
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        } 
        this.list[index].loadingTags = false;       
      });
      this.addTagName = "";  // 清空 input            
    }
  }
};
</script>

<style lang="less" scoped>
table.image-list{
  th {
    border-top:none;
  }
  > tbody{
    > tr:first-child {
        td.show-hidden {
          width: 65px;
          margin-right: 10px;
          padding-left: 25px;
          color: #1a99a5;
          &:hover {
            text-shadow: 0px 1px 0px #32b1bf;
          }
        }
    }
    > tr:last-child {
      > td { 
          padding:0; 
          background-color: #f9f9f9;
        }
        table {
          // margin-left: 60px;
          // width: 90%;
          background-color: #f9f9f9;
          border-left: 1px solid #eee;
          border-right: 1px solid #eee;
        th, td {
          padding:3px 0;
          color: #777777;
        }
        th {
          padding: 4px 0;
        }
        th:first-child{
          color: #1a99a5;
          // width: 40px;
          padding-left: 6px;
          i{
            color: #1a99a5;
            border-radius: 50%;
            padding:2px;
            border:1px solid #ffffff;
          }
        }
        th:first-child:hover {          
          i {
            border:1px solid #1a99a5;
          }
        }
      }      
    }
    > tr:last-child:hover{
      background-color: #ffffff;
    }   
  }
}

</style>
