<template>
    <main class="cluster" v-loading="licenseVisible" :element-loading-text="$t('m.loading')">
      <section class="column" v-if="!licenseVisible">        
        <QuotaResources></QuotaResources>
        <ZoneList v-if="rolesZone=='admin'"></ZoneList>
        <UserQuotas v-else></UserQuotas>
      </section>

      <section class="column" v-if="!licenseVisible">
        <NodeOverview></NodeOverview>       
        <Job></Job>        
      </section>

      <!-- 激活 -->
      <License where="home" v-if="licenseVisible" v-on:isHomeLicenseVisible="licenseVisible= $event"></License>
    </main>
</template>

<script>
import QuotaResources from "./QuotaResources.vue";
import Job from "./Job.vue";
import ZoneList from "./ZoneList.vue";
import UserQuotas from "./UserQuotas.vue";
import NodeOverview from "./NodeOverview.vue";
import Lib from "../../assets/js/Lib";
import License from '../../components/License.vue';

export default {
  components: {
    QuotaResources,
    Job,
    ZoneList,
    NodeOverview,
    UserQuotas,
    License
  },
  data() {
    return {
      rolesZone: '',
      // isRender: false,
      licenseVisible: true,
    };
  },
  created(){   
    this.rolesZone = localStorage.getItem("rolesZone")?localStorage.getItem("rolesZone"):null; 
  },
  methods: {
    // onLicenseVisible(params){
    //   console.log('params');
    //   console.log(params);
      
    // }
  }
};
</script>

<style  lang="less"  scoped>
main.cluster {
  flex-grow: 1; /* main元素 占 整个布局余下空间的份额*/
  display: flex; /* main元素作为 flex容器*/
  flex-wrap: wrap; /* 横向布局， 且换行*/
  padding: 0 0 20px 0;
  background-color: #ffffff;
}
main section.column {
  flex-basis: 100%; /*属性定义了在分配多余空间之前，项目占据的主轴空间（main size）*/
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  padding-bottom: 0;
  padding-top: 0;
}
main section.column .item-wrap {
  box-shadow: 2px 2px 2px #cccccc;
}
main section.column .item-wrap > div {
  padding: 8px 15px;
}
main section.column .item-wrap:nth-child(1) {
  min-width: 600px;
  flex-flow: 6;
  flex-basis: 66%;
  margin-left: 14px;
  margin-right: 7px;
}
main section.column .item-wrap:nth-child(2) {
  min-width: 300px;
  flex-flow: 3;
  flex-basis: 33%;
  margin-left: 7px;
  margin-right: 14px;
}

</style>
