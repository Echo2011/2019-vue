<template>
  <footer>
    <!-- 下载镜像列表 -->
    <div :class="{'image-downloading':true,'is-image-wrap':!isImageWrap}" v-if="isShowImage&&(this.imageLoadingList.length || this.imageMakingList.length)" >
      <!-- <transition>   -->
      <div class="footer-box-wrap" v-show="isImageWrap">
        <div class="footer-box-card" v-if="imageLoadingList.length">
          <div class="card-title"  @click="imageDownloadingHandle" id="footer-image-download-title">
            <span>{{$t('m.image.downloadList')}}</span>
            <i :class="isShowDownloadingList?'el-icon-caret-bottom':'el-icon-caret-right'" ></i>
          </div>
          <div v-show="isShowDownloadingList" v-loading="loadingLoading"  :element-loading-text="$t('m.loading')">
            <div style="padding:0 10px 10px 10px">
              <span v-for="(item,index) in loadedList" :key="index">{{item.imageName}} : {{item.tagName}} &nbsp; &nbsp; 
                <i class="el-icon-circle-check good"></i> {{$t('m.successAdv')}} <br/>
              </span>
            </div>
            <el-collapse accordion >
              <el-collapse-item v-for="(item, index) in loadingList" :key="index">
                <template slot="title">
                  <!--  下载中  0 正在下载，１　成功，　２　失败-->
                  {{item.imageName}} : {{item.tagName}} &nbsp; &nbsp; 
                  <span v-if="item.status==0" class="btn-cancel" >
                    <i class="el-icon-loading"></i> {{$t('m.downloading')}}
                    <el-button type="text"  size="medium" icon="el-icon-circle-close"  @click.stop="cancelDownloadHandle('load',item.id,item.imageName,item.tagName)" id="footer_cancel_loading">{{$t('m.cancel')}}</el-button>
                  </span>
                  <span v-if="item.status==2"><i class="el-icon-warning warning"></i> {{$t('m.failAdv')}}</span>     
                </template>
                <ul v-if="item.failMessage">
                  <li> {{ item.failMessage }} </li>              
                </ul>
                <ul v-else>
                  <li v-for="(info,index) in item.pushMessagesList" :key="index" class="liquid-li">
                    <span>{{item.activeTime[index]}} </span> 
                    <span>
                      <span>{{$t('m.image.pushMessages')}}: {{info}}</span><br/>
                      <!-- <hr> -->
                      <span>{{$t('m.image.readStream')}}: {{item.readStreamList[index]}}</span>
                    </span>                
                  </li>              
                </ul>
              </el-collapse-item>
            </el-collapse>
          </div>
          
        </div>

        <div class="footer-box-card" v-if="imageMakingList.length">
          <div  class="card-title"  @click="imageMakingingHandle" id="footer-image-make-title">
            <span>{{$t('m.image.makeList')}}</span>
            <i :class="isShowMakingList?'el-icon-caret-bottom':'el-icon-caret-right'" ></i>
          </div>
          <div v-show="isShowMakingList" v-loading="loadingMaking"  :element-loading-text="$t('m.loading')">
            <div style="padding:0 10px 10px 10px">
              <span v-for="(item,index) in makedList " :key="index">{{item.imageName}} : {{item.tagName}} &nbsp; &nbsp; 
                <i class="el-icon-circle-check good"></i> {{$t('m.successAdv')}}<br/>
              </span>
            </div>
            <el-collapse accordion>
              <el-collapse-item v-for="(item, index) in makingList" :key="index">
                <template slot="title">
                  <!--  制作中  0 正在制作，１　成功，　２　失败-->
                  {{item.imageName}} : {{item.tagName}} &nbsp; &nbsp; 
                  <span v-if="item.status==0" class="btn-cancel" >
                    <i class="el-icon-loading"></i> {{$t('m.image.making')}}
                    <el-button type="text"  size="medium" icon="el-icon-circle-close"  @click.stop="cancelDownloadHandle('make',item.id,item.imageName,item.tagName)"  id="footer_cancel_making">{{$t('m.cancel')}}</el-button>
                  </span> 
                  <span v-if="item.status==2"><i class="el-icon-warning warning"></i> {{$t('m.failAdv')}}</span>       
                </template>
                <ul v-if="item.failMessage">
                  <li> {{ item.failMessage }} </li>              
                </ul>
                <ul v-else>
                  <li v-for="(info,index) in item.pushMessagesList" :key="index" class="liquid-li">
                    <span>{{item.activeTime[index]}} </span> 
                    <span>
                      <span>{{$t('m.image.pushMessages')}}: {{info}}</span><br/>
                      <!-- <hr> -->
                      <span>{{$t('m.image.readStream')}}: {{item.readStreamList[index]}}</span>
                    </span>                
                  </li>              
                </ul>
              </el-collapse-item>
            </el-collapse>
          </div>
          
        </div> 
      </div>
      <!-- </transition> -->
      <div class="toggle-button" @click="isImageWrap=!isImageWrap;imageLoadingList.length?isShowDownloadingList=true:isShowMakingList=true" id="footer-to-button" :title="isImageWrap?$t('m.image.foldUp'):''">
        <!-- <div> -->
          <i :class="isImageWrap?'el-icon-d-arrow-right':''"></i>
          {{isImageWrap?'':$t('m.image.viewImageStatus')}}
        <!-- </div> -->
        
      </div>
           
    </div>
    <div class="copyright">
      © 2019  AI Max 4.3.1 <router-link to="/aimax/about">{{$t('m.about')}} </router-link>
    </div>    
  </footer>  
</template>

<script>
import Lib from "../assets/js/Lib";

export default {
  data(){
    return {
      imageLoadingList: [],
      imageMakingList: [],
      timerIdListMaking: [], // 多个定时器　ID
      timerIdListLoading: [], // 多个定时器　ID
      isShowDownloadingList: false,　// 收缩
      isShowMakingList: false,　// 收缩
      isShowImage: false, // 是否展示整个　image 相关列表
      isImageWrap: true,
      loadingMaking: false,
      loadingLoading: false,
    }
  },
  
  computed: {
    loadedList: function(){ // 成功
      return this.imageLoadingList.filter(function (ele) {
        return ele.status === 1
      })
    },
    loadingList: function(){　// 正在下载 or 失败
      return this.imageLoadingList.filter(function (ele) {
        return ele.status !== 1
      })
    },
    makedList: function(){　//　成功
      return this.imageMakingList.filter(function (ele) {
        return ele.status === 1
      })
    },
    makingList: function(){ // 正在下载 or fail
      return this.imageMakingList.filter(function (ele) {
        return ele.status !== 1
      })
    }
  },
  
  watch: {
    $route(to,from){
      // 什么情况下发起请求
      if(!this.$route.path.includes('/image/')){ // 非镜像模块
        this.isShowImage = false;
        if(from.path.includes('/image/')){ // 上一次来自镜像模块，-> 停止定时器
          // 循环　activeTime 
          this.timerIdListMaking.forEach( ele => {
            this.stopTimer(ele);
          });
          this.timerIdListLoading.forEach( ele => {
            this.stopTimer(ele);
          })
        }
        
      }else{ // 如果是处于镜像模块
        //　再看从哪里跳过来的
        if(!from.path.includes('/image/')){ // 从别的模块调到镜像模块，-> 发起请求
          this.timerIdListMaking = []; // 清空 
          this.timerIdListLoading = []; // 清空 
          
          this.getImageLoadingList();
          this.getImageMakingList();

          this.isShowImage = true;

        }
      }
    }
  },

  mounted(){
    // this.test();
    var imageDown = document.querySelectorAll('.footer-box-card .el-collapse')[0]; 
    var imageMake = document.querySelectorAll('.footer-box-card .el-collapse')[1];

    if(imageDown){
      imageDown.style.maxHeight = window.innerHeight - 240 + 'px'; // 333, header + footer + 其它
    }
    if(imageMake){
      imageMake.style.maxHeight = window.innerHeight - 240 + 'px'; // 333, header + footer + 其它
    };

    Lib.bus.$on("imageDownload", (arg) => {
      this.downloadHandle(arg.repositoryName,arg.isPublic,arg.imageName,arg.tagName,arg.isAli);
      // console.log('$ononononononon--');
    });

    Lib.bus.$on("imageMake", (arg) => {

      // 1,　停止定时器
      this.timerIdListMaking.forEach( ele => {
        this.stopTimer(ele);
      })

      // 2, 清空 
      this.timerIdListMaking = [];
      
      // 3, 调取　请求事件
      this.getImageMakingList();


      this.isShowDownloadingList = false;
      this.isShowMakingList = true;
    });
    
  },

  destroyed(){
    Lib.bus.$off('imageDownload'); // 注销掉，否则会发多次请求
    Lib.bus.$off('imageMake');

    this.timerIdListMaking.forEach( ele => {
      this.stopTimer(ele);
    });
    this.timerIdListLoading.forEach( ele => {
      this.stopTimer(ele);
    })
  },

  methods:{   

    refreshGetMake(){
      this.timerIdListMaking.forEach( ele => {　 // 1,　停止定时器
        this.stopTimer(ele);
      })
      this.timerIdListMaking = [];  　// 2, 清空     
      this.getImageMakingList();　// 3, 调取　请求事件
      this.isShowDownloadingList = false;
      this.isShowMakingList = true;
    },

    refreshGetLoad(){
      this.timerIdListLoading.forEach( ele => {　// 1,　停止定时器
        this.stopTimer(ele);
      })
      this.timerIdListLoading = [];　 // 2, 清空 this.timerIdListLoading ,
      this.getImageLoadingList();　// 3, 调取　请求事件
      this.isShowDownloadingList = true;
      this.isShowMakingList = false;
    },

    // 取消下载/制作
    cancelDownloadHandle(loadOrMake,id,imageName,tagName){

      if(loadOrMake == 'load'){
        this.loadingLoading = true;
      }else if(loadOrMake == 'make'){
        this.loadingMaking = true;
      }

      this.$axios
      .get(Lib.API().image.cancelImageMakingLoading+`?id=${id}`)
      // `/api/image/images/make/search/addImage`
      .then(res => {
        const data = res.data;
        if (data.success) {
          if(loadOrMake == 'load'){ 
            this.refreshGetLoad();
            if(data.imageStatusInfo.failMessage){ // 如果　有　错误信息，提示用户－下载出现异常，不要再下载同一个镜像
              this.$message({          
                showClose: true,
                message: this.$t('m.image.image')+' '+imageName+' : '+tagName+' '+this.$t('m.rules.loadingAbnormal')+data.imageStatusInfo.failMessage,
                type: "warning",
                duration: 0
              });
            }
          }else if(loadOrMake == 'make'){
            this.refreshGetMake();
            if(data.imageStatusInfo.failMessage){// 如果　有　错误信息，提示用户－制作出现异常，不要再制作同一个镜像
              this.$message({          
                showClose: true,
                message: this.$t('m.image.image')+' '+imageName+' : '+tagName+' '+this.$t('m.rules.makingAbnormal')+data.imageStatusInfo.failMessage,
                type: "warning",
                duration: 0
              });
            }
          }
           
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      });
    },

    // 下载和制作　只显示一个
    imageDownloadingHandle(){
      this.isShowDownloadingList=!this.isShowDownloadingList;
      if(this.isShowDownloadingList){
        this.isShowMakingList=false;
      }
    },

    // 下载和制作　只显示一个
    imageMakingingHandle(){
      this.isShowMakingList = !this.isShowMakingList;
      if(this.isShowMakingList){
         this.isShowDownloadingList = false;
      }
    },

    // 获取正在下载列表
    getImageLoadingList(){
      this.loadingLoading = true;
      this.$axios 
      .get(Lib.API().image.getLoadingAndMakingList+'?type=1')
      // `/api/image/images/make/search/addImage`
      .then(res => {
        const data = res.data;
        if (data.success) {
          // 下载中  0 正在制作，１　成功，　２　失败-
          // 添加对象属性
          data.imageStatus.forEach((ele,index) => {
            ele.timerId = 0;
            if(ele.status === 0){  
              ele.pushMessagesList = []; // 推送流
              ele.readStreamList = [];　// 下载流
              ele.activeTime = [];        
              // 发起定时器
              this.getInterval(index, ele.repositoryName, ele.imageName, ele.tagName)
            }             
          })
          this.imageLoadingList = data.imageStatus;
          this.loadingLoading = false;
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      });
    },

    // 获取正在制作列表
    getImageMakingList(){
      this.loadingMaking = true;
      this.$axios 
      .get(Lib.API().image.getLoadingAndMakingList+'?type=2')
      // `/api/image/images/make/search/addImage`
      .then(res => {
        const data = res.data;
        if (data.success) {
          　// 下载中  0 正在制作，１　成功，　２　失败-
           // 添加对象属性
          data.imageStatus.forEach((ele,index) => {
            ele.timerId = 0;
            if(ele.status == 0){  // 正在 
              ele.pushMessagesList = []; // 推送流
              ele.readStreamList = [];　// 下载流
              ele.activeTime = []      
              // 发起定时器
              this.getMakingInterval(index, ele.repositoryName, ele.imageName, ele.tagName)
            }  
          })
          this.imageMakingList = data.imageStatus;
          this.loadingMaking = false;
          var makings = this.imageMakingList.filter(ele => {
            return ele.status === 0;
          })
          this.$store.commit('imageMaking', makings.length);      
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })   
    },

    // 发起　下载 镜像　的请求
    downloadHandle(repositoryName,isPublic, imageName, tagName,isAli){
      
      // 判断正在下载的数量
      var temArr = this.imageLoadingList.filter(ele =>{
        return ele.status === 0;
      })
      if(temArr.length >= 3){
        this.$message({          
            showClose: true,
            message: this.$t('m.image.downNotExceed3'),
            type: "warning",
            duration: Lib.Common.messageDuration
          
        });
        this.$store.commit('imageToChange');
        return false;
      }

      this.isShowDownloadingList = true;
      this.isShowMakingList = false;
      
      this.$axios
          // /api/image/images/pull
          .post(Lib.API().image.pullImage + `?imageName=${imageName}&isPublic=${isPublic}&repositoryName=${repositoryName}&tagName=${tagName}&isAli=${isAli}`)
          .then( res => {
            this.$store.commit('imageToChange');
            const data = res.data;
            if(data.success){
              // 重新发起请求　正在下载列表
              // 1,　并停止定时器
              this.timerIdListLoading.forEach( ele => {
                this.stopTimer(ele);
              })

              // 2, 清空 this.timerIdListLoading ,
              this.timerIdListLoading = [];
              
              // 3, 调取　请求事件
              this.getImageLoadingList();
            
            }else{
              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText, data.messageParams);
            }
            
          })
    },

    // 下载列表　定时器　获取是否下载成功
    getInterval(index,repositoryName, imageName, tagName){

      var temIndex = this.timerIdListLoading.push(imageName+tagName);

      this.timerIdListLoading[temIndex-1] = setInterval(() => {
        // 发送请求， 获取添加结果
        this.$axios.post(Lib.API(repositoryName, imageName+':'+tagName).image.pullImageProgress)
        // `/api/image/images/pull/${this.repositoryName}/${imageName}/progress`
        .then(res => {
          const data = res.data;
          this.imageLoadingList[index].timerId = this.timerIdListLoading[temIndex-1];

          if(data.success){ 
            
            // 0:正在下载，1:下载成功,2:下载失败
            if(data.status !== 0){
              this.imageLoadingList[index].status = data.status; // 改变状态
              this.stopTimer(this.timerIdListLoading[temIndex-1]); // 关闭定时器
               
            }else{ 
              if(data.pushMessages.length || data.readStream.length )  {
                this.imageLoadingList[index].pushMessagesList.push(data.pushMessages.length?data.pushMessages.join('; '):' ');
                this.imageLoadingList[index].readStreamList.push(data.readStream.length?data.readStream.join('; '):' ');
                this.imageLoadingList[index].activeTime.push(new Date().toLocaleTimeString(localStorage.getItem('locale')));
              }        
              
            }

          }else{ 
            this.imageLoadingList[index].status = 2; // 改变状态 为 失败
            this.stopTimer(this.timerIdListLoading[temIndex-1]); // 关闭定时器
            
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
        
        })
      }, 10000) // 10000毫秒->  10秒 发一次请求　　
      
    },

    // 制作镜像时的定时器请求
    getMakingInterval(index,repositoryName,imageName,tagName){
      var makings = this.imageMakingList.filter(ele => {
        return ele.status === 0;
      })
      this.$store.commit('imageMaking', makings.length);
      // 开启新的定时器
       var temIndex = this.timerIdListMaking.push(imageName+tagName);
       this.timerIdListMaking[temIndex-1] = setInterval(() => {
        // 发送请求， 获取添加结果
        this.$axios.post(Lib.API(repositoryName, imageName+':'+tagName).image.makeImageProgress)
        // /api/image/images/make/${repositoryName}/${newImage}/progress
        .then(res => {
          const data = res.data;

          this.imageMakingList[index].timerId = this.timerIdListMaking[temIndex-1];

          if(data.success){ 
            // 0:正在制作,1:完成,2:失败
            if(data.status !== 0){
              // 完成　or 失败
              this.imageMakingList[index].status = data.status; // 改变状态
              this.stopTimer(this.timerIdListMaking[temIndex-1]); // 关闭定时器

              // 如果成功，且处于“镜像列表”页面　＝＝》　刷新镜像列表
              if(data.status == 1 && (this.$route.path=='/image/list/public' ||this.$route.path=='/image/list/private')){
                Lib.bus.$emit('refreshImageList');
              }
            }else{
              // 正在制作 
              if(data.pushMessages.length || data.readStream.length )  {
                this.imageMakingList[index].pushMessagesList.push(data.pushMessages.length?data.pushMessages.join('; '):' ');
                this.imageMakingList[index].readStreamList.push(data.readStream.length?data.readStream.join('; '):' ');
                this.imageMakingList[index].activeTime.push(new Date().toLocaleTimeString(localStorage.getItem('locale')));
              }  
                         
            }            
          }else{
            this.imageMakingList[index].status = 2; // 改变状态 为 失败
            this.stopTimer(this.timerIdListMaking[temIndex-1]); // 关闭定时器
            
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          } 

          // 更新 store 里 正在制作的个数
          var makings = this.imageMakingList.filter(ele => {
            return ele.status === 0;
          })
          this.$store.commit('imageMaking', makings.length);   
               
        })
      }, 10000) // 10000毫秒->  10秒 发一次请求　　
    },

     // 关闭定时器
    stopTimer: function (timerId) {
      clearInterval(timerId);
    }, 
  }
  
}
</script>

<style lang="less" scoped>
footer {  
  padding: 10px;
  border-top: 1px solid #eeeeee;
  background-color: #fff;
  .copyright {
    text-align: center;
    a {
      display: inline-block;
      margin-left: 20px;
      color: #1a99a5;
    }
  }

  .image-downloading {
    position: fixed;
    right: 5px;
    bottom: 0px;
    padding: 10px;
    width: 40%;
    min-width: 720px;
    z-index: 1998;
    // z-index: 2;
    font-size: 13px;
    display:flex;
    justify-content: space-between;
    .toggle-button {
      background-color: #f5f6f7;
      border:1px solid #d4e6e7;
      border-radius: 5px;
      color: #5dc6cf;
      width: 20px;
      i {
        top: 50%;
        position: absolute;
        margin-top: -8px;
        display: inline-block;
        right: 9px;
        width: 20px;
      }
      &:hover {
        border: 1px solid #ade0e5;
        color: #30a9b4;
        cursor: pointer;
      }
    }
    .footer-box-wrap {
      flex-grow: 1;
    }    
  }

  .image-downloading.is-image-wrap  {
    display: block;
    .toggle-button {
      width: 150px;
      line-height: 40px;
      position: absolute;
      right: 5px;
      bottom: 10px;
      border-radius: 8px;
      text-align: center;
    }
  }

  .footer-box-card {
    background-color: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    padding: 0;
    .card-title {
      font-weight: bold;
      padding: 13px;
      font-size: 13px;
      &:hover {
        cursor: pointer;
        color: #1a99a5;
      }
    }
    .el-collapse {
      font-size: 13px;
      padding: 0 16px;
      overflow-y: auto;
      ul {
        max-height: 200px;
        overflow-y: auto;
      }
      .liquid-li {
        display: flex;
        border-bottom: 1px solid #eee;
        > span:first-child {
          color: #666;
          padding-right: 3px;
          display: inline-block;
        }
      }
    }
  }
}
span.btn-cancel {
  .el-button{
    padding: 5px;
    color:#666;
    margin-left:10px;
  }
  .el-button:hover {
    border:1px solid #f56c6c;
    color:#f56c6c;
  }
}
</style>


