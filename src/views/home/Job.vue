<template>
  <div class="item-wrap task">
    <div class="task-overview">
      <h2 id="cluster_task">{{$t('m.nav.jobstatistics')}}</h2>
      {{$t('m.nav.jobstatistics')}}({{$t('m.today')}}):
       {{$t('m.total')}} <span class="num">{{total.Total}}</span> 
    </div>
    <div class="task-list">
      <ul>
          <li>
            {{$t('m.job.scheduled')}}  <br />
            <i class="el-icon-time"></i> <span class="num">{{total.Scheduled}}</span> 
          </li>
          <li>
            {{$t('m.job.terminated')}}<br />
            <i class="el-icon-check"></i>
            <span class="num">{{total.Terminated}}</span> 
          </li>
          <li>
            {{$t('m.job.running')}}<br />
            <i class="el-icon-d-arrow-right"></i>  
            <span class="num">{{total.Running}}</span> 
          </li>
          <li>
            {{$t('m.job.paused')}}<br />
              <span class="pause-icon" >
                <i class="el-icon-minus"> </i> 
                <i class="el-icon-minus"> </i> 
              </span><span class="num">{{total.Paused}}</span> 
          </li>
        </ul>
    </div>     
  </div>
</template>

<script>


export default {
  data(){
    return {
      total:{
        Total:0,
        Scheduled:0,
        Terminated:0,
        Running:0,
        Paused:0
      },
      startFrom:null,
    }
    
  },
  created(){
    this.getJobSummery();
  },
  methods:{
    getJobSummery(){
      const date = new Date();
      this.startFrom = date.getFullYear()+'-'+(date.getMonth()/1+1)+'-'+date.getDate()+'T00:00:00Z';
      this.$axios
        // .get(`http://rap2api.taobao.org/app/mock/2311//api/job/jobs/summary`)
        .get(`/api/job/jobs/summary?startFrom=${this.startFrom}`) 
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.total = data.total;
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
      })
    }
  }
};
</script>

<style lang="less"  scoped>
.task {
  span.num {
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
    font-weight: bold;
  }
}
.task-overview {
  padding: 10px;
  background-color: #f1f1f1;
  height: 92px;
  > ul {
    display: flex;
    justify-content: space-between;
  li {                
      display: inline-flex;      
      color: #777777;
      font-size: 13px;
      
      span:nth-child(1){
        font-size: 14px;
        font-weight: 400;
        color:#333333;
        
      }
      b {
        display: inline-block;
        padding-left: 5px;
        line-height: 20px;
      }      
    } 
  }  
}

.task-list {
  padding: 10px;

  ul  {
    display: flex;
    justify-content: space-between;
    line-height: 40px;
    span.pause-icon {
      display: inline-block;
      position: relative;
      i.el-icon-minus{
        position: relative;
        transform: rotate(90deg);
      }
      i:last-child {
        left: -13px;
      }
    }
    li:last-child {
      position: relative;
      span.num {
        position: relative;
        left: -15px;
      }
    }
  }
}
</style>

