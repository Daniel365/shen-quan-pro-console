<template>
  <!-- 利润分配配置管理页面 -->
  <div class="profit-distribution-manage-page">
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
      :api="profitDistributionManageApi.getList"
      :search-params="searchParams"
      :columns="columns"
    >
      <!-- 新增按钮 -->
      <template #caption>
        <button-group :options="actionButtonGroup" />
      </template>
      <template #bodyCell="{ column, record }">
        <!-- 状态列渲染 -->
        <template v-if="column.key === 'status'">
          <StatusText :options="enabledStatusOptions" :value="record.status" />
        </template>
        <!-- 角色分配比例列渲染 -->
        <template v-if="column.key === 'roleShares'">
          <div class="role-shares-display">
            <div
              v-for="(share, roleName) in record.roleShares"
              :key="roleName"
              class="role-share-item"
            >
              <span class="role-name">{{ roleName }}:</span>
              <span class="share-percentage">{{ share }}%</span>
            </div>
          </div>
        </template>
        <!-- 操作列渲染 -->
        <template v-if="column.key === 'action'">
          <button-group :options="tableButtonGroup" :record="record" link />
        </template>
      </template>
    </DataTable>

    <!-- 利润分配配置表单弹窗 -->
    <FormGroupDialog
      v-model:visible="editVisible"
      width="560px"
      label-position="top"
      :action-type="actionType"
      :form-fields="profitDistributionFormFields"
      :form-rules="profitDistributionFormRules"
      :add-api="profitDistributionManageApi.onCreate"
      :edit-api="profitDistributionManageApi.onEdit"
      :details-data="currentProfitDistribution"
      :handle-submit-data="handleSubmitData"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';

// type
import type {
  ProfitDistributionFormData,
  ProfitDistributionListItem,
  ProfitDistributionListParams,
} from '@/api/app/profitDistributionManage/types';
// utils
import { onArrToKeyObject } from '@/utils/dataConvert';

import RoleSharesForm from './components/RoleSharesForm.vue';

import type { RoleShareItem } from './utils/types';

// 表格引用
const tableRef = ref();
// 加载状态
const loading = ref(false);
// 数据来源
const tableData = ref<ProfitDistributionListItem[]>([]);
// 编辑抽屉显示状态
const editVisible = ref(false);
// 当前编辑利润分配配置
const currentProfitDistribution = ref<ProfitDistributionFormData>();
// 操作类型
const actionType = computed(() =>
  currentProfitDistribution.value?.uuid ? ActionTypeEnum.EDIT : ActionTypeEnum.CREATE
);

// 搜索参数
const searchParams = reactive<ProfitDistributionListParams>({
  configName: '',
  status: undefined,
});

// 搜索字段配置
const searchFields = computed(() => [
  {
    key: 'configName',
    label: i18nText('profitDistributionManage.configNameLabel'),
    placeholder: i18nText('profitDistributionManage.configNamePlaceholder'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'status',
    label: i18nText('profitDistributionManage.statusLabel'),
    options: enabledStatusOptions,
    placeholder: i18nText('profitDistributionManage.statusPlaceholder'),
    type: FormTypeEnum.SELECT,
  },
]);

// 表格列配置
const columns = [
  { key: 'configName', titleKey: 'profitDistributionManage.configNameLabel' },
  { key: 'roleShares', titleKey: 'profitDistributionManage.roleSharesLabel' },
  { key: 'status', titleKey: 'profitDistributionManage.statusLabel' },
  { key: 'createdAt', titleKey: 'form.createTime' },
  { key: 'updatedAt', titleKey: 'form.updateTime' },
  { fixed: 'right', key: 'action', titleKey: 'form.action', width: 200 },
];

// 利润分配配置表单字段配置
const profitDistributionFormFields = [
  {
    key: 'configName',
    label: i18nText('profitDistributionManage.configNameLabel'),
    maxlength: 100,
    placeholder: i18nText('profitDistributionManage.configNamePlaceholder'),
    required: true,
    showWordLimit: true,
    type: FormTypeEnum.INPUT,
  },
  {
    component: RoleSharesForm,
    key: 'roleShares',
    label: i18nText('profitDistributionManage.roleSharesLabel'),
    placeholder: i18nText('profitDistributionManage.roleSharesPlaceholder'),
    required: true,
    type: FormTypeEnum.CUSTOM,
  },
  {
    key: 'status',
    label: i18nText('profitDistributionManage.statusLabel'),
    options: enabledStatusOptions,
    type: FormTypeEnum.RADIO_GROUP,
  },
];

const getRequiredMessage = (key: string) =>
  i18nText(`profitDistributionManage.message.${key}.required`);
const getMaxLengthMessage = (key: string) =>
  i18nText(`profitDistributionManage.message.${key}.maxLength`);
// 利润分配配置表单验证规则
const profitDistributionFormRules = {
  configName: [
    { message: getRequiredMessage('configName'), required: true, trigger: 'blur' },
    { max: 100, message: getMaxLengthMessage('configName'), trigger: 'blur' },
  ],
  roleShares: [
    {
      trigger: 'blur',
      validator: (rule: any, value: RoleShareItem[], callback: any) => {
        console.log('value', value);
        if (!value || value.length === 0) {
          callback(new Error(getRequiredMessage('roleShares')));
        } else {
          const total = value.reduce((sum, share) => sum + share.profitPoints, 0);
          if (total !== 100) {
            callback(new Error(i18nText('profitDistributionManage.message.roleShares.total100')));
          } else {
            callback();
          }
        }
      },
    },
  ],
  status: [{ message: getRequiredMessage('status'), required: true, trigger: 'change' }],
};

/** 操作按钮组 */
const actionButtonGroup: ButtonGroupOptions[] = [
  {
    handler: () => {
      handleAdd();
    },
    labelKey: 'action.add',
    permission: [RequestPath.APP_PROFIT_DISTRIBUTION_CREATE],
    type: 'primary',
    value: 'create',
  },
];

/** 表格操作按钮组 */
const tableButtonGroup: ButtonGroupOptions[] = [
  {
    handler: (record: ProfitDistributionListItem) => {
      handleEnable(record);
    },
    isShow: (record: ProfitDistributionListItem) => record.status !== EnabledStatusEnum.ENABLED,
    labelKey: 'profitDistributionManage.enableConfig',
    permission: [RequestPath.APP_PROFIT_DISTRIBUTION_ENABLE],
    type: 'success',
    value: 'enable',
  },
  {
    handler: (record: ProfitDistributionListItem) => {
      handleEdit(record);
    },
    labelKey: 'action.edit',
    permission: [RequestPath.APP_PROFIT_DISTRIBUTION_UPDATE],
    type: 'primary',
    value: 'edit',
  },
  {
    handler: (record: ProfitDistributionListItem) => {
      handleDelete(record);
    },
    labelKey: 'action.delete',
    permission: [RequestPath.APP_PROFIT_DISTRIBUTION_DELETE],
    type: 'danger',
    value: 'delete',
  },
];

// 处理搜索和重置
const handleRefresh = () => {
  tableRef.value?.refresh();
};

// 处理新增利润分配配置
const handleAdd = () => {
  currentProfitDistribution.value = {
    configName: '',
    roleShares: [],
    status: EnabledStatusEnum.DISABLED,
  };
  editVisible.value = true;
};

// 处理编辑利润分配配置
const handleEdit = (record: ProfitDistributionListItem) => {
  currentProfitDistribution.value = {
    ...record,
    roleShares: JSON.parse(record.roleShares),
  };
  editVisible.value = true;
};

// 处理提交数据
const handleSubmitData = (data: ProfitDistributionFormData) => {
  const newData = {...data}
  for (const key in newData) {
    if (Object.prototype.hasOwnProperty.call(newData, key)) {
      const value = newData[key as keyof ProfitDistributionFormData];

      switch (key) {
        case 'roleShares':
          if (value) {
            newData[key] = onArrToKeyObject(value as any[], {
              keyField: 'roleUuid',
              valueField: 'profitPoints',
            });
          }
          break;
        default:
          // 其他字段不做处理
          break;
      }
    }
  }
  return newData
};

// 处理启用利润分配配置
const handleEnable = (record: ProfitDistributionListItem) => {
  ElMessageBox.confirm(
    i18nText('profitDistributionManage.enableConfirm', {
      configName: record.configName,
    }),
    i18nText('action.confirm')
  )
    .then(async () => {
      try {
        await profitDistributionManageApi.onEnable({ uuid: record.uuid });
        ElMessage.success(i18nText('profitDistributionManage.enableSuccess'));
        tableRef.value?.refresh();
      } catch (error) {
        ElMessage.error(i18nText('profitDistributionManage.enableFailed'));
      }
    })
    .catch(() => {
      // 用户取消启用
    });
};

// 处理删除利润分配配置
const handleDelete = (record: ProfitDistributionListItem) => {
  ElMessageBox.confirm(
    i18nText('profitDistributionManage.deleteConfirm', {
      configName: record.configName,
    }),
    i18nText('action.confirmDelete')
  )
    .then(async () => {
      try {
        await profitDistributionManageApi.onDelete({ uuid: record.uuid });
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

