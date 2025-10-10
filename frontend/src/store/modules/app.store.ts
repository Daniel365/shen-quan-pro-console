/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-30 19:19:16
 * @Description: 网站公共配置
 */

import { defaultSettings } from "@/config";
import { store } from "@/store";

export const useAppStore = defineStore("app", () => {
  // 设备类型
  const device = useStorage("device", DeviceEnum.DESKTOP);
  // 语言
  const language = useStorage("language", defaultSettings.language);
  // 侧边栏状态
  const sidebarStatus = useStorage("sidebarStatus", SidebarStatus.CLOSED);
  const sidebar = reactive({
    opened: sidebarStatus.value === SidebarStatus.OPENED,
    withoutAnimation: false,
  });

  // 顶部菜单激活路径
  const activeTopMenuPath = useStorage("activeTopMenuPath", "");

  // 未读消息数量
  const unreadCount = ref(0);

  // 刷新定时器
  let refreshTimer: NodeJS.Timeout | null = null;

  /**
   * 切换语言
   *
   * @param val
   */
  function changeLanguage(val: string) {
    language.value = val;
  }

  // 切换侧边栏
  function toggleSidebar() {
    sidebar.opened = !sidebar.opened;
    sidebarStatus.value = sidebar.opened ? SidebarStatus.OPENED : SidebarStatus.CLOSED;
  }

  // 关闭侧边栏
  function closeSideBar() {
    sidebar.opened = false;
    sidebarStatus.value = SidebarStatus.CLOSED;
  }

  // 打开侧边栏
  function openSideBar() {
    sidebar.opened = true;
    sidebarStatus.value = SidebarStatus.OPENED;
  }

  /**
   * 获取未读消息数量
   */
  async function getUnreadCount() {
    try {
      const result = await notificationManageApi.getUnreadCount();
      unreadCount.value = result.data.unreadCount;
      return unreadCount.value;
    } catch (error) {
      console.error("获取未读数量失败:", error);
      unreadCount.value = 0;
      return 0;
    }
  }

  /**
   * 设置未读数量
   */
  function setUnreadCount(count: number) {
    unreadCount.value = count;
  }

  /**
   * 增加未读数量
   */
  function incrementUnreadCount(count: number = 1) {
    unreadCount.value += count;
  }

  /**
   * 减少未读数量
   */
  function decrementUnreadCount(count: number = 1) {
    unreadCount.value = Math.max(0, unreadCount.value - count);
  }

  /**
   * 重置未读数量
   */
  function resetUnreadCount() {
    unreadCount.value = 0;
  }

  /**
   * 开始定时刷新未读数量
   */
  function startUnreadCountRefresh(interval: number = 300000) {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
    refreshTimer = setInterval(getUnreadCount, interval);
  }

  /**
   * 停止定时刷新未读数量
   */
  function stopUnreadCountRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }

  return {
    activeTopMenuPath,
    changeLanguage,
    closeSideBar,
    decrementUnreadCount,
    device,
    getUnreadCount,
    incrementUnreadCount,
    language,
    openSideBar,
    resetUnreadCount,
    setUnreadCount,
    sidebar,
    sidebarStatus,
    startUnreadCountRefresh,
    stopUnreadCountRefresh,
    toggleSidebar,
    unreadCount,
  };
});

/**
 * 用于在组件外部（如在Pinia Store 中）使用 Pinia 提供的 store 实例。
 * 官方文档解释了如何在组件外部使用 Pinia Store：
 * https://pinia.vuejs.org/core-concepts/outside-component-usage.html#using-a-store-outside-of-a-component
 */
export function useAppStoreHook() {
  return useAppStore(store);
}
