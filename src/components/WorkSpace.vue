

<template>
  
  <!-- storage tree -->
  <el-dialog :title="$t('m.job.workSpace')" :visible.sync="dialogStrorageTreeVisible" @close="choseDialogStorageTree">    
      <p style="margin:0;padding:0">{{$t('m.store.selectedPath')}}： <strong>{{choosePath}}</strong></p>                 
      <ul class="demo" style="min-height:300px;border:1px solid #eee;padding:10px 0;">
        <storageTreeItem class="item" :model="treeData" ></storageTreeItem>
      </ul>                    
    <div slot="footer" class="dialog-footer">
      <el-button @click="choseDialogStorageTree">{{$t('m.cancel')}}</el-button>
      <el-button type="primary" :disabled="!choosePath" @click="deploymentSubmitHandle">{{$t('m.confirm')}}</el-button>
    </div>
  </el-dialog> 
</template>

<script>
  import Lib from "../assets/js/Lib";
  // import storageTreeItem from '../../components/StorageTreeItem.vue';

  export default {
    name:'workSpace',
    components: {
      // storageTreeItem,
    },
    props: {
      dialogStrorageTreeVisible: {
        type: Boolean,  // 从父级接收过来
        default: false,
      }
    },
    data: function() {  
      return {       
        form:{
          entryFile: [],
          wordingDirectory: '',
        },
        choosePath: '', 
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
      }
    },

    created(){
      this.username = Lib.Common.getCookies("username")?Lib.Common.getCookies("username"):null; // 获取用户名
      this.volumeName = localStorage.getItem('volumeName')?localStorage.getItem('volumeName'):'nfs';
      this.getEntryFile();

      // this.getEntryFile();
      Lib.bus.$on("choose-path", arg => {
          this.choosePath = '/' + arg;
          this.$emit('event-choose-path',this.choosePath);
      });
    
      
    },
    
    mounted(){

    },

    methods: {

      // 关闭 choseDialogStorageTree
      choseDialogStorageTree(){
        this.dialogStrorageTreeVisible = false;
        this.choosePath='';
        if(!this.form.deploymentEntryFile){
          this.changeEveryTime = !this.changeEveryTime;
          this.validateDeploymentEntryFileError = this.$t("m.rules.pleaseChoose") + this.$t("m.job.workSpace").toLowerCase() + (this.changeEveryTime?'。 ':'。');
        }
        if(!this.form.wordingDirectory){
          this.changeEveryTime = !this.changeEveryTime;
        }
      },

      // 在线编辑， 选择好空间
      deploymentSubmitHandle: function() {
        this.dialogStrorageTreeVisible = false;
        this.form.deploymentEntryFile = this.choosePath;
        this.form.wordingDirectory = this.choosePath;
        
      },

    }
    
  }
</script>

<style lang="less" scoped>
  
</style>

