<template>
    <main>

      <section style="padding:0;" v-loading="loading" :element-loading-text="$t('m.loading')">  
        <el-card class="box-card" shadow="never" style="border:none; padding-bottom:50px;">
          <div slot="header" class="clearfix">
            <span style="font-weight:bold;">{{jobName}}</span>
            <div class="right-icon operation" style="float: right; position:relative;" type="text">
              <el-popover
                placement="bottom"
                width="360"
                v-model="isDeleteVisible" >
                  <div>
                    <p>{{$t('m.doYouDecide') + ' '+$t('m.delete').toLowerCase() + ' ' + jobName + '?'}}</p>
                    <div style="text-align: right; margin: 0">  
                      <el-button size="mini" id="interactive_detail_btn_cancel" @click="isDeleteVisible = false">{{$t('m.cancel')}}</el-button>                      
                      <el-button type="primary" size="mini"  id="interactive_detail_btn_delete"  @click="isDeleteVisible=false;deleteHandle(id)">{{$t('m.confirm')}}</el-button>
                      
                    </div>
                  </div>
                <el-button slot="reference" size="medium" id="interactive_detail_delete" type="text" icon="el-icon-delete" >
                {{$t('m.delete')}}
                </el-button>
              </el-popover>
            </div>

          </div>
          
          <div class="detail-body">
              <div  id="test1"></div>              
              <div  id="test2"></div> <br/>              
              <div  id="test3"></div>              
              <div  id="test4"></div> <br/>   
              <div  id="train1"></div>        
              <div  id="train2"></div> <br/>         
              <div  id="train3"></div>        
              <div  id="train4"></div>        
          </div>

        </el-card>         
      </section>

      

    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";
import echarts from 'echarts';

export default {
  data() {
    return {
      DialogVisibleFailedMsg: false, // 任务运行失败/错误　信息
      failedMsgList: [],
      // dateTime:'', // log 中选择的时间
      id: "",
      logList: [],
      zoneName: "",
      containerId: "",
      role: "",
      isDeleteVisible: false,
      jobStatus: {
        runningStatus: ""
      },
      workItemInfo: {},
      quotas: {
        CPU: {
          amount: null
        },
        GPU: {
          amount: null
        },
        MEM: {
          amount: null,
          unit: null
        }
      },
      pods: {},
    //   volumeName: "",
    //   username: "",
      jobName: "", // 任务名
      owner: "",
      loading: false,  //
      loadingStatus: false,
      
      obj: {}, // 
      from: '',  // 如果是　submit , 说明来自　创建页面
    };
  },

  created() {
    this.id = this.$route.query.id;
    this.jobName = this.$route.query.jobName;
    this.from = this.$route.query.from;
    
  },

  mounted(){
    if( this.from === 'submit')  { // 来自创建页面
        this.obj = JSON.parse(localStorage.getItem('visualDetailData'));
        this.handleData(); // 处理数据，渲染页面
    }else{ // 来自列表详情
        this.getDetail();
    }    
  },

  methods: {    
    // 创建图表
    createCharts(idName,xName,yName,xData,yData){
      let myChart = echarts.init(document.getElementById(idName));
      let option = {
        title: {
            text: yName + ' vs. ' + xName, // 图标标题　'accuracy ' + 'vs.' + ' Iters',
            x: 'center'
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            name: xName, // 'Iters',　　// 横坐标标题
            data: xData, // xAxisTemData  // 横坐标数组
        },
        yAxis: {
            name: yName, // 'accuracy'　　// 纵坐标标题
        },
        series: [{
            type: 'line',
            data: yData, // seriesData　// 纵坐标数组
        }]
      }
      myChart.setOption(option);
    },

    // 处理数据，渲染页面
    handleData(){
        // 数据处理
        let test_Seconds =[], test_Iters = [], test_Accuracy = [], test_Loss = [],
        train_Seconds =[], train_Iters = [], train_LearningRate = [], train_Loss = [];

        this.obj.logsForTest.forEach(ele => {
            test_Seconds.push(ele.seconds);
            test_Iters.push(ele.numIters);
            test_Accuracy.push(ele.accuracy);
            test_Loss.push(ele.loss);
        });

        this.obj.logsForTrain.forEach(ele => {
            train_Seconds.push(ele.seconds);
            train_Iters.push(ele.numIters);
            train_LearningRate.push(ele.learningRate);
            train_Loss.push(ele.loss);
        });

        this.createCharts('test1','Iters','Test accuracy',test_Iters,test_Accuracy); // 图表１　Accuracy vs. Iters
        this.createCharts('test2','Seconds','Test accuracy',test_Seconds,test_Accuracy); // 图表2　Accuracy vs. Seconds
        this.createCharts('test3','Iters','Test loss',test_Iters,test_Loss); // 图表3　Loss vs. Iters
        this.createCharts('test4','Seconds','Test loss',test_Seconds,test_Loss); // 图表4　Loss vs. Seconds
        this.createCharts('train1','Iters','Train learning rate',train_Iters,train_LearningRate); // 图表5　Accuracy vs. Iters
        this.createCharts('train2','Seconds','Train learning rate',train_Seconds,train_LearningRate); // 图表6　Accuracy vs. Iters
        this.createCharts('train3','Iters','Train loss',train_Iters,train_Loss); // 图表7　Accuracy vs. Iters
        this.createCharts('train4','Seconds','Train loss',train_Seconds,train_Loss); // 图表8　Accuracy vs. Iters
    },

    // 获取详情
    getDetail() {

      this.loading = true;
      this.$axios      
        .get(Lib.API(this.id).job.visualDetailForCaffee)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.obj = data;
            this.handleData(); // 处理数据，渲染页面
            
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
          }
          this.loading = false;
        });
    },

    // 删除
    deleteHandle(id) {
      this.loading = true;
      this.$axios
        .delete(Lib.API(id).job.visualDelete)
        .then(res => {
          const data = res.data;
          if (data.success) {
            this.$router.push({path:'/modeltraining/visual/list'}); // 跳转到交互式开发列表页
          } else {
            var messageCode = data.message || "default";
            var messageText = this.$t("m.responseErrorMessage." + messageCode);
            Lib.Common.errorMessage(messageText, data.messageParams);
            this.loading = false;
          }
        });
    },

    

  }
};
</script>

<style lang="less" scoped>
section {
  
}
div.detail-body {
  > div {
    display: inline-block;
    min-width: 200px;
    width: 48%;
    margin-right: 1%;
    margin-bottom: 20px;
    border:1px solid #eee;
    height: 300px;
  }
}

div.right-icon {
  > span:hover {
    color: #1a99a5;
    cursor: pointer;
  }
}

</style>