<template>
    <main>
      <section  v-loading="loading" :element-loading-text="$t('m.loading')">
        
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="280px" size="small" style="width:70%;margin-left:10%;padding-top:50px;">

          <el-form-item :label="$t('m.systemQuota')" style="color:#1a99a5">
            GPU: <strong>{{systemQuotas.gpu}}</strong> Core &nbsp; &nbsp; 
            CPU: <strong>{{systemQuotas.cpu}}</strong> Core &nbsp; &nbsp; 
            {{$t('m.memory')}}: <strong>{{systemQuotas.memory}} GB</strong>  &nbsp; &nbsp;            
          </el-form-item>
          <el-form-item :label="$t('m.zone.name')" prop="zoneName"  id="zoneadd_label_zonename">
            <span v-if="operation=='edit'">{{ruleForm.zoneName}}</span>
            <span v-else>
              <el-input id="zoneadd_zonename" v-model.trim="ruleForm.zoneName"></el-input>
            </span>            
          </el-form-item>

          <el-form-item :label="$t('m.authority.gpuQuota')+' (Core)'" prop="gpu">
            <el-input-number v-model.number="ruleForm.GPU" :precision="0" :step="1"  :min="0" :max="systemQuotas.gpu" id="zoneadd_GPU" @blur="ruleForm.GPU=ruleForm.GPU?ruleForm.GPU:0;"></el-input-number>
          </el-form-item>

          <el-form-item :label="$t('m.authority.cpuQuota')+' (Core)'" prop="cpu">
            <el-input-number v-model.number="ruleForm.CPU" :precision="0" :step="1" :min="1" :max="systemQuotas.cpu" id="zoneadd_CPU"  @blur="ruleForm.CPU=ruleForm.CPU?ruleForm.CPU:1"></el-input-number>
          </el-form-item> 

          <el-form-item :label="$t('m.authority.memoryQuota')+' (GB)'" prop="memory">
            <el-input-number v-model.number="ruleForm.memory" :precision="0" :step="1" :min="1" :max="quotasMaxMemory" id="zoneadd_memory" @blur="ruleForm.memory=ruleForm.memory?ruleForm.memory:1"></el-input-number>
          </el-form-item>

          <el-form-item :label="$t('m.authority.jobQuota')" prop="job">
            <el-input-number v-model.number="ruleForm.jobs" :precision="0" :step="1" :min="1"  id="zoneadd_label_jobs" @blur="ruleForm.jobs=ruleForm.jobs?ruleForm.jobs:1"></el-input-number>
          </el-form-item>

          <el-form-item :label="$t('m.zone.jobType')" prop="job" id="zoneadd_label_jobType">
            {{ruleForm.jobType}}
          </el-form-item>
         
          <el-form-item style="margin-top:40px;">
            <el-button href="javascript:;"  size="medium" 　class="primary" type="primary" @click="submitZone('ruleForm')" id="zoneadd_button_submit">{{$t('m.'+operation)}}</el-button>
            &nbsp; &nbsp; 
            <router-link to="/cluster/zonelist">
              <el-button  size="medium"  id="zoneadd_button_cancel">{{$t('m.cancel')}}</el-button> 
            </router-link>            
          </el-form-item>


        </el-form>  
      </section>
    </main>

</template>

<script>
import Lib from "../../assets/js/Lib.js";

export default {
  data() {
    var validateName = (rule, value, callback) => {
      if (value === "") {
        console.log('ttttt')
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.zone.name").toLowerCase()
          )
        );
      } else if (!/^[a-z0-9]([-a-z0-9]{0,18}[a-z0-9])?$/.test(value)) {
        callback(new Error(this.$t('m.zone.name')+this.$t('m.rules.notEmpty')+', '+this.$t('m.rules.regularCommon')));        
      } else {
        callback();
      }
    };
    return {
      loading:false,
      operation: "", // add or edit 需要知道是 新建 还是 修改
      whichName: "",
      ruleForm: {
        zoneName: "",
        GPU: 0,
        CPU: 1,
        memory: 1,
        memoryUnit: "GB",
        jobs: 20,
        jobType: 'ML',
      },
      rules: { // 各个对应的P标签的内容是否显示
        zoneName: [
          { required: true, validator: validateName,  trigger: 'blur' },
        ],
      },  
      systemQuotas:{
        cpu: 10000,
        gpu: 10000,
        memory: 100000,　// 单位　为　ｇｂ
      },  
      // errorMsg: '',
      
    };
  },

  computed:{
    // 内存最大值
    quotasMaxMemory: {
      get: function () {
        if(this.ruleForm.memoryUnit == 'GB'){
          return this.systemQuotas.memory ;
        }else if(this.ruleForm.memoryUnit == 'MB'){
          return this.systemQuotas.memory*1024;
        }
      },
    },
  },

  created() {
    this.operated();
    this.getSystemQuotes();
  },

  methods: {

    // 获取系统额度
    getSystemQuotes(){
      this.loading = true;
      this.$axios
        .get(Lib.API().zone.systemQuotes)
        // .get(`/api/monitor/cluster/item?keys=clusterInfo`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            // console.log('00000');
            this.systemQuotas.cpu = Number(data.item.cpuproc);
            this.systemQuotas.gpu = Number(data.item.gpuphy);
            this.systemQuotas.memory = parseInt(data.item.memtotal/1024/1024/1024);
            // console.log('1111');
          }else{
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,data.messageParams,'interval');
          }
          this.loading = false;
        }
        )
    },
        // 改变内存配额的单位
    // memoryHandleCommand(command){
    //   this.ruleForm.memoryUnit = command;
    // },

    // 判断是 新增 还是 更新
    operated() {
      if (this.$route.query.operation == "edit") {
        this.operation = "edit"; // 需要知道是 修改 还是 新增 操作， 好在用户反馈里写
        this.whichName = this.$route.query.zoneName;
        this.ruleForm.zoneName = this.$route.query.zoneName;
        this.getEdit(this.whichName);
      } else if (this.$route.query.operation == "create") {
        this.operation = "create";
      }
    },

    // 获取分区详情
    getEdit(whichzoneName) {
      this.$axios.get(Lib.API(this.whichName).zone.getZone)
      .then(res => {
        const data = res.data;

        if (data.success) {
          this.ruleForm.zoneName = data.result.name;            
          this.ruleForm.GPU = data.result.quotas.GPU || 0;
          this.ruleForm.CPU = data.result.quotas.CPU || 0;            

          this.ruleForm.memoryUnit = data.result.quotas.memory
          ? data.result.quotas.memory.substr(-2)
          : "";

          if(this.ruleForm.memoryUnit.toUpperCase()==='GB'){
            this.ruleForm.memory = parseInt(data.result.quotas.memory.slice(0, -2))
          }else if(this.ruleForm.memoryUnit.toUpperCase()==='MB'){
            this.ruleForm.memory = parseInt(data.result.quotas.memory.slice(0, -2)/1024)
          }

          this.ruleForm.jobs = data.result.quotas.jobs

        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText,data.messageParams);
        }
      });
    },

    submitZone(formName) {

      // if(this.errorMsg){　// 超出配额
      //   return false;
      // }

      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 提交
          if (this.operation == "create") {
            // 新建
            var method = "post";
            var url = Lib.API().zone.createZone; //'/api/zone/zones';
          } else if (this.operation == "edit") {
            // 更新
            var method = "put";
            var url = Lib.API(this.whichName).zone.editZone; //`/api/zone/zones/${this.whichName}`
          }
          
          this.$axios({
            method: method,
            url: url,
            data: {
              name: this.ruleForm.zoneName,
              jobType: this.ruleForm.jobType,
              quotas: {
                CPU: this.ruleForm.CPU,
                GPU: this.ruleForm.GPU,
                memory: this.ruleForm.memory + this.ruleForm.memoryUnit,
                jobs: this.ruleForm.jobs
              },
            }
          }).then(res => {
            const data = res.data;
            if (data.success) {
              this.$router.push({path:'/cluster/zonelist'}); 
            } else {
              var messageCode = data.message || "default";
              var messageText = this.$t("m.responseErrorMessage." + messageCode);
              Lib.Common.errorMessage(messageText,data.messageParams); 
            }
          });
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style lang="less"  scoped >
.drop-down:hover {
  cursor: pointer;
}
</style>


