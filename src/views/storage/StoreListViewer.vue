<template>
    <main>     
      <div class="viewer-btn-wrap">       
        <el-button id="storelist_btn_create" size="medium" type="primary"  plain icon="el-icon-plus" @click="createDir">{{$t('m.store.create')}}</el-button>
        <el-button id="storelist_btn_refresh" size="medium" type="primary"  plain icon="el-icon-refresh" @click="viewerGetData('','','','refresh')">{{$t('m.refresh')}}</el-button>
        <div class="upload-input-wrap">
          <label for="xFile" class="el-button el-button--primary el-button--medium is-plain">  <i class="el-icon-upload2"></i>{{$t('m.store.upload')}}</label>
          <input type="file" id="xFile" class="upload-input" @change="uploadChange('first')">  
        </div>

        <!-- delete -->
        <el-popover
          placement="bottom"
          width="360"
          v-model="deleteVisibleMoreItem" >
            <div>
              <span v-if="isHaveShare">{{$t('m.selectedShared')}}</span>
              <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + '?'}}</p>
              <div style="text-align: right; ">  
                <el-button size="mini"  id="storelist_btn_d_cancel" @click="deleteVisibleMoreItem = false">{{$t('m.cancel')}}</el-button>                      
                <el-button type="primary" size="mini"  id="storelist_btn_d_confirm" @click="deleteVisibleMoreItem=false;deleteHandle()">{{$t('m.confirm')}}</el-button>
                
              </div>
            </div>
          <el-button  slot="reference" id="storelist_btn_d_delete" size="medium" type="primary"  plain icon="el-icon-delete" v-show="deleteMultipleBtnVisible" @click="isHaveShareHandle()">{{$t('m.delete')}}</el-button>
        </el-popover>
      </div> 

      <!-- 验证没通过 -->
      <div class="upload-progress" v-show="uploadingErrorMessage">
        <p>{{uploadingFileName}}</p>
        <el-progress :percentage="uploadPercentage" :show-text="false"></el-progress>
      </div>
      <!-- 上传的百分比 -->
      <div class="upload-progress" v-show="uploadingDiv">
        <p>{{uploadingFileName}}({{uploadingSize}}) &nbsp; --> &nbsp; {{uploadingPath}}</p>
        <div>
          <el-progress :percentage="uploadPercentage" :show-text="false"></el-progress>
          {{uploadPercentage.toFixed(2)}} %
          <el-button @click="uploadChange()"  size="mini" v-if="isPause" plain icon="el-icon-video-play" id="storelist_btn_continue">{{$t('m.continue')}}</el-button> 
          <el-button @click="stopUpload()" id="storelist_btn_pause"  size="mini"   plain icon="el-icon-video-pause"  v-else>{{$t('m.pause')}}</el-button>
          <el-button @click="cancelUpload()" id="storelist_btn_update_cancel"  size="mini" icon="el-icon-error" >{{$t('m.cancel')}}</el-button>
        </div>      
      </div>

      <section class="show-info viewer">
        <!-- 面包屑 -->
        <div class="bread-road">
          <p v-show="dirList.length>=2">
            <span id="storelist_viewergetdata" @click="viewerGetData('',dirList.length-2);oldDecompressInfos={};
              decompressObjLength=1;unzipInterval()">{{$t('m.store.BackTo')}}</span><i>｜</i> <span  v-for="(item,index) in dirList" :key="index" @click="viewerGetData('',index);oldDecompressInfos={};
              decompressObjLength=1;unzipInterval()"><i v-if="index !=0"> &gt; </i>{{item}}</span>
          </p>
          <p v-show="dirList.length<2" class="one-level">
            <span  v-for="(item,index) in dirList" :key="index">{{item}}</span>
          </p>
          <p>&nbsp;</p>
        </div>

        <table v-loading="loading" :element-loading-text="$t('m.loading')">
           <thead>
             <tr>
               <th><el-checkbox id="storelist_checkall" @change="handleCheckAllChange" v-model="checkAll" ></el-checkbox></th>
               <th>{{$t('m.store.directoryName')}}</th>
               <th>{{$t('m.store.type')}}</th>
               <th>{{$t('m.store.modifiedTime')}}</th>
               <th>{{$t('m.operating')}}</th>
             </tr>
           </thead>
           <tbody v-show="createDirTbody" class="create-dir-tbody">
              <tr>
               <td></td>
               <td>
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-2"></use>
                </svg>
                <input id="storelist_createdir" type="text" class="createDirInput" v-model="createDirInput" :placeholder="$t('m.rules.pleaseEnter')+$t('m.store.directoryName').toLowerCase()" @keyup.enter="postDir" autofocus="autofocus" >
                <i id="storelist_postdir" class="el-icon-circle-check" @click="postDir"></i>
                <i id="storelist_hiddendir" class="el-icon-remove-outline" style="color: #666;" @click="createDirTbody = false;createDirInput = '';isRegExpMessage = false"></i>
                <p v-show="isRegExpMessage" class="red-text">{{$t('m.store.directoryName') + $t('m.rules.notEmpty') + ', '+ $t('m.rules.regularMore')}}</p>
                <p v-show="isDuplicateNamesMessage" class="red-text">{{$t('m.store.directoryName') + $t('m.rules.alreadyExists')}}</p>
               </td>
               <td>-</td>
               <td>-</td>               
               <td>-</td>
             </tr>    
           </tbody>
           <!-- 渲染 -->
           <tbody v-if="list.length>0" class="tbody-viewer" >
             <tr v-for="(item,index) in list" :key="index" >
               <td>
                 <span v-show="!item.decompressInfos.length">
                   <el-checkbox v-model="item.isCheck" @change="handleItemCheckedChange(item.fileName,item.isCheck)"></el-checkbox>
                 </span>
                 
                 
               </td>
               <td>

                  <span style="display:flex;flex-direction:row; justify-content:space-between;">
                    <span>
                      <!-- 图标展示 -->
                      <i v-if="item.imgUrl" class="el-icon-picture-outline"></i> <!-- 图片 -->
                      <svg v-else-if="item.directory"  class="icon" aria-hidden="true"> <!-- 目录 -->
                          <use xlink:href="#icon-2"></use>
                      </svg> 
                      <svg v-else-if="item.isArchive" class="icon" aria-hidden="true" style="font-size:12px;"> <!-- 压缩文件 -->
                        <use xlink:href="#icon-rar"></use>
                      </svg>  
                      <i v-else class="el-icon-document"></i>  <!-- 其他文件 -->

                      <!-- 文字展示 -->
                      <span v-if="item.directory" class="ellipsis" >                        
                        <el-button :disabled="Boolean(item.decompressInfos.length)" :class="{btnDisabled:Boolean(item.decompressInfos.length)}"  @click="viewerGetData(item.fileName)" type="text" >
                          {{item.fileName}}
                        </el-button>
                      </span> 
                      <span v-else>{{item.fileName}}</span>                      
                    </span>

                    <span v-show="item.decompressInfos.length" >
                      {{$t('m.store.'+item.decompressInfo.split(':')[0])}}
                      <i class="el-icon-loading"></i>
                    </span> &nbsp;
                  </span>
                  <span style="max-width: 400px;word-wrap:break-word;word-break:break-all;display:inline-block;" v-show="item.decompressInfos.length" >
                    {{item.decompressInfos[0]}}
                  </span>
                  
                  
               </td>
               <td><span v-if="item.directory">{{$t('m.store.dir')}}</span><span v-else>{{$t('m.store.doc')}}</span></td>
               <td>{{item.date | toDate}} </td>             
               <td class="operation" v-loading="item.loading">  
                                 
                  <!-- download -->                   
                  <a  :href="'/api/storage/volumes/'+volumeName+'/dirs/'+userFolder+'/download?path='+path+'&fileName='+item.fileName+'&isDir='+item.directory+'&type='+type" >
                    <el-button :disabled="Boolean(item.decompressInfos.length)" :class="{btnDisabled:Boolean(item.decompressInfos.length)}" type="text" >
                      <i class="el-icon-download"></i>{{$t('m.download')}}
                    </el-button>
                  </a>  

                  <!-- copy -->
                  <el-button :disabled="Boolean(item.decompressInfos.length)" :class="{btnDisabled:Boolean(item.decompressInfos.length)}" type="text" @click="moveOrCopy='copy';moveOrCopyIndex=index;dialogStrorageTreeVisible=true">
                    <i class="el-icon-document-copy"></i>
                    {{$t('m.copy')}}
                  </el-button>
                  
                  <!-- move -->
                  <el-button :disabled="Boolean(item.decompressInfos.length)" type="text" :class="{btnDisabled:Boolean(item.decompressInfos.length)}" @click="moveOrCopy='move';moveOrCopyIndex=index;dialogStrorageTreeVisible=true" icon="el-icon-rank">
                    {{$t('m.move')}}
                  </el-button>

                  <!-- 大小 -->
                  <el-popover
                    placement="bottom"
                    width="360"
                    v-model="item.detailVisible" >
                      <ul style="line-height:2em;" v-loading="item.detailLoading" :element-loading-text="$t('m.loading')">             
                        <li>{{$t('m.size')}}: {{item.size}}</li>
                        <li>{{$t('m.store.dir')}}: {{item.directory ? $t('m.yes') : $t('m.no')}}</li>
                        <li>{{$t('m.modifiedTime')}}: {{item.date | toDate}}</li>      
                      </ul>
                    <el-button :disabled="Boolean(item.decompressInfos.length)" :class="{btnDisabled:Boolean(item.decompressInfos.length)}" type="text" icon="el-icon-view" @click="viewDetailHandle(item.fileName, index)" slot="reference">
                    {{$t('m.size')}} </el-button>
                  </el-popover>

                  <!-- 只有普通用户有分享操作 -->
                  <span v-if="role==='viewer'">
                    <!-- 设置共享-->
                    <!-- 0,1,2,,3; 
                    0，可以共享；1，已经共享； 2，不能共享，父级或祖父级已经共享；
                    3，其子文件已经共享，提示用户“此文件夹内已有共享文件夹，子文件的共享状态将被取消，是否继续？ -->
                    <el-button v-if="item.share===0||item.share===1" :disabled="Boolean(item.decompressInfos.length)" :class="{btnDisabled:Boolean(item.decompressInfos.length)}" type="text" icon="el-icon-setting" @click="shareHandle(index,item.directory,item.share,item.id)" >{{$t('m.setShare')}}</el-button>


                    <el-popover
                        placement="bottom"
                        :title="$t('m.tip')"
                        width="300"
                        v-model="item.shareVisible">
                        <p>{{$t('m.shareContinue')}}</p>
                      <div style="text-align: right; margin: 0">
                        <el-button size="mini" type="text" @click="item.shareVisible = false">{{$t('m.cancel')}}</el-button>
                        <el-button type="primary" size="mini" @click="item.shareVisible = false;shareHandle(index,item.directory,item.share,item.id)">{{$t('m.confirm')}}</el-button>
                      </div>
                      <el-button :disabled="Boolean(item.decompressInfos.length)" :class="{btnDisabled:Boolean(item.decompressInfos.length)}" v-show="item.share===3"  type="text" icon="el-icon-setting"  slot="reference">{{$t('m.setShare')}}</el-button>
                    </el-popover>

                    

                    <!-- 取消共享 -->
                    <el-button v-if="item.share===1" :disabled="Boolean(item.decompressInfos.length)" :class="{btnDisabled:Boolean(item.decompressInfos.length)}" type="text" icon="el-icon-circle-close-outline" @click="shareCancelHandle(index,item.id)" >{{$t('m.cancelSharing')}}</el-button>
                  </span>

                  <!-- delete -->
                  <el-popover
                    placement="bottom"
                    width="360"
                    v-model="item.deleteVisible" >
                      <div>
                        <span v-if="item.share==1">{{$t('m.currentShared')}}</span>
                        <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' + item.fileName + '?'}}</p>
                        <div style="text-align: right; margin: 0">  
                          <el-button size="mini" @click="item.deleteVisible = false">{{$t('m.cancel')}}</el-button>                      
                          <el-button type="primary" size="mini" @click="item.deleteVisible=false;deleteHandle(item.fileName,index)">{{$t('m.confirm')}}</el-button>
                          
                        </div>
                      </div>
                    <el-button :disabled="Boolean(item.decompressInfos.length)" :class="{btnDisabled:Boolean(item.decompressInfos.length)}" slot="reference" type="text" icon="el-icon-delete" >
                    {{$t('m.delete')}}
                    </el-button>
                  </el-popover>

                  <!-- 查看图片 -->
                  <el-button :disabled="Boolean(item.decompressInfos.length)" :class="{btnDisabled:Boolean(item.decompressInfos.length)}" v-if="item.imgUrl" @click="viewFile(item,true)" type="text" icon="el-icon-view" >
                    {{$t('m.view')}}
                  </el-button>

                  <!-- 压缩文件 -->
                  <el-button :disabled="Boolean(item.decompressInfos.length)" :class="{btnDisabled:Boolean(item.decompressInfos.length)}" v-else-if="item.isArchive" @click="unzip(item.fileName,index)" type="text" icon="el-icon-unlock" >
                    {{$t('m.unzip')}}
                  </el-button>
                  

                  <!-- 其他文件 -->
                  <el-button :disabled="Boolean(item.decompressInfos.length)" :class="{btnDisabled:Boolean(item.decompressInfos.length)}" v-else-if="!item.isArchive&&!item.imgUrl&&!item.directory" @click="viewFile(item)" type="text" icon="el-icon-view" >
                    {{$t('m.view')}}
                  </el-button>

               </td>
             </tr>           
           </tbody>
        </table> 
        <!-- 分页， 当数据 > 500条时 -->
        <div class="page-block">  
            <span>{{$t('m.total')}} {{page.total}} {{$t('m.tiao')}}</span>      
            <el-pagination  v-if="page.total>page.pageSize"
              @current-change="pageHandle"
              :current-page.sync="page.currentPage"
              :page-size="page.pageSize"
              layout="prev, pager, next"
              :total="page.total"  id="storelist_page">
            </el-pagination>
        </div>
        <!-- <p style="text-align:right;color:#999;padding-right:20px;">{{$t('m.store.loadingCompleted')}}, {{$t('m.store.total').toLowerCase()}} {{this.list.length}} {{$t('m.store.ge')}}</p> -->
        
        <!-- move copy -->
        <el-dialog :title="$t('m.'+moveOrCopy)" :visible.sync="dialogStrorageTreeVisible" @close="choseDialogStorageTree">    
          <p style="margin:0;padding:0">{{$t('m.store.selectedPath')}}： <strong>{{choosePath?choosePath:'/'}}</strong></p>                 
          <ul class="demo" style="min-height:300px;border:1px solid #eee;padding:10px 0;">
            <storageTreeItem  ref="storageTree" class="item" :model="treeData" ></storageTreeItem>
          </ul>                    
          <div slot="footer" class="dialog-footer">
            <el-button @click="choseDialogStorageTree">{{$t('m.cancel')}}</el-button>
            <el-button type="primary" @click="confirmHandle">{{$t('m.confirm')}}</el-button>
          </div>
        </el-dialog>

        <!-- 获取　组 + 用户 -->
        <el-dialog class="tree-dialog" width="70%" :visible.sync="personDialogVisible" center @close="closeGroupPerson">
          <GroupPerson ref="groupPerson" v-on:groupPersonCom="groupPersonFn" :shareObjs="shareObjs"></GroupPerson>
        </el-dialog>
          
         <!-- 查看图片/文件内容 -->
        <el-dialog :title="$t('m.view')" :visible.sync="dialogViewFileVisible" id
        ="storelist_dialog_viewfile" @close="imgUrl='';fileContent=''" >
          <div v-loading="loadingImageAndText" :element-loading-text="$t('m.loading')">
            <img  v-if="imgVisible" :src="imgUrl" alt="" width="100%">
            <div class="file-content">{{fileContent}}</div>
          </div>
          
        </el-dialog> 

      </section>      
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";
import storageTreeItem from '../../components/StorageTreeItem.vue';
import GroupPerson from './GroupPerson.vue';

export default {
  components: {
    GroupPerson,
    storageTreeItem,
  },
  data() {
    return {
      dialogStrorageTreeVisible:false,
      choosePath: '',
      chooseShare:0,
      treeData: {
        fileName: this.$t('m.store.allFiles'),
        directory: true,
        path: '', // 根目录时, path 为空, 后台要的路径,大家根据需要添加
        // 防止第一次随机获取数据为空, 默认加的 children
        children: [
          // { fileName: 'work.md', path: "/work.md", directory: true, children: [] },
          // { fileName: 'ss.md', path: "/ss.md", directory: false },
        ]
      },

      moveOrCopy:'',
      moveOrCopyIndex:0,

      role:'',
      list: [], // 
      
      deleteMultipleBtnVisible:false, // 批量删除按钮是否显示
      deleteVisibleMoreItem:false, // 删除多个时的确认框
      isHaveShare:false, // 批量删除的文件是否有共享文件

      createDirTbody:false,  // 是否显示创建ｉｎｐｕｔ
      isRegExpMessage:false, // 是否显示提示信息, 验证没通过
      isDuplicateNamesMessage:false, // 是否重名
      checkAll:false,
      dirList:[], // 页面上要显示的目录集合

      userFolder:'', // 用户名，　传的参数
      volumeName:'', // 数据卷名
      type:'', // public private 公共数据还是私有数据

      attr:'rwx', // 文件权限　要传的参数，　文件权限（现在默认全写成rwx）
      createDirInput:'', // 创建的目录名
      

      uploadingFileName:'',
      uploadingSize:'',
      uploadPercentage: 0,
      uploadingErrorMessage:false,
      uploadingDiv:false,
      cancelTokenSource:null,

      dialogViewFileVisible:false, // 查看文件对话框
      imgVisible: false,
      imgUrl: '',
      fileContent: '',
      timerId:null,
      moveDialogVisible: false, // 移动到/赋值到 对话框
      loading: false, //

      shareItemDir:false, // 分享的文件是文件夹还是文件
      shareItemFileName:'',
      shareItemId: null,
      personDialogVisible: false,
      shareObjs:{
        group: [],
        person: [],
        all: [],
      },
      sliceCurrent: 0, // 当前传的是第几块
      timerIdUnzip: 0, // 定时器 ID
      decompressObjLength: 1, // 正在解压的数量
      oldDecompressInfos: [],
      uploadingPath: '',
      isPause: false, // 是否暂停
      loadingImageAndText: false,
      listTemAll: [], // 当获取的条数大于500条时，临时全部放再这里
      page: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 50 // 一页显示多少条
      }, 
    };
  },

  computed: {
    // 仅读取
    path: function () {
      if(this.dirList.length === 1){  
        return '';  // ["全部文件"] => ''
      }else{
        return this.dirList.slice(1).join('/'); // ["全部文件",'aa','bb','cc'] => aa/bb/cc
      }
    },
  },
  
  created() {
    this.role = localStorage.getItem("rolesStore");
    this.dirList.push(this.$t('m.store.allFiles'));

    // 判断角色
    if(this.role == 'viewer'){
      this.volumeName = localStorage.getItem('volumeName')?localStorage.getItem('volumeName'):'nfs';
      this.userFolder = Lib.Common.getCookies('username');  
      this.type = 'private';
    }else if(this.role == 'admin'){
      this.volumeName = 'public';
      this.userFolder = 'common';
      this.type = 'public';
    }
    this.viewerGetData();
    this.unzipInterval(); // 查看 是否有正在解压的文件

    Lib.bus.$on("choose-path", (arg,share) => {
        this.choosePath = arg;
        this.chooseShare = share;
    });
  },
  
  destroyed(){
    clearInterval(this.timerIdUnzip);; // 关闭定时器
  },

  methods: {
    // 取消选中路径
    choseDialogStorageTree(){
      this.dialogStrorageTreeVisible = false;
      this.choosePath = '';
    },

    // 选中路径，发送　复制 / 移动　请求
    confirmHandle: function() {
      // if(!this.choosePath){
      //   this.$message({
      //     showClose: true,
      //     message:  " " + this.$t('m.store.pleaseSelectPath'),
      //     // type: "warning",
      //     duration: Lib.Common.messageDuration
      //   });
      //   return false;
      // }
      if(this.moveOrCopy === 'move'　&&　this.chooseShare === 1){
        this.$message({
          showClose: true,
          message:  this.$t('m.targetDirectory') + this.choosePath + this.$t('m.TipCancelShare'),
          type: "warning",
          duration: 0
        });
        return false;
      }
      
      // 1 发送　请求
      let url = '',succMess = '', item = {};
      item = this.list[this.moveOrCopyIndex];

      if(this.moveOrCopy === 'move'){ // 移动
        url = Lib.API(this.volumeName, this.userFolder).storage.moveTo + `?srcPathStr=${this.path}&destPathStr=${this.choosePath}&isDir=${item.directory}&type=${this.type}&id=${item.id}&share=${item.share}&fileName=${item.fileName}`;
        succMess = this.$t('m.move');
      }else if(this.moveOrCopy === 'copy'){　// 复制
        url = Lib.API(this.volumeName, this.userFolder).storage.copyTo + `?srcPathStr=${this.path}&destPathStr=${this.choosePath}&isDir=${item.directory}&type=${this.type}&fileName=${item.fileName}`;
        succMess = this.$t('m.copy');
      }

      this.list[this.moveOrCopyIndex].loading = true;
      this.$axios
        .get(url)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.unzipInterval(this.moveOrCopyIndex);
          }else{
            this.list[this.moveOrCopyIndex].loading = false;
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams);
          }
          
        })
      // ２　关闭 dialog,　同时会触发关闭事件　choseDialogStorageTree
      this.dialogStrorageTreeVisible = false;
    },

    // 取消分享
    shareCancelHandle(index,id){
      this.$axios.delete(
        // /api/storage/volumes/{volumeName}/dirs/{userFolder}/share
          Lib.API(this.volumeName,this.userFolder).storage.cancelShare+`?id=${id}`)     
          .then(res => {
            const data = res.data;
            if (data.success) {
              this.$message({
                showClose: true,
                // message: this.$t("m.store.dir") + ' '+ this.createDirInput + " " + this.$t("m.created"),
                message: this.$t("m.canceledSharing"),
                type: "success",
                duration: Lib.Common.messageDuration
              });
              this.viewerGetData(); 
            } else {
              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText, data.messageParams);
            }
        })
    },

    // 关闭　groupPerson dislog时, 触发子组件事件
    closeGroupPerson(){
      this.$refs.groupPerson.allcheckedFalse(); // 清空 groupPerson DIALOG 的选项
      this.$refs.groupPerson.goBack(); 
    },

    // // 获取共享对象
    shareHandle(index,dir,share,id){
      this.shareObjs = {
        person: [],
        group: [],
        all: []
      }
      // this.list[index].loading = true;
      if(share === 1){ // 已经共享
        // 获取共享对象
        this.$axios.get(
        // /api/storage/volumes/{volumeName}/dirs/{userFolder}/share
          Lib.API(this.volumeName,this.userFolder).storage.shareRange+`?id=${id}`)     
          .then(res => {
            const data = res.data;
            if (data.success) {
              // 修改数据结构，并赋值
              for(let v of data.shareObjs){
                if(v.shareRange === 'all'){
                  this.shareObjs.all = v.shareTo;
                }else if(v.shareRange === 'person'){
                  this.shareObjs.person = v.shareTo;
                }else if(v.shareRange === 'group'){
                  this.shareObjs.group = v.shareTo;
                }
              }
              this.shareItemDir = dir;
              this.shareItemFileName = this.list[index].fileName;
              this.shareItemId = id;
              this.personDialogVisible = true;    

            } else {
              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText, data.messageParams);
            }
        })
      }else if(share === 0 || share === 3){ // 可以共享
        this.shareObjs = {
          group: [],
          person: [],
          all: [],
        };
        this.shareItemDir = dir;
        this.shareItemFileName = this.list[index].fileName;
        this.shareItemId = id;
        this.personDialogVisible = true;    
      }
    },

    // 获取子组件传来的数据, 并发送设置分享请求
    groupPersonFn( arg){
      this.personDialogVisible = false;
      // 取消
      if(!arg){
        return false;        
      };
      let shareObjs = JSON.parse(arg);

      // 发送分享请求
      this.$axios.post(
        // /api/storage/volumes/{volumeName}/dirs/{userFolder}/share
        Lib.API(this.volumeName,this.userFolder).storage.shareData,
        {
          sharePath: this.path,
          fileName: this.shareItemFileName,
          dir: this.shareItemDir,
          shareObjs:[ 
            {shareTo:shareObjs.group,shareRange:"group"},
            {shareTo:shareObjs.person,shareRange:"person"},
            {shareTo:shareObjs.all,shareRange:'all'}
          ],
          id: this.shareItemId
        })     
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.$message({
              showClose: true,
              // message: this.$t("m.store.dir") + ' '+ this.createDirInput + " " + this.$t("m.created"),
              message: this.$t("m.shared"),
              type: "success",
              duration: Lib.Common.messageDuration
            });
            this.viewerGetData();
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
      })
    },

    // 查看大小　
    viewDetailHandle(fileName,index){

      this.list[index].detailLoading = true;  

      this.$axios
      .get(Lib.API(this.volumeName, this.userFolder).storage.viewerViewDetail + `?path=${this.path}&type=${this.type}&fileName=${fileName}`)
      .then(res => {
        const data = res.data;
        if (data.success) {
          this.list[index].size = data.size;
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText,data.messageParams);
        }
        this.list[index].detailLoading = false;
      })
      
    },


    // 文件列表
    viewerGetData(fileName,dirLsitIndex,interval,refresh){  
      if(!refresh){
        // this.cancelUpload(); // 更换目录时，取消正在上传的文件。如果不取消，路径会跟着变动，即重新上传到更新后的目录上去了。
      }else{

      }
      
      this.list.forEach((element,index,array) => {
        element.isCheck = false;
      })
      if(fileName){
        this.dirList.push(fileName);
      }     
      if(dirLsitIndex===(this.dirList.length-1)){
        return false;
      }
      if(dirLsitIndex){
        this.dirList = this.dirList.slice(0,dirLsitIndex+1);
      }
      if(dirLsitIndex === 0){
        this.dirList = this.dirList.slice(0,dirLsitIndex+1);
      }
      if(!interval){
        this.loading = true;
      }

      this.$axios
        // /api/storage/volumes/${this.volumeName}/dirs/${this.userFolder}
        .get(Lib.API(this.volumeName, this.userFolder).storage.viewerGetFileList + `?path=${this.path}&type=${this.type}`) 
        .then(res => {
          const data = res.data;
          
          if (data.success) {
            this.page.total = data.result.length;
            data.result.forEach((element,index,array) => {           
              element.deleteVisible = false;
              element.isCheck = false;
              // element.isUnzipVisible = true; // 正在解压 ... 
              element.loading = false;
              element.shareVisible = false; // 当　share === 3　时提示用户，是否继续
              element.detailVisible = false;
              element.detailLoading = false;
              // element.isUnzipingLoading = false;
              element.decompressInfos = [];
              element.decompressInfo = '';
              for(let prop in this.oldDecompressInfos){
                if(element.fileName === prop){  
                  element.decompressInfos = this.oldDecompressInfos[prop];
                }
              }
                
              
              
              // 判断是否是压缩包 Archive
              // 目前支持 zip tar.gz 后缀               
              // element.isArchive = /[.]tar$/i.test(element.fileName) || /[.]tar[.]gz$/i.test(element.fileName) || /[.]zip$/i.test(element.fileName);
              element.isArchive = /[.]tar[.]gz$/i.test(element.fileName) || /[.]zip$/i.test(element.fileName);
            })     

              
            // 1, 按时间排序， 加了目录或文件的排序， 但有浏览器兼容性问题，所以后面又加了判断排序。
            data.result.sort((a,b) => {
              if(a.directory != b.directory ){
                return a.directory;
              }else{
                return new Date(b.date) - new Date(a.date);
              }              
            })
            // 2，找出所有的目录
            var i = null;
            data.result.some( (ele,index) => {
              if(ele.directory){
                i = index;
                return ele.directory;
              }
              
            })
            var temporaryArray = data.result.slice(i);

            // 3， 删除目录
            data.result.splice(i,temporaryArray.length)
            
            // 4，把目录添加到最上面，并赋值
            if(this.page.total > this.page.pageSize){ // 前端分页处理
              this.listTemAll = [...temporaryArray,...data.result];
              this.list = this.listTemAll.slice((this.page.currentPage-1)*this.page.pageSize,this.page.currentPage*this.page.pageSize);

            }else{ // 不做分页， 直接展示
              this.list = [...temporaryArray,...data.result];
            }
            

            // 清空 storageTreeItem 子组件
            if(this.$refs.storageTree){
              this.treeData.children = []; // 清空 子组件数据，因为移动　复制　删除，都改变了原来的目录列表
              this.$refs.storageTree.open = false;　// 收起第０层（）
            }
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams,interval);
          }
          this.loading = false;
      })
      this.checkAll = false;
    },

    // 分页处理
    pageHandle(){
      this.loading = true;
      this.list = this.listTemAll.slice((this.page.currentPage-1)*this.page.pageSize,this.page.currentPage*this.page.pageSize);
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    },

    // 显示　创建的ｔｂｏｄｙ
    createDir(){
      this.createDirTbody = true;
      var inputCreate = document.querySelector('tbody.create-dir-tbody input');
      inputCreate.focus();
      
    },

    // 创建 目录/文件夹
    postDir(){
      // 验证
      // 不能包含以下字符’<‘,’>‘,’|‘,’*‘,’?‘,’,‘，’/‘，长度限制在50个字符
      // str.search(//) 如果找到会返回下标，如果没找到会返回　-1
      // 
      this.createDirInput = this.createDirInput.trim();
      if(this.createDirInput.length == 0){
        this.isRegExpMessage = true;
        return false;
      }
      if(this.createDirInput.search(/[<>/*?,\s]/) >= 0 || this.createDirInput.length > 20){ 
        // ’<‘, ’>‘, ’|‘, ’*‘, ’?‘, ’,‘，’/‘，
        this.isRegExpMessage = true;
        return false;
      }
      this.isRegExpMessage = false;
      
      //＝＝＝ 判断是否重名
      /*
      逻辑：　例如用户输入的是　xx ，是完全重名的判断
      查看 list 中是否有　xx　－－－　temporaryObject　为　underfined


      */
      var temporaryObject = this.list.find(ele => {
        return this.createDirInput == ele.fileName;
      })
      // temporaryObject 不为　undefined , 重名的情况
      if(temporaryObject){ //  temporaryObject 如果存在，说明有重名的情况
        // 如果重名，比如　tt ,　看有没有　xx(　，　
        // 如果没有，添加　tt(1)，　并执行下去
        // 
        // 
        // 过滤出　tt(x) 这样的情况,并且　x 是数字的情况
        var temporaryArr = this.list.filter(ele => {
          return ele.fileName.includes(this.createDirInput+'(') && (ele.fileName[ele.fileName.length-1] === ')') && Number(ele.fileName.split(this.createDirInput+'(')[1].split(')')[0]);
        })
        if(temporaryArr.length){ // 存在 xx( 这种情况，
          // 转成　temporaryArr = [4,7,9,2]
         　temporaryArr = temporaryArr.map(ele => {
            return Number(ele.fileName.split(this.createDirInput+'(')[1].split(')')[0]);
          })　
          // 升序排列
          temporaryArr.sort((a,b) => a - b);
          for(var i = 1; i < 1000; i++){
            var temI = temporaryArr.find(ele => {
              return ele == i;
            })
            if(!temI){
              this.createDirInput = this.createDirInput + '(' + i + ')'
              break;
            }
          }
        }else{
          this.createDirInput = this.createDirInput + '(1)';
        }
      }
      this.isDuplicateNamesMessage = false;
      // 如果不重名，直接向下走，直接发送请求

      // 消除根目录下　２个 / 的情况
      var temporaryPath = null;

      this.$axios.post(
        // `/api/storage/volumes/${this.volumeName}/dirs`,
        Lib.API(this.volumeName).storage.createDir+`?type=${this.type}`,
        {"folderInfo": {
            path: this.path, // 路径
            attr: this.attr,　// 权限
            fileName: this.createDirInput,
          }
        })     
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.$message({
              showClose: true,
              message: this.$t("m.store.dir") + ' '+ this.createDirInput + " " + this.$t("m.created"),
              type: "success",
              duration: Lib.Common.messageDuration
            });
            this.viewerGetData(); 
            this.createDirInput = '';
            this.createDirTbody = false;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
      })
    },

    // 全选/全不选
    handleCheckAllChange(){
      this.list.forEach((element,index,array) => {
        element.isCheck = this.checkAll;
      });
      this.deleteMultipleBtnVisible = this.list.some((element) => {
        return element.isCheck;
      });
    },

    // 每个的选择框，　只要有一个没选中的，就取消全选
    handleItemCheckedChange(fileName,isCheck){
      // 全选
      this.checkAll = this.list.every((element) => {
        return element.isCheck;
      });
      this.deleteMultipleBtnVisible = this.list.some((element) => {
        return element.isCheck;
      });
      
    },

    // 批量删除的文件中是否有已经分享的文件，需要给于用户以提示
    isHaveShareHandle(){
      let temList = this.list.filter(element => {
        return element.isCheck;
      });
      this.isHaveShare = temList.some(element => {
        return element.share === 1;
      });
    },

    // 删除　文件/目录
    deleteHandle(fileName,index){
      let delePara = [];
      if(fileName){　// 删除单个文件
          delePara = [{
            path: this.path,
            fileName: fileName,
            id: this.list[index].id,
            share: this.list[index].share
          }];
          this.list[index].loading = true;
      }else{　// 批量删除
        this.list.forEach((ele,index) => {
          if(ele.isCheck){
            let obj = {
              path: this.path,
              fileName: this.list[index].fileName,
              id: this.list[index].id,
              share: this.list[index].share
            }
            delePara.push(obj);
          }
        });
        this.loading = true;

      }

      if(this.dirList.length === 1){ // 根目录

      }
      this.$axios.put(
        // /api/storage/volumes/${this.volumeName}/dirs/${this.userFolder},
        Lib.API(this.volumeName, this.userFolder).storage.deleteData+`?type=${this.type}`,delePara)     
        .then(res => {
          const data = res.data;
          if (data.success) { 
            if(fileName){ // 删除一个情况
              this.unzipInterval(index);              
            }else{ // 删除多个情况
              this.unzipInterval(index);
              this.deleteMultipleBtnVisible = false;  
              this.checkAll = false;      
            } 
          } else {
            if(fileName){　// 删除单个文件
              this.list[index].loading = false;
            }else{　// 批量删除
              this.loading = false;
            }
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
      })          
    },


    // 查看文件内容
    viewFile(item,isImage){

      if(isImage){ // 图片
        this.imgVisible = true;
      }else{ // 文本
        this.imgVisible = false;
      }

      this.dialogViewFileVisible = true;
      this.loadingImageAndText = true;

      this.$axios
      // /api/storage/volumes/${this.volumeName}/dirs/${this.userFolder}/show?path=${path}
      .get(Lib.API(this.volumeName, this.userFolder).storage.viewContent + `?path=${this.path}&type=${this.type}&fileName=${item.fileName}`)
      .then( res => {
        const data = res.data;
        if(data.success){

          if(isImage){ // 图片
            this.imgUrl = data.fileContent ? data.fileContent : '';
          }else{ // 文本
            this.fileContent = data.fileContent ? data.fileContent : this.$t("m.noData");
          }

        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText,data.messageParams);
        }   
        this.loadingImageAndText = false;
      })
    },


    // 取消上传
    cancelUpload(){
      if(this.cancelTokenSource){
        this.cancelTokenSource.cancel()
      };
      if(document.querySelector('input[type="file"]')){
        document.querySelector('input[type="file"]').value = '';
      }
      this.uploadingFileName = '';
      this.uploadingSize = '';
      this.uploadPercentage = 0;
      this.uploadingDiv = false;
    },

    // 暂停上传
    stopUpload(){ 
      this.isPause = true;
      if(this.cancelTokenSource){
        this.cancelTokenSource.cancel()
      };
    },

    // 上传
    uploadChange(first){
      this.isPause = false;
      
      // 取消上一个，每次只能传一个。
      if(this.cancelTokenSource){
        this.cancelTokenSource.cancel();
      };
      
      let sameUpload = true;
      let path = '';
      if(first){
        // 如果是重新点击 上传 按钮
         sameUpload = false;
         this.sliceCurrent = 0;
         this.uploadPercentage = 0;
         this.uploadingPath = this.path;
         path = this.path;
      }else{
         path = this.uploadingPath;
      }
      
      // 执行下一个上传
      let file = document.querySelector('input[type="file"]').files[0];
      
      if(!file){
        
        return false;
      }
      let fileSize = file.size;
      let step = 10 * 1024 * 1024; // 一份大小 5MB，转换成 B 字节，后台一块的大小一致
      let sliceTotal = parseInt(fileSize/step); // 一共分多少块
      // .slice(表示第一个会被会被拷贝进新的 Blob 的字节的起始位置,这个下标-1的对应的字节将会是被拷贝进新的Blob 的最后一个字节)
      let sliceFile = file.slice(this.sliceCurrent*step,(this.sliceCurrent+1)*step,file.type);
      this.uploadingFileName = file.name;
      if(parseInt(file.size/1024/1024) >0 ){
        // toFixed(num) 四舍五入 保留几位小数
        this.uploadingSize = (file.size/1024/1024).toFixed(2) + 'MB';
      }else{
        this.uploadingSize = (file.size/1024).toFixed(2) + 'KB';
      }

      
      
      let param = new FormData();
      param.append("file", sliceFile);
      this.cancelTokenSource = this.$axios.CancelToken.source();
      let config = {
        header: { "Content-Type": "multipart/form-data" },
        cancelToken:this.cancelTokenSource.token
      };

      var url = Lib.API(this.volumeName, this.userFolder).storage.upload + `?path=${path}&type=${this.type}&sameUpload=${sameUpload}&fileSize=${file.size}&sliceCurrent=${this.sliceCurrent}&fileName=${this.uploadingFileName}`

      this.uploadingDiv = true;

      this.$axios.post(url, param,config).then(res => {
        const data = res.data;
        if (data.success) {
            if(sliceTotal === this.sliceCurrent){
              // 全部传完了
              this.viewerGetData(); // 清空写在了　this.viewerGetData()　底部             
              this.$message({
                showClose: true,
                message: this.uploadingFileName + ' ' + this.$t("m.uploaded"),
                type: "success",
                duration: Lib.Common.messageDuration
              });
              this.uploadingDiv = false;

              // 清空
              this.uploadingFileName = '';
              this.uploadingSize = '';
              this.uploadPercentage = 0;
              this.uploadingDiv = false;
            }else{
              // 还没传完
              this.sliceCurrent ++; // 当前传的是第几块， 从 0 开始
              this.uploadPercentage = this.uploadPercentage + (100/(sliceTotal+1));
              // 把没传完的 块的序数，百分比，文件名，文件大小 存入 localStorage 里，当刷新或者再次登录时，调取，显示给用户，供继续上传。
              this.uploadChange(); // 递归
            }
            
          // }
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
          // 清空
          this.uploadingFileName = ""; // 文件名
          this.uploadingSize = '';
          this.uploadingDiv = false; // 标签名
          this.uploadPercentage = 0;
          if(this.cancelTokenSource){
            this.cancelTokenSource.cancel()
          }
        }            
      })
    },


    // 解压　至当前目录
    unzip(fileName,index){
      this.list[index].loading = true;
     
      this.$axios
      .get(Lib.API(this.volumeName, this.userFolder).storage.unzip + `?path=${this.userFolder+(this.path?('/'+this.path):'')}&fileName=${fileName}&type=${this.type}`)
      .then(res => {
        const data = res.data;
        if (data.success) {
          this.unzipInterval(index);
        }else{
          this.list[index].loading = false;
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText,data.messageParams);
        }
        
      })
    },

    // 定时器 -- 解压/复制/移动/删除 过程 
    unzipInterval(index){

      clearInterval(this.timerIdUnzip); // 关闭定时器

      this.timerIdUnzip = setInterval(() => {
        this.$axios
          .get(Lib.API(this.volumeName, this.userFolder).storage.unzipInterval + `?path=${this.userFolder+(this.path?('/'+this.path):'')}&type=${this.type}`)
          .then(res => {
            if(Number.isInteger(index)){
              this.list[index].loading = false;
            }
            this.loading = false;
            
            let data = res.data;
            if (data.success) { 
              
              if(data.decompressInfos === null){
                data.decompressInfos = {};
              }
              this.oldDecompressInfos = data.decompressInfos;
              // console.log(Object.keys(data.decompressInfos).length);
              
              if(Object.keys(data.decompressInfos).length){
                // console.log('0000');
                
                this.list.forEach( (ele,index) => {
                  ele.decompressInfos = []; 
                  for(let prop in data.decompressInfos){
                    if(prop === ele.fileName){
                      ele.decompressInfos = data.decompressInfos[prop];
                      ele.decompressInfo = data.decompressInfos[prop][0];
                    }
                  }                                 
                })
              }else{
                // console.log('11111');
                
                clearInterval(this.timerIdUnzip); // 关闭定时器                
                this.viewerGetData('','','interval','refresh'); // 重新获取数据
              } 

              // 当 返回的数量于上一次存储的数量不一致时，说明有文件已经解压完成，这时需要重新获取数据
              if((this.decompressObjLength !== Object.keys(data.decompressInfos).length) && Object.keys(data.decompressInfos).length){
                this.viewerGetData('','','interval','refresh'); // 重新获取数据
              }
              this.decompressObjLength = Object.keys(data.decompressInfos).length ? Object.keys(data.decompressInfos).length : 1;


            }else{
              clearInterval(this.timerIdUnzip);; // 关闭定时器
              this.oldDecompressInfos = {};
              this.decompressObjLength = 1; // 重置
              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText,data.messageParams);
            }
          })
      },2000)
    }
    

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
      vertical-align: top;
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
    td:first-child, th:first-child {
      width: 60px;
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
          // cursor: pointer;
        }
        td:nth-child(2):hover{
          // color: #1a99a5;
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
      width: 70%;
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
  white-space: normal;
  cursor: pointer;
        // }
        // td:nth-child(2):hover{
          // color: #1a99a5;
  &:hover {
    // text-decoration: underline #1a99a5;
    color: #1a99a5;
  }
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
