<template>
  <!-- 收益记录管理页面 -->
  <div class="profit-manage-page">
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
      :api="profitManageApi.getList"
      :search-params="searchParams"
      :columns="columns"
      :selectable="true"
    >
      <!-- 操作按钮 -->
      <template #caption>
        <ButtonGroup :options="actionButtonGroup" />
      </template>
      <template #bodyCell="{ column, record }">
        <!-- 收益金额列渲染 -->
        <template v-if="column.key === 'amount'">
          <span :class="record.type === ProfitTypeEnum.INCOME ? 'text-green-500' : 'text-red-500'">
            {{ record.type === ProfitTypeEnum.INCOME ? '+' : '-' }}¥{{ record.amount }}
          </span>
        </template>

        <!-- 收益来源列渲染 -->
        <template v-else-if="column.key === 'source'">
          <StatusText :options="profitSourceOptions" :value="record.source" />
        </template>

        <!-- 收益类型列渲染 -->
        <template v-else-if="column.key === 'type'">
          <StatusText :options="profitTypeOptions" :value="record.type" />
        </template>

        <!-- 收益状态列渲染 -->
        <template v-else-if="column.key === 'status'">
          <StatusText :options="profitStatusOptions" :value="record.status" />
        </template>

        <!-- 创建时间列渲染 -->
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDateTime(record.createdAt) }}
        </template>

        <!-- 结算时间列渲染 -->
        <template v-else-if="column.key === 'settledAt'">
          {{ record.settledAt ? formatDateTime(record.settledAt) : '-' }}
        </template>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';

// type
import type { ProfitListItem, ProfitListParams } from '@/api/app/profitManage/types';

// utils
import { defaultSearchParams, exportFields, tableColumns } from './utils/const';
import { profitSourceOptions, profitTypeOptions, profitStatusOptions } from './utils/options';
import { ProfitTypeEnum } from './utils/enum';

// 表格引用
const tableRef = ref();
// 加载状态
const loading = ref(false);
// 数据列表
const tableData = ref<ProfitListItem[]>([]);
// 选中的行数据
const selectedRows = ref<ProfitListItem[]>([]);

// 搜索参数
const searchParams = reactive<ProfitListParams>({
  ...defaultSearchParams,
});

// 搜索字段配置
const searchFields = computed(() => [
  {
    key: 'profitNo',
    label: i18nText('profitManage.profitNoLabel'),
    placeholder: i18nText('profitManage.profitNoPlaceholder'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'userName',
    label: i18nText('profitManage.userNameLabel'),
    placeholder: i18nText('profitManage.userNamePlaceholder'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'activityName',
    label: i18nText('profitManage.activityNameLabel'),
    placeholder: i18nText('profitManage.activityNamePlaceholder'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'source',
    label: i18nText('profitManage.sourceLabel'),
    options: profitSourceOptions,
    placeholder: i18nText('profitManage.sourcePlaceholder'),
    type: FormTypeEnum.SELECT,
  },
  {
    key: 'type',
    label: i18nText('profitManage.typeLabel'),
    options: profitTypeOptions,
    placeholder: i18nText('profitManage.typePlaceholder'),
    type: FormTypeEnum.SELECT,
  },
  {
    key: 'status',
    label: i18nText('profitManage.statusLabel'),
    options: profitStatusOptions,
    placeholder: i18nText('profitManage.statusPlaceholder'),
    type: FormTypeEnum.SELECT,
  },
  {
    key: 'startTime',
    label: i18nText('profitManage.startTimeLabel'),
    placeholder: i18nText('profitManage.startTimePlaceholder'),
    type: FormTypeEnum.DATE_PICKER,
  },
  {
    key: 'endTime',
    label: i18nText('profitManage.endTimeLabel'),
    placeholder: i18nText('profitManage.endTimePlaceholder'),
    type: FormTypeEnum.DATE_PICKER,
  },
]);

// 表格列配置
const columns = tableColumns;

/** 操作按钮组 */
const actionButtonGroup = computed<ButtonGroupOptions[]>(() => [
  {
    disabled: selectedRows.value.length === 0,
    handler: () => {
      handleExportSelected();
    },
    labelKey: 'action.export',
    permission: [RequestPath.APP_PROFIT_EXPORT],
    type: 'primary',
    value: 'export',
  },
]);

// 处理搜索和重置
const handleRefresh = () => {
  tableRef.value?.refresh();
};

// 处理导出选中数据
const handleExportSelected = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.error(i18nText('action.pleaseSelect'));
    return;
  }

  try {
    loading.value = true;

    const response = await profitManageApi.onExportData({
      ...searchParams,
      exportFields: exportFields.map((field) => field.key),
    });

    // 处理导出文件下载
    const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `收益记录_${new Date().getTime()}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);

    ElMessage.success(i18nText('action.exportSuccess'));
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error(i18nText('action.exportFailed'));
  } finally {
    loading.value = false;
  }
};
</script>