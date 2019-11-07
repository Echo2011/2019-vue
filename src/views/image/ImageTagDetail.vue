<template>
  <main>

    <BaseMainHeader>    
      <template>
        <!-- 管理员从仓库页面跳到此页，是看不到这个按钮的 -->
          <el-button @click="$router.back()" size="medium" type="text" icon="el-icon-back" id="image_detail_back">{{$t('m.goBack')}}</el-button> 
      </template>        
    </BaseMainHeader>

    <el-card class="box-card" shadow="never" v-loading="loading" :element-loading-text="$t('m.loading')" >
      <div slot="header" class="clearfix operation">
        <span style="font-weight: bold;">
          {{$t('m.image.image')+' '+imageName}} 
          <span style="color:#aaa;font-weight:nomal;"><i class="el-icon-arrow-right"></i></span> 
          {{$t('m.image.tag')+' '+tagName}}
        </span>
        <router-link :to="'/image/make?imageName='+imageName+'&tagName='+tagName" v-if="isOperation" id="image_detail_tomake">
          <el-button style="float: right; "  type="text" icon="el-icon-news">{{$t('m.image.makeImage')}}</el-button>
        </router-link>
      </div>
      <ul class="tag-detail">
        <li>{{$t('m.image.version')}}:　{{tagDetail.dist}} {{tagDetail.distVersion}}</li>
        <li>{{$t('m.image.version')}}ID:　{{tagDetail.distId}}</li>
        <li>{{$t('m.image.kernel')}}:　{{tagDetail.kernel}}</li> <br/>
        
        <li>shell:　{{tagDetail.shell}}</li>
        <li>{{$t('m.system')}}:　{{tagDetail.system}}</li> 
        <li>{{$t('m.image.rootProgram')}}:　{{tagDetail.rootProc}}</li> <br/>
        <li>{{$t('m.image.pythonVersion')}}:　{{tagDetail.python}}</li>
        <li>{{$t('m.image.python3Version')}}:　{{tagDetail.python3}}</li>
      </ul>
      <div class="python-list">
        <span style="min-width:100px;">{{$t('m.image.pythonPackage')}}:  </span>
        <ul>
          <li v-for="(item,index) in pythonList" :key="index">
            <img :src="getImgUrl(item)" :alt="item" >{{item}}
          </li>
        </ul>
      </div>
      <div class="python-list">
        <span style="min-width:100px;">{{$t('m.image.python3Package')}}:  </span>
        <ul>
          <li v-for="(item,index) in python3List" :key="index">
            <img :src="getImgUrl(item)" :alt="item" >{{item}}
          </li>
        </ul>
      </div>      
    </el-card>  

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
      tagDetail: '',
      pythonList: [],
      python3List: [],
      loading: false, // 
      repositoryName: '', // 
      imageName: '', // 
      tagName: '', //
      loading: false,
      isOperation:false,
    };
  },

  created() {
    this.username = Lib.Common.getCookies("username"); // 用户名
    this.role = localStorage.getItem("rolesImage")?localStorage.getItem("rolesImage"):'viewer';
    this.repositoryName = this.$route.query.repositoryName;
    this.imageName = this.$route.query.imageName;
    this.tagName = this.$route.query.tagName;
    this.isOperation = this.$route.query.isOperation=='false' ? false : true;
    this.getImageTagDetail();
  },
  methods: {

    // 解决动态获取 img 的 src 属性不显示问题
    getImgUrl(petTem) {
      let pet = petTem.split(' ')[0];
      // 图标
      var arrIcon = ['Bokeh','cython','ipython','jupyter','matplotlib','NetworkX','numpy','NuPIC','pandas','Plotly','python','scikit-learn','scipy','seaborn','Statsmodels'];

      var images = require.context('../../assets/img/python-icon/', false, /\.gif$/);
      
      if(arrIcon.includes(pet)){
        return images('./' + pet + ".gif");
      }else{
        return images('./python.gif');
      }
      
    },

    // 详情
    getImageTagDetail() {   
      this.loading = true;
      this.$axios
        .get(Lib.API().image.getImageTagDetail+`?repositoryName=${this.repositoryName}&imageName=${this.imageName}&tagName=${this.tagName}`)
        // `/api/image/images/make/search/addImage`
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.tagDetail = data.imageInfoDetect;
            if(data.imageInfoDetect.pythonPkgs){
              this.pythonList = data.imageInfoDetect.pythonPkgs.split(',');
              // temArr.forEach(element => {
              //   this.pythonList.push(element.split(' ')[0]);
              // });
            }

            if(data.imageInfoDetect.python3Pkgs){
              this.python3List = data.imageInfoDetect.python3Pkgs.split(',');
              // temArr3.forEach(element => {
                // this.python3List.push(element.split(' ')[0]);
              // });
            }
            
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

<style  lang="less" scoped>
ul {
  line-height: 40px;
}
ul.tag-detail{
  li {
    display: inline-block;
    min-width: 200px;
  }
}
div.python-list {
  display:flex;
  margin-top:10px;
  > span {
    padding-right:10px;
    display:inline-block;
    
  }
  li {
    display: inline-block;
    padding-right: 30px;
    min-width: 330px;
    img {
      padding-right:5px;
    }
  }
}

</style>


