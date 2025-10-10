<template>
  <!-- 活动管理页面 -->
  <div class="activity-manage-page">
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
      v-model:selected-rows="selectedRows"
      :api="activityManageApi.getList"
      :search-params="searchParams"
      :columns="tableColumns"
      :selectable="true"
    >
      <!-- 新增按钮 -->
      <template #caption>
        <ButtonGroup :options="actionButtonGroup" />
      </template>
      <template #bodyCell="{ column, record }">
        <!-- 封面图列渲染 -->
        <!-- <template v-if="column.key === 'coverImage'">
          <el-image
            :src="record.coverImage"
            :preview-src-list="[record.coverImage]"
            fit="cover"
            style="width: 80px; height: 60px; border-radius: 4px"
          />
        </template> -->

        <!-- 报名人数列渲染 -->
        <template v-if="column.key === 'regCount'">
          <span>{{ record.regCount }}/{{ record.regLimit }}</span>
        </template>

        <!-- 状态列渲染 -->
        <template v-else-if="column.key === 'status'">
          <StatusText :options="activityStatusOptions" :value="record.status" />
        </template>

        <!-- 创建时间列渲染 -->
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDateTime(record.createdAt) }}
        </template>

        <!-- 操作列渲染 -->
        <template v-else-if="column.key === 'action'">
          <ButtonGroup :options="tableButtonGroup" :record="record" link />
        </template>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';

// type
import type { ActivityListItem, ActivityListParams } from '@/api/app/activityManage/types';
import { ActionTypeEnum } from '@/enums';

import { activityStatusOptions } from './utils/options';

// 表格引用
const tableRef = ref();
// 加载状态
const loading = ref(false);
// 数据来源
const tableData = ref<ActivityListItem[]>([]);
// 选中的行数据
const selectedRows = ref<ActivityListItem[]>([]);
// 编辑抽屉显示状态
const editVisible = ref(false);
// 当前编辑活动
const currentActivity = ref<ActivityListItem>();

// 搜索参数
const searchParams = reactive<ActivityListParams>({
  status: undefined,
  title: '',
});

// 搜索字段配置
const searchFields = computed(() => [
  {
    key: 'title',
    label: i18nText('activityManage.titleLabel'),
    placeholder: i18nText('activityManage.titlePlaceholder'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'status',
    label: i18nText('activityManage.statusLabel'),
    options: activityStatusOptions,
    placeholder: i18nText('activityManage.statusPlaceholder'),
    type: FormTypeEnum.SELECT,
  },
]);

// 表格列配置
const tableColumns = [
  {
    key: 'title',
    minWidth: 200,
    multilingualKey: 'translations',
    titleKey: 'activityManage.title',
  },
  { key: 'location', titleKey: 'activityManage.location', width: 150 },
  { key: 'startTime', titleKey: 'activityManage.startTime', width: 180 },
  { key: 'endTime', titleKey: 'activityManage.endTime', width: 180 },
  { align: 'center', key: 'regCount', titleKey: 'activityManage.regCount', width: 120 },
  { align: 'center', key: 'status', titleKey: 'activityManage.status', width: 100 },
  { align: 'center', key: 'basePrice', titleKey: 'activityManage.basePrice', width: 120 },
  { key: 'createdAt', titleKey: 'form.createTime', width: 180 },
  { align: 'center', fixed: 'right', key: 'action', titleKey: 'form.action', width: 300 },
];

/** 操作按钮组 */
const actionButtonGroup = computed<ButtonGroupOptions[]>(() => [
  {
    labelKey: 'action.add',
    permission: [RequestPath.APP_ACTIVITY_CREATE],
    to: RouterPath.ACTIVITY_FORM,
    type: 'primary',
    value: 'create',
  },
  {
    disabled: selectedRows.value.length === 0,
    handler: () => {
      const data = selectedRows.value;
      if (data.length === 0) {
        ElMessage.error(i18nText('action.pleaseSelect'));
      } else {
        handleDelete(data.map((item) => item.uuid));
      }
    },
    labelKey: 'action.delete',
    permission: [RequestPath.APP_ACTIVITY_DELETE],
    type: 'danger',
    value: 'delete',
  },
]);

/** 表格操作按钮组 */
const tableButtonGroup: ButtonGroupOptions[] = [
  {
    labelKey: 'action.edit',
    permission: [RequestPath.APP_ACTIVITY_UPDATE],
    query: (record: ActivityListItem) => {
      return {
        actionType: ActionTypeEnum.EDIT,
        uuid: record.uuid,
      };
    },
    to: RouterPath.ACTIVITY_FORM,
    type: 'primary',
    value: 'edit',
  },
  {
    labelKey: 'action.copy',
    permission: [RequestPath.APP_ACTIVITY_CREATE],
    query: (record: ActivityListItem) => {
      return {
        actionType: ActionTypeEnum.COPY,
        uuid: record.uuid,
      };
    },
    to: RouterPath.ACTIVITY_FORM,
    type: 'success',
    value: 'copy',
  },
  {
    labelKey: 'action.details',
    permission: [RequestPath.APP_ACTIVITY_DETAILS],
    query: (record: ActivityListItem) => {
      return {
        actionType: ActionTypeEnum.DETAIL,
        uuid: record.uuid,
      };
    },
    to: RouterPath.ACTIVITY_FORM,
    value: 'detail',
  },
  {
    handler: (record: ActivityListItem) => {
      handleDelete([record.uuid]);
    },
    labelKey: 'action.delete',
    permission: [RequestPath.APP_ACTIVITY_DELETE],
    type: 'danger',
    value: 'delete',
  },
];

// 处理搜索和重置
const handleRefresh = () => {
  tableRef.value?.refresh();
};

// 处理删除活动
const handleDelete = (activityUuids: string[]) => {
  ElMessageBox.confirm(
    i18nText(
      activityUuids.length > 1
        ? 'activityManage.deleteConfirmMultiple'
        : 'activityManage.deleteConfirmSingle',
      {
        count: activityUuids.length,
      }
    ),
    i18nText('action.confirmDelete')
  )
    .then(async () => {
      const response = await activityManageApi.onDelete({ activityUuids });
      handleReturnResults({
        onSuccess: () => {
          ElMessage.success(i18nText('action.deleteSuccess'));
          tableRef.value?.refresh();
          // 清空选中状态
          selectedRows.value = [];
        },
        params: response,
      });
    })
    .catch(() => {
      // 用户取消删除
    });
};
</script>
