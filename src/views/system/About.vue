<template>
    <main>     
      <ul>
        <li>
          <img src="../../assets/img/AIMax-header.png" alt="">
        </li>
        <li>Version 4.3.1 (Official Build) </li>
      </ul>
      <ul>
        <li>AI Max 4.3.1<br/>
          Copyright 2019</li>
      </ul>      
    </main>
</template>

<script>
import Lib from "../../assets/js/Lib";

export default {

  data() {
    return {};
  },

  methods: {
  }
};
</script>

<style  lang="less" scoped>
/* 动画开始前 和 动画结束后的状态 */
.v-enter,
.v-leave-to {
  transform: translateX(-200px);
}

/* 进场和离场的动画效果 */
.v-enter-active,
.v-leave-active {
  transition: all 0.4s ease;
}
// 只在 detail 页面显示的样式

// 确认删除框显示/隐藏过渡
// 动画效果
// 动画效果
.deleteTransition-enter-active, .deleteTransition-leave-active {
  transition: all 0.4s;
}
// 进场，　出场状态
.deleteTransition-enter, .deleteTransition-leave-to {
  opacity: 0;
}
nav {
  position: absolute;
  left: 0px;
  z-index: 2;
  padding-top: 0;
  border: 1px solid #cccccc;
  box-shadow: 1px 1px 2px #aaaaaa;
  background-color: #ffffff;
}
main {
  flex-grow: 1;
  flex-shrink: 1;

  ul {
    margin-left: 200px;
    margin-right: 200px;
    background-color: #ffffff;
    border-radius: 5px; 
    box-shadow: 3px 3px 3px #cccccc;
    
    margin-bottom: 20px; 
    li {
      padding: 20px;
    }     
  }
  ul:first-child {
    li {
      border-bottom:1px solid #eeeeee
    }
  }
  ul:last-child {
    margin-bottom: 350px;
  }
  
  h1 {
    display: inline-block;
  }
}
span.logout:hover {
    background-color: #1a99a5 !important;
  }

</style>

