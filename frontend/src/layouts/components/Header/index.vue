<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-08-27 18:18:15
 * @Description: 布局顶部组件
-->
<template>
  <div class="layout-header-container">
    <div class="header-left">
      <!-- 折叠按钮 -->
      <CollapseBtn />
      <!-- 面包屑 -->
      <Breadcrumb />
    </div>

    <div class="header-right">
      <!-- 语言切换 -->
      <LangSelect />

      <!-- 消息通知 -->
      <Notification />

      <!-- 账号信息 -->
      <AccountSelect />

      <!-- 系统设置 -->
      <!-- <el-link underline="never" @click="emit('openSettings')">
        <icon-font name="setting" size="20px" />
      </el-link> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
// 定义事件
const emit = defineEmits<{
  (e: 'openSettings'): void;
}>();
</script>

<style lang="less" scoped>
.layout-header-container {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
</style>
