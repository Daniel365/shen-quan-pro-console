<template>
  <!-- 系统配置管理页面 -->
  <div class="system-config-manage-page">
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
      :api="systemConfigManageApi.getList"
      :search-params="searchParams"
      :columns="columns"
    >
      <!-- 新增按钮 -->
      <template #caption>
        <button-group :options="actionButtonGroup" />
      </template>
      <template #bodyCell="{ column, record }">
        <!-- 类型列渲染 -->
        <template v-if="column.key === 'type'">
          <StatusText :options="systemConfigTypeOptions" :value="record.type" />
        </template>
        <!-- 操作列渲染 -->
        <template v-if="column.key === 'action'">
          <button-group :options="tableButtonGroup" :record="record" link />
        </template>
      </template>
    </DataTable>

    <!-- 系统配置表单弹窗 -->
    <FormGroupDialog
      v-model:visible="editVisible"
      :action-type="actionType"
      :form-fields="systemConfigFormFields"
      :form-rules="systemConfigFormRules"
      :add-api="systemConfigManageApi.onCreate"
      :edit-api="systemConfigManageApi.onEdit"
      :details-data="currentSystemConfig"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';

// utils
import type { SystemConfigFormData, SystemConfigListItem, SystemConfigListParams } from '@/api/app/systemConfigManage/types';

import { SystemConfigTypeEnum } from './utils/enum'
import { systemConfigTypeOptions } from './utils/options'

// 表格引用
const tableRef = ref();
// 加载状态
const loading = ref(false);
// 数据来源
const tableData = ref<SystemConfigListItem[]>([]);
// 编辑抽屉显示状态
const editVisible = ref(false);
// 当前编辑系统配置
const currentSystemConfig = ref<SystemConfigFormData>();
// 操作类型
const actionType = computed(() =>
  currentSystemConfig.value?.uuid ? ActionTypeEnum.EDIT : ActionTypeEnum.CREATE
);

// 搜索参数
const searchParams = reactive<SystemConfigListParams>({
  key: '',
  type: undefined,
});


// 搜索字段配置
const searchFields = computed(() => [
  {
    key: 'key',
    label: i18nText('systemConfigManage.keyLabel'),
    placeholder: i18nText('systemConfigManage.keyPlaceholder'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'type',
    label: i18nText('systemConfigManage.typeLabel'),
    options: systemConfigTypeOptions,
    placeholder: i18nText('systemConfigManage.typePlaceholder'),
    type: FormTypeEnum.SELECT,
  },
]);

// 表格列配置
const columns = [
  { key: 'key', titleKey: 'systemConfigManage.keyLabel' },
  { key: 'value', titleKey: 'systemConfigManage.valueLabel' },
  { key: 'description', titleKey: 'systemConfigManage.descriptionLabel' },
  { key: 'type', titleKey: 'systemConfigManage.typeLabel' },
  { fixed: 'right', key: 'action', titleKey: 'form.action', width: 200 },
];

// 系统配置表单字段配置
const systemConfigFormFields = [
  {
    key: 'key',
    label: i18nText('systemConfigManage.keyLabel'),
    maxlength: 100,
    placeholder: i18nText('systemConfigManage.keyPlaceholder'),
    required: true,
    showWordLimit: true,
    type: FormTypeEnum.INPUT,
  },
    {
    key: 'type',
    label: i18nText('systemConfigManage.typeLabel'),
    options: systemConfigTypeOptions,
    type: FormTypeEnum.SELECT,
  },
  {
    key: 'description',
    label: i18nText('systemConfigManage.descriptionLabel'),
    maxlength: 200,
    placeholder: i18nText('systemConfigManage.descriptionPlaceholder'),
    rows: 3,
    showWordLimit: true,
    type: FormTypeEnum.TEXT_AREA,
  },
  {
    key: 'value',
    label: i18nText('systemConfigManage.valueLabel'),
    placeholder: i18nText('systemConfigManage.valuePlaceholder'),
    required: true,
    type: FormTypeEnum.TEXT_AREA,
  },
];

const getRequiredMessage = (key: string) => i18nText(`systemConfigManage.message.${key}.required`);
const getMaxLengthMessage = (key: string) => i18nText(`systemConfigManage.message.${key}.maxLength`);
// 系统配置表单验证规则
const systemConfigFormRules = {
  description: [
    { max: 200, message: getMaxLengthMessage('description'), trigger: 'blur' },
  ],
  key: [
    { message: getRequiredMessage('key'), required: true, trigger: 'blur' },
    { max: 100, message: getMaxLengthMessage('key'), trigger: 'blur' },
  ],
  type: [{ message: getRequiredMessage('type'), required: true, trigger: 'change' }],
  value: [
    { message: getRequiredMessage('value'), required: true, trigger: 'blur' },
  ],
};

/** 操作按钮组 */
const actionButtonGroup: ButtonGroupOptions[] = [
  {
    handler: () => {
      handleAdd();
    },
    labelKey: 'action.add',
    permission: [RequestPath.APP_SYSTEM_CONFIG_CREATE],
    type: 'primary',
    value: 'create',
  },
];

/** 表格操作按钮组 */
const tableButtonGroup: ButtonGroupOptions[] = [
  {
    handler: (record: SystemConfigListItem) => {
      handleEdit(record);
    },
    labelKey: 'action.edit',
    permission: [RequestPath.APP_SYSTEM_CONFIG_UPDATE],
    type: 'primary',
    value: 'edit',
  },
  {
    handler: (record: SystemConfigListItem) => {
      handleDelete(record);
    },
    labelKey: 'action.delete',
    permission: [RequestPath.APP_SYSTEM_CONFIG_DELETE],
    type: 'danger',
    value: 'delete',
  },
];

// 处理搜索和重置
const handleRefresh = () => {
  tableRef.value?.refresh();
};

// 处理新增系统配置
const handleAdd = () => {
  currentSystemConfig.value = {
    description: '',
    key: '',
    type: SystemConfigTypeEnum.STRING, // 默认字符串类型
    value: '',
  };
  editVisible.value = true;
};

// 处理编辑系统配置
const handleEdit = (record: SystemConfigListItem) => {
  currentSystemConfig.value = record;
  editVisible.value = true;
};

// 处理删除系统配置
const handleDelete = (record: SystemConfigListItem) => {
  ElMessageBox.confirm(
    i18nText('systemConfigManage.deleteConfirm', {
      configKey: record.key,
    }),
    i18nText('action.confirmDelete')
  )
    .then(async () => {
      try {
        await systemConfigManageApi.onDelete({ uuid: record.uuid });
        ElMessage.success(i18nText('action.deleteSuccess'));
        tableRef.value?.refresh();
      } catch (error) {
        ElMessage.error(i18nText('action.deleteFailed'));
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};
</script>
