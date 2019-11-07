<template>
  <li>

    <label class="tabindex" tabindex="1000" :style="{ paddingLeft:paddingLeft+'px' }" @click="getList(model.path)" @click.prevent="toggle(model.path,model.share)">

      <span  :class="{noChildren: !hasChildren}"  > 
        <i v-if="!open && hasChildren"  class="el-icon-caret-right"></i>
        <i v-if="open && hasChildren"  class="el-icon-caret-bottom"></i>
        <i v-if="getting"  class="el-icon-loading"></i>
        <i v-if="!hasChildren"  class="noChildren"></i>
      </span>

      <input type="radio" name="checkRadio" :value="model.path">

      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-2"></use>
      </svg>

      {{ model.fileName }}

    </label>

    <ul v-show="open" v-if="hasChildren">
      <storageTreeItem class="item" v-for="(model, index) in model.children" :key="index" :model="model">
      </storageTreeItem>
    </ul>
  </li>
</template>

<script>
import Lib from "../assets/js/Lib";
import storageTreeItem from './StorageTreeItem.vue';

export default {
    name:'storageTreeItem',
    components: {
      storageTreeItem
    },
    props: {
      model: Object,      
    },
    data: function() {
      return {
        open: false,
        newFile: false,
        getting: false,
        volumeName:'',
        username: '',
        type:'', // public private 公共数据　还是　私有数据
      }
    },
    computed: {
      hasChildren: function() {
        return this.model.children;
      },

      paddingLeft: function () {
        return  this.model.path ? (this.model.path.split('/').length * 30) : 10;
      }
    },

    created(){
      this.role = localStorage.getItem("rolesStore");
      if(this.role == 'viewer'){
        this.volumeName = localStorage.getItem('volumeName')?localStorage.getItem('volumeName'):'nfs';
        this.username = Lib.Common.getCookies('username');  
        this.type = 'private';
      }else if(this.role == 'admin'){
        this.volumeName = 'public';
        this.username = 'common';
        this.type = 'public';
      }
    },

    methods: {

      toggle: function(path,share) {
        if (this.hasChildren) {
          this.open = !this.open;
        }
        // 自定义事件， 传递路径给父级
        Lib.bus.$emit('choose-path',path,share);
      },

      addChild: function(path) {
        this.newFile = false;
        this.model.children.push({
          fileName: this.newFileName,
          directory: true,
          path: (path?(path + '/'):'') + this.newFileName,
          children: []
        })
        this.newFileName = 'new-stuff';
      },

      getList(path) {
        if(this.open){
          return false;
        }
        this.getting = true;
        this.$axios.get(Lib.API(this.volumeName, this.username).storage.viewerGetFileList+`?path=${path}&type=${this.type}`)
          .then(res => {
            const data = res.data;
            if (data.success) {
              this.getting = false; // 图标归位
              if(data.result){
                data.result = data.result.filter(ele => ele.directory);
              }else{
                this.model.children = ''; 
                return false;
              }
              
              if (!data.result || !data.result.length) {
                this.model.children = ''; // 字符串转为 boolean 值为false, 等于是 计算属性在计算 hasChildren 时为false
                return false;
              }

              // 3, 整理数据

              // 3.1 筛选出文件夹
              

              // 3.2 添加 path 属性
              data.result.forEach(ele => {
                ele.path = (path?(path + '/'):'') + ele.fileName;
                ele.children = [];
              })

              // 3.3 添加 children 属性和数据
              this.$set(this.model, 'children', data.result);
            // },1000)
      
      
            } else {
              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText, data.messageParams);
            }
          })
       
      }
    }
  
}
</script>

<style lang="less" scoped>
  ul {
    padding-left: 0em;
    line-height: 1.5em;
    list-style-type: none;
  }

  label {
    display: block;
    cursor: pointer;
  }

  label:hover {
    background: #f0f4f5;
  }

  label:focus {
    background: #e2ecef;
    outline: none;
    border: none;
  }

  input[type="radio"] {
    display: none;
  }

  .noChildren {
    width: 18px;
    display: inline-block;
  }
  
  .add {
    color: #ccc;
  }
</style>

