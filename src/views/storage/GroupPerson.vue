<template> 
<div>
  <section class="com-wrap">
    <div class="group-person" v-loading="loading"  :element-loading-text="$t('m.loading')">
      <div class="main-btn-wrap">   
        <div>
          <el-button v-show="queryPerson.isVisible" @click="goBack" size="medium" type="text" icon="el-icon-back" id="groupPerson_button_upload">{{$t('m.goBack')}}</el-button>
        </div>  
        <div> 
          <el-input id="groupPerson_query" v-model="queryPerson.personName" :placeholder="$t('m.pleaseEnter')+$t('m.username')" clearable size="small" ></el-input> &nbsp; 
          <el-button  id="groupPerson_search" size="mini" type="primary" icon="el-icon-search" @click="queryPerson.isVisible=true;getPersonList('searchDifferent')" >{{$t('m.search')}}</el-button>
        </div>        
      </div>
      
      <!-- 组和用户同时选泽 -->
      <div v-if="!queryPerson.isVisible">
        <el-checkbox v-model="allChecked" @change="allCheckedHandle">{{$t('m.allMembers')}}</el-checkbox>
        <ul>
          <li v-for="(group,index) in groupList" :key="group.groupname">
            <i :class="group.isFolded?'el-icon-caret-bottom':'el-icon-caret-right'" style="vertical-align: bottom;" @click="foldHandle(index)" @click.once="getPersonList(index)"></i>

            <!-- 0: 未被选中  -->
            <i v-show="group.isChecked===0" @click="groupHandle(index)"  style="vertical-align: bottom;border:1px solid #ddd; border-radius:2px;width:14px;height:14px;display:inline-block;">&nbsp;</i>
            <!-- 1: 选中 -->
            <i v-show="group.isChecked===1" @click="groupHandle(index)"  class="el-icon-check" style="vertical-align: bottom;font-size: 12px;border:1px solid #32b1bf;background-color:#32b1bf; border-radius:2px;color:#fff;"></i>
            <!-- 2: 子有被选中的 -->
            <i v-show="group.isChecked===2" @click="groupHandle(index)" class="el-icon-minus" style="vertical-align: bottom;font-size: 12px;border:1px solid #32b1bf;background-color:#32b1bf; border-radius:2px;color:#fff; border-radius:1px;"></i>

            <!-- <el-checkbox v-model="group.checked"></el-checkbox> -->
            <span @click="groupHandle(index)" class="group-name" :style="{color:group.isChecked===1?'#32B1BF':'#606266'}">{{group.groupname}}<span v-show="group.total!=='dontKnownyet'" style="color:#999;">({{group.total}}{{$t('m.members')}})</span></span>
            <transition name="operationTransition">
              <ul v-show="group.isFolded" v-loading="group.loading"  :element-loading-text="$t('m.loading')">
                <li v-for="(person,i) in group.children" :key="person.userName">
                  <el-checkbox v-model="person.isChecked" @change="personHandle(index,i)">{{person.username}}</el-checkbox>                  
                </li>
                <el-button v-show="group.total>group.children.length" size="mini" type="text" plain style="margin:5px 20px; padding:5px 10px;" @click="getPersonList(index)">{{$t('m.moreMembers')}}</el-button>
              </ul>
            </transition>
            
          </li>
        </ul>
      </div>

      <!-- 全局中选中用户 -->
      <div v-else>
        <p>{{$t('m.members')}}<span  style="color:#999;"></span></p>
        <ul  v-loading="queryPerson.loading"  :element-loading-text="$t('m.loading')">
          <li v-for="(person,i) in queryPerson.list" :key="person.userName">
            <el-checkbox v-model="person.isChecked">
            {{person.username}}</el-checkbox>
          </li>
          <el-button  v-show="queryPerson.total>queryPerson.list.length"  size="mini" type="text" id="group_person_more1" plain style="margin:5px 20px; padding:5px 10px;" @click="getPersonList()">{{$t('m.moreMembers')}}</el-button>
        </ul>
      </div>     
    </div>

    <div class="arrow" style="">
      <span>
        <i class="el-icon-arrow-right" @click="choosedHandle"  id="group_person_arrow"></i>
      </span>
    </div>

    <div class="choosed">
      <h2>{{$t('m.selectedItem')}}：</h2>
      <p v-if="shareObjs.all.length">{{$t('m.allMembers')}} <i class="el-icon-delete" @click="deleteHandle('all')"  id="group_person_delete" ></i></p>
      <div v-else class="choosed-group-person">
        <div>
          <p>{{$t('m.authority.userGroup')}}: </p>
          <ul>
            <li v-for="(group,index) in shareObjs.group" :key="group">{{group}} <i class="el-icon-delete" @click="deleteHandle('group',index)"></i></li>
          </ul>
        </div>
        <div>
          <p>{{$t('m.members')}}:</p>
          <ul>
            <li v-for="(person,index) in shareObjs.person" :key="person">{{person}} <i class="el-icon-delete" @click="deleteHandle('person',index)"></i></li>
          </ul>
        </div>
        
      </div>
      
    </div>
  </section>

  <div style="text-align:right;margin-top:10px;">
    <el-button @click="cancelHandle" id="group_person_cancel" size="medium">{{$t('m.cancel')}}</el-button>
    <el-button type="primary" @click="confirmHandle" id="group_person_confirm" size="medium" :disabled="!(shareObjs.group.length || shareObjs.person.length || shareObjs.all.length)">{{$t('m.confirm')}}</el-button>
    &nbsp; &nbsp; &nbsp; 
    
  </div>

</div>

</template>

<script>
import Lib from "../../assets/js/Lib";
export default {
  props:{
    shareObjs: {
      type: Object,
      default: {
        group: [],
        person: [],
        all: [],
      }
    },
  },
  data() {
    return {
      // checked 的三种情况　 0: 未被选中，1:选中， 2: 子有被选中的
      allChecked: false,
      groupList: [],
      queryPerson: { // 搜索状态
        isVisible: false,
        personName: '',
        currentPage: 0,
        list: [],
        loading: false,
        total: false, 
      },
      
      loading: false,
    };
  },
  created(){
    this.getGroupList();
  },
  
  methods: { 
    // 确认
    confirmHandle(){
      this.$emit('groupPersonCom', JSON.stringify(this.shareObjs));　// 向父级传递选好的数据
      this.allcheckedFalse(); // 清空选中项
    },

    // 删除从已选中的
    deleteHandle(grouporperson,index){
      if(grouporperson === 'group'){
        this.shareObjs.group.splice(index,1);
      }else if(grouporperson === 'person'){
        this.shareObjs.person.splice(index,1);
      }else if(grouporperson === 'all'){
        this.shareObjs.all = [];
      }
    },

    // 全部取消
    allcheckedFalse(){
      console.log('全部取消');
      this.allChecked = false;
      this.groupList.forEach ( ele => {
        ele.isChecked = 0;
        if(ele.children.length){
          ele.children.forEach( person => {
            person.isChecked = false;
          })
        }        
      })
    },

    // 全选/全部取消
    allCheckedHandle(){
      console.log('9999')
      // 循环所有组/用户      
      if(this.allChecked){ // 全选
        this.groupList.forEach ( ele => {
          ele.isChecked = 1;
          if(ele.children.length){
            ele.children.forEach( person => {
              person.isChecked = true;
            })
          }        
        })
      }else{ // 全部取消
        this.allcheckedFalse();
      }
    },

    // 回退
    goBack(){
      this.queryPerson.isVisible = false;
      // 恢复到原始状态
      this.queryPerson = {
        isVisible: false,
        personName: '',
        currentPage: 0,
        list: [],
        loading: false,
        total:0, 
      };

      // 取消组中所有的选中状态
      // this.allcheckedFalse();
    },

    // 组的是否选中
    groupHandle(index){
      if(this.groupList[index].isChecked === 0 || this.groupList[index].isChecked === 2){ //　未选中 or 内部有选中 ->　选中
        this.groupList[index].isChecked = 1;
        if(this.groupList[index].children.length){
          this.groupList[index].children.forEach( ele => {
            ele.isChecked = true;
          })
        }
      }else if(this.groupList[index].isChecked === 1){　// 选中　未选中
        this.groupList[index].isChecked = 0;
        if(this.groupList[index].children.length){
          this.groupList[index].children.forEach( ele => {
            ele.isChecked = false;
          })
        }
      };
      this.allChecked = this.groupList.every( ele => {
        return ele.isChecked === 1;
      })
    },

    // 改变　person　的 isChecked 的值　
    personHandle(index,i){
      // 循环
      let ChildrenChecked = this.groupList[index].children.filter( ele => {
        return ele.isChecked;
      });
      // 0:未选中状态；　 1:选中状态；　 2:内部有选中状态的用户 
      if(ChildrenChecked.length === 0){ // 全部取消
        this.groupList[index].isChecked = 0;
      }else if(ChildrenChecked.length === this.groupList[index].total){　// 全部选中
        this.groupList[index].isChecked = 1;
      }else{　// 部分选中
        this.groupList[index].isChecked = 2;
      }
    },

    // 选择, 向右添加
    choosedHandle(){
      // 判断是否处于　“全局搜索用户”　中
      if(this.queryPerson.isVisible){ // 全局搜索状态
        let personCheckedList = this.queryPerson.list.filter( ele => {
          return ele.isChecked;
        });
        personCheckedList.forEach( ele => {
          this.shareObjs.person.push(ele.username);　// 添加
          this.shareObjs.person = [...new Set(this.shareObjs.person)]// 数组去重
          // this.shareObjs.group = [];
          // this.shareObjs.all = '';
        });
      }else{　// 组　＋　用户
      // console.log('000');
        if(this.allChecked){ // 选中所有人
          this.shareObjs.all = ['all'];
          this.shareObjs.group = [];
          this.shareObjs.person = [];
        } else {
          // console.log('111');
          // 双循环
          // 循环所有选中的组
          this.groupList.forEach ( ele => {
            if(ele.isChecked === 1){ // １　-> 组选中
              this.shareObjs.group.push(ele.groupname); // 添加
              this.shareObjs.group = [...new Set(this.shareObjs.group)]; // 去重
            }else if(ele.isChecked === 2){ // ２　-> 组内有选中的成员
              // 继续循环
              ele.children.forEach( person => {
                if(person.isChecked){
                  this.shareObjs.person.push(person.username); // add
                  this.shareObjs.person = [...new Set(this.shareObjs.person)]; // remove duplicates
                }
              })
            }
            this.shareObjs.all = [];
          })
        }
      }
    },  

    // 取消
    cancelHandle(){
      this.$emit('groupPersonCom', '');
      this.allcheckedFalse();
    },


    // 展开收起
    foldHandle(index){      
      if(!this.groupList[index].isFolded){
        //　所有的都收起
        this.groupList.forEach(element => {
          element.isFolded = false;
        });
      }
      this.groupList[index].isFolded = !this.groupList[index].isFolded 
    },

    

    // 获取组列表
    getGroupList(){
      this.loading = true;
      this.$axios
        .get(Lib.API().auth.getGroupList) 
        .then(res => {
          let data = res.data;
          if (data.success) {
            // 筛选组，只能查看到　组里的角色包含　存储模块的角色是普通用户的
            let temList = []
            data.results.forEach(ele => {
              ele.roles.forEach( role => {
                if(role.roleName === 'storage_viewer'){
                  temList.push(ele);
                }
              })
            })
            // console.log(temList)
            temList.forEach(ele => {
              ele.children = []; // 
              ele.isChecked = 0;
              ele.isFolded = false;
              ele.loading = false;
              ele.total = 'dontKnownyet';
              ele.currentPage = 0;

            })
            // console.log(temList)
            this.groupList = temList; 
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loading = false;
      })
    },

    // 获取用户列表
    getPersonList(index){
      // 更新查询的页码
      let page,groupId;
      if(index === 'searchDifferent'){　// 全局查询用户第　１　次加载
        page = this.queryPerson.currentPage = 1;
        groupId = '';
        this.queryPerson.loading = true;
      }else if(index === undefined){ // 全局查询用户 中的　加载更多
        this.queryPerson.currentPage ++;
        page = this.queryPerson.currentPage;
        groupId = '';
        this.queryPerson.loading = true;
      }else if(Number.isInteger(index)){ // 组里面的用户
        this.groupList[index].currentPage ++;
        page = this.groupList[index].currentPage;
        groupId = this.groupList[index].id;
        this.groupList[index].loading = true;
      }
      

      this.$axios
        // .get(`http://rap2api.taobao.org/app/mock/2311//api/user/users?page=${this.page.currentPage}&q=${this.query}&groupId=${this.groupId}`)
        .get(Lib.API().auth.getUserList + `?page=${page}&q=${this.queryPerson.personName}&groupId=${groupId}`) 
        .then(res => {
          const data = res.data;
          if (data.success) {  
             
            let temList = [];
            console.log('length00 = ' + data.results.length);
            data.results.forEach(ele => {
              ele.isChecked = this.queryPerson.isVisible ? false : (this.groupList[index].isChecked===1); // 是否处于选中状态
              this.groupList.forEach(group => {
                if(ele.groupname === group.groupname){
                  temList.push(ele);
                }
              })              
            });
            console.log('length11 = ' + temList.length);
            // 筛选角色包含数据存储普通用户的：　如果用户所在的组名不在　this.groupList 里（已筛选过），则剔除掉，

            if(index === undefined){  // // 全局查询用户 
              this.queryPerson.list = [...this.queryPerson.list,...temList];
              // this.queryPerson.total = data.total; // 经过筛选，此值已不准
              this.queryPerson.total = (data.total === 10) ? true : false; 
            }else if(index === 'searchDifferent'){ // 全局查询用户第　１　次加载
              this.queryPerson.list = temList;
              this.queryPerson.total = (data.total === 10) ? true : false;
            }else if(Number.isInteger(index)){ // // 组里面的用户
              this.groupList[index].children = [...this.groupList[index].children, ...temList];
              this.groupList[index].total = data.total;
            }
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          if(index === undefined || index === 'searchDifferent'){
            this.queryPerson.loading = false;
          }else{
            this.groupList[index].loading = false;
          }
         
      })
    },

  }
}
</script>

<style lang="less" scoped>
.com-wrap {
  display: flex;
  > div:first-child, >div:last-child {
    border: 1px solid #aaa;
    padding:20px;
    flex-basis: 50%;
    // max-height: 400px;
    // overflow-y: auto;
    
  }
  > div:first-child {
    
  }
  > div.arrow {
    min-width: 60px;
    span {
      display: inline-block;  height: 100%; position: relative; width: 60px;
      i {
        top: 40%; position: absolute; border: 1px solid #32b1bf; border-radius: 50%; width: 40px; height: 40px;text-align: center;left: 10px;line-height: 34px;line-height: 36px;color: #32b1bf;
      }
      i:hover {
        background-color: #32b1bf;
        color: #fff;
      }
    }
  }
}
  .group-person {
  label.el-checkbox {
    padding:3px 5px 3px 0;
  }
  ul {
    margin-left: 25px;
    > li {
      padding: 5px 0;
      ul {
        margin-left: 35px;
        border: 1px solid #f1f1f1;
        padding-left: 5px;
        padding-bottom:5px;
        max-height: 200px;
        overflow-y: auto;
        > li {
          padding:0;
        }
      }
    }
  }
  .operationTransition-enter-active {
    transition: all 0.6s;
  }
  .operationTransition-leave-active {
    transition: all 0s;
  }
  // 进场，　出场状态
  .operationTransition-enter,
  .operationTransition-leave-to {
    height: 0;
  }
  
}
.choosed {
  i {
    margin-left:10px;
    &:hover {
      color: #32b1bf;
      cursor: pointer;
    }
  }
  p {
    padding-right: 15px;
    font-weight: bold;
    margin: 0;
    text-align: right;
    width: 200px;
  }
  .choosed-group-person {
    >div {
      display: flex;
      margin-bottom: 10px;
      
      li {
        line-height: 25px;
      }
    }
  }

}
.group-name {
  &:hover {
    // color:#32b1bf;
    cursor: pointer;
  }
}
</style>


