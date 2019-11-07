

<template>
<div>
  <input
      type="text"
      v-bind:toggle="valuee"
      v-on:change="$emit('change', $event.target.value)"
    > 
    
    <!-- value  input 的 原始属性-->
    <!-- valuee  指的是数据的 
    $event.target.value 原生事件 所指对象的 值
    -->
    <!-- <input type="checkbox" id="checkbox" v-model="checked"> -->
  <!-- <input type="text" v-bind:value="value" v-on:change="$emit('change', $event.target.checked)"> -->
  <!-- <my-checkbox
    :checked="foo"
    @change="val => { foo = val }"
    value="some value">
  </my-checkbox> -->
  <!-- <my-checkbox v-model="foo" value="some value"></my-checkbox> -->
</div>
  
  
</template>

<script>

  export default {
    model: {
      prop: 'valuee', // ？？ 要传递出去，或者说
      event: 'change' // 事件类型， 当组件对应的值改变时， 传递给父级
    },
    props: {
      values: String,
      // use `checked` as the prop which take the place of `value`
      valuee: {
        type: String,  // 从父级接收过来
        default: 'sss'
      }
    },
    data: function() {  
      return {   
      }
    },

    created(){
      
    },

    methods: {


    }
    
  }
</script>

<style lang="less" scoped>
  
</style>

