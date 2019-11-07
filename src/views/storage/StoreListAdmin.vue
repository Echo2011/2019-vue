<template>
    <!-- 管理员登录 -->
    <main  v-loading="loading" :element-loading-text="$t('m.loading')"> 

      <!-- dialog 创建卷 -->
      <el-dialog :title="dialogName" :visible.sync="dialogNewVolumeVisible" @close="expand={};resetForm('newVolumeForm')">
        <el-form :model="newVolumeForm" :rules="rules" ref="newVolumeForm" label-width="120px" v-loading="loadingBricks" :element-loading-text="$t('m.loading')">
          <el-form-item :label="$t('m.store.volumeName')" prop="volumeName">
            <el-input v-if="!Object.keys(expand).length" v-model.trim="newVolumeForm.volumeName" auto-complete="off" id="store_admin_form_volumeName"></el-input>
            <span v-else>{{expand.volumeName}}</span>
          </el-form-item>
          <el-form-item :label="$t('m.store.volumeType')"  prop="volumeType">
            <el-select  v-if="!Object.keys(expand).length" v-model="newVolumeForm.volumeType" :placeholder="$t('m.pleaseChoose')" id="store_select_volumetype">
              <el-option label="replica" value="replica" id="store_admin_form_replica"></el-option>
              <el-option label="stripe" value="stripe" id="store_admin_form_stripe"></el-option>
              <el-option label="distribute" value="distribute" id="store_admin_form_distribute"></el-option>
            </el-select>
            <span v-else>{{expand.volumeType}}</span>
          </el-form-item>

          <!-- create -->
          <el-form-item v-if="!Object.keys(expand).length" :label="$t('m.store.brick')"  prop="bricks">
             <el-checkbox-group v-model="newVolumeForm.bricks">
              <span class="brick-checkout" v-if="bricks&&bricks.length">
                <el-checkbox v-for="(item,index) in bricks" :key="index" :label="item"></el-checkbox><br/>                
              </span>
              <i style="font-size:14px; font-style:normal" v-else>{{$t('m.noData')}}</i>
             </el-checkbox-group>
          </el-form-item>

          <!-- expand -->
          <el-form-item v-else :label="$t('m.store.brick')"  prop="bricksExpand">
             <el-checkbox-group v-model="newVolumeForm.bricksExpand">
              <span class="brick-checkout" v-if="bricks&&bricks.length">
                <el-checkbox v-for="(item,index) in bricks" :key="index" :label="item"></el-checkbox><br/>                
              </span>
              <i style="font-size:14px; font-style:normal" v-else>{{$t('m.noData')}}</i>
             </el-checkbox-group>
          </el-form-item>

          <el-form-item  v-if="newVolumeForm.volumeType!='distribute'&&!Object.keys(expand).length" :label="$t('m.store.replicaOrStripeCount')" prop="replicaOrStripeCount">
            <el-input v-model.trim="newVolumeForm.replicaOrStripeCount" auto-complete="off"  id="store_admin_form_replicaOrStripeCount"></el-input>
          </el-form-item> 
          <el-form-item  v-if="expand.volumeType!=='Distribute'&&Object.keys(expand).length" :label="$t('m.store.replicaOrStripeCount')" >
            <span>{{expand.numberOfBricks}}</span>
          </el-form-item>         
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="resetForm('newVolumeForm');expand={}" id="store_admin_form_btn_cancel">{{$t('m.cancel')}}</el-button>
          <!-- create -->
          <el-button v-if="!Object.keys(expand).length" :disabled="!this.newVolumeForm.bricks.length"  type="primary" @click="expand={};submitForm('newVolumeForm')" id="store_admin_form_btn_confirm">{{$t('m.confirm')}}</el-button>
          <!-- expand -->
          <el-button v-else type="primary" :disabled="!this.newVolumeForm.bricksExpand.length" @click="submitFormExpand" id="store_admin_form_btn_expand" >{{$t('m.confirm')}}</el-button>
        </div>
      </el-dialog>

      <div class="viewer-btn-wrap" v-if="adminVolumeName!=='nfs'">  
        <el-button size="medium" type="primary" plain icon="el-icon-plus" id="new_volume"  @click="dialogName=$t('m.store.newVolume');getBricks('')">{{$t('m.store.newVolume')}}</el-button>
      </div>

      <section class="show-info volumes">        
        <table>
           <thead>
             <tr style="height:40px;line-height:40px;">
               <th>{{$t('m.store.volumeName')}}</th>
               <th>{{$t('m.store.brickCount')}}</th>
               <th>{{$t('m.store.brick')}}</th>
               <th>{{$t('m.store.volumeType')}}</th>  
               <th>{{$t('m.store.volumeStatus')}}</th>             
               <th>{{$t('m.operating')}}</th>             
             </tr>
           </thead>
           <tbody v-if="list.length">
             <tr v-for="(item,index) in list" :key="item.volumeName" >
               <!-- <td><router-link :to="'/storage/listAdmin/'+item.volumeName+'?item='+JSON.stringify(item)">{{item.volumeName}}</router-link></td> -->
               <td @click="toDetailHandle(item)">{{item.volumeName}}</td>
               <td>{{item.brickCount}}</td>
               <td>
                 <span v-for="(brick,index) in item.bricks" :key="index">{{brick}}<br/></span>
               </td>
               <td>{{item.volumeType}}</td>               
               <td>{{item.status}}</td>
               <td class="operation" v-loading="item.loading" :element-loading-text="$t('m.loading')">
                 <el-button type="text" icon="el-icon-plus"  @click="dialogName=$t('m.store.expandVolume');getBricks(item,index)"> {{$t('m.store.expandVolume')}}</el-button>
               </td>
             </tr>           
           </tbody>
           <tbody v-else>
             <tr><td colspan="5" style="text-align: center;">{{$t('m.noData')}}</td></tr>
           </tbody>
         </table>        
         <div class="page-block">  
            <span id="storelist_admin_volumes_total">{{$t('m.total')}} {{list.length}} {{$t('m.tiao')}}</span>   
        </div>      
        
      </section>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
    // 卷名称 ， 只能由字母或数字组成
    var validateVolumeName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.store.volumeName").toLowerCase()
          )
        );
      } else if (
        !/^[a-zA-Z0-9]{1,10}$/.test(value.trim())
      ) {
        callback(new Error(this.$t("m.store.volumeName") + this.$t("m.rules.alphanumeric")));
      } else {
        callback();
      }
    };

    // 块， 至少选 1 个, type = replica 时， 必须选2个
    var validateBricks = (rule, value, callback) => {
      if(this.newVolumeForm.volumeType == 'replica'){
        if(value.length < 2){
          callback( new Error(
              this.$t("m.store.rules01")
            ) );
        }else{
          callback();
        }
      }else{
        if(value.length == 0){
          callback(new Error(this.$t('m.pleaseChoose') + ' ' + this.$t('m.store.brick').toLowerCase()))
        }else{
          callback();
        }
      }
    };

    // 扩容卷
    var validateBricksExpand = (rule, value, callback) => {
      if(value.length == 0){
        callback(new Error(this.$t('m.pleaseChoose') + ' ' + this.$t('m.store.brick').toLowerCase()))
      }else if(this.expand.volumeType === 'Replica'){
        if(value.length < 2){
          callback( new Error(
              this.$t("m.store.rules01")
            ) );
        }else if(this.newVolumeForm.bricksExpand.length%this.expand.numberOfBricks !== 0){
          callback(new Error(this.$t("m.store.rules03")));
        }else{
          callback();
        }
      }else if(this.expand.volumeType === 'Stripe'){
        if(this.newVolumeForm.bricksExpand.length%this.expand.numberOfBricks != 0){
          callback(new Error(this.$t("m.store.rules03")));
        } else {
          callback();
        }
      }
      

    };

    // 数量
    var validateCount = (rule, value, callback) => {      
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.store.replicaOrStripeCount").toLowerCase()
          )
        );
      } else if (
        !/^[1-9][0-9]*$/.test(value.trim())
      ) {
        callback(new Error(this.$t("m.store.replicaOrStripeCount") + this.$t("m.rules.positiveIntegerNoAnd")));
      } else if(this.newVolumeForm.bricks.length%value.trim() != 0){
        callback(new Error(this.$t("m.store.rules02")));
      } else {
        callback();
      }
    };
    
    return {      
      list: [],
      dialogNewVolumeVisible: false,
      bricks: [],
      newVolumeForm: {
        volumeName: '',
        volumeType: 'replica',
        replicaOrStripeCount:'',
        bricks:[],
        bricksExpand: [],
      },
      rules: {
        volumeName: [
          { required: true, validator: validateVolumeName, trigger: "blur" }
        ],
        volumeType: [
          { required: true, message: '请选择', trigger: 'change' }
        ],        
        bricks: [
          {type: 'array', required: true, validator: validateBricks , trigger: 'change' }
        ],
        bricksExpand: [
          {type: 'array', required: true, validator: validateBricksExpand , trigger: 'change' }
        ],
        replicaOrStripeCount: [
          { required: true, validator: validateCount, trigger: 'blur' }
        ],
      },
      loading: false, // 
      loadingBricks: false, // 
      adminVolumeName: '',
      expand:{},
      currentIndex: null,
      dialogName:'', // 卷名字 -》 创建卷 or 扩容卷
    };
  },
  created() {
    // 如果管理员的　volumeName 为　nfs （单机版的话，volumeName 只有　nfs, 也是不能创建的），则不能创建卷
    this.adminVolumeName =  localStorage.getItem('volumeName');
    this.getVolumes();  
  },
  methods: {

    // 跳转到详情页
    toDetailHandle(item){
      // this.$router.push({path:`/storage/listAdmin/${item.volumeName}`,query: item});
      this.$router.push({path:`/storage/listAdmin/${item.volumeName}`,query: {volumeName:item.volumeName,volumeType:item.volumeType,brickCount:item.brickCount,status:item.status,bricks:JSON.stringify(item.bricks)}});
    },

    // 创建卷
    submitForm(formName) { 
      
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.dialogNewVolumeVisible = false; // 
          this.loading = true; // disable user 
          this.$axios
            .post(
              Lib.API().storage.adminCreateVolume, // `/api/storage/volumes`
              {
                volumeName: this.newVolumeForm.volumeName,
                volumeType: this.newVolumeForm.volumeType,
                count: this.newVolumeForm.replicaOrStripeCount,
                dataDisk: this.newVolumeForm.bricks
              }
            )
            .then(res => {
              const data = res.data;
              if (data.success) {
                
                setTimeout(() => {
                  this.$message({
                    showClose: true,
                    message: this.$t("m.store.newVolume") + this.$t("m.successAdv"),
                    type: "success",
                    duration: Lib.Common.messageDuration
                  });
                },3000)
                
                this.resetForm('newVolumeForm'); // 清空

                // 重新获取卷列表
                setTimeout(this.getVolumes, 2000); // 延迟执行获取列表
              } else {
                this.loading = false; //
                var messageCode = data.message || "default";
                var messageText = this.$t("m.responseErrorMessage." + messageCode);
                Lib.Common.errorMessage(messageText, data.messageParams);
              }
            })
        } else {
          return false;
        }
      });
    },

    // 取消
    resetForm(formName) {
      this.dialogNewVolumeVisible = false
      this.$refs[formName].resetFields();
      this.newVolumeForm.volumeType = 'replica';
    },

    // 获取 卷列表
    getVolumes(){
      this.loading = true;
      this.$axios
        .get(Lib.API().storage.adminGetVolumes) // `/api/storage/volumes`
        .then(res => {
          let data = res.data;
          if (data.success) {
            data.volumeInfos.forEach(ele => {
              ele.loading = false;
              if(ele.volumeType!=='Distribute'){ // 获取到 复制/条带数量
                ele.numberOfBricks = Number(ele.brickCount.split('=')[0].split('x')[1])
              }
            })
            this.list = data.volumeInfos;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loading = false;
      })
    },
    
    // 获取 块 列表
    getBricks(expand,index){
      if(expand){
        this.expand = expand;
        this.currentIndex = index;
      }else{
        this.expand = {};
        this.currentIndex = null;
      }

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
      this.list[this.currentIndex].loading = true; // 
      // if(this.newVolumeForm.bricksExpand.length)
      this.$axios        
        .put(Lib.API(this.expand.volumeName).storage.adminExpand, 
          {
            brickNames: this.newVolumeForm.bricksExpand
          }) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.getVolumes(); // 重新调取卷列表
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          // 清空
          this.list[this.currentIndex].loading = false;
          this.currentIndex = null;
          this.resetForm('newVolumeForm'); // 
      })
    }

  }
};
</script>

<style  lang="less" scoped>
span.brick-checkout {
  label.el-checkbox{
    margin-right: 20px;
    margin-left:0;
  }
}
main section.volumes {
  padding-top: 0;  
}

table tbody td:first-child {
  color: #1a99a5;
  &:hover {
    cursor: pointer;
  }
}

</style>
