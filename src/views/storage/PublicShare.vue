<template>    
  <section class="show-info viewer">
    <!-- 面包屑 -->
    <div class="bread-road">
      <p v-show="dirList.length>=2">
        <span id="public_share_viewergetdata" @click="viewerGetData('',dirList.length-2)">{{$t('m.store.BackTo')}}</span><i>｜</i> <span  v-for="(item,index) in dirList" :key="index" @click="viewerGetData('',index)"><i v-if="index !=0"> &gt; </i>{{item}}</span>
      </p>
      <p v-show="dirList.length<2" class="one-level" >
        <span  v-for="(item,index) in dirList" :key="index">{{item}}</span>
      </p>
      <p>&nbsp;</p>
    </div>

    <table v-loading="loading" :element-loading-text="$t('m.loading')">
        <thead>
          <tr>
            <th>{{$t('m.store.directoryName')}}</th>
            <th>{{$t('m.store.type')}}</th>
            <th v-show="publicOrShare==='share'">{{$t('m.fileSource')}}</th>
            <th>{{$t('m.operating')}}</th>
          </tr>
        </thead>
        
        <tbody v-if="list.length>0" class="tbody-viewer" >
          <tr v-for="(item,index) in list" :key="index" >
            <td>
              <span style="display:flex;flex-direction:row; justify-content:space-between;">
                <span>
                  <!-- 图片 -->
                  <span v-if="item.imgUrl">
                    <i class="el-icon-picture-outline"></i>
                    {{item.fileName}}
                  </span>

                  <!-- 文件夹 共享数据第一级目录-->
                  <span  class="clickable ellipsis" v-else-if="item.directory&&(dirList.length===1)&&(publicOrShare==='share')" @click="ownerPath=item.ownerPath;ownerVolumeName=item.ownerVolumeName;ownerUserFolder=item.ownerUserFolder;owner=item.owner;viewerGetData(item.fileName)">
                    <svg class="icon" aria-hidden="true">
                      <use xlink:href="#icon-2"></use>
                    </svg>
                    {{item.fileName}}
                  </span>

                  <!-- 文件夹 共享数据第ｎ级目录 -->
                  <span class="clickable ellipsis" v-else-if="item.directory" @click="viewerGetData(item.fileName)">
                    <svg class="icon" aria-hidden="true">
                      <use xlink:href="#icon-2"></use>
                    </svg>
                    {{item.fileName}}
                  </span>
                  
                  <!-- 压缩文件 -->
                  <span v-else-if="item.isArchive">
                    <svg class="icon" aria-hidden="true" style="font-size:12px;">
                      <use xlink:href="#icon-rar"></use>
                    </svg>
                    {{item.fileName}}                
                  </span>

                  <!-- 其他文件 -->
                  <span v-else>
                    <i class="el-icon-document"></i>
                    {{item.fileName}}
                  </span>
                </span>
                <!-- 复制过程数据 -->
                <span v-show="item.decompressInfos.length" >
                  {{$t('m.store.'+item.decompressInfo.split(':')[0])}}
                  <i class="el-icon-loading"></i>
                </span> &nbsp;
              </span>
              
              
              <p style="max-width: 400px;word-wrap:break-word;word-break:break-all;display:inline-block;margin:0;padding:0;" v-show="item.decompressInfos.length" >
                {{item.decompressInfos[0]}}
              </p>

            </td>
            <td><span v-if="item.directory">{{$t('m.store.dir')}}</span><span v-else>{{$t('m.store.doc')}}</span></td>
            <td v-show="publicOrShare==='share'">
              <span v-show="dirList.length===1">{{item.owner}}</span>
              <span v-show="dirList.length!==1">{{ownerUserFolder}}</span>
            </td>
            <td class="operation" v-loading="item.loading" element-loading-text="">

                

              <!-- 下载 -->
              <!-- 　共享数据根目录下  -->
              <span v-if="publicOrShare==='share'&&dirList.length===1">
                <a :href="'/api/storage/volumes/'+item.ownerVolumeName+'/dirs/'+item.ownerUserFolder+'/download?path='+item.ownerPath+'&fileName='+item.fileName+'&isDir='+item.directory+'&type='+type"  class="el-button el-button--text">
                  <i class="el-icon-download"></i>{{$t('m.download')}}
                </a>
              </span>
              <span v-else-if="publicOrShare==='public'"> <!-- 公共数据　-->
                <a  :href="'/api/storage/volumes/public/dirs/common/download?path='+path+'&fileName='+item.fileName+'&isDir='+item.directory+'&type='+type"  class="el-button el-button--text">
                  <i class="el-icon-download"></i>{{$t('m.download')}}
                </a>
              </span>
              <span v-else> <!-- 共享Ｎ级目录下 -->
                <a  :href="'/api/storage/volumes/'+ownerVolumeName+'/dirs/'+ownerUserFolder+'/download?path='+path+'&fileName='+item.fileName+'&isDir='+item.directory+'&type='+type"  class="el-button el-button--text">
                  <i class="el-icon-download"></i>{{$t('m.download')}}
                </a>
              </span>

              <!-- copy icon -->
              <el-button type="text" :disabled="Boolean(item.decompressInfos.length)" :class="{btnDisabled:Boolean(item.decompressInfos.length)}"  @click="copyIndex=index;dialogStrorageTreeVisible=true">
                <i class="el-icon-document-copy"></i>
                {{$t('m.copy')}}
              </el-button>
              
              <!-- 查看大小 -->           

              <el-popover
                placement="bottom"
                width="360"
                v-model="item.detailVisible" >
                  <ul style="line-height:2em;" v-loading="item.detailLoading" :element-loading-text="$t('m.loading')">             
                    <li>{{$t('m.size')}}: {{item.size}}</li>
                    <li>{{$t('m.store.dir')}}: {{item.directory ? $t('m.yes') : $t('m.no')}}</li>
                    <li>{{$t('m.modifiedTime')}}: {{item.date | toDate}}</li>      
                  </ul>
                <el-button type="text" :icon="item.loadingViewing?'el-icon-loading':'el-icon-view'" @click="viewDetailHandle(item.fileName, index)" slot="reference">
                {{$t('m.size')}} </el-button>
              </el-popover>

              <!-- 查看图片 -->
              <el-button  v-if="item.imgUrl" @click="viewFile(item.fileName,index,true)" type="text" icon="el-icon-view" >
                {{$t('m.viewImage')}}
              </el-button>              

              <!-- 其他文件 -->
              <el-button  v-else-if="!item.isArchive&&!item.imgUrl&&!item.directory"  @click="viewFile(item.fileName,index)"  type="text" icon="el-icon-view" >
                {{$t('m.viewDocument')}}
              </el-button>
            </td>
          </tr>           
        </tbody>
    </table> 
    <p style="text-align:right;color:#999;padding-right:20px;">{{$t('m.store.loadingCompleted')}}, {{$t('m.store.total').toLowerCase()}} {{this.list.length}} {{$t('m.store.ge')}}</p>

    <!-- 复制 对话框 -->
    <el-dialog :title="$t('m.copyTo')" :visible.sync="dialogStrorageTreeVisible" @close="choseDialogStorageTree">    
        <p style="margin:0;padding:0">{{$t('m.store.selectedPath')}}： <strong>{{choosePath?choosePath:'/'}}</strong></p>                 
        <ul class="demo" style="min-height:300px;border:1px solid #eee;padding:10px 0;">
          <storageTreeItem  ref="storageTree" class="item" :model="treeData" ></storageTreeItem>
        </ul>                    
      <div slot="footer" class="dialog-footer">
        <el-button @click="choseDialogStorageTree" id="public_share_cancel">{{$t('m.cancel')}}</el-button>
        <el-button type="primary" @click="confirmHandle" id="public_share_confirm">{{$t('m.confirm')}}</el-button>
      </div>
    </el-dialog>

      
      <!-- 查看图片/文件内容 -->
    <el-dialog :title="$t('m.store.viewFile')" :visible.sync="dialogViewFileVisible" id
    ="group_person_dialog_viewfile" @close="imgUrl='';fileContent=''">
      <div v-loading="loadingImageAndText" :element-loading-text="$t('m.loading')">
        <img  v-if="imgVisible" :src="this.imgUrl" alt="" width="100%">
        <div class="file-content">{{fileContent}}</div>
      </div>
    </el-dialog> 

  </section>      
</template>

<script>
import Lib from "../../assets/js/Lib";
import storageTreeItem from '../../components/StorageTreeItem.vue';

export default {
  components: {
    storageTreeItem,
  },
  props:{
    publicOrShare: {
      type: String,
      default: 'public'
    },
  },
  data() {
    return {
      dialogStrorageTreeVisible:false,
      choosePath: '',
      treeData: {
        fileName: this.$t('m.store.allFiles'),
        directory: true,
        path: '', // 根目录时, path 为空, 后台要的路径,大家根据需要添加
        // 防止第一次随机获取数据为空, 默认加的 children
        children: [
          // { fileName: 'work.md', path: "work.md", directory: true, children: [] },
          // { fileName: 'ss.md', path: "ss.md", directory: false },
        ]
      },

      list: [], // 
      
      dirList:[], // 页面上要显示的目录集合
      userFolder:'', // 用户名，　传的参数
      volumeName:'', // 数据卷名，
      type:'', // public or private

      dialogViewFileVisible:false, // 查看文件对话框
      imgVisible: false,
      imgUrl: '',
      fileContent: '',

      loading: false, //
      loadingIndex: 0, // 向　FileTree 中传递 index 的值，因为 FileTree 请求返回来，停止 loading　状态时需要知道是哪一个

      ownerPath: '',
      ownerVolumeName: '',
      ownerUserFolder: '',
      owner:'', // 文件所属者
      copyIndex:0,   
      loadingImageAndText: false,    
      timerIdUnzip: null,
    };
  },

  computed: {
    // 仅读取
    path: function () {
      if(this.publicOrShare === 'public'){
        
        if(this.dirList.length === 1){  
          return '';  // ["全部文件"] => ''
        }else{
          return this.dirList.slice(1).join('/'); // ["全部文件",'aa','bb','cc'] => aa/bb/cc
        }
      }else if(this.publicOrShare === 'share'){
        
        if(this.dirList.length === 1){  
          return this.ownerPath;  // this.ownerPath = 'aa/bb' ["全部文件"] => 'aa/bb'  , 
        }else{
          return (this.ownerPath ? (this.ownerPath + '/'):'')+this.dirList.slice(1).join('/'); // ["全部文件",'xx','yy','zz'] => /aa/bb/xx/yy/zz
        }
      }
      
    },
  },

  created() {
    this.dirList.push(this.$t('m.store.allFiles')); // 添加 "一级目录" 到数组
    this.volumeName = localStorage.getItem('volumeName')?localStorage.getItem('volumeName'):'nfs';
    this.userFolder = Lib.Common.getCookies('username');
    if(this.publicOrShare === 'public'){
      this.type = 'public';
    }else{
      this.type = 'private';
    }

    // ５,发送请求
    Lib.bus.$on("choose-path", (arg,share) => {
      this.choosePath = arg;
    });
    this.viewerGetData();
    
  },

  destroyed(){
    clearInterval(this.timerIdUnzip);; // 关闭定时器
  },

  methods: {


    // 取消选中路径
    choseDialogStorageTree(){
      this.dialogStrorageTreeVisible = false;
      this.choosePath='';
    },

    // 选中路径, 复制　请求
    confirmHandle() {
      // if(!this.choosePath){
      //   this.$message({
      //     showClose: true,
      //     message:  " " + this.$t('m.store.pleaseSelectPath'),
      //     // type: "warning",
      //     duration: Lib.Common.messageDuration
      //   });
      //   return false;
      // }
      
      // 1 发送　复制　请求
      var url = '',fileName = '',ownerVolume='',srcPathStr='',owner='';
      fileName = this.list[this.copyIndex].fileName;
      if(this.publicOrShare==='public'){  // 公共数据
        ownerVolume = 'public';
        owner = 'common';
      }else if(this.publicOrShare==='share'&&this.dirList.length===1){ // 共享数据 根目录/第一层目录
        ownerVolume = this.list[this.copyIndex].volumeName; 
        owner = this.list[this.copyIndex].owner;       
      }else{ // 共享数据 第 n>1 层目录
        ownerVolume = this.ownerVolumeName;
        owner = this.ownerUserFolder;
      }

      srcPathStr = (this.publicOrShare==='share'&&this.dirList.length===1) ? this.list[this.copyIndex].ownerPath : this.path;

      url = Lib.API(this.volumeName, this.userFolder).storage.shareCopy + `?srcPathStr=${srcPathStr}&destPathStr=${this.choosePath}&isDir=${this.list[this.copyIndex].directory}&type=${this.type}&ownerVolume=${ownerVolume}&owner=${owner}&fileName=${fileName}`;

      this.list[this.copyIndex].loading = true;
      this.$axios
        .get(url)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.unzipInterval(this.copyIndex); // 发起定时器请求
            // 清空 storageTreeItem 子组件
            if(this.$refs.storageTree){
              this.treeData.children = []; // 清空 子组件数据，因为移动　复制　删除，都改变了原来的目录列表
              this.$refs.storageTree.open = false;　// 收起第０层（）
            }
          }else{
            this.list[this.copyIndex].loading = false;
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }
        })
      // ２　关闭 dialog,　同时会触发关闭事件　choseDialogStorageTree
      this.dialogStrorageTreeVisible = false;
    },

    // 复制 过程 定时器
    unzipInterval(index){

      let url;

      if(this.publicOrShare==='public'){  // 公共数据
        url = Lib.API('public', 'common').storage.unzipInterval + `?path=${'common'+(this.path?('/'+this.path):'')}&type=public`;
      }else if(this.publicOrShare==='share'&&this.dirList.length===1){ // 共享数据 根目录/第一层目录
        url = Lib.API().storage.shareRootUnzip;
      }else{ // 共享数据 第 n>1 层目录
        url = Lib.API(this.ownerVolumeName, this.ownerUserFolder).storage.unzipInterval + `?path=${this.ownerUserFolder+(this.path?('/'+this.path):'')}&type=private`;
      }

      clearInterval(this.timerIdUnzip); // 关闭定时器

      this.timerIdUnzip = setInterval(() => {
        this.$axios
          .get(url)
          .then(res => {
            if(Number.isInteger(index)){
              this.list[index].loading = false;
            }
            this.loading = false;
            
            let data = res.data;
            if (data.success) { 
              if(this.publicOrShare==='share'&&this.dirList.length===1){ // 共享数据 根目录/第一层目录
                if(data.shareDataOpInfos === null){
                  data.decompressInfos = {};
                }else if(data.shareDataOpInfos){
                  data.decompressInfos = data.shareDataOpInfos;
                }
              }else{ // 公共数据 || 共享数据 第 n>1 层目录
                if(data.decompressInfos === null){
                  data.decompressInfos = {};
                }
              }
              // console.log(data.decompressInfos);
              if(data.decompressInfos === null){
                data.decompressInfos = {};
              }
              
              if(Object.keys(data.decompressInfos).length){

                if(this.publicOrShare==='share'&&this.dirList.length===1){ // 共享数据 根目录/第一层目录
                  console.log("this.publicOrShare==='share'&&this.dirList.length===1");
                  
                  // 情况
                  this.list.forEach( (ele,index) => {
                    ele.decompressInfos = []; 
                    for(let prop in data.decompressInfos){
                      if(prop === ele.owner){
                        // console.log('prop = ' + prop);
                        
                        for(let fileName in data.decompressInfos[prop]){
                          if(fileName === ele.fileName){
                            // console.log('fileName = ' + fileName);
                            // console.log('data.decompressInfos[prop][fileName] = ' + data.decompressInfos[prop][fileName]);
                            
                            ele.decompressInfos = data.decompressInfos[prop][fileName];
                            ele.decompressInfo = data.decompressInfos[prop][fileName][0];
                          }
                        }                        
                      }
                    }                                 
                  })

                }else{ // 公共数据 or 共享数据 第 n>1 层目录
                  this.list.forEach( (ele,index) => {
                    ele.decompressInfos = []; 
                    for(let prop in data.decompressInfos){
                      if(prop === ele.fileName){
                        ele.decompressInfos = data.decompressInfos[prop];
                        ele.decompressInfo = data.decompressInfos[prop][0];
                      }
                    }                                 
                  })
                }
                


              }else{
                this.list.forEach( (ele,index) => {
                    ele.decompressInfos = [];
                });
                clearInterval(this.timerIdUnzip); // 关闭定时器                
              } 


            }else{
              clearInterval(this.timerIdUnzip);; // 关闭定时器
              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText,data.messageParams);
            }
          })
      },2000)
    },

    

    // 文件大小
    viewDetailHandle(fileName,index){
      if(this.list[index].size){ // 如果有值说明已经发过请求了
        return false;
      }
      var path = '', url = '';
      if(this.publicOrShare == 'share' && (this.dirList.length===1)){
        // path = this.list[index].sharePath;
        url = Lib.API(this.list[index].volumeName, this.list[index].owner).storage.viewerViewDetail + `?path=${this.list[index].ownerPath}&type=${this.type}&fileName=${this.list[index].fileName}`; 
      }else if(this.publicOrShare == 'public' ){
        url = Lib.API('public', 'common').storage.viewerViewDetail + `?path=${this.path}&type=${this.type}&fileName=${fileName}`;
      }else {
        url = Lib.API(this.ownerVolumeName, this.ownerUserFolder).storage.viewerViewDetail + `?path=${this.path}&type=${this.type}&fileName=${fileName}`;
      }
        
      this.list[index].detailLoading = true;
      this.$axios
      .get(url)
      .then(res => {
        const data = res.data;
        if (data.success) {
          this.list[index].size = data.size;
          this.list[index].date = data.lastAccessDate;
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText,data.messageParams);
        }
        this.list[index].detailLoading = false;
      })      
    },


    // 文件列表
    viewerGetData(fileName,dirLsitIndex){   
      // console.log('=====getData======')
      if(fileName){　// 点击文件夹发起的请求
        this.dirList.push(fileName);
      }     
      if(dirLsitIndex===(this.dirList.length-1)){　//点击面包屑最后一级 不发请求
        return false; 
      }
      if(dirLsitIndex){ // 点击面包屑
        this.dirList = this.dirList.slice(0,dirLsitIndex+1);
      }
      if(dirLsitIndex === 0){　// 点击面包屑　全部文件
        this.dirList = this.dirList.slice(0,dirLsitIndex+1);
      }

      let url = '';
      
      if(this.publicOrShare === 'public'){ // 公共数据
        url = Lib.API(this.volumeName, this.userFolder).storage.viewerGetFileList + `?path=${this.path}&type=${this.type}`;
      }else if(this.publicOrShare === 'share'){ // 获取分享到自己的数据
        if(this.dirList.length > 1) { // 获取 n >= 2级目录
          url = Lib.API(this.ownerVolumeName, this.ownerUserFolder).storage.viewerGetFileList + `?path=${this.path}&type=${this.type}`;
        }else{　// 获取一级目录
          url = Lib.API(this.volumeName, this.userFolder).storage.getShareDataToMe;
        }       
      }

      this.loading = true;

      this.$axios
        .get(url) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            if(this.publicOrShare === 'share' && (this.dirList.length===1)){ // 第一次获取分享到的数据，即获取分享到的数据的根目录
              data.fileShareInfos.forEach( ele => {
                ele.directory = ele.dir;
                ele.date = '';
                // (ele.sharePath[0]==='/') ? (ele.sharePath = ele.sharePath.slice(1)) : (ele.sharePath = ele.sharePath)
                let tem = ele.sharePath.split('/');　// 例如 sharePath: 'aa/bb/cc'  => ['aa','bb','cc']
                ele.fileName = tem[tem.length-1]; // cc
                tem.pop(); // [aa','bb'] 
                ele.ownerPath = tem.join('/'); // 需要拼接的前部分　 'aa/bb'
                ele.ownerVolumeName = ele.volumeName;
                ele.ownerUserFolder = ele.owner;
                ele.detailLoading = false;
                ele.detailVisible = false;
                ele.loading = false;

                ele.decompressInfos = [];
                ele.decompressInfo = '';
                
                ele.isArchive = /[.]tar$/i.test(ele.fileName) || /[.]tar[.]gz$/i.test(ele.fileName) || /[.]zip$/i.test(ele.fileName);
              })
              this.list = data.fileShareInfos;
            }else{
              data.result.forEach((element,index,array) => {           
                element.detailVisible = false; // 查看详情， 大小， 创建时间
                element.detailLoading = false; // 查看详情， 大小， 创建时间
                element.loading = false;
                element.shareVisible = false; // 当　share === 3　时提示用户，是否继续

                element.decompressInfos = [];
                element.decompressInfo = '';

                // 目前支持 tar zip tar.gz 后缀               
                element.isArchive = /[.]tar$/i.test(element.fileName) || /[.]tar[.]gz$/i.test(element.fileName) || /[.]zip$/i.test(element.fileName);
              });
              this.list = data.result;
            }

          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loading = false;
      }).then(()=>{
        this.unzipInterval();
      })
    },

    
    // 查看文件内容
    viewFile(fileName,index,isImage){
      // this.imgVisible = false;
      if(isImage){ // 图片
        this.imgVisible = true;
      }else{ // 文本
        this.imgVisible = false;
      }

      var path = '', url = '';
      if(this.publicOrShare == 'share' && (this.dirList.length===1)){
        url = Lib.API(this.list[index].volumeName, this.list[index].owner).storage.viewContent + `?path=${this.list[index].ownerPath}&type=${this.type}&fileName=${this.list[index].fileName}`; 
      }else if(this.publicOrShare == 'public' ){
        url = Lib.API('public', 'common').storage.viewContent + `?path=${this.path}&type=${this.type}&fileName=${fileName}`;
      }else {
        url = Lib.API(this.ownerVolumeName, this.ownerUserFolder).storage.viewContent + `?path=${this.path}&type=${this.type}&fileName=${fileName}`;
      }

      this.dialogViewFileVisible=true;
      this.loadingImageAndText = true;

      this.$axios.get(url)
      .then( res => {
        const data = res.data;
        if(data.success){
          if(isImage){ // 图片
            this.imgUrl = data.fileContent ? data.fileContent : '';
          }else{ // 文本
            this.fileContent = data.fileContent ? data.fileContent : this.$t("m.noData");
          }
          // }
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText,data.messageParams);
        } 
        this.loadingImageAndText = false;  
      })
    },　
  }
};
</script>

<style  lang="less" scoped>

// 动画效果
.deleteTransition-enter-active,
.deleteTransition-leave-active {
  transition: all 0.4s;
}
// 进场，　出场状态
.deleteTransition-enter,
.deleteTransition-leave-to {
  opacity: 0;
}

main section.search-info {
  p:first-child {
    font-weight: 600;
    padding-bottom: 15px;
  }  
}
section.show-info {
  padding: 12px 0;
  > div:first-child {
    display: flex;
    justify-content: space-between;
    margin: 0 30px;
    > p:first-child {
      font-weight: 600;
    }
    span.num {
      border-bottom: 1px solid #aaaaaa;
      cursor: pointer;
    }   
  }
}
section.show-info table {
  th {
    border-top: 1px solid #eeeeee;
  } 
}
section.show-info.admin {
  > div:first-child {
    i {
        color: #1a99a5;
        cursor: pointer;
        margin-left: 5px;
        font-size: 22px;        
      }
      i:hover {
        text-shadow: 1px 1px 1px #aaaaaa;
      }
    .editNum{
      border-bottom: 1px solid #1a99a5;
      padding: 2px 5px;
      outline: none;
    }
    span.button-wrap {
      display: inline-block;       
    }
  }  
}
section.show-info.viewer {

  > div:first-child {    
    color: #cccccc;
    font-size: 14px;      
    p:first-child{
      font-weight: 400;
      flex-grow: 1;
      width: 500px;
      span {
        cursor: pointer;
        color: #888;
      }
      span:hover {
        color: #1a99a5;
        // text-decoration: underline #1a99a5;
      }
      span:last-child {
        cursor: auto;
        color: #555555;       
      }
      span:last-child:hover {
        cursor: auto;
        color: #555555;       
      }
      i {
        color: #cccccc;
        padding: 0 5px;
        font-size: 14px;
        font-style: normal;
      }
      i:hover {
        cursor: text;
      }
    }
    p.one-level {
      color: #555555;
    }
    p:last-child {
      color: #999999;
      width: 200px;
      text-align: right;
    }
    
  }
  table {  
    span.tip-user {
      position:absolute; right:0;display:inline-block;border-left:1px solid #cccccc;border-radius:1px; padding:0 5px; margin-left:5px;
      background-color:#fff;
      color: #1a99a5;
    } 
    tr {
      border-bottom:1px solid #eeeeee;
    }
    border-bottom: none;
    thead tr:first-child {
      border-top: none;
    }
    td {
      position:relative;
      .view-more{
        position:absolute;
        border:1px solid red;
        z-index:300;
      }
    }
    th {
      border: none;
      span.el-checkbox__label{
        color: #999999;
      }
    }    
    td {
      vertical-align: top;
      
    }
    th:last-child {
      padding-left:10px;
    }
    td:nth-child(2),th:nth-child(2){
      position:relative;
    }
    td:last-child {
      position: relative;
      
      i {
        display:inline-block;
        // margin:0 10px;
      }
      i.unzip{
        border-top:1px solid #666;
        border-bottom:1px solid #666;
        color:#666;
        height:18px;
      }
    }
    tbody.create-dir-tbody {
      input {
        height: 32px;
        border-radius: 5px;
        outline: none;
        border: 1px solid #cccccc;
        padding-left: 10px;
        color: #555555;
      }
      input:focus {
        border: 1px solid #1a99a5;
      }
      i {
        font-size: 26px;
        font-weight: 100;
        color: #1a99a5;
        vertical-align: middle;     
        cursor: pointer;   
      }
      i:hover {
        text-shadow: 1px 1px 1px #999999;
      }
      td {
        padding: 8px 0;
        color: #cccccc;
      }     
    }
    tbody {
      overflow-y: auto;
      width: 100%;
      tr {
        td:nth-child(2){
          cursor: pointer;
        }
        td:nth-child(2):hover{
          color: #1a99a5;
        }
      }
      
    }
    tbody.tbody-viewer {
      tr:last-child {
        margin-bottom: 135px;
        border-bottom:1px solid #eeeeee;
      }
    }
  }
}
.viewer-btn-wrap {
  position: relative;
  div.upload-input-wrap{
    display: inline-block;
    position: relative;
    label {
      position: relative;
      z-index: 2;
    }
    .upload-input {
      position: absolute;
      margin-top: 3px;
      opacity: 0;
      width: 3px;
      left: 10px;
      top:0;
    }
  }
  
  .operation-message {
    top: 50px;
    left: 255px;
    right: none;
  }
}
.upload-progress{
  > div {
    > div {
      width: 90%;
      display: inline-block;
    }
  }
}
.file-content {
  white-space:pre-wrap; // 保留空白符序列，但是正常地进行换行。
  word-wrap:break-word; // 自动换行 
}
.el-progress.el-progress--line .el-progress__text {
  display: none;
}
svg.icon {
    width: 1.2em;
    height: 1.2em;
    padding-bottom: 2px;
}
.tree-dialog {
  .el-dialog--center {
    .el-dialog__body{
      padding-top: 0;
    }
  }
  .el-dialog__body{
    padding-top:0;
  }
}
span.copy-span:hover {
  color: #1a99a5;
}
.ellipsis{
  color:#1a99a5;
  &:hover {
    text-decoration: underline #1a99a5;
  }
  // .is-archive{
  //   color:#34495e;
  //   &:hover {
  //     text-decoration: underline #fff;
  //   }
  // }
}
div.bread-road {
  a{
    color:#999;
  }
}
.btnDisabled {
  // background-color: #eee;
  
  &:hover {
    // background-color: #fff;
  }
}
.btnDisabled.el-button--text {
  color: #ccc;
  &:hover{
    color: #ccc;
    border-color: #fff;
  }
}
</style>
