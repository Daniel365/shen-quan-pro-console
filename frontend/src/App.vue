<template>
  <el-config-provider :locale="locale">
    <router-view />
  </el-config-provider>
</template>

<script lang="ts" setup>
// 导入 Element Plus 中英文语言包
import en from 'element-plus/es/locale/lang/en';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

const appStore = useAppStore();
const accountStore = useAccountStore();
const locale = computed(() => (appStore.language === LanguageEnum.ZH ? zhCn : en));

// 初始化SSE连接
const { initSSE, disconnect } = useSSE();

/**
 * 启动SSE连接
 */
const startSSEConnection = async () => {
  if (accountStore.accessToken) {
    console.log('App.vue: 初始化SSE连接');

    // 建立SSE连接（全局只初始化一次）
    await initSSE();
  }
};

/**
 * 停止SSE连接
 */
const stopSSEConnection = () => {
  console.log('App.vue: 停止SSE连接');
  disconnect();
};

// 监听登录状态变化
watch(
  () => accountStore.accessToken,
  (newToken, oldToken) => {
    if (newToken && !oldToken) {
      // 用户登录，启动SSE
      startSSEConnection();
    } else if (!newToken && oldToken) {
      // 用户登出，停止SSE
      stopSSEConnection();
    }
  }
);

onMounted(() => {
  // 组件挂载时，如果用户已登录，启动SSE连接
  if (accountStore.accessToken) {
    startSSEConnection();
  }
});

onUnmounted(() => {
  // 组件卸载时停止SSE连接
  stopSSEConnection();
});
</script>
