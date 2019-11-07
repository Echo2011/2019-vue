<template>
  <div class="main-header">
    <div class="button">
      <slot></slot>
    </div>
    <div class="search-input">
      <slot name="search-input"></slot>
    </div>
  </div>
</template>

<script>
export default {
  
}
</script>

<style lang="less" scoped>
  .main-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .search-input {
    display: flex;
    align-items: center;
  }
</style>

