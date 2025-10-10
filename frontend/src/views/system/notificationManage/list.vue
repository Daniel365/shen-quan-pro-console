<template>
  <!-- 消息通知页面 -->
  <div class="notification-manage-page">
    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchParams"
      :fields="searchFields"
      :loading="loading"
      @search="handleRefresh"
      @reset="handleRefresh"
    />

    <!-- 数据表格 -->
    <DataTable
      ref="tableRef"
      v-model:loading="loading"
      v-model:data-list="tableData"
      :api="notificationManageApi.getList"
      :search-params="searchParams"
      :columns="columns"
    >
      <template #caption>
        <el-button
          type="primary"
          :disabled="unreadCount === 0"
          :loading="markAllLoading"
          @click="handleMarkAllRead"
        >
          {{ $t('notificationManage.markAllRead') }} ({{ unreadCount }})
        </el-button>
      </template>
      <template #bodyCell="{ column, record }">
        <!-- 类型列渲染 -->
        <template v-if="column.key === 'type'">
          <StatusText :options="notificationTypeOptions" :value="record.type" />
        </template>

        <!-- 状态列渲染 -->
        <template v-if="column.key === 'isRead'">
          <StatusText :options="notificationReadStatusOptions" :value="record.isRead" />
        </template>

        <!-- 操作列渲染 -->
        <template v-if="column.key === 'action'">
          <el-button
            v-if="!record.isRead"
            type="primary"
            link
            :loading="markReadLoading[record.uuid]"
            @click="handleMarkAsRead(record)"
          >
            {{ $t('notificationManage.markAsRead') }}
          </el-button>
          <el-button type="info" link @click="handleViewDetail(record)">
            {{ $t('action.view') }}
          </el-button>
        </template>
      </template>
    </DataTable>

    <!-- 通知详情对话框 -->
    <NotificationDetails
      v-model:visible="detailVisible"
      :notification="currentNotification"
      @refresh="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';

// utils
// type
import type {
  NotificationListItem,
  NotificationListParams,
} from '@/api/system/notificationManage/types';

// components
import NotificationDetails from './details.vue';
import { notificationReadStatusOptions, notificationTypeOptions } from './utils/options';

/**
 * App Store
 */
const appStore = useAppStore();

/**
 * 表格组件引用
 */
const tableRef = ref();

/**
 * 加载状态
 */
const loading = ref(false);
const markAllLoading = ref(false);
const markReadLoading = ref<Record<string, boolean>>({});

/**
 * 表格数据列表
 */
const tableData = ref<NotificationListItem[]>([]);

/**
 * 未读消息数量（使用app.store）
 */
const unreadCount = computed(() => appStore.unreadCount);

/**
 * 详情对话框显示状态
 */
const detailVisible = ref(false);

/**
 * 当前查看的通知
 */
const currentNotification = ref<NotificationListItem>();

/**
 * 搜索参数
 */
const searchParams = reactive<NotificationListParams>({
  isRead: undefined,
  title: '',
  type: undefined,
});

/**
 * 搜索表单字段配置
 * 用于通知列表的搜索功能，包含标题、类型和状态三个搜索条件
 */
const searchFields = computed(() => [
  {
    key: 'title',
    label: i18nText('form.title'),
    placeholder: i18nText('notificationManage.enterTitle'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'type',
    label: i18nText('form.type'),
    options: notificationTypeOptions,
    placeholder: i18nText('notificationManage.selectType'),
    type: FormTypeEnum.SELECT,
  },
  {
    key: 'isRead',
    label: i18nText('form.status'),
    options: notificationReadStatusOptions,
    placeholder: i18nText('notificationManage.selectStatus'),
    type: FormTypeEnum.SELECT,
  },
]);

/**
 * 表格列配置
 */
const columns = [
  { key: 'title', titleKey: 'form.title' },
  { key: 'content', showOverflowTooltip: true, titleKey: 'form.content', width: 300 },
  { key: 'type', titleKey: 'form.type', width: 100 },
  { key: 'senderName', titleKey: 'notificationManage.sender', width: 120 },
  { key: 'isRead', titleKey: 'form.status', width: 100 },
  { key: 'createdAt', titleKey: 'form.createTime', width: 150 },
  { fixed: 'right', key: 'action', titleKey: 'form.action', width: 220 },
];

/**
 * 处理搜索和重置操作
 */
const handleRefresh = () => {
  tableRef.value?.refresh();
  appStore.getUnreadCount();
};

/**
 * 标记单条通知为已读
 */
const handleMarkAsRead = async (record: NotificationListItem) => {
  markReadLoading.value[record.uuid] = true;
  try {
    const response = await notificationManageApi.markAsRead({ uuid: record.uuid });
    handleReturnResults({
      onSuccess: () => {
        ElMessage.success(i18nText('notificationManage.markReadSuccess'));
        record.isRead = true;
        appStore.decrementUnreadCount();
      },
      params: response,
    });
  } catch (error) {
    ElMessage.error(i18nText('notificationManage.markReadFailed'));
  } finally {
    markReadLoading.value[record.uuid] = false;
  }
};

// 从详情对话框标记为已读的逻辑已移至NotificationDetails组件中

/**
 * 标记全部为已读
 */
const handleMarkAllRead = async () => {
  if (unreadCount.value === 0) return;

  try {
    await ElMessageBox.confirm(
      i18nText('notificationManage.markAllReadConfirm'),
      i18nText('action.confirm'),
      {
        cancelButtonText: i18nText('action.cancel'),
        confirmButtonText: i18nText('action.confirm'),
        type: 'warning',
      }
    );

    markAllLoading.value = true;
    const response = await notificationManageApi.markAllAsRead();
    handleReturnResults({
      onSuccess: (res) => {
        const { updatedCount } = res.data;
        ElMessage.success(
          i18nText('notificationManage.markAllReadSuccess', {
            count: updatedCount,
          })
        );
      },
      params: response,
    });

    // 更新本地数据
    tableData.value.forEach((item) => {
      item.isRead = true;
    });
    appStore.resetUnreadCount();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(i18nText('notificationManage.markAllReadFailed'));
    }
  } finally {
    markAllLoading.value = false;
  }
};

/**
 * 查看通知详情
 */
const handleViewDetail = (record: NotificationListItem) => {
  currentNotification.value = record;
  detailVisible.value = true;
};

watch(
  () => unreadCount.value,
  (val) => {
    if (+val > 0) {
      handleRefresh();
    }
  }
);
</script>
