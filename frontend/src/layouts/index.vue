<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-08-27 18:18:15
 * @Description: layout容器
-->
<template>
  <el-container class="layout-container">
    <el-aside class="layout-aside" :class="{ 'is-collapse': collapse }">
      <system-logo :collapse="collapse" />
      <system-menu :collapse="collapse" :data-list="menuList" />
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <LayoutHeader @open-settings="onOpenSettings" />
      </el-header>
      <el-main class="layout-content">
        <LayoutContent />
      </el-main>
      <el-footer class="layout-footer">
        <LayoutFooter />
      </el-footer>
    </el-container>
  </el-container>
  <!-- 设置面板 - 独立于布局组件 -->
  <!-- <SystemSettings v-if="isShowSettings" /> -->
</template>

<script lang="ts" setup>
import { defaultSettings } from '@/config';

// components
import LayoutContent from './components/Content/index.vue';
import LayoutFooter from './components/Footer/index.vue';
import LayoutHeader from './components/Header/index.vue';

const settingStore = useSettingsStore();
const permissionStore = usePermissionStore();
const appStore = useAppStore();

// 侧边栏展开状态
const collapse = computed(() => appStore.sidebar.opened);

// 菜单数据
const menuList = computed(() => permissionStore.routes);

// 是否显示设置面板
const isShowSettings = computed(() => defaultSettings.showSettings);

// 打开设置面板
const onOpenSettings = () => {
  settingStore.settingsVisible = true;
};
</script>

<style lang="scss" scoped>
.layout-container {
  min-height: 100vh;
}

.layout-aside {
  background-color: var(--menu-background);
  position: relative;
  width: 210px;
  transition: width 0.3s ease;
  overflow: hidden;

  &.is-collapse {
    width: 64px;
  }
}

.layout-header {
  height: 50px;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  background: var(--el-bg-color-page);
}

.el-container {
  background: var(--el-container-bg-color);
}

.layout-footer {
  text-align: center;
  padding: 12px;
}
</style>
