<template>
    <main>    
      <el-tabs v-model="activeName" >
        <el-tab-pane :label="$t('m.publicData')" name="public" id="share_data_view_public">
          <public-share publicOrShare="public"></public-share>
        </el-tab-pane>
        <el-tab-pane  :label="$t('m.sharingData')" name="share" id="share_data_view_share">
          <public-share publicOrShare="share"></public-share>
        </el-tab-pane>
      </el-tabs> 
            
    </main>
</template>

<script>
import PublicShare from './PublicShare.vue'

export default {
  components: {
    PublicShare,
  },
  data() {
    return {
      activeName:'public',     
    };
  },

  created() {
  },

  methods: {

  }
};
</script>

<style  lang="less" scoped>

</style>
