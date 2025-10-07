<template>
  <!-- 收益详情组件 -->
  <div class="profit-detail">
    <div class="basic-info">
      <h3>基本信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">订单号:</span>
          <span class="info-value">{{ profit.orderUuid }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">活动名称:</span>
          <span class="info-value">{{ profit.activityTitle }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">参与用户:</span>
          <span class="info-value">{{ profit.userNickname }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">订单金额:</span>
          <span class="info-value">¥{{ profit.totalAmount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">创建时间:</span>
          <span class="info-value">{{ formatDateTime(profit.createdAt) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">结算时间:</span>
          <span class="info-value">{{ formatDateTime(profit.settledAt) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">收益状态:</span>
          <span class="info-value">
            <el-tag :type="getStatusType(profit.status)">
              {{ getStatusText(profit.status) }}
            </el-tag>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">剩余金额:</span>
          <span class="info-value">¥{{ profit.remainingAmount }}</span>
        </div>
      </div>
    </div>

    <el-divider />

    <div class="profit-distribution">
      <h3>分润明细</h3>
      <el-table :data="profit.profitDistribution" stripe>
        <el-table-column label="角色" prop="roleName" width="120" />
        <el-table-column label="分润比例" width="100" align="center">
          <template #default="{ row }"> {{ row.percentage }}% </template>
        </el-table-column>
        <el-table-column label="分润金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分润状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="结算时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.settledAt) }}
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" />
      </el-table>
    </div>

    <div class="profit-summary">
      <h4>分润汇总</h4>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">订单总金额:</span>
          <span class="summary-value">¥{{ profit.totalAmount }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">总分润金额:</span>
          <span class="summary-value">¥{{ totalProfitAmount }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">剩余金额:</span>
          <span class="summary-value">¥{{ profit.remainingAmount }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">分润比例:</span>
          <span class="summary-value">{{ profitPercentage }}%</span>
        </div>
      </div>
    </div>

    <div class="dialog-actions">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProfitDistribution {
  roleUuid: string;
  roleName: string;
  amount: number;
  percentage: number;
  status: number;
  settledAt?: string;
  remark?: string;
}

interface ProfitRecord {
  uuid: string;
  orderUuid: string;
  activityTitle: string;
  userNickname: string;
  totalAmount: number;
  remainingAmount: number;
  status: number;
  createdAt: string;
  settledAt?: string;
  profitDistribution: ProfitDistribution[];
}

interface Props {
  profit: ProfitRecord;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 计算总分润金额
const totalProfitAmount = computed(() => {
  return props.profit.profitDistribution.reduce((sum, item) => sum + item.amount, 0);
});

// 计算分润比例
const profitPercentage = computed(() => {
  if (props.profit.totalAmount === 0) return 0;
  return ((totalProfitAmount.value / props.profit.totalAmount) * 100).toFixed(2);
});

// 获取收益状态类型
const getStatusType = (status: number) => {
  const types = {
    1: 'warning', // 冻结中
    2: 'success', // 已结算
    3: 'info', // 已取消
  };
  return types[status as keyof typeof types] || 'info';
};

// 获取收益状态文本
const getStatusText = (status: number) => {
  const texts = {
    1: '冻结中',
    2: '已结算',
    3: '已取消',
  };
  return texts[status as keyof typeof texts] || '未知';
};

// 格式化日期
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
};

// 关闭弹窗
const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.profit-detail {
  padding: 20px;
}

.basic-info h3,
.profit-distribution h3,
.profit-summary h4 {
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

.profit-distribution {
  margin: 20px 0;
}

.amount {
  font-weight: bold;
  color: #409eff;
}

.profit-summary {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.summary-label {
  font-weight: bold;
  color: #666;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
}

.dialog-actions {
  margin-top: 20px;
  text-align: right;
}
</style>
