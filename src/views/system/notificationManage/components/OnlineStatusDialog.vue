<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-27
 * @Description: 在线用户状态弹窗组件
-->
<template>
  <el-dialog
    v-model="visible"
    :title="$t('notificationManage.onlineUserDialog')"
    width="800px"
    :close-on-click-modal="false"
    append-to-body
  >
    <!-- 在线用户统计信息 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :xs="24" :sm="12" :md="6" class="mb-3">
        <el-card shadow="hover" class="h-full">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-500 mb-1">
                {{ $t('notificationManage.totalOnlineUsers') }}
              </div>
              <div class="text-2xl font-bold text-primary">{{ onlineUsersList.length }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" class="mb-3">
        <el-card shadow="hover" class="h-full">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-500 mb-1">
                {{ $t('notificationManage.lastUpdateTime') }}
              </div>
              <div class="text-sm font-medium text-info">{{ lastUpdateTime }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" class="mb-3">
        <el-card shadow="hover" class="h-full">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-500 mb-1">
                {{ $t('notificationManage.refreshInterval') }}
              </div>
              <div class="text-sm font-medium text-warning">30s</div>
            </div>
            <el-link underline="never" @click="handleRefresh">
              <el-icon class="text-warning text-xl"><Refresh /></el-icon>
            </el-link>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" class="mb-3">
        <el-card shadow="hover" class="h-full">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-500 mb-1">
                {{ $t('notificationManage.dataStatus') }}
              </div>
              <div class="text-sm font-medium" :class="loading ? 'text-warning' : 'text-success'">
                {{ loading ? $t('notificationManage.loading') : $t('notificationManage.realTime') }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 在线用户列表 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-medium text-lg">
              {{ $t('notificationManage.onlineUsersList') }}
            </span>
          </div>
          <div class="flex gap-2">
            <el-button size="small" :icon="DocumentCopy" plain @click="handleCopyList">
              {{ $t('action.copy') }}
            </el-button>
          </div>
        </div>
      </template>

      <DataTable
        :data-list="onlineUsersList"
        :columns="tableColumns"
        :loading="loading"
        row-key="uuid"
        height="auto"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'username'">
            <div class="user-info">
              <span class="username">{{ record.username }}</span>
              <el-tag type="success" size="small" class="online-tag">
                {{ $t('notificationManage.online') }}
              </el-tag>
            </div>
          </template>
          <template v-else-if="column.key === 'lastActivity'">
            <span class="text-muted">{{ $t('notificationManage.justNow') }}</span>
          </template>
          <template v-else-if="column.key === 'operation'">
            <el-button link type="primary" size="small" @click="handleSendMessage(record)">
              {{ $t('notificationManage.sendMessage') }}
            </el-button>
          </template>
        </template>
      </DataTable>
    </el-card>
  </el-dialog>
</template>

<script setup lang="ts">
import { DocumentCopy, Refresh } from '@element-plus/icons-vue';

import { ElMessage } from 'element-plus';

// types
import type { UserListItem } from '@/api/system/userManage/data.d';
import type { TableColumn } from '@/components/DataTable/index.vue';

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'sendMessage', user: UserListItem): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * 弹窗显示状态
 */
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

/**
 * 加载状态
 */
const loading = ref(false);

/**
 * 在线用户列表
 */
const onlineUsersList = ref<UserListItem[]>([]);

/**
 * 最后更新时间
 */
const lastUpdateTime = ref('');

/**
 * 表格列配置
 */
const tableColumns = computed<TableColumn[]>(() => [
  {
    key: 'username',
    titleKey: 'form.username',
  },
  {
    key: 'email',
    titleKey: 'form.email',
  },
  {
    key: 'roleName',
    titleKey: 'form.role',
  },
  {
    key: 'lastActivity',
    titleKey: 'notificationManage.lastActivity',
  },
  {
    fixed: 'right',
    key: 'operation',
    titleKey: 'form.action',
  },
]);

/**
 * 加载在线用户状态
 */
const loadOnlineStatus = async () => {
  loading.value = true;
  try {
    const result = await notificationManageApi.getOnlineStatus();
    // 直接使用后端返回的完整用户数据
    onlineUsersList.value = result.data.onlineUsers || [];
    lastUpdateTime.value = new Date().toLocaleString();
  } catch (error) {
    console.error(i18nText('notificationManage.getOnlineStatusFailed'), error);
    ElMessage.error(i18nText('notificationManage.getOnlineStatusFailed'));
  } finally {
    loading.value = false;
  }
};

/**
 * 刷新数据
 */
const handleRefresh = () => {
  loadOnlineStatus();
};

/**
 * 复制用户列表
 */
const handleCopyList = async () => {
  try {
    const userNames = onlineUsersList.value.map((user) => user.username).join(', ');
    await navigator.clipboard.writeText(userNames);
    ElMessage.success(i18nText('notificationManage.copySuccess'));
  } catch (error) {
    console.error('复制失败:', error);
    ElMessage.error(i18nText('notificationManage.copyFailed'));
  }
};

/**
 * 发送消息
 */
const handleSendMessage = (user: UserListItem) => {
  emit('sendMessage', user);
  handleClose();
};

/**
 * 关闭弹窗
 */
const handleClose = () => {
  visible.value = false;
};

/**
 * 监听弹窗显示状态，加载数据
 */
watch(visible, (newVal) => {
  if (newVal) {
    loadOnlineStatus();

    // 定时刷新数据
    const timer = setInterval(loadOnlineStatus, 30000);

    // 弹窗关闭时清除定时器
    const stopWatcher = watch(visible, (val) => {
      if (!val) {
        clearInterval(timer);
        stopWatcher();
      }
    });
  }
});
</script>
