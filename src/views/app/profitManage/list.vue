<template>
  <!-- 收益明细页 -->
  <div class="profit-list-page">
    <div class="page-header">
      <h1>{{ $t('profit.title') }}</h1>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="filterParams" inline>
        <el-form-item :label="$t('profit.status')">
          <el-select
            v-model="filterParams.status"
            :placeholder="$t('profit.selectStatus')"
            clearable
          >
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('profit.dateRange')">
          <el-date-picker
            v-model="filterParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item :label="$t('profit.activity')">
          <el-input
            v-model="filterParams.activityTitle"
            :placeholder="$t('profit.enterActivity')"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            {{ $t('action.search') }}
          </el-button>
          <el-button @click="handleReset">
            {{ $t('action.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 收益统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="color: #409eff">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ stats.totalAmount }}</div>
              <div class="stat-label">总收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="color: #67c23a">
              <el-icon><CreditCard /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ stats.settledAmount }}</div>
              <div class="stat-label">已结算</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="color: #e6a23c">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ stats.frozenAmount }}</div>
              <div class="stat-label">冻结中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="color: #f56c6c">
              <el-icon><CloseBold /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ stats.cancelledAmount }}</div>
              <div class="stat-label">已取消</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 收益明细列表 -->
    <el-card class="list-card">
      <el-table :data="profitList" v-loading="loading" stripe>
        <el-table-column :label="$t('profit.activity')" prop="activityTitle" min-width="200" />

        <el-table-column :label="$t('profit.order')" prop="orderUuid" width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewOrder(row)">
              {{ row.orderUuid }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column :label="$t('profit.user')" prop="userNickname" width="120" />

        <el-table-column
          :label="$t('profit.totalAmount')"
          prop="totalAmount"
          width="120"
          align="right"
        >
          <template #default="{ row }">
            <span class="amount">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>

        <!-- 角色分润明细 -->
        <el-table-column
          v-for="role in roleColumns"
          :key="role.roleUuid"
          :label="role.roleName"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            <div class="role-profit">
              <div class="profit-amount">¥{{ getRoleProfitAmount(row, role.roleUuid) }}</div>
              <div class="profit-percentage">
                {{ getRoleProfitPercentage(row, role.roleUuid) }}%
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('profit.remainingAmount')" width="140" align="right">
          <template #default="{ row }">
            <span class="remaining-amount">¥{{ row.remainingAmount }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('profit.status')" prop="status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('profit.createTime')" prop="createdAt" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('profit.settleTime')" prop="settledAt" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.settledAt) }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('form.action')" fixed="right" width="120" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleViewDetail(row)">
              {{ $t('action.view') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="filterParams.page"
          v-model:page-size="filterParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 收益详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="$t('profit.detail')" width="900px">
      <ProfitDetail
        v-if="detailVisible && currentProfit"
        :profit="currentProfit"
        @close="detailVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { CloseBold, CreditCard, Money, Timer } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

// API
import profitManageApi from '@/api/app/profitManage';

// 组件
import ProfitDetail from './components/ProfitDetail.vue';

interface ProfitRecord {
  uuid: string;
  orderUuid: string;
  activityTitle: string;
  userNickname: string;
  totalAmount: number;
  remainingAmount: number;
  status: number; // 1: 冻结中, 2: 已结算, 3: 已取消
  createdAt: string;
  settledAt?: string;
  profitDistribution: Array<{
    roleUuid: string;
    roleName: string;
    amount: number;
    percentage: number;
    status: number;
  }>;
}

interface FilterParams {
  status: number | null;
  dateRange: string[];
  activityTitle: string;
  page: number;
  pageSize: number;
}

interface Stats {
  totalAmount: number;
  settledAmount: number;
  frozenAmount: number;
  cancelledAmount: number;
}

const loading = ref(false);
const profitList = ref<ProfitRecord[]>([]);
const total = ref(0);
const detailVisible = ref(false);
const currentProfit = ref<ProfitRecord | null>(null);

// 筛选参数
const filterParams = reactive<FilterParams>({
  status: null,
  dateRange: [],
  activityTitle: '',
  page: 1,
  pageSize: 20,
});

// 统计信息
const stats = reactive<Stats>({
  totalAmount: 0,
  settledAmount: 0,
  frozenAmount: 0,
  cancelledAmount: 0,
});

// 角色列配置
const roleColumns = ref<Array<{ roleUuid: string; roleName: string }>>([]);

// 状态选项
const statusOptions = [
  { label: '冻结中', value: 1 },
  { label: '已结算', value: 2 },
  { label: '已取消', value: 3 },
];

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

// 获取角色分润金额
const getRoleProfitAmount = (record: ProfitRecord, roleUuid: string) => {
  const distribution = record.profitDistribution.find((d) => d.roleUuid === roleUuid);
  return distribution ? distribution.amount : 0;
};

// 获取角色分润比例
const getRoleProfitPercentage = (record: ProfitRecord, roleUuid: string) => {
  const distribution = record.profitDistribution.find((d) => d.roleUuid === roleUuid);
  return distribution ? distribution.percentage : 0;
};

// 格式化日期
const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
};

// 加载收益列表
const loadProfitList = async () => {
  try {
    loading.value = true;
    const result = await profitManageApi.getList(filterParams);

    if (result.code === 200) {
      profitList.value = result.data.list;
      total.value = result.data.total;

      // 更新统计信息
      Object.assign(stats, result.data.stats || {});

      // 更新角色列配置
      if (result.data.roleColumns) {
        roleColumns.value = result.data.roleColumns;
      }
    } else {
      ElMessage.error(result.message || '加载失败');
    }
  } catch (error) {
    console.error('加载收益列表失败:', error);
    ElMessage.error('加载失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  filterParams.page = 1;
  loadProfitList();
};

// 重置搜索
const handleReset = () => {
  filterParams.status = null;
  filterParams.dateRange = [];
  filterParams.activityTitle = '';
  filterParams.page = 1;
  loadProfitList();
};

// 查看订单
const handleViewOrder = (record: ProfitRecord) => {
  // 跳转到订单详情页面
  console.log('查看订单:', record.orderUuid);
};

// 查看详情
const handleViewDetail = (record: ProfitRecord) => {
  currentProfit.value = record;
  detailVisible.value = true;
};

// 分页处理
const handleSizeChange = (size: number) => {
  filterParams.pageSize = size;
  loadProfitList();
};

const handleCurrentChange = (page: number) => {
  filterParams.page = page;
  loadProfitList();
};

onMounted(() => {
  loadProfitList();
});
</script>

<style scoped>
.profit-list-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  .stat-item {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .stat-icon {
    font-size: 40px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }

  .stat-label {
    font-size: 14px;
    color: #666;
    margin-top: 5px;
  }
}

.list-card {
  min-height: 400px;
}

.role-profit {
  text-align: right;
}

.profit-amount {
  font-weight: bold;
  color: #409eff;
}

.profit-percentage {
  font-size: 12px;
  color: #999;
}

.amount {
  font-weight: bold;
  color: #f56c6c;
}

.remaining-amount {
  color: #e6a23c;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

:deep(.el-table .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
