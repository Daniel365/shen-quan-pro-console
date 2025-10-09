<template>
  <!-- 订单管理页面 -->
  <div class="order-manage-page">
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
      :api="orderManageApi.getList"
      :search-params="searchParams"
      :columns="tableColumns"
      :selectable="true"
    >
      <!-- 操作按钮 -->
      <template #caption>
        <ButtonGroup :options="actionButtonGroup" />
      </template>
      <template #bodyCell="{ column, record }">
        <!-- 订单状态列渲染 -->
        <template v-if="column.key === 'status'">
          <StatusText :options="orderStatusOptions" :value="record.status" />
        </template>

        <!-- 退款状态列渲染 -->
        <template v-else-if="column.key === 'refundStatus'">
          <StatusText :options="refundStatusOptions" :value="record.refundStatus" />
        </template>

        <!-- 支付方式列渲染 -->
        <template v-else-if="column.key === 'paymentMethod'">
          <StatusText :options="paymentMethodOptions" :value="record.paymentMethod" />
        </template>

        <!-- 金额列渲染 -->
        <template v-else-if="column.key === 'amount'">
          <span>¥{{ record.amount }}</span>
        </template>

        <!-- 创建时间列渲染 -->
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDateTime(record.createdAt) }}
        </template>

        <!-- 支付时间列渲染 -->
        <template v-else-if="column.key === 'paidAt'">
          {{ record.paidAt ? formatDateTime(record.paidAt) : '-' }}
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
import type { OrderListItem, OrderListParams } from '@/api/app/orderManage/types';

// utils
import { defaultSearchParams, exportFields, tableColumns } from './utils/const';
import { OrderStatusEnum, RefundStatusEnum } from './utils/enum';
import { orderStatusOptions, paymentMethodOptions, refundStatusOptions } from './utils/options';

// 表格引用
const tableRef = ref();
// 加载状态
const loading = ref(false);
// 数据列表
const tableData = ref<OrderListItem[]>([]);
// 选中的行数据
const selectedRows = ref<OrderListItem[]>([]);

// 搜索参数
const searchParams = reactive<OrderListParams>({
  ...defaultSearchParams,
});

// 搜索字段配置
const searchFields = computed(() => [
  {
    key: 'orderNo',
    label: i18nText('orderManage.orderNoLabel'),
    placeholder: i18nText('orderManage.orderNoPlaceholder'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'userName',
    label: i18nText('orderManage.userNameLabel'),
    placeholder: i18nText('orderManage.userNamePlaceholder'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'activityName',
    label: i18nText('orderManage.activityNameLabel'),
    placeholder: i18nText('orderManage.activityNamePlaceholder'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'status',
    label: i18nText('orderManage.statusLabel'),
    options: orderStatusOptions,
    placeholder: i18nText('orderManage.statusPlaceholder'),
    type: FormTypeEnum.SELECT,
  },
  {
    key: 'paymentMethod',
    label: i18nText('orderManage.paymentMethodLabel'),
    options: paymentMethodOptions,
    placeholder: i18nText('orderManage.paymentMethodPlaceholder'),
    type: FormTypeEnum.SELECT,
  },
  {
    key: 'refundStatus',
    label: i18nText('orderManage.refundStatusLabel'),
    options: refundStatusOptions,
    placeholder: i18nText('orderManage.refundStatusPlaceholder'),
    type: FormTypeEnum.SELECT,
  },
  {
    key: 'startTime',
    label: i18nText('orderManage.startTimeLabel'),
    placeholder: i18nText('orderManage.startTimePlaceholder'),
    type: FormTypeEnum.DATE_PICKER,
  },
  {
    key: 'endTime',
    label: i18nText('orderManage.endTimeLabel'),
    placeholder: i18nText('orderManage.endTimePlaceholder'),
    type: FormTypeEnum.DATE_PICKER,
  },
]);

/** 操作按钮组 */
const actionButtonGroup = computed<ButtonGroupOptions[]>(() => [
  {
    disabled: selectedRows.value.length === 0,
    handler: () => {
      handleExportSelected();
    },
    labelKey: 'action.export',
    permission: [RequestPath.APP_ORDER_EXPORT],
    type: 'primary',
    value: 'export',
  },
]);

/** 表格操作按钮组 */
const tableButtonGroup: ButtonGroupOptions[] = [
  {
    handler: (record: OrderListItem) => {
      handleRefund(record);
    },
    // 只有已支付且未退款或退款失败的订单可以退款
    isShow: (record: OrderListItem) =>
      record.status === OrderStatusEnum.PAID &&
      (record.refundStatus === RefundStatusEnum.NONE ||
        record.refundStatus === RefundStatusEnum.FAILED),
    labelKey: 'orderManage.refund',
    permission: [RequestPath.APP_ORDER_REFUND],
    type: 'warning',
    value: 'refund',
  },
];

// 处理搜索和重置
const handleRefresh = () => {
  tableRef.value?.refresh();
};

// 处理订单退款
const handleRefund = async (record: OrderListItem) => {
  try {
    await ElMessageBox.confirm(
      i18nText('orderManage.refundConfirm', {
        amount: record.amount,
        orderNo: record.orderNo,
      }),
      i18nText('orderManage.refund'),
      {
        type: 'warning',
      }
    );

    const response = await orderManageApi.onRefund({
      orderUuid: record.uuid,
    });

    handleReturnResults({
      onSuccess: () => {
        ElMessage.success(i18nText('orderManage.refundSuccess'));
        tableRef.value?.refresh();
      },
      params: response,
    });
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退款操作失败:', error);
    }
  }
};

// 处理导出选中数据
const handleExportSelected = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.error(i18nText('action.pleaseSelect'));
    return;
  }

  try {
    loading.value = true;

    const response = await orderManageApi.onExportData({
      ...searchParams,
      exportFields: exportFields.map((field) => field.key),
    });

    // 处理导出文件下载
    const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `订单数据_${new Date().getTime()}.xlsx`;
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
