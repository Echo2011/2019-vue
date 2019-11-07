<template>
  <main>
    <div>
      <el-dropdown>
        <el-button size="medium" type="primary" plain icon="el-icon-plus">
          {{$t('m.create')}}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <router-link to="/modeltraining/job/submit?template=job">{{$t('m.job.jobTemplate')}}</router-link>
          </el-dropdown-item>
          <el-dropdown-item>
            <router-link
              to="/modeltraining/job/submit?template=interactive"
            >{{$t('m.job.interactiveTemplate')}}</router-link>
          </el-dropdown-item>
          <el-dropdown-item>
            <router-link
              to="/modeltraining/job/submit?template=visual"
            >{{$t('m.job.visualTemplate')}}</router-link>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <section class="show-info" style="background-color:#f1f1f1;">
      <el-tabs v-model="activeName">
        <!-- 任务训练 -->
        <el-tab-pane :label="$t('m.job.jobTemplate')" name="job">
          <table v-loading="loadingInteractive" :element-loading-text="$t('m.loading')">
            <thead>
              <tr>
                <th>{{$t('m.name')}}</th>
                <th>{{$t('m.job.entryFile')}}</th> <!--入口 -->
                <th>{{$t('m.job.executor')}}</th> <!--执行器 -->
                <th>{{$t('m.job.MLlib')}}</th> <!--机器学习库 -->
                <th>{{$t('m.job.tfOperatingMode')}}</th> <!--tensorflow运行模式 -->
                <th>{{$t('m.job.workSpace')}}</th> <!-- 空间 -->
                <th>{{$t('m.creationTime')}}</th>
                <th>{{$t('m.image.image')}}</th>
                <th class="operation" style="padding-left:7px;">{{$t('m.operating')}}</th>
              </tr>
            </thead>
            <tbody v-if="listJob.length">
              <tr v-for="item in listJob" :key="item.uid">
                <td>{{item.jobName}}</td>
                <td>{{item.workItemInfo.entryFile}}</td> <!--入口 -->
                <td>{{item.workItemInfo.executor}}</td> <!--执行器 -->
                <td>{{item.workItemInfo.lib}}</td> <!--机器学习库 -->
                <td>{{item.workItemInfo.lib}}</td> <!--tensorflow运行模式 -->
                <th>{{$t('m.job.workSpace')}}</th> <!-- 空间 -->
                <td>{{item.jobStatus.startedTime | toDate('date')}}</td>
                <td>{{item.imageName}}</td>
                <td class="operation">
                  <!-- 删除 -->
                  <el-popover placement="bottom" width="280" v-model="item.isDeleteVisible">
                    <div>
                      <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' +'?'}}</p>
                      <div style="text-align: right; margin: 0">
                        <el-button
                          size="mini"
                          @click="item.isDeleteVisible = false"
                        >{{$t('m.cancel')}}</el-button>
                        <el-button
                          type="primary"
                          size="mini"
                          @click="item.isDeleteVisible=false;deleteHandle('interactive',item.uid,item.zoneName)"
                        >{{$t('m.confirm')}}</el-button>
                      </div>
                    </div>
                    <el-button slot="reference" type="text" icon="el-icon-delete">{{$t('m.delete')}}</el-button>
                  </el-popover>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 分页 -->
          <div class="page-block">
            <span>{{$t('m.total')}} {{pageInteractive.total}} {{$t('m.tiao')}}</span>
          </div>
        </el-tab-pane>

        <!-- 交互式开发   -->

        <el-tab-pane :label="$t('m.job.interactiveTemplate')" name="interactive">
          <table v-loading="loadingInteractive" :element-loading-text="$t('m.loading')">
            <thead>
              <tr>
                <th>{{$t('m.name')}}</th>
                <th>{{$t('m.job.executor')}}</th> <!-- 执行器  -->
                <th>{{$t('m.job.workSpace')}}</th> <!-- 空间 -->
                <th>{{$t('m.image.image')}}</th>
                <th>{{$t('m.creationTime')}}</th>
                <th class="operation" style="padding-left:7px;">{{$t('m.operating')}}</th>
              </tr>
            </thead>
            <tbody v-if="listInteractive.length">
              <tr v-for="item in listInteractive" :key="item.uid">
                <td>{{item.jobName}}</td>
                <td>{{item.workItemInfo.executor}}</td>
                <td>{{item.owner}}</td>
                <td>{{item.zoneName}}</td>
                <td>{{item.jobStatus.startedTime | toDate('date')}}</td>
                <td class="operation">
                  <!-- 删除 -->
                  <el-popover placement="bottom" width="280" v-model="item.isDeleteVisible">
                    <div>
                      <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' +'?'}}</p>
                      <div style="text-align: right; margin: 0">
                        <el-button
                          size="mini"
                          @click="item.isDeleteVisible = false"
                        >{{$t('m.cancel')}}</el-button>
                        <el-button
                          type="primary"
                          size="mini"
                          @click="item.isDeleteVisible=false;deleteHandle('interactive',item.uid,item.zoneName)"
                        >{{$t('m.confirm')}}</el-button>
                      </div>
                    </div>
                    <el-button slot="reference" type="text" icon="el-icon-delete">{{$t('m.delete')}}</el-button>
                  </el-popover>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 分页 -->
          <div class="page-block">
            <span>{{$t('m.total')}} {{pageInteractive.total}} {{$t('m.tiao')}}</span>
          </div>
        </el-tab-pane>

        <!-- 可视化 -->
        <el-tab-pane :label="$t('m.job.visualTemplate')" name="visual">
          <table v-loading="loadingVisual" :element-loading-text="$t('m.loading')">
            <thead>
              <tr>
                <th>{{$t('m.name')}}</th>
                <th>{{$t('m.job.MLlib')}}</th> <!--机器学习库/类型 -->
                <th>{{$t('m.job.workSpace')}}</th> <!-- 空间 -->
                <th>{{$t('m.job.entryFile')}}</th> <!-- 入口文件 -->
                <th>{{$t('m.image.image')}}</th>
                <th>{{$t('m.creationTime')}}</th>
                <th class="operation" style="padding-left:7px;">{{$t('m.operating')}}</th>
              </tr>
            </thead>
            <tbody v-if="listVisual.length">
              <tr v-for="(item,index) in listVisual" :key="index">
                <td>{{item.jobName}}</td>
                <td>{{item.owner}}</td>
                <td>{{item.owner}}</td>
                <td>{{item.owner}}</td>
                <td>{{item.type}}</td>
                <td>{{item.createTime | toDate('date')}}</td>
                <td class="operation">
                  <!-- 删除 -->
                  <el-popover placement="bottom" width="280" v-model="item.isDeleteVisible">
                    <div>
                      <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' +'?'}}</p>
                      <div style="text-align: right; margin: 0">
                        <el-button
                          size="mini"
                          @click="item.isDeleteVisible = false"
                        >{{$t('m.cancel')}}</el-button>
                        <el-button
                          type="primary"
                          size="mini"
                          @click="item.isDeleteVisible=false;deleteHandle('visual',item.id)"
                        >{{$t('m.confirm')}}</el-button>
                      </div>
                    </div>
                    <el-button slot="reference" type="text" icon="el-icon-delete">{{$t('m.delete')}}</el-button>
                  </el-popover>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="page-block">
            <span>{{$t('m.total')}} {{pageVisual.total}} {{$t('m.tiao')}}</span>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>
  </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
    return {
      activeName: "job",

      listJob: [],
      listInteractive: [],
      listVisual: [],
      queryOwner: "",
      pageJob: {
        total: 0, // 一共多少条数据
      },
      pageInteractive: {
        total: 0, // 一共多少条数据
      },
      pageVisual: {
        total: 0, // 一共多少条数据
      },
      loadingJob: false,
      loadingVisual: false,
      loadingInteractive: false,
    };
  },

  created() {
    this.getList();
  },

  methods: {
    getList() {
      this.getListInteractive();
      this.getListJob();
      this.getListVisual();
    },

    // 交互式开发
    getListInteractive() {
      this.loadingInteractive = true;
      this.$axios({
        method: "get",
        url:
          Lib.API().job.interactiveListAndDetail +
          `?appType=interactive`
      }).then(res => {
        const data = res.data;
        if (data.success) {
          data.jobs.forEach(ele => {
            ele.isDeleteVisible = false;
          });

          this.listInteractive = data.jobs;
          this.pageInteractive.total = data.total ? Number(data.total) : 0;
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }
        this.loadingInteractive = false;
      });
    },

    // 任务训练
    getListJob() {
      this.loadingJob = true;
      this.$axios
        .get(
          Lib.API().job.joblist +
            `?appType=job`
        )
        .then(res => {
          const data = res.data;
          if (data.success) {
            data.jobs.forEach(ele => {
              ele.isDeleteVisible = false; //
              ele.isShowChildren = false; // 是否展示　分布式　的子内容
              ele.loading = false; // 用于　获取子的渲染时展示

              ele.simpleJobName = ele.jobName.split("-")[0]; // 分布式　总的任务名，只用于展示
              if (ele.jobName.includes("-")) {
                ele.children = [];
                ele.canDelete = false; // 判断分布式父级是否出现　删除　按钮
                ele.runningStatus = ""; // 'Paused' or 'Running' 用于判断分布式父级是否出现　暂停　或者　恢复　按钮
              }
            });
            this.pageJob.total = data.total;
            this.listJob = data.jobs;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loadingJob = false;
        });
    },

    // 可视化
    getListVisual() {
      this.loadingVisual = true;

      this.$axios
        .get( Lib.API().job.visualsList )
        .then(res => {
          const data = res.data;
          if (data.success) {
            data.list.forEach(ele => {
              ele.isDeleteVisible = false; //
            });
            this.listVisual = data.list;
            this.pageVisual.total = data.total ? Number(data.total) : 0;
          } else {
            Lib.Common.errorMessage(this.$t("m.responseErrorMessage." + data.message || "default"), data.messageParams);
          }
          this.loadingVisual = false;
        });
    },

    // 删除
    deleteHandle(which, uidOrId, zoneName) {
      // console.log('delete');

      let url = "";
      if (which === "model") {
        // 模型部署
        url =
          Lib.API("hand" + uidOrId).job.deleteDeployment +
          `?zoneName=${zoneName}`;
        this.loadingModel = true;
      } else if (which === "interactive") {
        // 交互式开发
        url =
          Lib.API("hand" + uidOrId).job.deleteDeployment +
          `?zoneName=${zoneName}`;
        this.loadingInteractive = true;
      } else if (which === "visual") {
        // 可视化
        url = Lib.API(uidOrId).job.visualDelete;
        this.loadingVisual = true;
      } else if (which === "job") {
        // job任务
        url = Lib.API(uidOrId).job.deleteItem + `?zoneName=${zoneName}`;
        this.loadingJob = true;
      }

      this.$axios.delete(url).then(res => {
        const data = res.data;
        if (data.success) {
          this.$message({
            showClose: true,
            message: this.$t("m.deleted"),
            type: "success",
            duration: Lib.Common.messageDuration
          });
          // 延迟　1　秒发请求，否则有缓存

          if (which === "model") {
            // 模型部署
            setTimeout(this.getListModel, 1000); // 延迟执行获取列表
          } else if (which === "interactive") {
            // 交互式开发
            setTimeout(this.getListInteractive, 1000); // 延迟执行获取列表
          } else if (which === "visual") {
            // 可视化
            setTimeout(this.getListVisual, 1000); // 延迟执行获取列表
          } else if (which === "job") {
            // job任务
            setTimeout(this.getListJob, 1000); // 延迟执行获取列表
          }
        } else {
          var messageCode = data.message || "default";
          var messageText = this.$t("m.responseErrorMessage." + messageCode);
          Lib.Common.errorMessage(messageText, data.messageParams);
        }

        if (which === "model") {
          // 模型部署
          this.loadingModel = false;
        } else if (which === "interactive") {
          // 交互式开发
          this.loadingInteractive = false;
        } else if (which === "visual") {
          // 可视化
          this.loadingVisual = false;
        } else if (which === "job") {
          // job任务
          this.loadingJob = false;
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
table{  
  th {
    height: 50px;
  }
}
</style>
