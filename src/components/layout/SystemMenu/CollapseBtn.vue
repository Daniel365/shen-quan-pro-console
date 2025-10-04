<template>
  <el-link class="collapse-btn" @click="toggleSideBar">
    <el-icon :size="20">
      <Fold v-if="!collapsed" />
      <Expand v-else />
    </el-icon>
  </el-link>
</template>

<script lang="ts" setup>
import { Fold, Expand } from "@element-plus/icons-vue";

const appStore = useAppStore();

// 侧边栏展开状态
const collapsed = computed(() => appStore.sidebar.opened);
// 切换侧边栏展开/折叠状态

function toggleSideBar() {
  appStore.toggleSidebar();
}
</script>
