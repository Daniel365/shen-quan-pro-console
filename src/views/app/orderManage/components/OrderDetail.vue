<template>
  <!-- 订单详情组件 -->
  <div class="order-detail">
    <div class="order-info">
      <h3>{{ $t('activity.order.orderInfo') }}</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">{{ $t('activity.order.orderNo') }}:</span>
          <span class="info-value">{{ order.uuid }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">{{ $t('activity.order.activityName') }}:</span>
          <span class="info-value">{{ order.activityTitle }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">{{ $t('user.nickname') }}:</span>
          <span class="info-value">{{ order.userNickname }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">{{ $t('activity.order.orderStatus') }}:</span>
          <span class="info-value">
            <el-tag :type="getOrderStatusType(order.orderStatus)">
              {{ getOrderStatusText(order.orderStatus) }}
            </el-tag>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">{{ $t('activity.order.orderAmount') }}:</span>
          <span class="info-value">¥{{ order.actualPrice }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">{{ $t('activity.order.orderTime') }}:</span>
          <span class="info-value">{{ formatDate(order.orderTime) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">{{ $t('activity.order.payTime') }}:</span>
          <span class="info-value">{{ formatDate(order.payTime) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">{{ $t('activity.order.refundTime') }}:</span>
          <span class="info-value">{{ formatDate(order.refundTime) }}</span>
        </div>
      </div>
    </div>

    <el-divider />

    <div class="profit-info" v-if="order.profitRecord">
      <h3>{{ $t('activity.order.profitInfo') }}</h3>
      <div class="profit-status">
        <span class="info-label">{{ $t('activity.order.profitStatus') }}:</span>
        <el-tag :type="getProfitStatusType(order.profitRecord.status)">
          {{ getProfitStatusText(order.profitRecord.status) }}
        </el-tag>
      </div>
      
      <div class="profit-distribution" v-if="order.profitRecord.distribution">
        <h4>{{ $t('activity.order.profitDistribution') }}</h4>
        <el-table :data="profitDistribution" size="small">
          <el-table-column :label="$t('activity.order.role')" prop="roleName" width="120" />
          <el-table-column :label="$t('user.name')" prop="userName" width="150" />
          <el-table-column :label="$t('activity.order.profitAmount')" prop="amount" width="100" align="right">
            <template #default="{ row }">
              ¥{{ row.amount }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('activity.order.profitPercentage')" prop="percentage" width="100" align="center">
            <template #default="{ row }">
              {{ row.percentage }}%
            </template>
          </el-table-column>
          <el-table-column :label="$t('form.status')" prop="status" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getProfitStatusType(row.status)">
                {{ getProfitStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="profit-summary">
        <div class="summary-item">
          <span class="summary-label">{{ $t('activity.order.totalAmount') }}:</span>
          <span class="summary-value">¥{{ order.actualPrice }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ $t('activity.order.profitedAmount') }}:</span>
          <span class="summary-value">¥{{ totalProfitAmount }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ $t('activity.order.remainingAmount') }}:</span>
          <span class="summary-value">¥{{ remainingAmount }}</span>
        </div>
      </div>
    </div>

    <div class="dialog-actions">
      <el-button @click="handleClose">{{ $t('action.close') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Order {
  uuid: string;
  activityTitle: string;
  userNickname: string;
  orderStatus: number; // 1: 待支付, 2: 已支付, 3: 已完成, 4: 已退款, 5: 已取消
  actualPrice: number;
  orderTime: string;
  payTime?: string;
  refundTime?: string;
  profitRecord?: {
    status: number; // 1: 冻结中, 2: 已结算, 3: 已取消
    distribution?: Array<{
      roleName: string;
      userName: string;
      amount: number;
      percentage: number;
      status: number;
    }>;
  };
}

interface Props {
  order: Order;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 计算分润明细
const profitDistribution = computed(() => {
  return props.order.profitRecord?.distribution || [];
});

// 计算总分润金额
const totalProfitAmount = computed(() => {
  return profitDistribution.value.reduce((sum, item) => sum + item.amount, 0);
});

// 计算剩余金额
const remainingAmount = computed(() => {
  return props.order.actualPrice - totalProfitAmount.value;
});

// 获取订单状态类型
const getOrderStatusType = (status: number) => {
  const types = {
    1: 'warning', // 待支付
    2: 'success', // 已支付
    3: 'info',    // 已完成
    4: 'info',    // 已退款
    5: 'info',    // 已取消
  };
  return types[status as keyof typeof types] || 'info';
};

// 获取订单状态文本
const getOrderStatusText = (status: number) => {
  const texts = {
    1: $t('activity.order.status.pending'),
    2: $t('activity.order.status.paid'),
    3: $t('activity.order.status.completed'),
    4: $t('activity.order.status.refunded'),
    5: $t('activity.order.status.cancelled'),
  };
  return texts[status as keyof typeof texts] || $t('common.unknown');
};

// 获取分润状态类型
const getProfitStatusType = (status: number) => {
  const types = {
    1: 'warning', // 冻结中
    2: 'success', // 已结算
    3: 'info',    // 已取消
  };
  return types[status as keyof typeof types] || 'info';
};

// 获取分润状态文本
const getProfitStatusText = (status: number) => {
  const texts = {
    1: $t('activity.order.profitStatus.frozen'),
    2: $t('activity.order.profitStatus.settled'),
    3: $t('activity.order.profitStatus.cancelled'),
  };
  return texts[status as keyof typeof texts] || $t('common.unknown');
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
};

// 关闭弹窗
const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.order-detail {
  padding: 20px;
}

.order-info h3,
.profit-info h3 {
  margin-bottom: 15px;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  font-weight: bold;
  color: #666;
  min-width: 80px;
}

.info-value {
  color: #333;
}

.profit-status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.profit-distribution {
  margin-bottom: 20px;
}

.profit-distribution h4 {
  margin-bottom: 10px;
  color: #666;
}

.profit-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.summary-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.dialog-actions {
  margin-top: 20px;
  text-align: right;
}
</style>