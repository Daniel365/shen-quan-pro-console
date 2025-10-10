<template>
  <!-- 会员卡管理页面 -->
  <div class="membership-card-manage-page">
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
      :api="membershipCardManageApi.getList"
      :search-params="searchParams"
      :columns="columns"
      :selectable="true"
    >
      <!-- 新增按钮 -->
      <template #caption>
        <ButtonGroup :options="actionButtonGroup" />
      </template>
      <template #bodyCell="{ column, record }">
        <!-- 状态列渲染 -->
        <template v-if="column.key === 'status'">
          <StatusText :options="enabledStatusOptions" :value="record.status" />
        </template>

        <!-- 会员卡名称列渲染（多语言显示） -->
        <template v-else-if="column.key === 'name'">
          <span>{{ getLanguageObj(record.translations).name }}</span>
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
import type {
  MembershipCardListItem,
  MembershipCardListParams,
} from '@/api/app/membershipCardManage/types';

// 表格引用
const tableRef = ref();
// 加载状态
const loading = ref(false);
// 数据来源
const tableData = ref<MembershipCardListItem[]>([]);
// 选中的行数据
const selectedRows = ref<MembershipCardListItem[]>([]);

// 搜索参数
const searchParams = reactive<MembershipCardListParams>({
  code: '',
  status: undefined,
});

// 搜索字段配置
const searchFields = computed(() => [
  {
    key: 'code',
    label: i18nText('membershipCardManage.codeLabel'),
    placeholder: i18nText('membershipCardManage.codePlaceholder'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'status',
    label: i18nText('membershipCardManage.statusLabel'),
    options: enabledStatusOptions,
    placeholder: i18nText('membershipCardManage.statusPlaceholder'),
    type: FormTypeEnum.SELECT,
  },
]);

// 表格列配置
const columns = [
  {
    key: 'name',
    multilingualKey: 'translations',
    titleKey: 'membershipCardManage.nameLabel',
    width: 200,
  },
  { key: 'code', titleKey: 'membershipCardManage.codeLabel', width: 200 },
  { key: 'price', titleKey: 'membershipCardManage.priceLabel', width: 120 },
  { key: 'durationDays', titleKey: 'membershipCardManage.durationDaysLabel', width: 120 },
  { key: 'status', titleKey: 'form.status', width: 100 },
  { key: 'createdAt', titleKey: 'form.createTime', width: 180 },
  { fixed: 'right', key: 'action', titleKey: 'form.action', width: 200 },
];

/** 操作按钮组 */
const actionButtonGroup = computed<ButtonGroupOptions[]>(() => [
  {
    labelKey: 'action.add',
    permission: [RequestPath.APP_MEMBERSHIP_CARD_CREATE],
    to: RouterPath.MEMBERSHIP_CARD_FORM,
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
    permission: [RequestPath.APP_MEMBERSHIP_CARD_DELETE],
    type: 'danger',
    value: 'delete',
  },
]);

/** 表格操作按钮组 */
const tableButtonGroup: ButtonGroupOptions[] = [
  {
    labelKey: 'action.edit',
    permission: [RequestPath.APP_MEMBERSHIP_CARD_UPDATE],
    query: (record: MembershipCardListItem) => {
      return {
        actionType: ActionTypeEnum.EDIT,
        uuid: record.uuid,
      };
    },
    to: RouterPath.MEMBERSHIP_CARD_FORM,
    type: 'primary',
    value: 'edit',
  },
  {
    labelKey: 'action.detail',
    permission: [RequestPath.APP_MEMBERSHIP_CARD_DETAILS],
    query: (record: MembershipCardListItem) => {
      return {
        actionType: ActionTypeEnum.DETAIL,
        uuid: record.uuid,
      };
    },
    to: RouterPath.MEMBERSHIP_CARD_FORM,
    value: 'detail',
  },
  // {
  //   handler: (record: MembershipCardListItem) => {
  //     handleToggleStatus(record);
  //   },
  //   // labelKey: (record) =>
  //   //   record.status === MembershipCardStatusEnum.ENABLED
  //   //     ? 'membershipCardManage.statusDisabled'
  //   //     : 'membershipCardManage.statusEnabled',
  //   permission: [RequestPath.APP_MEMBERSHIP_CARD_TOGGLE_STATUS],
  //   type: 'warning',
  //   value: 'toggleStatus',
  // },
  {
    handler: (record: MembershipCardListItem) => {
      handleDelete([record.uuid]);
    },
    labelKey: 'action.delete',
    permission: [RequestPath.APP_MEMBERSHIP_CARD_DELETE],
    type: 'danger',
    value: 'delete',
  },
];

// 处理搜索和重置
const handleRefresh = () => {
  tableRef.value?.refresh();
};

// 处理删除会员卡
const handleDelete = (cardUuids: string[]) => {
  ElMessageBox.confirm(
    i18nText(
      cardUuids.length > 1
        ? 'membershipCardManage.deleteConfirmMultiple'
        : 'membershipCardManage.deleteConfirmSingle',
      {
        count: cardUuids.length,
      }
    ),
    i18nText('action.confirmDelete')
  )
    .then(async () => {
      const response = await membershipCardManageApi.onDelete({ uuid: cardUuids[0] });
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

// 处理启用/禁用的会员卡
const handleToggleStatus = (record: MembershipCardListItem) => {
  const newStatus =
    record.status === EnabledStatusEnum.ENABLED
      ? EnabledStatusEnum.DISABLED
      : EnabledStatusEnum.ENABLED;

  ElMessageBox.confirm(
    i18nText('membershipCardManage.toggleStatusConfirm', {
      action: i18nText(
        newStatus === EnabledStatusEnum.ENABLED
          ? 'membershipCardManage.statusEnabled'
          : 'membershipCardManage.statusDisabled'
      ),
    }),
    i18nText('action.confirm')
  )
    .then(async () => {
      const response = await membershipCardManageApi.toggleStatus({
        status: newStatus,
        uuid: record.uuid,
      });

      handleReturnResults({
        onSuccess: () => {
          ElMessage.success(i18nText('action.updateSuccess'));
          tableRef.value?.refresh();
        },
        params: response,
      });
    })
    .catch(() => {
      // 用户取消操作
    });
};
</script>
