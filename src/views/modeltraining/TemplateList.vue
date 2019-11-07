<template>
  <main>
    <div>
      <router-link to="/modeltraining/template/submit?appType=job&istemplate=1">
        <el-button size="medium" type="primary" id="visual_list_new"  plain icon="el-icon-plus">{{$t('m.job.jobTemplate')}}</el-button>
      </router-link> &nbsp; &nbsp; 
      
      <router-link to="/modeltraining/template/submit?appType=interactive&istemplate=1">
        <el-button size="medium" type="primary" id="visual_list_new"  plain icon="el-icon-plus">{{$t('m.job.interactiveTemplate')}}</el-button>
      </router-link> &nbsp; &nbsp; 

      <router-link to="/modeltraining/template/submit?appType=visual&istemplate=1">
        <el-button size="medium" type="primary" id="visual_list_new"  plain icon="el-icon-plus">{{$t('m.job.visualTemplate')}}</el-button>
      </router-link> &nbsp; &nbsp; 

    </div>

    <section class="show-info">
      <table>
        <thead>
          <tr>
            <th>{{$t('m.name')}}</th>
            <th>{{$t('m.type')}}</th>
            <th>{{$t('m.desc')}}</th>            
            <th>{{$t('m.creationTime')}}</th>
            <th>{{$t('m.modifiedTime')}}</th>
            <th class="operation" style="padding-left:7px;">{{$t('m.operating')}}</th>
          </tr>
        </thead>
        <tbody v-if="list.length"  v-loading="loading" :element-loading-text="$t('m.loading')">
          <tr v-for="(item,index) in list" :key="item.templateName">
            <td>{{item.templateName}}</td>            
            <td>{{item.appType}}</td>
            <td>{{item.description}}</td>
            <td>{{item.createTime | toDate('date')}}</td>
            <td>{{item.updateTime | toDate('date')}}</td>
            <td class="operation"> 
              <!-- 查看 -->
              <router-link   :to="'/modeltraining/template/submit?appType='+item.appType+'&istemplate=1&templateName='+item.templateName">
                <el-button type="text" icon="el-icon-view">{{$t('m.view')}}</el-button>
              </router-link>
              <!-- 修改 -->
              <router-link   :to="'/modeltraining/template/submit?appType='+item.appType+'&istemplate=1&templateName='+item.templateName">
                <el-button type="text" icon="el-icon-edit">{{$t('m.edit')}}</el-button>
              </router-link>
              <!-- 删除 -->
              <el-popover placement="bottom" width="280" v-model="item.isDeleteVisible">
                <div>
                  <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' +'?'}}</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" @click="item.isDeleteVisible = false">{{$t('m.cancel')}}</el-button>
                    <el-button
                      type="primary"
                      size="mini"
                      @click="item.isDeleteVisible=false;deleteHandle(item.templateName,index)"
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
        <span>{{$t('m.total')}} {{list.length}} {{$t('m.tiao')}}</span>
      </div>
    </section>
  </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
    return {
      list: [],
      loading: false
    };
  },
  created() {
    this.getList();
  },

  methods: {
    // 列表
    getList() {
      this.loading = true;
      this.$axios({
        method: "get",
        url: Lib.API().job.templateList
      }).then(res => {
        const data = res.data;
        if (data.success) {
          // 排序
          data.data.sort(function(a, b) {
            if (a.appType < b.appType) {
              return -1;
            }
            if (a.appType > b.appType) {
              return 1;
            }
            return 0;
          });
          data.data.forEach(ele => {
            ele.isDeleteVisible = false;
          });
          this.list = data.data;
        } else {
          Lib.Common.errorMessage(
            this.$t("m.responseErrorMessage." + data.message || "default"),
            data.messageParams
          );
        }
        this.loading = false;
      });
    },

    // 删除
    deleteHandle(templateName,index) {
      this.loading = true;
      this.$axios.delete(Lib.API(templateName).job.templateDelete).then(res => {
        const data = res.data;
        if (data.success) {
          this.$message({
            showClose: true,
            message: this.$t("m.deleted"),
            type: "success",
            duration: Lib.Common.messageDuration
          });
          // 在当前列表删除
          this.list.splice(index,1);
        } else {
          Lib.Common.errorMessage(
            this.$t("m.responseErrorMessage." + data.message || "default"),
            data.messageParams
          );
        }
        this.loading = false;
      });
    }
  }
};
</script>

<style lang="less" scoped>
table {
  th {
    height: 50px;
  }
  td {
    max-width: 400px;
    padding-right: 20px;
  }
}
</style>
