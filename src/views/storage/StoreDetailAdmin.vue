<template>
    <main  v-loading="loading" :element-loading-text="$t('m.loading')">

      <!-- dialog 扩容卷 -->
      <el-dialog :title="$t('m.store.expandVolume')" :visible.sync="dialogNewVolumeVisible" @close="expand={};">
        <el-form :model="newVolumeForm" :rules="rules" ref="newVolumeForm" label-width="120px" v-loading="loadingBricks" :element-loading-text="$t('m.loading')">
          <el-form-item :label="$t('m.store.volumeName')" prop="volumeName">
            {{item.volumeName}}
          </el-form-item>
          <el-form-item :label="$t('m.store.volumeType')"  prop="volumeType">
            {{item.volumeType}}
          </el-form-item>
          <el-form-item :label="$t('m.store.brick')"  prop="bricksExpand">
             <el-checkbox-group v-model="newVolumeForm.bricksExpand">
              <span class="brick-checkout" v-if="bricks&&bricks.length">
                <el-checkbox v-for="(item,index) in bricks" :key="index" :label="item"></el-checkbox><br/>                
              </span>
              <i style="font-size:14px; font-style:normal" v-else>{{$t('m.noData')}}</i>
             </el-checkbox-group>
          </el-form-item>
          <el-form-item  v-if="item.volumeType!=='Distribute'" :label="$t('m.store.replicaOrStripeCount')" >
            <span>{{item.numberOfBricks}}</span>
          </el-form-item>         
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="resetForm('newVolumeForm')" id="store_admin_info_form_btn_cancel">{{$t('m.cancel')}}</el-button>
          <el-button :disabled="!Boolean(newVolumeForm.bricksExpand.length)" type="primary" @click="submitFormExpand" id="store_admin_info_form_btn_confirm" >{{$t('m.confirm')}}</el-button>
        </div>
      </el-dialog>

      <section class="search-info"  v-loading="loadingExpand" :element-loading-text="$t('m.loading')">
        <div style="display:flex; justify-content:space-between;">
          <p>
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-cunchu"></use>
            </svg>
            {{$t('m.store.dataVolume')}} {{adminVolumeInfo.volumeName}}
          </p>
          <div  class="operation" >
            <el-button type="text" @click="getBricks()" id="storedetailadmin_btn"><i class="el-icon-plus" ></i> {{$t('m.store.expandVolume')}}</el-button>
          </div>
          
        </div> 
        <p style="line-height:2em;padding-top:0;margin-top:0">
          {{$t('m.store.volumeType')}}: {{item.volumeType}} &nbsp;  &nbsp;  &nbsp;  &nbsp;
          {{$t('m.store.brickCount')}}: {{item.brickCount}} &nbsp;  &nbsp;  &nbsp;  &nbsp;
          {{$t('m.store.volumeStatus')}}: {{item.status}} <br />
          {{$t('m.store.brick')}}: <span v-for="(brick,index) in item.bricks" :key="index">{{brick}} &nbsp;  &nbsp;  &nbsp;  &nbsp; </span>
        </p>       
      
        <div style="width:50%; position:relative;">
          <el-progress :show-text="false" :stroke-width="18" :percentage="Number(adminVolumeInfo.percentage)" ></el-progress>
          <span style="position:absolute;right:0;top:0;">
            {{adminVolumeInfo.percentage}}%
          </span>
        </div>
        <p>{{adminVolumeInfo.unallocatedSpace}} {{$t('m.store.available')}}，{{$t('m.store.total').toLowerCase()}}{{adminVolumeInfo.totalSpace}}</p>        
      </section>
      
      <section class="show-info admin">
        <div>
          <p>{{$t('m.store.userUsage')}}</p>
        </div>
        <table>
           <thead>
             <tr>
               <th>{{$t('m.username')}}</th>
               <th>{{$t('m.store.used')}}</th>
               <th v-if="adminVolumeInfo.type.toLowerCase()!='nfs'">{{$t('m.store.total')}}</th>
               <th v-if="adminVolumeInfo.type.toLowerCase()!='nfs'">{{$t('m.store.usageRate')}}</th>
             </tr>
           </thead>
           <tbody v-if="adminPrivateVolInfos.length>0">
             <tr v-for="item in adminPrivateVolInfos" :key="item.username" >
               <td>{{item.userName}}</td>
               <td>{{item.usedSize}}</td>
               <td v-if="adminVolumeInfo.type.toLowerCase()!='nfs'">{{item.quota}}</td>
               <td v-if="adminVolumeInfo.type.toLowerCase()!='nfs'">{{item.percentage}}</td>               
             </tr>           
           </tbody>
         </table>        
         <div class="page-block">  
            <span id="storelist_admin_page_total">{{$t('m.total')}} {{page.total}} {{$t('m.tiao')}}</span>      
            <el-pagination id="storelist_admin_page"
              @current-change="adminGetData"
              :current-page.sync="page.currentPage"
              :page-size="page.pageSize"
              layout="prev, pager, next"
              :total="page.total">
            </el-pagination>
        </div>      
        
      </section>


    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
    // 扩容卷
    var validateBricksExpand = (rule, value, callback) => {
      if(value.length == 0){
        callback(new Error(this.$t('m.pleaseChoose') + ' ' + this.$t('m.store.brick').toLowerCase()))
      }else if(this.item.volumeType === 'Replica'){
        if(value.length < 2){
          callback( new Error(
              this.$t("m.store.rules01")
            ) );
        }else if(this.newVolumeForm.bricksExpand.length%this.item.numberOfBricks !== 0){
          callback(new Error(this.$t("m.store.rules03")));
        }else{
          callback();
        }
      }else if(this.item.volumeType === 'Stripe'){
        if(this.newVolumeForm.bricksExpand.length%this.item.numberOfBricks != 0){
          callback(new Error(this.$t("m.store.rules03")));
        } else {
          callback();
        }
      }     

    };
    return {  

      adminPrivateVolInfos:[], //　管理员查看用户私有卷信息
      volumeName:'',
      item: {},
      bricks: [],
      adminVolumeInfo:{
        type:'',
        percentage:0,
      }, // 管理员查看大的数据卷数据  
      page: {
        currentPage: 1, // 当前页码
        total: 0, // 一共多少条数据
        pageSize: 10 // 一页显示多少条
      },
      dialogNewVolumeVisible: false,
      loadingBricks: false,
      loading: false,
      loadingExpand: false,
      newVolumeForm: {
        bricksExpand: [],
      },
      rules: {
        bricksExpand: [
          {type: 'array', required: true, validator: validateBricksExpand , trigger: 'change' }
        ],
      },
    };
  },
  created() {
    this.volumeName = this.$route.params.volumeName;
    let item = {};
    item.volumeName = this.$route.query.volumeName;
    item.volumeType = this.$route.query.volumeType;
    item.brickCount = this.$route.query.brickCount;
    item.status = this.$route.query.status;
    item.bricks = JSON.parse(this.$route.query.bricks);
    
    if(item.volumeType!=='Distribute'){ // 获取到 复制/条带数量
      item.numberOfBricks = Number(item.brickCount.split('=')[0].split('x')[1])
    }
    this.item = item;
    this.adminGetData(); 
  },
  methods: {

    

    // 获取详情
    adminGetData(){ 
      this.loading = true;
      this.$axios
        .get(Lib.API(this.volumeName).storage.adminGetVolumesInfo+`?pageNum=${this.page.currentPage}&pageSize=${this.page.pageSize}`) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            
            data.volumeInfo.percentage = parseFloat(data.volumeInfo.percentage).toFixed(2)
            this.adminVolumeInfo = data.volumeInfo; // 该卷相关的信息

            this.adminPrivateVolInfos = data.privateVolInfos;  // 该卷下的所有用户（私有卷）信息
            this.page.total = data.total;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loading = false;
      })
    },

    // 获取 块 列表
    getBricks(){

      this.dialogNewVolumeVisible = true
      this.loadingBricks = true;
      this.$axios        
        .get(Lib.API().storage.adminGetBricks) // `/api/storage/bricks`
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.bricks = data.bricks;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loadingBricks = false;
      })
    },

    // 扩容卷
    submitFormExpand(){
      
      let errorList = document.querySelectorAll('.el-form-item__error');
      if(errorList.length){
        return false;
      }
      this.dialogNewVolumeVisible = false; // 
      this.loadingExpand = true; // 
      this.$axios        
        .put(Lib.API(this.volumeName).storage.adminExpand, 
          {
            brickNames: this.newVolumeForm.bricksExpand
          }) // `/api/storage/bricks`
        .then(res => {
          let data = res.data;
          if (data.success) {
            this.newVolumeForm.bricksExpand.forEach( ele => {
              this.item.bricks.push(ele);
            })
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          // 清空
          this.loadingExpand = false;
          this.resetForm('newVolumeForm'); // 
      })
    },

     // 取消
    resetForm(formName) {
      this.dialogNewVolumeVisible = false
      this.$refs[formName].resetFields();
      this.newVolumeForm.volumeType = 'replica';
    },
  }
};
</script>

<style  lang="less" scoped>

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

</style>
