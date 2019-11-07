

<template>
  <el-cascader style="width:100%;"  
    :options="options" 
    v-model="form.entryFile"      
    @active-item-change="handleItemChange" 
    @change="cascaderHandle" clearable>
  </el-cascader> 
</template>

<script>
  import Lib from "../assets/js/Lib";

  export default {
    name:'EntryFile',
    data: function() {  
      return {       
        form:{
          entryFile: [],
          wordingDirectory: '',
        },
        logPathFolder: '/', //  
        options: [],
        optionFileArr:[], // 点击选择的文件夹名的集合， 不包括最后的文件名
        firstIndex:null, //  option数组的 index
        optionIndexArr:[], // 获取到的所有 的 index 值
        optionIndexStr:'', // 指向 哪个 数据， 即 获取数据需要插入到的数组
        pathHistory:[], // 存放 path 的历史记录，用来避免发重复的请求
        username: '',
        volumeName: '', 
      }
    },

    created(){
      this.username = Lib.Common.getCookies("username")?Lib.Common.getCookies("username"):null; // 获取用户名
      this.volumeName = localStorage.getItem('volumeName')?localStorage.getItem('volumeName'):'nfs';
      this.getEntryFile();
      
    },
    
    mounted(){

    },

    methods: {

      handleItemChange(val) {
        this.optionFileArr = val;    // 点击的文件夹 数组
        this.getEntryFile();
      },

      cascaderHandle(value){
        if(value.length == 1){
          // this.logPathFolder = '/';
          Lib.bus.$emit('log-path-folder', '/'); // 把用户选择入口文件的路径传递给父级
          // console.log('ddddd')
        }else if(value.length > 1) {
          Lib.bus.$emit('log-path-folder', '/' + this.form.entryFile.slice(0,this.form.entryFile.length-1).join('/') + '/');
          // console.log('ddddd')
          // this.logPathFolder = '/' + this.form.entryFile.slice(0,this.form.entryFile.length-1).join('/') + '/';
        }
        if(!this.form.wordingDirectory){
          if(value.length == 1){
            this.form.wordingDirectory = '/';
          }else if(value.length > 1) {
            this.form.wordingDirectory = '/' + this.form.entryFile.slice(0,this.form.entryFile.length-1).join('/') + '/';
          }        
        }  
        this.$emit('event-entry',this.form.entryFile); // 传递给父极
      },
      
      // 获取入口文件
    getEntryFile(){


      var optionIndexStr = '';  
      var index = null;
      var whichChildren = null;
      var temArr = this.options;

      this.optionIndexArr = []; // 清空

      //1 获取 index 的数组
      for(var i=0; i < this.optionFileArr.length; i++){        
        var index = null;
        if(i===0){          
          index = this.options.findIndex( ele => {
            return ele.label == this.optionFileArr[i];           
          })
          this.optionIndexArr.push(index);
          this.firstIndex = index;
          whichChildren = 'temArr['+this.firstIndex+']';
        }else{
          // var tt = eval(whichChildren)
          index = eval(whichChildren).children.findIndex( ele => {
            return ele.label == this.optionFileArr[i];           
          })
          whichChildren = whichChildren+'.children['+index+']'
          this.optionIndexArr.push(index);
        }
      }

      //2 获取 路径 的字符串
      for(var j = 1; j < this.optionIndexArr.length; j ++){
        optionIndexStr += '.children['+this.optionIndexArr[j]+']'
      }
      optionIndexStr = 'temArr['+this.firstIndex+']'+optionIndexStr;


      // 优化 已经请求过的文件夹，不在请求
      var temIndex = this.pathHistory.findIndex(ele => {
        return ele == '/'+this.optionFileArr.join('/');
      })
      if(temIndex > 0){
        return false;
      }
      this.pathHistory.push('/'+this.optionFileArr.join('/'));

      // 请求
      this.$axios       
       .get(Lib.API(this.volumeName, this.username).storage.viewerGetFileList+`?path=${this.optionFileArr.join('/')}&type=private`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            if(data.result.length > 0){
              // 1 过滤掉 压缩文件和图片
              data.result = data.result.filter((element,index,array) => {  
                return !(element.imgUrl || /[.]tar$/i.test(element.fileName) || /[.]tar[.]gz$/i.test(element.fileName) || /[.]zip$/i.test(element.fileName));
              })
            }else{
              return false;
            }
             
            if(this.firstIndex === null){
              data.result.forEach((ele,index) => {
              // this.options = [];
                if(ele.directory){
                  this.options.push({
                    label:ele.fileName,
                    value:ele.fileName,
                    children: []});
                }else{
                  this.options.push({
                    label:ele.fileName,
                    value:ele.fileName,
                  });
                }                
              })
            }else{
              eval(optionIndexStr).children = [];
              data.result.forEach((ele,index) => {                  
                if(ele.directory){
                  eval(optionIndexStr).children.push({
                  label:ele.fileName,
                  value:ele.fileName,
                  children: []});
                  
                }else{
                  eval(optionIndexStr).children.push({
                  label:ele.fileName,
                  value:ele.fileName,
                  });
                }                
              })
              // 重新赋值
              this.options = temArr;
            }            
          }
        })    
    },

    }
    
  }
</script>

<style lang="less" scoped>
  
</style>

