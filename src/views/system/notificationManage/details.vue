<template>
  <el-dialog
    v-model="visible"
    :title="$t('notificationManage.detail')"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="notification" class="notification-detail">
      <div class="detail-item">
        <label>{{ $t('form.title') }}：</label>
        <span>{{ notification.title }}</span>
      </div>

      <div class="detail-item">
        <label>{{ $t('form.type') }}：</label>
        <StatusText :options="notificationTypeOptions" :value="notification.type" />
      </div>

      <div class="detail-item">
        <label>{{ $t('notificationManage.sender') }}：</label>
        <span>{{ notification.senderName || $t('notificationManage.system') }}</span>
      </div>

      <div class="detail-item">
        <label>{{ $t('form.createTime') }}：</label>
        <span>{{ formatDate(notification.createdAt) }}</span>
      </div>

      <div class="detail-item">
        <label>{{ $t('form.status') }}：</label>
        <StatusText :options="notificationReadStatusOptions" :value="notification.isRead" />
      </div>

      <div class="detail-item content-item">
        <label>{{ $t('form.content') }}：</label>
        <div class="content-text">{{ notification.content }}</div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">
        {{ $t('action.close') }}
      </el-button>
      <el-button
        v-if="notification && !notification.isRead"
        type="primary"
        :loading="markReadLoading"
        :disabled="markReadLoading"
        @click="handleMarkAsRead"
      >
        {{ $t('notificationManage.markAsRead') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';

// utils
import type { NotificationListItem } from '@/api/system/notificationManage/types';
import { formatDate } from '@/utils/format/dateTime';

import { notificationReadStatusOptions, notificationTypeOptions } from './utils/options';
// type

interface Props {
  /** 是否显示对话框 */
  visible: boolean;
  /** 通知数据 */
  notification?: NotificationListItem;
}

interface Emits {
  /** 关闭对话框 */
  (e: 'update:visible', value: boolean): void;
  /** 标记已读后刷新数据 */
  (e: 'refresh'): void;
}

/**
 * 组件属性
 */
const props = defineProps<Props>();

/**
 * 组件事件
 */
const emit = defineEmits<Emits>();

/**
 * 标记已读加载状态
 */
const markReadLoading = ref(false);

/**
 * 双向绑定显示状态
 */
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

/**
 * 处理关闭对话框
 */
const handleClose = () => {
  emit('update:visible', false);
};

/**
 * 处理标记为已读
 */
const handleMarkAsRead = async () => {
  if (!props.notification) return;

  markReadLoading.value = true;
  try {
    await notificationManageApi.markAsRead({ uuid: props.notification.uuid });
    ElMessage.success(i18nText('notificationManage.markReadSuccess'));

    // 标记为已读后关闭对话框并刷新数据
    props.notification.isRead = true;
    emit('refresh');
    handleClose();
  } catch (error) {
    ElMessage.error(i18nText('notificationManage.markReadFailed'));
  } finally {
    markReadLoading.value = false;
  }
};

/**
 * 监听visible变化，重置状态
 */
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      markReadLoading.value = false;
    }
  }
);
</script>

<style scoped>
.notification-detail {
  padding: 0;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  line-height: 1.5;
}

.detail-item label {
  min-width: 80px;
  font-weight: 500;
  color: #606266;
}

.detail-item span {
  flex: 1;
  color: #303133;
}

.content-item {
  align-items: flex-start;
}

.content-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 4px;
}
</style>
