<template>
  <!-- 操作日志页面 -->
  <div class="operation-log-page">
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
      :api="operationLogApi.getList"
      :search-params="searchParams"
      :columns="columns"
    >
      <template #expand="{ row }">
        <UserAgentInfo :user-agent="row.userAgent" />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
// type
import type { OperationLogListItem } from '@/api/system/operationLog/data.d';

// 表格引用
const tableRef = ref();
// 加载状态
const loading = ref(false);
// 数据来源
const tableData = ref<OperationLogListItem[]>([]);

// 搜索参数
const searchParams = reactive({
  action: '',
  ipAddress: '',
  username: '',
});

// 搜索字段配置
const searchFields = computed(() => [
  {
    key: 'action',
    label: i18nText('form.action'),
    placeholder: i18nText('form.enterAction'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'username',
    label: i18nText('form.username'),
    placeholder: i18nText('form.enterUsername'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'ipAddress',
    label: i18nText('form.ipAddress'),
    placeholder: i18nText('form.enterIpAddress'),
    type: FormTypeEnum.INPUT,
  },
]);

// 表格列配置
const columns = [
  { key: 'username', titleKey: 'form.username' },
  { key: 'description', titleKey: 'form.description' },
  { key: 'httpMethod', titleKey: 'form.httpMethod' },
  { key: 'apiPath', titleKey: 'form.apiPath' },
  { key: 'ipAddress', titleKey: 'form.ipAddress' },
  { key: 'createdAt', titleKey: 'form.createTime' },
];

// 处理搜索和重置
const handleRefresh = () => {
  tableRef.value?.refresh();
};
</script>
