<template>
    <main> 
      <section class="search-info">
        {{$t('m.job.jobStartTime')}} &nbsp; 
        <el-date-picker
          v-model="srcDate"
          align="right" value-format="yyyy-MM-dd"
          type="date" @change="startDateHandle"
          :placeholder="$t('m.chooseDate')"
          :picker-options="pickerOptions1" id="jobstatistics_date">
        </el-date-picker>
        <el-button type="primary"  icon="el-icon-search" @click="getList" id="jobstatistics_search">{{$t('m.search')}}</el-button>
        <!-- <el-button  icon="el-icon-refresh"  @click="startFrom=null;srcDate=null" id="jobstatistics_reset">{{$t('m.reset')}}</el-button> -->
      </section> 
       
      <section class="show-info"> 
        <p class="title">{{$t('m.nav.jobstatistics')}} </p>       
        <ul>
          <li>
            <i class="el-icon-rank"></i> <span class="num">{{total.Total}}</span> {{$t('m.job.jobs')}}
          </li>
          <li>
            <i class="el-icon-time"></i> <span class="num">{{total.Scheduled}}</span> {{$t('m.job.scheduled')}}
          </li>
          <li>
            <i class="el-icon-check"></i>
            <span class="num">{{total.Terminated}}</span> {{$t('m.job.terminated')}}
          </li>
          <li>
            <i class="el-icon-d-arrow-right"></i>  
            <span class="num">{{total.Running}}</span> {{$t('m.job.running')}}
          </li>
          <li>
              <span class="pause-icon" >
                <i class="el-icon-minus"> </i> 
                <i class="el-icon-minus"> </i> 
              </span><span class="num">{{total.Paused}}</span> {{$t('m.job.paused')}}
          </li>
        </ul>                 
        
        <p class="title">{{$t('m.result')}}</p>
        <table>
          <thead>
            <tr>
              <th>{{$t('m.zone.name')}}</th>
              <th>{{$t('m.job.scheduled')}}</th>
              <th>{{$t('m.job.terminated')}}</th>
              <th>{{$t('m.job.running')}}</th>
              <th>{{$t('m.job.paused')}}</th>
              <th>{{$t('m.gpuQuota')}}</th>
              <th>{{$t('m.memQuota')}}</th>
              <th>{{$t('m.cpuQuota')}}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="list" v-for="item in list" :key="item.Name">
              <td>{{item.Name}}</td>
              <td>{{item.Scheduled}}</td>
              <td>{{item.Terminated}}</td>
              <td>{{item.Running}}</td>
              <td>{{item.Paused}}</td>
              <td>{{item.GPU}}</td>
              <td>{{item.MEM}}</td>
              <td>{{item.CPU}}</td>
            </tr>
          </tbody>
        </table> 
      </section>
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  data() {
    return {  
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [{
          text: this.$t('m.today'),
          onClick(picker) {
            picker.$emit('pick', new Date());
          }
        }, {
          text: this.$t('m.yesterday'),
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', date);
          }
        }, {
          text: this.$t('m.thisWeek'),
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', date);
          }
        }]
      },

      startFrom:'',
      srcDate:'',
      total:{},  
      list: [],       
    };
  },
  // beforeCreate(){
  //   this.$i18n.locale = localStorage.getItem("locale"); 
  // },
  created() {
    this.getDateHandle();
    this.getList(); 
  },
  methods: {
    // 切换语言
    getDateHandle() {
      // this.$i18n.locale = localStorage.getItem("locale"); 
      this.srcDate = new Date();
      this.startFrom = new Date();
      this.startFrom = this.startFrom.getFullYear() + '-'+(this.startFrom.getMonth()/1+1)+'-'+this.startFrom.getDate()+'T00:00:00Z';

    },  

    startDateHandle(){
      this.startFrom = this.srcDate+'T00:00:00Z';
    },

    // 获取列表 
    getList(){
      this.$axios
        // `/api/job/jobs/summary?startFrom=${this.startFrom}`
        .get(Lib.API().job.statistics+`?startFrom=${this.startFrom}`) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.total = data.total;
            this.list = data.items;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
      })
    },



  }
};
</script>

<style lang="less" scoped>
section.search-info {
  button.el-button {
    padding: 10px 20px;
    margin-left: 40px;
  }
}
section {
  ul  {
    display: flex;
    padding: 0 30px 30px 30px;
    justify-content: space-between;
    color: #777777;
    span.num {
      font-size: 20px;
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
      color: #444444;
    }
    span.pause-icon {
      display: inline-block;
      position: relative;
      i.el-icon-minus{
        position: relative;
        transform: rotate(90deg);
      }
      i:first-child {
        right: -13px;
      }
    }
  }

  p.title {
    padding-left: 30px;
    font-weight: bold;
  }
  ul + p {
    border-bottom: 1px solid #eeeeee;
    padding-bottom: 15px;
    margin-bottom: 0;
  }
  
}

</style>