<template>
    <main>
      <section class="form-wrap" v-loading="loading"  :element-loading-text="$t('m.loading')">
        <el-form ref="form" :model="form" :rules="rules" label-width="200px"  size="small">

          <!-- 第一步 -->
          <div class="step one">
            <div class="left">
              <p>
                <span class="num">1</span>  
              </p>
              <span class="line"></span>
            </div>
            <div class="right">
              <p class="title">{{$t('m.job.basicConfig')}}</p>

              <!-- 提交任务 -->
              <div v-if="!isDeployment">
                <el-form-item :label="$t('m.job.jobName')" prop="jobName">
                  <el-input v-model.trim="form.jobName" id="submitjob_jobName" :autofocus="true"></el-input>
                </el-form-item>
                <el-form-item :label="$t('m.job.entryFile')" prop="entryFile">

                  <el-cascader style="width:100%;"  :options="options" v-model="form.entryFile"      
                   @active-item-change="handleItemChange" id="submitjob_entryFile" @change="cascaderHandle">
                  </el-cascader>

                </el-form-item>

                <el-form-item :label="$t('m.job.executor')">
                  <el-select v-model="form.executor" @change="libHandle" id="submitjob_select_executor"> 
                    <el-option label="python3" value="python3" id="submitjob_option_python3"></el-option>
                    <el-option label="python" value="python" id="submitjob_option_python"></el-option>
                    <el-option label="shell" value="shell" id="submitjob_option_shell"></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item :label="$t('m.job.MLlib')">
                  <!-- {{form.lib}} -->
                  <el-radio-group v-model="form.lib" @change="labelChange">
                    <el-radio v-for="item in libList" :label="item" :key="item">{{item}}</el-radio>
                  </el-radio-group>
                </el-form-item>  
                <transition name="operationTransition" >
                <el-form-item  :label="$t('m.job.tfOperatingMode')" v-if="form.lib === 'tensorflow'">
                  <el-radio-group v-model="form.type" id="submit_job_type" @change="tfOperatingModeHandle">
                    <el-radio label="stand-alone" >{{$t('m.job.standalone')}}</el-radio> 
                    <el-radio label="distributed"  v-if="standaloneOrCluster!=='standalone'">{{$t('m.job.distributed')}}</el-radio>
                  </el-radio-group>
                </el-form-item> 
                </transition>  
                <transition name="operationTransition" >
                  <el-form-item  :label="$t('m.logPath')" v-if="form.executor === 'shell'"  prop="logPath">
                    <el-input v-model="form.logPath" id="submitjob_logPath">
                      <template slot="prepend">{{logPathFolder}}</template>
                    </el-input>
                  </el-form-item>
                  <!-- working directory  -->
                  <el-form-item :label="$t('m.job.workSpace')" v-if="form.lib === 'tensorflow'">
                    
                    <el-input v-model="form.wordingDirectory" id="submitjob_working_directory"  @focus="dialogStrorageTreeVisible = true" ></el-input>
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
                  </el-form-item> 
                </transition>  
                <el-form-item  :label="$t('m.hyperparametric')" >
                  <div style="margin-bottom:15px;" v-for="(item,index) in superParamArr" :key="index">
                    <el-input v-model="item.key" style=" width:10%;min-width:100px;"  placeholder="key">
                    </el-input> :
                    <el-input v-model="item.value"  style=" width:20%;min-width:200px" placeholder="value">
                    </el-input> 
                    <i class="el-icon-plus" @click="superParamPlus" v-show="index==0"></i>
                    <i class="el-icon-minus" @click="superParamMinus(index)" v-show="index!==0"></i><br/>
                  </div>                
                </el-form-item> 

                                                       
              </div>

              <!-- 交互式开发 -->
              <div v-if="isDeployment&&!isModel">  
                <el-form-item  :label="$t('m.job.executor')">
                  <el-radio-group v-model="form.executor" id="submit_isDeployment_executor" @change="interactiveExecutorChange">
                    <el-radio label="jupyter" >
                      <svg class="icon" aria-hidden="true" style="width:30px;height:30px;">
                        <use xlink:href="#icon-file_type_jupyter"></use>
                      </svg>
                      Jupyter
                    </el-radio> 
                    <el-radio label="desktop" >
                      <svg class="icon" aria-hidden="true" style="width:25px;height:25px;">
                        <use xlink:href="#icon-desktop"></use>
                      </svg>
                      Desktop
                    </el-radio>
                    <el-radio label="jupyterlab" >
                      <svg class="icon" aria-hidden="true" style="width:30px;height:30px;">
                        <use xlink:href="#icon-file_type_jupyter"></use>
                      </svg>
                      Jupyter<span style="color:#f37726">Lab</span>
                    </el-radio>
                    <el-radio label="terminal" >
                      <svg class="icon" aria-hidden="true" style="width:25px;height:25px;">
                        <use xlink:href="#icon-terminal"></use>
                      </svg>
                      Terminal
                    </el-radio>
                  </el-radio-group>
                </el-form-item> 
                              
                <el-form-item :label="$t('m.job.workSpace')" prop="deploymentEntryFile" :error="validateDeploymentEntryFileError" >
                  
                  <el-input v-model="form.deploymentEntryFile" id="submitjob_isDeployment_jobName"  @focus="dialogStrorageTreeVisible = true" ></el-input>
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
                </el-form-item>
                <el-form-item :label="$t('m.authority.password')" prop="password" :error="validateDeploymentPasswordError" >
                  <input type="text" style="width: 0px;height: 0px;position: absolute;z-index:-1;border: none;">
                  <el-input v-model.trim="form.password" id="submitjob_password" auto-complete="new-password"  show-password style="width:340px;"></el-input>
                </el-form-item>
                <transition  name="operationTransition">
                  <el-form-item :label="$t('m.resolution')" v-show="form.executor=='desktop'">
                    <el-select v-model="form.resolution"  id="submitjob_select_resolution" > 
                      <el-option v-for="item in resolutionList" :label="item" :value="item" :key="item"></el-option>
                    </el-select>                  
                  </el-form-item>
                </transition>
                  
              </div>

              <!-- 模型部署 -->
              <div v-if="isDeployment&&isModel">  
                <el-form-item :label="$t('m.modelName')" prop="modelName">
                  <el-input v-model.trim="form.modelName" id="submit_model_name" :autofocus="true"></el-input>
                </el-form-item>
                <el-form-item  :label="$t('m.modelType')">
                  <el-radio-group v-model="form.executor" id="submit_model_executor">
                    <el-radio label="tensorflowserving" >TENSORFLOW_SERVING
                    </el-radio>
                  </el-radio-group>
                </el-form-item> 
                              
                <el-form-item :label="$t('m.modelPath')" prop="deploymentEntryFile" :error="validateDeploymentEntryFileError" >
                  
                  <el-input v-model="form.deploymentEntryFile" id="submit_model_path"  @focus="dialogStrorageTreeVisible = true" ></el-input>
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
                </el-form-item>
              </div>
            </div>
          </div>

          <!-- 第二步 资源配额　-->
          <div class="step two">
            <div class="left">
              <p>
                <span class="num">2</span>  
              </p>
              <span class="line"></span>
            </div>
            <div class="right">
              <p class="title">{{$t('m.job.quotas')}}</p>
              <div　class="user-resource">
                <div>
                  <span style="display:inline-block; width:188px; text-align:right; padding-right:12px;">{{$t('m.job.boundZone')}}</span>
                  <ul style="">
                    <li>
                      {{this.form.zoneName}} <br />
                      <!-- 请联系管理员，绑定一个分区！ -->
                      <span v-if="!this.form.zoneName" class="red-text" style="font-weight:normal;">{{$t('m.bindZone')}}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <span style="display:inline-block; width:188px; text-align:right; padding-right:12px;">{{$t('m.job.remainResourceOfTheZone')}}</span>
                  <ul style="">
                    <li>GPU: <span>{{zoneItem.gpu}}</span> Core</li>
                    <li>|</li>
                    <li>CPU: <span>{{zoneItem.cpu}}</span> Core</li>
                    <li>|</li>
                    <li>{{$t('m.memory')}}: <span>{{zoneItem.memory}}</span> GB</li>
                    <li>|</li>
                    <li>{{$t('m.zone.jobsNum')}}: <span>{{zoneItem.jobNumber}}</span> </li>
                  </ul>
                </div>
                <!-- <div>
                  <span style="display:inline-block; width:188px; text-align:right; padding-right:12px;">{{$t('m.job.userTotalResource')}}</span>
                  <ul style="">
                    <li>GPU: {{user.quotas.gpu}} Core</li>
                    <li>|</li>
                    <li>CPU:  {{user.quotas.cpu}} Core</li>
                    <li>|</li>
                    <li>{{$t('m.memory')}}:  {{user.quotas.memory}} GB</li>
                    <li>|</li>
                    <li>{{$t('m.zone.jobsNum')}}:  {{user.quotas.jobNumber}} </li>
                  </ul>
                </div> -->
                <div>
                  <span style="display:inline-block; width:188px; text-align:right; padding-right:12px;">{{$t('m.job.userRemainResource')}}</span>
                  <ul style="">
                    <li>GPU: <span>{{user.last.gpu}}</span> Core</li>
                    <li>|</li>
                    <li>CPU: <span>{{user.last.cpu}}</span> Core</li>
                    <li>|</li>
                    <li>{{$t('m.memory')}}: <span>{{user.last.memory}} </span> GB</li>
                    <li>|</li>
                    <li>{{$t('m.zone.jobsNum')}}: <span>{{user.last.jobNumber}} </span></li>
                  </ul>
                </div>              
              </div>
              <!-- 交互式开发　或者　提交任务－单机版 -->
              <div v-if="(form.type!=='distributed' || form.lib!=='tensorflow')||isDeployment">                
                <el-form-item :label="$t('m.memory')" prop="amount" label-width="137px" style="padding-right:5px;" class="form-memory-unit">
                  <div style="display:inline-block;width:58px;position: relative;left: -7px;">
                    <el-dropdown @command="handleCommand" id="submitjob_select_amount">
                      <span class="el-dropdown-link">
                        ({{form.unit}}<i class="el-icon-arrow-down el-icon--right"></i>)
                      </span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="GB" id="submitjob_option_GB">GB</el-dropdown-item>
                        <el-dropdown-item command="MB" id="submitjob_option_MB">MB</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                  <el-input-number v-model.number="form.amount" :precision="0" :step="1" :min="1" :max="standAloneMaxMemory" @blur="form.amount=form.amount?form.amount:1;numberBlurChangeHandle()" @change="numberBlurChangeHandle" id="submitjob_memory_input"  >        
                  </el-input-number>
                </el-form-item>
                <el-form-item label="CPU (Core)" prop="cpu">
                  <el-input-number v-model.number="form.cpu" :precision="0" :step="1"  :min="1" :max="standAloneMaxCPU" @blur="form.cpu=form.cpu?form.cpu:1;numberBlurChangeHandle()" @change="numberBlurChangeHandle"   id="submitjob_cpu">
                  </el-input-number>                
                </el-form-item>
                <el-form-item label="GPU (Core)" prop="gpu">
                  <el-input-number v-model.number="form.gpu" :precision="0" :step="1" :min="0"  :max="standAloneMaxGPU" @blur="form.gpu=form.gpu?form.gpu:0;numberBlurChangeHandle()" @change="numberBlurChangeHandle();labelChange()" id="submitjob_gpu">                    
                  </el-input-number>       
                </el-form-item>
                <el-form-item :label="$t('m.gpuType')" >
                  <el-select v-model="form.gpuType"  id="submitjob_select_gputype" clearable  :placeholder="$t('m.rules.pleaseChoose')"> 
                    <el-option v-for="item in gpuTypeList" :label="item" :value="item" :key="item"></el-option>
                  </el-select>               
                </el-form-item>
              </div>

              <div  v-if="form.type=='distributed' && form.lib=='tensorflow' && !isDeployment" class="parameter-server-wrap">
                
                <!-- worker　的配额 -->
                <div class="parameter-server-item">
                  <el-form-item :label="$t('m.job.numberOfWorker')" prop="workerQuotas.count" 
                  :rules="[{ required: true, message:  $t('m.rules.pleaseEnter') + $t('m.job.numberOfWorker'), trigger: 'change'}]">
                    <el-input-number :precision="0" :step="1"  :min="1" :max="workerServerQuotasMaxCount" v-model.number="form.workerQuotas.count"  @blur="form.workerQuotas.count=form.workerQuotas.count?form.workerQuotas.count:1;numberBlurChangeHandle()"  @change="numberBlurChangeHandle" id="submitjob_worker_number"></el-input-number>                    
                   </el-form-item>
                  
                  <el-form-item :label="$t('m.memory')" prop="workerQuotas.amount" label-width="137px" style="padding-right:5px;" class="form-memory-unit"
                  :rules="[{ required: true, message: $t('m.rules.pleaseEnter') + $t('m.authority.memoryQuota').toLowerCase(), trigger: 'change'}]"
                  >
                    <div style="display:inline-block;width:58px;position: relative;left: -7px;">
                      <el-dropdown @command="workerHandleCommand">
                        <span class="el-dropdown-link">
                          ({{form.workerQuotas.unit}}<i class="el-icon-arrow-down el-icon--right"></i>)
                        </span>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item command="GB" id="submitjob_worker_option_GB">GB</el-dropdown-item>
                          <el-dropdown-item command="MB" id="submitjob_worker_option_MB">MB</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </div>
                    <el-input-number v-model.number="form.workerQuotas.amount" :precision="0" :step="1"  :min="1" :max="workerServerQuotasMaxMemory" @blur="form.workerQuotas.amount=form.workerQuotas.amount?form.workerQuotas.amount:1;numberBlurChangeHandle()" @change="numberBlurChangeHandle"  id="submitjob_worker_memory_input">        
                    </el-input-number>
                  </el-form-item>
                  <el-form-item label="CPU (Core)" prop="workerQuotas.cpu"
                  :rules="[{ required: true, message: $t('m.rules.pleaseEnter') + $t('m.authority.cpuQuota'), trigger: 'change'}]"
                  >
                    <el-input-number v-model.number="form.workerQuotas.cpu" :precision="0" :step="1"  :min="1" :max="workerServerQuotasMaxCPU" @blur="form.workerQuotas.cpu=form.workerQuotas.cpu?form.workerQuotas.cpu:1;numberBlurChangeHandle()" @change="numberBlurChangeHandle" id="submitjob_worker_cpu">
                    </el-input-number>                
                  </el-form-item>
                  <el-form-item label="GPU (Core)" prop="workerQuotas.gpu"
                  :rules="[{ required: true, message: $t('m.rules.pleaseEnter') + $t('m.authority.gpuQuota'), trigger: 'change'}]">
                    <el-input-number v-model.number="form.workerQuotas.gpu" :precision="0" :step="1"  :min="0" :max="workerServerQuotasMaxGPU" @blur="form.workerQuotas.gpu=form.workerQuotas.gpu?form.workerQuotas.gpu:0;numberBlurChangeHandle()" @change="numberBlurChangeHandle();libHandle()" id="submitjob_worker_gpu">
                    </el-input-number>                
                  </el-form-item>
                </div>

                <!-- 参数服务器　选中配额 -->
                <div class="parameter-server-item">
                  <el-form-item :label="$t('m.job.numberOfParameterServer')" prop="parameterServerQuotas.count" 
                  :rules="[{ required: true, message: $t('m.rules.pleaseEnter') + $t('m.job.numberOfParameterServer'), trigger: 'change'}]">
                    <el-input-number v-model="form.parameterServerQuotas.count" :precision="0" :step="1"  :min="1" :max="parameterServerQuotasMaxCount" @blur="form.parameterServerQuotas.count=form.parameterServerQuotas.count?form.parameterServerQuotas.count:1;numberBlurChangeHandle()" @change="numberBlurChangeHandle"  label="描述文字" id="submitjob_parameterServer" ></el-input-number>
                  </el-form-item>

                  <el-form-item :label="$t('m.memory')" prop="parameterServerQuotas.amount" label-width="137px" style="padding-right:5px;" class="form-memory-unit"
                  :rules="[{ required: true, message: $t('m.rules.pleaseEnter') + $t('m.authority.memoryQuota').toLowerCase(), trigger: 'change'}]">
                    <div style="display:inline-block;width:58px;position: relative;left: -7px;">
                      <el-dropdown @command="paraHandleCommand">
                        <span class="el-dropdown-link">
                          ({{form.parameterServerQuotas.unit}}<i class="el-icon-arrow-down el-icon--right"></i>)
                        </span>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item command="GB" id="submitjob_parameter_option_GB">GB</el-dropdown-item>
                          <el-dropdown-item command="MB" id="submitjob_parameter_option_MB">MB</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </div>
                    <el-input-number v-model.number="form.parameterServerQuotas.amount" :precision="0" :step="1"  :min="1" :max="parameterServerQuotasMaxMemory" @blur="form.parameterServerQuotas.amount=form.parameterServerQuotas.amount?form.parameterServerQuotas.amount:1;numberBlurChangeHandle()" @change="numberBlurChangeHandle"  id="submitjob_parameter_memory_input">        
                    </el-input-number>
                  </el-form-item>
                  <el-form-item label="CPU (Core)" prop="parameterServerQuotas.cpu"
                  :rules="[{ required: true, message: $t('m.rules.pleaseEnter') + $t('m.authority.cpuQuota'), trigger: 'change'}]">
                    <el-input-number v-model.number="form.parameterServerQuotas.cpu" :precision="0" :step="1"  :min="1" :max="parameterServerQuotasMaxCPU" @blur="form.parameterServerQuotas.cpu=form.parameterServerQuotas.cpu?form.parameterServerQuotas.cpu:1;numberBlurChangeHandle()" @change="numberBlurChangeHandle" id="submitjob_parameter_cpu">
                    </el-input-number>                
                  </el-form-item>
                </div>
                
              </div>
              <!-- <p v-show="form.lib=='tensorflow'&&form.type=='distributed'" class="red-text" style="padding-left:80px;">{{errorMsg}}</p> -->
              <p class="red-text" style="padding-left:80px;">{{errorMsg}}</p>
            </div>
          </div>

          

          <!-- 第四步 选择镜像 -->
          <div class="step four">
            <div class="left">
              <p>
                <span class="num">3</span>  
              </p>
              <span class="line"></span>
            </div>
            <div class="right">
              <p class="title">{{$t('m.job.chooseImage')}}</p>
              <el-form-item label="" prop="imageTag" class="image-tag" label-width="0px">

                <imageLabel :label="label" @imageTagValue="form.imageTag= $event"></imageLabel>          
              </el-form-item>            
            </div>
          </div>
          
          <!-- 提交 -->
          <div>
            <el-form-item>
              <el-button   id="submitjob_btn_submitForm"  type="primary" @click="submitForm('form')" size="medium">{{$t('m.submit')}}</el-button>
              <el-button  id="submitjob_btn_cancel"  @click="$router.go(-1)"  size="medium">{{$t('m.cancel')}}</el-button>
            </el-form-item>
          </div>

        </el-form>
      </section>

      <!-- 提示用户，”请联系管理员，绑定一个分区“ -->
      <el-dialog :title="$t('m.tip')" :visible.sync="isZoneNameVisible" :close-on-click-modal="false">
        <p style="font-size:16px;">{{$t('m.bindZone')}}</p>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="isZoneNameVisible = false" size="medium">{{$t('m.confirm')}}</el-button>
        </div>
      </el-dialog>

    </main>
</template>

<script>
import storageTreeItem from '../../components/StorageTreeItem.vue';
import imageLabel from '../../components/ImageLabel.vue';
import Lib from "../../assets/js/Lib";

export default {
  components: {
    storageTreeItem,
    imageLabel,
  },
  data() {
    var validateJobName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.job.jobName").toLowerCase()
          )
        );
      } else if (!/^[a-z0-9]([a-z0-9]{0,18}[a-z0-9])?$/.test(value)) {
        callback(new Error(this.$t("m.job.jobName") + this.$t("m.rules.regularCommonJobName")));
      } else {
        callback();
      }
    };
    var validateModelName = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.modelName").toLowerCase()
          )
        );
      } else if (!/^[a-z0-9]([a-z0-9]{0,38}[a-z0-9])?$/.test(value)) {
        callback(new Error(this.$t("m.modelName") + this.$t("m.rules.regularCommonJobName2")));
      } 
      // else if (value.substr(0,17)!=='tensorflowserving') {
      //   this.form.modelName = 'tensorflowserving'+value;
      // }
       else {
        callback();
      }
    };
    var validateEntryFile = (rule, value, callback) => {
      if (!value.length) {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.job.entryFile").toLowerCase()
          )
        );
      }  else {
        callback();
      }
    };
    var validateDeploymentEntryFile = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.job.workSpace").toLowerCase()
          )
        );
      }  else {
        callback();
      }
    };
    var validateCPU = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.cpuQuota")
          )
        );
      } else if (
        !/^[1-9][0-9]*$/.test(value)
      ) {
        callback(new Error(this.$t("m.authority.cpuQuota") + this.$t("m.rules.positiveIntegerNoAnd")));
      } else {
        callback();
      }
    };
    var validateGPU = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.gpuQuota")
          )
        );
      } else if (!/^[0-9]*$/.test(value)) {
        callback(new Error(this.$t("m.authority.gpuQuota") + this.$t("m.rules.positiveIntegeror0NoAnd")));
      } else {
        callback();
      }
    };
    var validateMemory = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.memoryQuota").toLowerCase()
          )
        );
      } else if (!/^[1-9][0-9]*$/.test(value)) {
        callback(new Error(this.$t("m.authority.memoryQuota") + this.$t("m.rules.positiveIntegerNoAnd")));
      } else {
        callback();
      }
    };
    var validateImage = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t('m.job.pleaseChooseImage')
          )
        );
      } else {
        callback();
      }
    };
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(
          new Error(
            this.$t("m.rules.pleaseEnter") + this.$t("m.authority.password").toLowerCase()
          )
        );
      } else if (!/^[A-Za-z0-9!@#$%^&*]{6,20}$/.test(value)) {
        callback(new Error(this.$t("m.authority.password") + this.$t("m.rules.regularPass")));
      } else {
        callback();
      }
    };
    var validateLogPath = (rule, value, callback) => {
      if (value === "") {
        this.form.logPath = 'log';
      } else if (value.search(/[<>/*?,\s]/) >= 0 || value.length > 20) { // 不可以　<>/*?,\s 可以是汉字
        callback(new Error(this.$t('m.logPath') + this.$t('m.rules.regularMore')));
      } else {
        callback();
      }
    };
    return {  
      loading: false,
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
      checked: [],
      username: '',
      // imageNameQuery: '',
      
      options: [],     
      zoneItem: {
        cpu:'',
        gpu:'',
        memory:'',
        jobNumber:'' // GB
      },
      // activeName: 'publicImages',
      // isPublicMore:true,
      // isPrivateMore:true, 
      // loadingPublicImages: false, // 公共镜像列表　加载图标
      // loadingPrivateImages: false, // 私有镜像列表　加载图标
      // pagePublic: {  // 公共镜像页码
      //   currentPage: 1, // 当前页码
      //   total: 0, // 一共多少条数据
      //   pageSize: 10 // 一页显示多少条
      // },  
      // pagePrivate: { // 私有镜像页码
      //   currentPage: 1, // 当前页码
      //   total: 0, // 一共多少条数据
      //   pageSize: 10 // 一页显示多少条
      // },    
      // publicImagesList:[],
      // privateImagesList:[],
      optionFileArr:[], // 点击选择的文件夹名的集合， 不包括最后的文件名
      firstIndex:null, //  option数组的 index
      optionIndexArr:[], // 获取到的所有 的 index 值
      optionIndexStr:'', // 指向 哪个 数据， 即 获取数据需要插入到的数组
      pathHistory:[], // 存放 path 的历史记录，用来避免发重复的请求
      libList: [],　// 机器学习裤
      form:{
        zoneName:'',
        jobName:'',
        modelName: '',
        imageName:'',
        imageTag:'',
        
        cpu:1,
        gpu:0,
        amount:1,
        unit:'GB',

        entryFile:[],
        lib:'tf',
        type: 'stand-alone', // 
        executor:'jupyter',  // 执行器    
        logPath: '', // 
        addOn:'',
        deploymentEntryFile: '',
        parameterServerQuotas: {
          count: 1,
          cpu:1,
          gpu: 0,
          amount:1,
          unit:'GB',
        },
        workerQuotas: {
          count:1 ,
          cpu:1,
          gpu:0,
          amount:1,
          unit:'GB',
        },
        password:'', // 
        gpuType:'', // gpu数据类型
        resolution: '1250x940', // 
        wordingDirectory: '', // 创建任务时选择的空间
      },
      rules: {
        jobName: [
          { required: true, validator: validateJobName,  trigger: 'blur' },
        ],
        modelName: [
          { required: true, validator: validateModelName,  trigger: 'blur' },
        ],
        entryFile: [
          { required: true, validator: validateEntryFile, trigger: 'change' }
        ],   
        deploymentEntryFile: [
          { required: true, validator: validateDeploymentEntryFile, trigger: 'change' }
        ] ,    
        cpu: [
          { required: true, validator: validateCPU, trigger: 'change' }
        ],
        gpu: [
          { required: true, validator: validateGPU, trigger: 'change' }
        ],
        amount: [
          { required: true, validator: validateMemory, trigger: 'change' }
        ],
        imageTag: [
          { required: true, validator: validateImage, trigger: 'change' }
        ], 
        work:[],
        password: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ],  
        logPath:[
          { required: true, validator: validateLogPath,  trigger: 'blur' },
        ],
      },  
      volumeName:'',
      isDeployment: false, // 是否是交互式开发， 如果不是， 那就是 提交任务 
      dialogStrorageTreeVisible: false,
      choosePath: '', // 选中的工作空间
      validateDeploymentEntryFileError:'',
      validateDeploymentPasswordError:'',
      changeEveryTime: true , // 每次改变， 因为 validateDeploymentEntryFileError 这个值每次改变才会每次显示， 否则，在关闭/取消 validateDeploymentEntryFile 如果为空， 只报一次错，第 n+1 次就不报了
      loadingZones: false, // 分区列表加载镜像
      user:{
        quotas: {
          cpu:'',
          gpu:'',
          memory:'',
          jobNumber:'',
        },
        last: {
          cpu:'',
          gpu:'',
          memory:'',
          jobNumber:'',
        }
      }, 
      errorMsg: '' , // 资源不足的提示
      gpuTypeList:[''], // GPU类型
      resolutionList: [
        '800x600',
        '2560x1600',
        '1920x1440',
        '1856x1392',
        '1792x1344',
        '1920x1200',
        '1600x1200',
        '1680x1050',
        '1400x1050',
        '1280x1024',
        '1440x900',
        '1280x960',
        '1360x768',
        '1280x800',
        '1152x864',
        '1280x768',
        '1024x768',
        '640x480',
        '1250x940',
      ], // 分辨率
      isZoneNameVisible: false, // 是否显示绑定分区的提示，在用户没有绑定分区时提示。
      isModel: false, // 
      logPathFolder: '/', // 
      superParamArr:[
        {key:'',value:''},
      ], // 创建任务时，超参数调整
      roleStorage : '',
      standaloneOrCluster: '',
      label: {},
      
    };
  },

  // watch:{
  //   label(){

  //     this.pagePrivate.currentPage = 1;
  //     this.pagePublic.currentPage = 1;
  //     this.isPublicMore = true;
  //     this.isPrivateMore = true;
  //     this.getImages('public');
  //     this.getImages('private');
  //   }
  // },

  computed:{

    // 单机版　最大值 计算
    standAloneMaxCPU(){ // 单机版　cpu　最大值
      return Math.min(this.zoneItem.cpu , this.user.last.cpu);
    },
    standAloneMaxGPU(){ // 单机版　gpu　最大值
      return Math.min(this.zoneItem.gpu, this.user.last.gpu );
    },
    standAloneMaxMemory(){ // 单机版　memory　最大值
      if(this.form.unit == 'GB'){
        return Math.min(this.zoneItem.memory, this.user.last.memory);
      }else{
        return  Math.min(this.zoneItem.memory, this.user.last.memory) *1024;
      }      
    },

    // 执行器：python　机器学习库：tensorflow 运行模式：分布式　－》  worker　最大值　计算
    workerServerQuotasMaxCount(){
      return Math.min(this.zoneItem.cpu , this.user.last.cpu)-1;
    },
    workerServerQuotasMaxCPU(){
      return Math.min(this.zoneItem.cpu , this.user.last.cpu)-1;
    },
    workerServerQuotasMaxGPU(){
      return parseInt(Math.min(this.zoneItem.gpu , this.user.last.gpu)/this.form.workerQuotas.count);
    },
    workerServerQuotasMaxMemory(){
      if(this.form.workerQuotas.unit == 'GB'){
        return Math.min(this.zoneItem.memory, this.user.last.memory);
      }else{
        return  Math.min(this.zoneItem.memory, this.user.last.memory) *1024;
      } 
    },

    // 执行器：python　机器学习库：tensorflow 运行模式：分布式　－》  参数服务器　最大值　计算
    parameterServerQuotasMaxCount(){
      return Math.min(this.zoneItem.cpu , this.user.last.cpu)-1;
    },
    parameterServerQuotasMaxCPU(){
      return Math.min(this.zoneItem.cpu , this.user.last.cpu)-1;
    },
    parameterServerQuotasMaxMemory(){
      if(this.form.parameterServerQuotas.unit == 'GB'){
        return Math.min(this.zoneItem.memory, this.user.last.memory);
      }else{
        return  Math.min(this.zoneItem.memory, this.user.last.memory) *1024;
      } 
    },
    
  },
  // watch:{

  // },

  created() {
    this.roleStorage = localStorage.getItem('rolesStore') ? localStorage.getItem('rolesStore') : null;
    this.standaloneOrCluster = localStorage.getItem('standaloneOrCluster');
    this.changeLang();
    this.getUserQuotas();
    // this.getUserLast();
    
    this.getGpuTypes();
    this.getEntryFile();
    Lib.bus.$on("choose-path", arg => {
        this.choosePath = '/' + arg;
    });
    

  },

  mounted(){   
    this.mountedHandle();
    if(document.getElementById('submitjob_isDeployment_jobName')){
      document.getElementById('submitjob_isDeployment_jobName').value = '';
    }
    if(document.getElementById('submitjob_password')){
      document.getElementById('submitjob_password').value = '';
    }   
    
  },

  methods: {
    // 切换 单机版/分布式 触发
    tfOperatingModeHandle(){
      this.computedErrorMsg();
      console.log(this.errorMsg);
      if(!this.errorMsg){ // 如果没有值， 说明通过初始验证， 再进行最大值验证
        this.numberBlurChangeHandle();
      }      
    },

    // 单机版/分布式 初始验证
    computedErrorMsg(){
      console.log('单机版');
      
      // 单机版开发
      if(this.user.last.cpu < 1 || this.zoneItem.cpu < 1){
        this.errorMsg =  this.$t('m.rules.insufficientCPU'); // 'cpu资源不足';
        return false;
      }else{
        this.errorMsg = '';
      };
      if(this.user.last.memory < 1 || this.zoneItem.memory < 1){
        this.errorMsg =  this.$t('m.rules.insufficientMemory');// 内存不足
        return false;
      }else{
        this.errorMsg = '';
      };
      if(!this.isDeployment && (this.user.last.jobNumber < 1 || this.zoneItem.jobNumber < 1)){ // 提交任务，任务数量为０
        this.errorMsg =  this.$t('m.rules.insufficientNumber'); // '任务数量不足';
        return false;
      }else{
        this.errorMsg = '';
      }
      
      // 分布式开发
      if(this.form.lib=='tensorflow'&&this.form.type=='distributed'){
        // 初始判断
        
        if(this.user.last.cpu <= 1 || this.zoneItem.cpu <= 1){
          this.errorMsg =  this.$t('m.rules.insufficientCPU'); // 'cpu资源不足';
          return false;
        }else{
          this.errorMsg = '';
        };
        if(this.user.last.memory <= 1||this.zoneItem.memory <= 1){
          this.errorMsg =  this.$t('m.rules.insufficientMemory');;// 内存不足
          return false;
        }else{
          this.errorMsg = '';
        };
        if(!this.isDeployment && (this.user.last.jobNumber <= 1 || this.zoneItem.jobNumber <= 1)){ // 提交任务，任务数量为1
          this.errorMsg =  this.$t('m.rules.insufficientNumber'); // '任务数量不足';
          return false;
        }else{
          this.errorMsg = '';
        }       
      }      
    },
        // 添加　超参数
    superParamPlus(){
      this.superParamArr.push({key:'',value:''})
    },

    // 减少　超参数
    superParamMinus(index){

      this.superParamArr.splice(index,1)
    },

    // 初始化数据
    changeLang() {
      this.$i18n.locale = localStorage.getItem("locale"); 
      this.username = Lib.Common.getCookies("username")?Lib.Common.getCookies("username"):null; // 获取用户名
      // 随机生成 job名      
      this.form.jobName = 'job'+parseInt(Math.random()*100000);
      this.form.modelName = 'tensorflowserving'+parseInt(Math.random()*100000);
      this.volumeName = localStorage.getItem('volumeName')?localStorage.getItem('volumeName'):'nfs';
      if(this.$route.query.deploymentorsubmit) {
        this.isDeployment = true;  // 交互式开发 或者 模型部署
        // this.form.resolution = '1250x940';
      }else{　
        // 提交任务
        this.isDeployment = false; 
        this.label = {frames:['tensorflow:python3']};
      }
      if(this.$route.query.deploymentorsubmit === 'deployment'){ // 交互式开发
        this.label = {jupyter:["jupyter"]}; // 默认值
      }
      if(this.$route.query.deploymentorsubmit === 'model'){ // 模型部署
        this.isModel = true; 
        this.label = {deploy:["tensor-serving"]};
      }
    },

    // 获取 gpu 类型
    getGpuTypes(){  
      this.$axios
      // `/api/user/users/${this.username}`
      .get(Lib.API().job.getGpuTypes)
      .then( res => {
        const data = res.data;
        if(data.success){ 
          if(data.gputypes.length) {
            this.gpuTypeList = data.gputypes;
          }                    
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },

    // 计算是否大于配额
    numberBlurChangeHandle(){
      
      // 　如果是分布式
      if(this.form.lib=="tensorflow"&&this.form.type=="distributed"){
        // 2.0 gpu
        if(( this.form.workerQuotas.gpu*this.form.workerQuotas.count) > Math.min(this.zoneItem.gpu,this.user.last.gpu)){
          // 提示资源不足
          this.errorMsg = this.$t('m.rules.insufficientGPU'); // gpu 资源不足
          return false;
        }else{
          this.errorMsg = '';
        }

        // 2,1 cpu
        if((this.form.parameterServerQuotas.cpu*this.form.parameterServerQuotas.count + this.form.workerQuotas.cpu*this.form.workerQuotas.count) > Math.min(this.zoneItem.cpu,this.user.last.cpu)){
          
          // 提示资源不足
          this.errorMsg = this.$t('m.rules.insufficientCPU'); // 'cpu资源不足';
          return false;
        }else{
          this.errorMsg = '';
        }

        // 2,2 jobNumber
        if((this.form.parameterServerQuotas.count + this.form.workerQuotas.count) > Math.min(this.zoneItem.jobNumber,this.user.last.jobNumber)){
          // 提示资源不足
          this.errorMsg = this.$t('m.rules.insufficientNumber'); // '任务数量不足';
          return false;
        }else{
          this.errorMsg = '';
        }

        // 2.3 内存
        let p,w;
        // 单位都转为　GB 统一计算
        if(this.form.parameterServerQuotas.unit == 'MB'){
          p = this.form.parameterServerQuotas.amount / 1024; // 参数服务器　内存　的值　
        }
        if(this.form.workerQuotas.unit == 'MB'){
          w = this.form.workerQuotas.amount / 1024;　// work 内存　的值
        }
        p = p || this.form.parameterServerQuotas.amount;
        w = w || this.form.workerQuotas.amount;
        // count 为　个数
        if((p*this.form.parameterServerQuotas.count+w*this.form.workerQuotas.count) > Math.min(this.zoneItem.memory,this.user.last.memory)){ 
          // 提示资源不足
          this.errorMsg = this.$t('m.rules.insufficientMemory'); // '内存资源不足'
        }else{
          this.errorMsg = '';
        }
      }
      
    },

    // 当　worker 的值发生改变时
    workerCountChangeHandle(){
      // １　改变　ｗｏｒｋｅｒ　的ｇｐｕ　的值  this.workerServerQuotasMaxGPU
      if(this.form.workerQuotas.gpu > this.workerServerQuotasMaxGPU){
        this.form.workerQuotas.gpu = this.workerServerQuotasMaxGPU
      };
    },

    // 发起 “用户详情" 请求，获取用户配额及分区名
    getUserQuotas(){   
      this.loading = true; 
      this.$axios
      // `/api/user/users/${this.username}`
      .get(Lib.API(this.username).auth.userDetail)
      .then( res => {
        const data = res.data;
        if(data.success){       
          // this.user.quotas.cpu = data.result.quota.cpu;
          // this.user.quotas.gpu = data.result.quota.gpu;
          // this.user.quotas.jobNumber = parseInt(data.result.quota.taskNumber);
          
          // if(data.result.quota.internalMemory.substr(-2).toLowerCase() == 'mb'){
          //   // 如果是　ｍｂ　转为　ｇｂ
          //   this.user.quotas.memory = parseInt(data.result.quota.internalMemory.slice(0, -2))/1024;
          //   this.user.quotas.memory = Number(this.user.quotas.memory.toFixed(2));
            
          // }else{
          //   this.user.quotas.memory = parseFloat(data.result.quota.internalMemory.slice(0, -2));
          //   this.user.quotas.memory = Number(this.user.quotas.memory.toFixed(2));
          // }
          // 判断用户是否绑定分区，如果没有绑定，显示 dialog , 且没有删除按钮, 即不能创建任务，提示　”请联系管理员，绑定一个分区！“
          if(data.result.zoneName){
            this.isZoneNameVisible = false;
            this.form.zoneName = data.result.zoneName;
            // 获取用户剩余配额和分区配额
            this.getQuota(); // 获取用户绑定分区的配额
          }else{
            this.isZoneNameVisible = true;
          }
          this.loading = false;
          
        }else{
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
      })
    },

    // 获取用户剩余配额和分区配额
    async getQuota(){
      let getUserLast = await this.$axios.get(Lib.API().job.getUserLastQuotas + `?owner=${this.username}`);
      

      let getZone = await this.$axios.get(Lib.API(this.form.zoneName).zone.getZone);
      

      // this.$axios.all([getUserLast(), getZone()])
        // .then(axios.spread(function (user, zone) {
          // Both requests are now complete
          let userLast = getUserLast.data;
          if(userLast.success){     
            this.user.last.cpu = userLast.cpu;
            this.user.last.gpu = userLast.gpu;
            this.user.last.jobNumber = parseInt(userLast.taskNumber);
            
            if(userLast.internalMemory.substr(-2).toLowerCase() == 'mb'){
              // 如果是　ｍｂ　转为　ｇｂ
              this.user.last.memory = parseInt(userLast.internalMemory.slice(0, -2))/1024;
              this.user.last.memory = Number(this.user.last.memory.toFixed(2));
              // console.log(this.user.last.memory);
              
              // this.lastResource.memory = this.lastResource.memory.toFixed(2);
            }else{
              this.user.last.memory = parseFloat(userLast.internalMemory.slice(0, -2));
              this.user.last.memory = Number(this.user.last.memory.toFixed(2));
            }
          }else{
            var messageCode = userLast.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, userLast.messageParams);
          }

          // zone
          let zoneItem = getZone.data;
          if (zoneItem.success) {
            this.zoneItem.cpu = zoneItem.result.quotas.CPU - zoneItem.result.quotas['CPU Used']; // 剩余 cpu
            this.zoneItem.gpu = zoneItem.result.quotas.GPU - zoneItem.result.quotas['GPU Used']; // 剩余 cpu
            this.zoneItem.jobNumber = zoneItem.result.quotas.jobs - zoneItem.result.quotas['jobs running']; // 剩余 cpu
            //  mb -> gb
            if(zoneItem.result.quotas.memory.substr(-2).toLowerCase() == 'mb'){
              zoneItem.result.quotas.memory = Number(Math.round(parseInt(zoneItem.result.quotas.memory) / 1024))
            }else{
              zoneItem.result.quotas.memory = parseInt(zoneItem.result.quotas.memory)
            }

            if(zoneItem.result.quotas['memory used']){
              if(zoneItem.result.quotas['memory used'].substr(-2).toLowerCase() == 'mb'){
                zoneItem.result.quotas['memory used'] = Math.round(parseInt(zoneItem.result.quotas['memory used']) / 1024)
              }else{
                zoneItem.result.quotas['memory used'] = parseInt(zoneItem.result.quotas['memory used'])
              }
            }
            
            this.zoneItem.memory = (zoneItem.result.quotas.memory - zoneItem.result.quotas['memory used']);            
             
          } else {
            var messageCode = zoneItem.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText,zoneItem.messageParams);
          }

          // 初始化数据　检测是否　
            this.computedErrorMsg(); // 初始数据，错误提示 
            

        // }));
    },

    handleCommand(command){
      this.form.unit = command;
      this.numberBlurChangeHandle();
    },
    paraHandleCommand(command){
      this.form.parameterServerQuotas.unit = command;
      this.numberBlurChangeHandle();
    },
    workerHandleCommand(command){
      this.form.workerQuotas.unit = command;
      this.numberBlurChangeHandle();
    },

    mountedHandle(){
      if(this.isDeployment && this.isModel){
        this.form.executor = 'tensorflowserving';
      }else if(this.isDeployment){
        this.form.executor = 'jupyter';
      }else{
        this.form.executor = 'python3';
        this.libList = ['tensorflow','pytorch'];
        this.form.lib = 'tensorflow'; 
      }
    },   

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
      // if(!this.choosePath){
      //   this.$message({
      //     showClose: true,
      //     message:  " " + this.$t('m.store.pleaseSelectPath'),
      //     // type: "warning",
      //     duration: Lib.Common.messageDuration
      //   });
      //   return false;
      // }
      this.dialogStrorageTreeVisible = false;
      // this.entryFileErrorMessage = '';
      this.form.deploymentEntryFile = this.choosePath;
      this.form.wordingDirectory = this.choosePath;
      
    },

    // label 改变的条件
    labelChange(){
      if(this.form.executor == 'python' || this.form.executor == 'python3'){
        // console.log('0000');
        
        // this.libList = ['tensorflow','pytorch'];
        // this.form.lib = 'tensorflow'; 
        // this.form.logPath = '';
        // 先判断机器学习库 lib:"tensorflow" lib:"pytorch"
        // tensorflow 可以选择 单机版，分布式 type:"stand-alone" type:"distributed"

        if(this.form.lib === 'tensorflow'){
          if((this.form.type === 'stand-alone'&&this.form.gpu)||(this.form.type === 'distributed'&&this.form.workerQuotas.gpu)){ // 单机版有gpu || 分布式有gpu
              this.label = {
                frames:['tensorflow-gpu:'+this.form.executor]
              }
          }else if((this.form.type === 'stand-alone'&&!this.form.gpu)||(this.form.type === 'distributed'&&!this.form.workerQuotas.gpu)){ // 单机版无gpu || 分布式无gpu 
              this.label = {
                frames:['tensorflow:'+this.form.executor]
              }
          }
        }else if(this.form.lib === 'pytorch'){ // 这个事件不会触发到这个值
        
          this.label = {
            frames:['pytorch:'+this.form.executor]
          }
        }


        // 判断是单机版还是分布式，然后再分别判断
      }else if(this.form.executor == 'shell'){
        // this.libList = ['caffe'];
        // this.form.lib = 'caffe';
        // this.form.logPath = 'log';
        this.label = {
            frames:['caffe']
          }
      };
    },

    // 根据代码执行器　－>　机器学习库  -> image 列表传参label
    libHandle(){
      if(this.form.executor == 'python' || this.form.executor == 'python3'){
        this.libList = ['tensorflow','pytorch'];
        this.form.lib = 'tensorflow'; 
        this.form.logPath = '';     

        // 判断是单机版还是分布式，然后再分别判断
      }else if(this.form.executor == 'shell'){
        this.libList = ['caffe'];
        this.form.lib = 'caffe';
        this.form.logPath = 'log';
      };

      this.labelChange();
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

      // 数据存储角色判断，发送不同的参数
      let type = '', volumeName = '', userFolder = '';
      if(this.roleStorage === 'viewer'){
        volumeName = this.volumeName;
        userFolder = this.username;
        type = 'private';
      }else if(this.roleStorage === 'admin'){
        volumeName = 'public';
        userFolder = 'common';
        type = 'public';
      }
      // console.log(volumeName)
      // console.log(userFolder)

      // 请求
      this.$axios       
       .get(Lib.API(volumeName, userFolder).storage.viewerGetFileList+`?path=${this.optionFileArr.join('/')}&type=${type}`)
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

    handleItemChange(val) {
      this.optionFileArr = val;    // 点击的文件夹 数组
      this.getEntryFile();
    },

    cascaderHandle(value){
      if(value.length == 1){
        this.logPathFolder = '/';
      }else if(value.length > 1) {
        this.logPathFolder = '/' + this.form.entryFile.slice(0,this.form.entryFile.length-1).join('/') + '/';
      }
      if(!this.form.wordingDirectory){
        if(value.length == 1){
          this.form.wordingDirectory = '/';
        }else if(value.length > 1) {
          this.form.wordingDirectory = '/' + this.form.entryFile.slice(0,this.form.entryFile.length-1).join('/') + '/';
        }        
      }      
    },

    // // 获取镜像列表    
    // getImages(which,isMore) {
      
    //   let query = '', pageSize = 0, page = 1,label = '';

    //   if(isMore){ // isMore有值， 获取更多， label 设置为空
    //     label = '';
    //     pageSize = 0; 
        
    //   }else{ // isMore为空，label 有值，定向查询
    //     pageSize = 0;
    //     // page = null;
    //     label = JSON.stringify(this.label);
    //     label = encodeURI(label);
    //   }
      
    //   if(which === 'public'){
    //     query = `?label=${label}&pageSize=${pageSize}&page=1&type=1`;
    //     this.loadingPublicImages = true;
    //     if(this.form.imageTag.includes('public')){ // 当页码改变时，清空选中的镜像
    //       this.form.imageTag = '';
    //     }
    //   }else{
    //     query = `?label=${label}&pageSize=${pageSize}&page=1&type=0`;
    //     this.loadingPrivateImages = true;
    //     if(this.form.imageTag.includes('user_')){ // 当页码改变时，清空选中的镜像
    //       this.form.imageTag = '';
    //     }
    //   }

    //   this.$axios
    //     .get(Lib.API().image.imagesForjob + query)
    //     .then(res => {
    //       let data = res.data;
    //       if(data.success){
            
    //         if(which === 'public'){   // 公共镜像
    //           if(isMore){ // 点击加载更多，label 为空，带分页
    //             this.isPublicMore = false; // 不再显示 “显示更多”
    //             this.publicImagesList = data.imagesForjob;
    //             this.pagePublic.total = data.count;
    //           }else{ // label 有值，不带分页
    //             this.publicImagesList = data.imagesForjob;
    //             this.isPublicMore = true;
    //           }
    //         }else{ // 私有镜像
    //           if(isMore){ // 点击加载更多，label 为空，带分页
    //             this.isPrivateMore = false; // 不太显示 “显示更多”
    //             this.privateImagesList = data.imagesForjob;
    //             this.pagePrivate.total = data.count;
    //           }else{ // label 有值，不带分页
    //             this.privateImagesList = data.imagesForjob;
    //             this.isPrivateMore = true;
    //           }
    //         }
    //       } else {
    //         var messageCode = data.message || "default";
    //         var messageText = this.$t("m.responseErrorMessage." + messageCode);
    //         Lib.Common.errorMessage(messageText, data.messageParams);
    //       }
    //       if(which === 'public'){
    //         this.loadingPublicImages = false;
    //       }else{
    //         this.loadingPrivateImages = false;
    //       }          
    //     })

    // },

    // 交互式开发时，改变 executor 时
    interactiveExecutorChange(value){
      if(value === 'jupyter'){
        this.label = {jupyter:['jupyter']};
      }else if(value === 'jupyterlab'){
        this.label = {jupyter:['jupyterlab']};
      }else if(value === 'desktop'){
        this.label = {vnc:true};
      }else if(value === 'terminal'){
        this.label = {ssh:true};
      }      
    },

    // 提交
    submitForm(formName) {    
      
      if(!this.form.zoneName){
        return false;
      }

      this.$refs[formName].validate((valid) => {
        if (valid) {
          
          if(this.errorMsg){
            return false; // 资源不足
          }

          var url, jobInfo = {}, para = {}; // para 要传的　超参数调整

          // 循环获取　superParamArr　超参数调整, 过滤掉　key 或　value 为空的
          this.superParamArr.forEach(ele => {
            if(ele.key && ele.value){
              para[ele.key] = ele.value;
            }            
          })
          
          if(this.isDeployment){　// 交互式开发  or 模型部署
            url = Lib.API().job.createDeployments;
          }else{ // 任务
            url = Lib.API().job.submitJob;
          }

          if(!this.isDeployment && (this.form.type=="distributed") && (this.form.lib == "tensorflow")){
            // 提交任务，且　分布式
            var jobInfos = [];
            // 公共部分
            var otherObj = {
              owner:this.username,
              zoneName: this.form.zoneName,
              imageName: this.form.imageTag.split('@')[0],
              imageTag: this.form.imageTag.split('@')[1],
              workItemInfo:{
                entryFile: '/' + this.form.entryFile.join('/'),
                executor:this.form.executor,
                lib:this.form.lib,
                workDirectory: this.form.lib === 'tensorflow' ?  this.form.wordingDirectory : '',
              },
              volumeName: this.volumeName,
              // labels:{
              hyperParameters:para
              // },

            }
            // worker
            jobInfos.push({ 
              ...otherObj,              
              jobName: this.form.jobName+'-worker-'+this.form.workerQuotas.count,                
              quotas:{
                CPU:{
                  resourceType:'CPU',
                  amount:this.form.workerQuotas.cpu,
                },
                GPU:{
                  resourceType:'GPU',
                  amount:this.form.workerQuotas.gpu,
                },
                MEM:{
                  resourceType:'MEM',
                  amount:this.form.workerQuotas.amount,
                  unit:this.form.workerQuotas.unit,                
                },
              },                
            })
            // 　parameterServer
            jobInfos.push({ 
              ...otherObj,              
              jobName: this.form.jobName+'-ps-' + this.form.parameterServerQuotas.count,                
              quotas:{
                CPU:{
                  resourceType:'CPU',
                  amount:this.form.parameterServerQuotas.cpu,
                },
                GPU:{
                  resourceType:'GPU',
                  amount:this.form.parameterServerQuotas.gpu,
                },
                MEM:{
                  resourceType:'MEM',
                  amount:this.form.parameterServerQuotas.amount,
                  unit:this.form.parameterServerQuotas.unit,                
                },
              },                
            })
            
            // 最后赋值给要传的变量
            jobInfo = {
              jobs : jobInfos,
              total: this.form.workerQuotas.count + this.form.parameterServerQuotas.count
            }
          }else{
            // 提交任务，单机，　或者在线编辑,  模型部署
            var paramJobName;
            let appType = '';
            if(!this.isDeployment){ // 任务
              paramJobName = this.form.jobName;
              appType = 'job';

            }else{
              if(this.isModel){ // 模型
                paramJobName = this.form.modelName;
                appType = 'model';
              }else{
                paramJobName = this.form.executor;　// 交互式开发
                appType = 'interactive';
              }
            }
            
            jobInfos = [{
              owner:this.username,
              zoneName: this.form.zoneName,
              jobName: paramJobName,
              imageName: this.form.imageTag.split('@')[0],
              imageTag: this.form.imageTag.split('@')[1],
              labels:{
                password: this.form.password,
                resolution: this.form.resolution,
                gputype:  this.form.gpuType, // gpu类型
                logPath: this.logPathFolder + this.form.logPath,  // caffee 时用到
                appType,
              },
              hyperParameters: para,
              quotas:{
                CPU:{
                  resourceType:'CPU',
                  amount:this.form.cpu,
                },
                GPU:{
                  resourceType:'GPU',
                  amount:this.form.gpu,
                },
                MEM:{
                  resourceType:'MEM',
                  amount:this.form.amount,
                  unit:this.form.unit,                
                },
              },
              workItemInfo:{
                entryFile: this.isDeployment ? this.form.deploymentEntryFile : '/' + this.form.entryFile.join('/'),
                workDirectory: (!this.isDeployment && this.form.lib === 'tensorflow') ?  this.form.wordingDirectory : '',
                executor:this.form.executor,
                lib:this.form.lib,
              },
              volumeName: this.volumeName
            }];
            jobInfo = {
              jobs : jobInfos,
              total: 1
            }
          }

          this.loading = true;  // 显示加载
           
          this.$axios.post(url,jobInfo).then(res => {
            const data = res.data;
            this.loading = false;　// 取消　加载 
            if (data.success) {
              
              if(this.isDeployment){ // 交互式开发
                if(this.$route.query.deploymentorsubmit === 'deployment'){　// 
                  this.$router.push({path:'/modeltraining/interactive/list'}); // 跳转到交互式开发列表页
                }else if(this.isModel) { // 模型部署
                  this.$router.push({path:'/modeldeployment/model/list'}); // 跳转到交互式开发列表页
                }
              }else{ // 提交任务
                this.$router.push({path:'/modeltraining/job/list'}); // 跳转到任务列表页
              }
              
            }else {
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

  }
};
</script>

<style lang="less" scoped>

  section.form-wrap {
    padding: 30px;
    div.step {
      margin-top: 10px;
      display: flex;
      div.left {
        flex-basis: 30px;
        position: relative;
        p {
          background-color: #fff;
          margin: 0;
          padding-bottom: 10px;
          position: relative;
          z-index: 2;
          span.num {
            display: inline-block;
            color: #ffffff;
            width: 30px;
            text-align: center;
            height: 30px;
            line-height: 30px;
            border-radius: 50%;
            background-color: #1a99a5;
            font-weight: bold;
            position: relative;
            z-index: 2;
            margin: 0;
          }          
        }
        >span.line {
          display: inline-block;
          height: 100%;
          width: 1px;
          margin-left: 15px;
          background-color: #dddddd;
          position: absolute;
          top: 0;
        }
      }
      div.right {
        flex-grow: 1;
        margin-left: 15px;
        p.title {
          margin-top: 5px;
          font-weight: bold; 
        }
        
      }      
    }
    div.step.four {
      table {
        > thead {
          th {
            text-align: left;
          }
        }
        td {
          text-align: left;
        }
        > tbody {
          > tr:first-child{
            > td:first-child {
              cursor: pointer;
            }
          }
          tr:nth-child(2) td{
            padding: 0px 0 0px 10px;
          }
          
        }
        table {
          td,th {
            border: 1px solid #eeeeee;
            padding: 3px 0 3px 10px !important;
            text-align: left;
            padding-left: 10px;
          }
          th {
            border-top:none;
          }
          th:first-child {
            padding-left: 30px !important;
          }
          tr:last-child td {
            border-bottom: none;
          }
        }
      }
    }
  } 
  .image-tag {
    > div.el-form-item__content {
      margin-left: 0 !important;
    }
    .el-tabs__header {
      margin-bottom: 0;
    }
  }
  div.el-dialog__body {
    padding: 5px 20px;
  }
  .user-resource {
    line-height: 3em;
    margin-bottom: 20px;
    ul {
      display:inline-block;
      li {
        display: inline-block;
        padding-right:5px;
        span {
          font-weight: bold;
        }
      }
      li:nth-child(even){
        color:#ccc;
      }
    }
  }
  .parameter-server-wrap {
    display:flex; 
    flex-wrap: wrap;
    // justify-content: space-around;
    margin-left: 78px;
    .parameter-server-item {
      // flex-basis:30%;
      // min-width:250px; 
      max-width: 45%;
      border:1px solid #eee;
      border-radius:5px;
      padding-top: 20px;
      padding-right: 20px;
      margin-right: 20px;
    }
  }
  .ttt > label.el-form-item__label {
    padding-right: 3px;
  }
  .el-dropdown-link:hover {
    cursor: pointer;
    color: #1a99a5;
  }

  .is-more {
    margin-top:20px;
    color: #666;
    display: block;
    width: 100%;
    font-size: 14px;
    text-align: right;
    &:hover{
      color: #1a99a5;
    }
  }

</style>