<template>
  <!-- 有下级时 -->
  <el-sub-menu v-if="hasChildren" :index="route.path">
    <template #title>
      <MenuItemContent v-if="meta" :icon="meta.icon" :title="meta.title" />
    </template>

    <MenuItem
      v-for="child in route.children"
      :key="child.path"
      :route="child"
      @menu-click="$emit('menu-click', $event)"
    />
  </el-sub-menu>
  <!-- 无下级时 -->
  <el-menu-item v-else :index="route.path" @click="handleMenuClick">
    <MenuItemContent v-if="meta" :icon="meta.icon" />
    <template #title>
      <MenuItemContent v-if="meta" :title="meta.title" />
    </template>
  </el-menu-item>
</template>

<script setup lang="ts">
import { MenuMeta } from '@/api/accountManage/types';

import type { RouteRecordRaw } from 'vue-router';

interface Props {
  route: RouteRecordRaw;
}

interface Emits {
  (e: 'menu-click', route: RouteRecordRaw): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const meta: globalThis.ComputedRef<MenuMeta> = computed(
  () => props.route.meta || { icon: '', title: '' }
);

const hasChildren = computed(() => {
  return props.route.children && props.route.children.length > 0;
});

const handleMenuClick = () => {
  emit('menu-click', props.route);
};
</script>
