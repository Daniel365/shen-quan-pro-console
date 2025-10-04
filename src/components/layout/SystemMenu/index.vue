<template>
  <el-menu
    :default-active="activeMenuPath"
    :collapse="collapse"
    :background-color="menuThemeProps.backgroundColor"
    :text-color="menuThemeProps.textColor"
    :active-text-color="menuThemeProps.activeTextColor"
    :popper-effect="theme"
    :unique-opened="uniqueOpened"
    :collapse-transition="false"
    :mode="mode"
    :border-collapse="false"
    @select="handleMenuSelect"
  >
    <MenuItem
      v-for="route in menuRoutes"
      :key="route.path"
      :route="route"
      @menu-click="handleMenuClick"
    />
  </el-menu>
</template>

<script name="LeftMenu" setup lang="ts">
import variables from "@/assets/style/theme/variables.module.scss";

import type { RouteRecordRaw } from "vue-router";
// theme 变量

interface Props {
  dataList: RouteRecordRaw[];
  collapse?: boolean;
  uniqueOpened?: boolean;
  mode?: "horizontal" | "vertical";
}

interface Emits {
  (e: "menu-select", index: string, indexPath: string[]): void;
  (e: "menu-click", route: RouteRecordRaw): void;
}

const props = withDefaults(defineProps<Props>(), {
  collapse: false,
  mode: "vertical",
  uniqueOpened: true,
});

const emit = defineEmits<Emits>();
const settingsStore = useSettingsStore();
const { route, router } = useRouteUtil();

const menuRoutes = computed(() => {
  return filterMenuRoutes(props.dataList);
});

// 获取主题
const theme = computed(() => settingsStore.theme);

// 获取浅色主题下的侧边栏配色方案
const sidebarColorScheme = computed(() => settingsStore.sidebarColorScheme);

// 菜单主题属性
const menuThemeProps = computed(() => {
  const isDarkOrClassicBlue =
    theme.value === "dark" || sidebarColorScheme.value === SidebarColor.CLASSIC_BLUE;

  return {
    activeTextColor: isDarkOrClassicBlue ? variables["menu-active-text"] : undefined,
    backgroundColor: isDarkOrClassicBlue ? variables["menu-background"] : undefined,
    textColor: isDarkOrClassicBlue ? variables["menu-text"] : undefined,
  };
});

// 计算当前激活的菜单项
const activeMenuPath = computed((): string => {
  const { meta, path } = route;

  // 如果路由meta中设置了activeMenu，则使用它（用于处理一些特殊情况，如详情页）
  if (meta?.activeMenu && typeof meta.activeMenu === "string") {
    return meta.activeMenu;
  }

  // 否则使用当前路由路径
  return path;
});

const filterMenuRoutes = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
  return routes.filter((route) => {
    if (route.meta?.hidden) return false;

    if (route.children && route.children.length > 0) {
      route.children = filterMenuRoutes(route.children);
      return route.children.length > 0 || !route.meta?.hideIfEmpty;
    }

    return true;
  });
};

const handleMenuSelect = (index: string, indexPath: string[]) => {
  emit("menu-select", index, indexPath);
};

const handleMenuClick = (clickedRoute: RouteRecordRaw) => {
  if (clickedRoute.path && !hasChildren(clickedRoute)) {
    router.push(clickedRoute.path);
  }
  emit("menu-click", clickedRoute);
};

const hasChildren = (route: RouteRecordRaw): boolean => {
  return !!(route.children && route.children.length > 0);
};
</script>
