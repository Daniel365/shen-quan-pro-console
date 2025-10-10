<template>
  <!-- 消息通知图标和数量 -->
  <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
    <el-link class="v-0%!" underline="never" @click="onClick">
      <icon-font name="bell" font-size="20px" />
    </el-link>
  </el-badge>

  <!-- 发送通知按钮（管理员） -->
  <el-link
    v-if="showSendButton"
    underline="never"
    :title="$t('notificationManage.sendNotification')"
    @click="showSendDialog = true"
  >
    <icon-font name="edit" font-size="20px" />
  </el-link>

  <!-- 发送通知弹窗 -->
  <SendDialog v-model="showSendDialog" @success="handleSendSuccess" />
</template>

<script setup lang="ts">
import { ElNotification } from 'element-plus';

import { isRoot } from '@/constants';
// components
import SendDialog from '@/views/system/notificationManage/send.vue';

const { goToPage } = useRouteUtil();
const accountStore = useAccountStoreHook();
const appStore = useAppStore();

// 使用SSE模块进行事件监听
const { onEvent } = useSSE();

/**
 * 发送通知弹窗显示状态
 */
const showSendDialog = ref(false);

/** 未读数量 */
const unreadCount = computed(() => {
  return appStore.unreadCount;
});
/**
 * 是否显示发送通知按钮（管理员权限）
 */
const showSendButton = computed(() => {
  return isRoot(accountStore.accountInfo?.roleCode);
});

/**
 * 点击通知图标
 */
function onClick() {
  goToPage(RouterPath.NOTIFICATION_LIST);
}

/**
 * 获取未读数量
 */
function getUnreadCount() {
  appStore.getUnreadCount();
}

/**
 * 发送成功回调
 */
const handleSendSuccess = () => {
  // 刷新未读数量
  getUnreadCount();
};

/**
 * 处理新通知事件
 */
const handleNewNotification = (notification: any) => {
  console.log('收到新通知:', notification);

  // 自动更新未读数量
  appStore.incrementUnreadCount();

  // 显示页面通知
  showPageNotification(notification);
};

/**
 * 显示页面内通知
 */
const showPageNotification = (notification: any) => {
  const typeMap: any = {
    error: 'error',
    info: 'info',
    success: 'success',
    warning: 'warning',
  } as const;

  ElNotification({
    duration: 5000,
    message: notification.content,
    showClose: true,
    title: notification.title,
    type: typeMap[notification.notificationType] || 'info',
  });
};

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  // 获取未读数量
  getUnreadCount();

  // 启动定时刷新未读数量
  appStore.startUnreadCountRefresh(300000);

  // 监听新通知事件
  const cleanup = onEvent(ListenerEventEnum.NEW_NOTIFICATION, handleNewNotification);

  onUnmounted(() => {
    appStore.stopUnreadCountRefresh();
    cleanup(); // 清理事件监听
  });
});
</script>

<style scoped lang="scss">
.notification-wrapper {
  display: flex;
  align-items: center;
}
</style>
