<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-08-27 18:18:15
 * @Description: 布局内容组件
-->
<template>
  <div class="layout-content-container">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<style scoped>
.layout-content-container {
  padding: 24px;
  background: var(--el-bg-color-page);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-radius: 8px;
  min-height: calc(100vh - 200px);
}
</style>
