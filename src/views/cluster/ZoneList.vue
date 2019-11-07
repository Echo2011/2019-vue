<template>
    <main> 
      <div v-if="role=='admin'">
        <router-link :to="{path:'/cluster/zoneadd',query: {operation: 'create'}}" id="zonelist_a_zoneadd_create">
          <el-button size="medium" type="primary" plain icon="el-icon-plus" id="new_zone" >{{$t('m.zone.new')}}</el-button>
        </router-link>       
      </div>    

      <section  v-loading="loading" :element-loading-text="$t('m.loading')" style="background-color: #f1f1f1;">
        <div  v-for="item in list" :key="item.name">
          <!-- 分区名 -->
          <div class="zone-name">
            <h2>{{item.name}}</h2>
            
            <!-- 操作 -->
            <div class="operation" v-if="role=='admin'">         
                {{item.jobType}}({{item.quotas['jobs running']}})
              <router-link :to="{path:'/cluster/zoneadd',query: {operation: 'edit',zoneName:item.name}}" :title="$t('m.edit')" class="zonelist_a_edit">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-edit"></use>
                </svg>
              </router-link>
              <!-- </a> -->

              <a href="javascript:;"   @click="item.deleteVisible=!item.deleteVisible" :title="$t('m.delete')" class="zonelist_a_deleteVisible">
                <svg class="icon" aria-hidden="true" >
                  <use xlink:href="#icon-delete"></use>
                </svg> 
              </a>
              <!-- 删除框 -->
              <transition name="deleteTransition">
                <div class="delete-message" v-show="item.deleteVisible">
                  <!-- <p class="title">SHANCHU</p> -->
                  <p>{{$t('m.doYouDecide') + $t('m.delete').toLowerCase() + ' ' + item.name + '?'}}</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="item.deleteVisible = false" class="zonelist_button_delete">{{$t('m.cancel')}}</el-button>
                    <el-button type="primary" size="mini" @click="item.deleteVisible=false;deleteZone(item.name)" class="zonelist_button_canceldelete"> &nbsp; {{$t('m.confirm')}} &nbsp; </el-button>
                  </div>
                </div>
              </transition>

            </div>
          </div>

          <!-- <p class="desc">{{item.desc}}</p> -->
          <p class="date">{{$t('m.createDate')}} {{ item.creationTime | toDate }}</p>

          <div class="quota-resource-wrap" >
            <div class="quota">
              <h2>
                {{$t('m.zone.applied')}}   
                <!-- 'n1/n2,n1是指已经申请的核数，n2是最高可申请的核数；p%中的p是指申请率(已申请/可申请的得数)' -->    
                <el-tooltip class="item" effect="light" :content="$t('m.zone.appliedInfo')" placement="right" >
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-shuoming"></use>
                  </svg>
                </el-tooltip>

              </h2>
              <div class="quota-wrap">
                <div>
                  {{$t('m.zone.jobsNum')}}: {{item.quotas['jobs running']}}/{{item.quotas.jobs}}
                  <el-tooltip class="item" effect="light" :content="$t('m.zone.jobsInfo')" placement="right" >
                    <svg class="icon jobsnum" aria-hidden="true" style="width:14px; height:14px;">
                      <use xlink:href="#icon-shuoming"></use>
                    </svg>
                  </el-tooltip>
                </div>
                <div>
                  <p>
                    <svg class="icon" aria-hidden="true">
                      <use xlink:href="#icon-GPU"></use>
                    </svg>
                    {{item.quotas.GPU?Math.round((item.quotas['GPU Used']/item.quotas.GPU)*100):0}}<span>%</span>
                  </p>
                  <p>GPU {{item.quotas['GPU Used']?item.quotas['GPU Used']:0}}/{{item.quotas.GPU?item.quotas.GPU:0}} Core</p>
                  <!-- <p>最大配额 12Core</p> -->
                </div>
                <div>
                  <p><svg class="icon" aria-hidden="true">
                      <use xlink:href="#icon-cpu1"></use>
                    </svg> {{item.quotas.CPU?parseInt((item.quotas['CPU Used']/item.quotas.CPU)*100):0}}<span>%</span></p>
                  <p>CPU {{item.quotas['CPU Used']?item.quotas['CPU Used']:0}}/{{item.quotas.CPU?item.quotas.CPU:0}} Core</p>
                </div>
                <div>
                  <p><svg class="icon" aria-hidden="true">
                      <use xlink:href="#icon-aistubiaokuozhan-"></use>
                    </svg> {{item.quotas | getPercentage}}<span>%</span></p>
                  <p>{{$t('m.memory')}} <span v-if="item.quotas['memory used']">{{parseInt(item.quotas['memory used'])}}{{item.quotas['memory used'] | memoryUnit}}</span><span v-if="!item.quotas['memory used']">0</span>/<span v-if="item.quotas.memory">{{parseInt(item.quotas.memory)}}{{item.quotas.memory | memoryUnit}}</span>
                    <span v-if="!item.quotas.memory">0</span>
                    </p>
                </div>
              </div>            
            </div>

            <!-- 已用资源 -->
            <div class="resources">
              <h2>
                {{$t('m.zone.used')}}:
                <el-tooltip class="item" effect="light" :content="$t('m.zone.alreadyUsed')" placement="right">
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-shuoming"></use>
                  </svg>
                </el-tooltip>
              </h2>
              <div class="info">
                <div>
                  <h3>GPU</h3>
                  <el-progress type="circle" :percentage="item.utilization.GPU"></el-progress>
                </div>
                <div>
                  <h3>CPU</h3>
                  <el-progress type="circle" :percentage="item.utilization.CPU"></el-progress>
                </div>
                <div>
                  <h3>{{$t('m.memory')}}</h3>
                  <el-progress type="circle" :percentage="item.utilization.MEM"></el-progress>
                </div>
              </div>    
            </div>         
          </div>
          <!-- 可用资源 -->
        </div>
      </section>
      
    </main>

</template>

<script>
import Lib from "../../assets/js/Lib";

export default {
  name: "zonelist",
  components: {

  },
  data() {
    return {
      list: [], // zone list
      role:'', // 分区的角色
      success: false,
      messageVisible: false,
      message: "",
      timer: null,
      messageParams: "",
      operation: "", // create or edit 需要知道是 新建 还是 修改
      whichName: "",

      message: {
        // 给用户的反馈信息， type: success | error
        text: "",
        type: ""
      },

      zoneAll: "", // 放在地址栏，传给detail页面
      loading: false,
    };
  },

  created() {
    this.getZoneList('true');
    this.changeLang();
    this.freshZoneList();
  },

  destroyed(){ 
    this.clearTimer()
  },

  methods: {
    // 切换语言
    changeLang() {
      // 因为把 i18n 挂载在了 vue 实例上， 因此可以这样写
      // this.$i18n.locale = localStorage.getItem("locale"); // 从 localStorage 中获取语言
      this.role = localStorage.getItem("rolesZone")?localStorage.getItem("rolesZone"):null; // 获取角色
    },

    // 获取所有列表
    getZoneList(isFirst) {
      
      if(isFirst){
        
        this.loading = true;
      }

      this.$axios
        .get(Lib.API().zone.getZoneList)
        // .get("http://rap2api.taobao.org/app/mock/2311//api/zone/zones")
        .then(res => {
          const data = res.data;
          if (data.success) {
            for (let i = 0; i < data.results.length; i++) {
              data.results[i].deleteVisible = false;
              this.zoneAll += data.results[i].name + "#"; // 将会传给 detail 页面
            }
            this.list = data.results;
            // this.messageVisible = false;
          } else {
            var messageTex = data.message || "default";
            var messageParams = data.messageParams || "";
            messageTex = this.$t("m.responseErrorMessage." + messageTex) || "";
            Lib.Common.errorMessage(messageTex,messageParams,'interval');
          }
          if(isFirst){
            this.loading = false;
          }
        });
    },

    freshZoneList(){
      this.timer=setInterval(() => {
        this.getZoneList();
      }, 10000 );
    },

    clearTimer(){
      if(this.timer){
        clearInterval(this.timer)
      }
    },

    // 删除分区
    deleteZone(itemName) {
      // 真实 url
      this.loading = true;
      this.$axios.delete(Lib.API(itemName).zone.deleteZone)
      // `/api/zone/zones/${itemName}`
        .then(res => {
          const data = res.data;
          // this.messageVisible = true;
          this.message = data.message || "";
          this.messageParams = data.messageParams || "";
          this.operation = "delete";
          this.whichName = itemName;
          if (data.success) {
            // 删除成功
            this.$message({
              showClose: true,
              message:
                this.$t("m.nav.zone") +
                " " +
                itemName +
                " " +
                this.$t("m.delete"),
              type: "success",
              duration: Lib.Common.messageDuration
            });
            for(var i =0;i<this.list.length; i++){
              if(this.list[i].name == itemName){
                  this.list.splice(i, 1);
              }
            }

          } else {
            // fail
            var messageTex = data.message || "default";
            var messageParams = data.messageParams || "";
            messageTex = this.$t("m.responseErrorMessage." + messageTex) || "";
            Lib.Common.errorMessage(messageTex, messageParams);
          }
          this.loading = false;
        });
    }
  }
};
</script>

<style  lang="less"  scoped >
// transition
.deleteTransition-enter-active, .deleteTransition-leave-active {
  transition: all .4s;
}
.deleteTransition-enter, .deleteTransition-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
  // transform: translateX(500px);
}

// nav 中选中状态的颜色背景
section > div {
  background-color: #fff;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 3px 3px 3px #cccccc;
  border-radius: 5px;
  position: relative;
}

h2 .icon {
  color: #cccccc;
  font-size: 12px;
}
div.zone-name {
  margin: 20px;
  border-bottom: 1px solid #eeeeee;
  padding: 10px 0 5px 0;
  display: flex;
  justify-content: space-between;
}
div.zone-name h2 {
  text-align: left;
  font-size: 16px;
  padding: 0;
  margin: 0;
  a {
    color: #1a99a5
  }
}
p.date {
  color: #777777;
  margin-left: 20px;
}
div.quota-resource-wrap {
  display: flex;
  justify-content: space-around;
}
div.quota-resource-wrap div.quota {
  min-width: 150px;
  flex-basis: 250px;
  flex-grow: 1;
  flex-shrink: 1;
  text-align: center;

  .quota-wrap > div {
    margin: 12px auto;
    .icon {
      color: #1a99a5;
      font-size: 28px;
    }
    p:nth-child(1) {
      font-size: 20px;
      vertical-align: bottom;
      span {
        font-size: 14px;
      }
    }
    p:nth-child(2),
    p:nth-child(3) {
      color: #777;
      font-size: 13px;
    }
  }

  p {
    margin: 0;
  }
}
div.quota-resource-wrap .resources {
  background-color: #ffffff;
  flex-grow: 3;
  flex-shrink: 2;

  > div {
    display: flex;
    text-align: center;
    justify-content: space-between;
    > div {
      flex-basis: 33%;
      text-align: left;
      h3 {
        margin-left: 45px;
      }
    }
  }
  .info > div:nth-child(1) {
    .el-progress__text {
      color: rgb(75, 184, 138);
    }
    .el-progress-circle > svg > path:nth-child(2) {
      stroke: rgb(75, 184, 138);
    }
  }
  .info > div:nth-child(2) {
    .el-progress__text {
      color: rgb(78, 186, 236);
    }
  }
  .info > div:nth-child(3) {
    .el-progress__text {
      color: rgb(113, 75, 184);
    }
    .el-progress-circle > svg > path:nth-child(2) {
      stroke: rgb(113, 75, 184);
    }
  }
}
div.operation a {
  display: inline-block;
  margin: 0 10px;
  color: #34495e;
}
.delete-message {
  background-color: #fff;
  padding: 20px;
  border: 1px solid #dddddd;
  box-shadow: 3px 3px 3px #dddddd;
  position: absolute;
  top: 55px;
  right: 10px;
  border-radius: 5px;
}
div.quota-resource-wrap div.quota .quota-wrap > div svg.icon.jobsnum {
  color: #cccccc;
  // font-size: 12px;
  padding-bottom: 2px;
}
</style>