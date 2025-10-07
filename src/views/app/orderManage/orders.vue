<template>
  <!-- 活动订单列表页 -->
  <div class="activity-orders-page">
    <div class="page-header">
      <div class="header-left">
        <el-button type="text" @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t('common.back') }}
        </el-button>
        <h1>{{ $t('activity.order.orderList.title') }} - {{ activityInfo?.title }}</h1>
      </div>
      <div class="header-right">
        <span class="activity-info">
          {{ $t('activity.order.orderCount') }}: {{ ordersList.length }} / {{ activityInfo?.regLimit || 0 }}
        </span>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :model="filterParams" inline>
        <el-form-item :label="$t('user.nickname')">
          <el-input
            v-model="filterParams.nickname"
            :placeholder="$t('user.enterNickname')"
            clearable
          />
        </el-form-item>
        <el-form-item :label="$t('activity.order.orderStatus')">
          <el-select
            v-model="filterParams.orderStatus"
            :placeholder="$t('activity.order.selectOrderStatus')"
            clearable
          >
            <el-option
              v-for="status in orderStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('activity.order.profitStatus')">
          <el-select
            v-model="filterParams.profitStatus"
            :placeholder="$t('activity.order.selectProfitStatus')"
            clearable
          >
            <el-option
              v-for="status in profitStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
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

    <!-- 订单列表 -->
    <el-card class="list-card">
      <el-table :data="filteredOrders" v-loading="loading">
        <el-table-column
          :label="$t('user.avatar')"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-avatar
              :src="row.avatar || '/default-avatar.png'"
              :size="40"
              shape="circle"
            />
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('user.nickname')"
          prop="nickname"
          min-width="120"
        >
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewUserDetail(row)">
              {{ row.nickname || $t('user.noNickname') }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('user.phone')"
          prop="phone"
          width="120"
        />

        <el-table-column
          :label="$t('activity.order.orderTime')"
          prop="orderTime"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDate(row.orderTime) }}
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('activity.order.orderStatus')"
          prop="orderStatus"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.orderStatus)">
              {{ getOrderStatusText(row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('activity.order.actualPrice')"
          prop="actualPrice"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            ¥{{ row.actualPrice || 0 }}
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('activity.order.profitStatus')"
          prop="profitStatus"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="getProfitStatusType(row.profitStatus)">
              {{ getProfitStatusText(row.profitStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('activity.order.profitAmount')"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            ¥{{ row.profitAmount || 0 }}
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('form.action')"
          fixed="right"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="handleViewDetail(row)"
            >
              {{ $t('action.view') }}
            </el-button>
            <el-button
              v-if="row.orderStatus === 1"
              size="small"
              type="warning"
              @click="handleRefund(row)"
            >
              {{ $t('action.refund') }}
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
          :total="totalOrders"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户详情弹窗 -->
    <el-dialog
      v-model="userDetailVisible"
      :title="$t('user.detail')"
      width="600px"
    >
      <UserDetail
        v-if="userDetailVisible && currentUser"
        :user="currentUser"
        @close="userDetailVisible = false"
      />
    </el-dialog>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="orderDetailVisible"
      :title="$t('activity.order.orderDetail')"
      width="800px"
    >
      <OrderDetail
        v-if="orderDetailVisible && currentOrder"
        :order="currentOrder"
        @close="orderDetailVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';

// API
import orderManageApi from '@/api/app/orderManage';

// 组件
import UserDetail from './components/UserDetail.vue';
import OrderDetail from './components/OrderDetail.vue';

interface ActivityInfo {
  uuid: string;
  title: string;
  regLimit: number;
}

interface Order {
  uuid: string;
  userUuid: string;
  nickname: string;
  phone: string;
  avatar: string;
  orderTime: string;
  orderStatus: number; // 1: 待支付, 2: 已支付, 3: 已完成, 4: 已退款, 5: 已取消
  actualPrice: number;
  profitStatus: number; // 1: 冻结中, 2: 已结算, 3: 已取消
  profitAmount: number;
}

interface FilterParams {
  nickname: string;
  orderStatus: number | null;
  profitStatus: number | null;
  page: number;
  pageSize: number;
}

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const ordersList = ref<Order[]>([]);
const activityInfo = ref<ActivityInfo | null>(null);
const userDetailVisible = ref(false);
const orderDetailVisible = ref(false);
const currentUser = ref<Order | null>(null);
const currentOrder = ref<any>(null);

// 活动ID
const activityUuid = computed(() => route.params.id as string);

// 筛选参数
const filterParams = reactive<FilterParams>({
  nickname: '',
  orderStatus: null,
  profitStatus: null,
  page: 1,
  pageSize: 20,
});

// 筛选后的数据
const filteredOrders = computed(() => {
  let filtered = ordersList.value;
  
  if (filterParams.nickname) {
    filtered = filtered.filter(p => 
      p.nickname.toLowerCase().includes(filterParams.nickname.toLowerCase())
    );
  }
  
  if (filterParams.orderStatus !== null) {
    filtered = filtered.filter(p => p.orderStatus === filterParams.orderStatus);
  }
  
  if (filterParams.profitStatus !== null) {
    filtered = filtered.filter(p => p.profitStatus === filterParams.profitStatus);
  }
  
  return filtered;
});

// 总订单数
const totalOrders = computed(() => filteredOrders.value.length);

// 订单状态选项
const orderStatusOptions = [
  { label: $t('activity.order.status.pending'), value: 1 },
  { label: $t('activity.order.status.paid'), value: 2 },
  { label: $t('activity.order.status.completed'), value: 3 },
  { label: $t('activity.order.status.refunded'), value: 4 },
  { label: $t('activity.order.status.cancelled'), value: 5 },
];

// 分润状态选项
const profitStatusOptions = [
  { label: $t('activity.order.profitStatus.frozen'), value: 1 },
  { label: $t('activity.order.profitStatus.settled'), value: 2 },
  { label: $t('activity.order.profitStatus.cancelled'), value: 3 },
];

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

// 加载订单列表
const loadOrders = async () => {
  try {
    loading.value = true;
    const result = await orderManageApi.getOrders({ activityUuid: activityUuid.value });
    
    if (result.code === 200) {
      ordersList.value = result.data.orders;
      activityInfo.value = result.data.activityInfo;
    } else {
      ElMessage.error(result.message || $t('common.loadFailed'));
    }
  } catch (error) {
    console.error($t('activity.order.loadOrdersFailed'), error);
    ElMessage.error($t('common.loadFailed'));
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  filterParams.page = 1;
  loadOrders();
};

// 重置搜索
const handleReset = () => {
  filterParams.nickname = '';
  filterParams.orderStatus = null;
  filterParams.profitStatus = null;
  filterParams.page = 1;
  loadOrders();
};

// 返回活动列表
const handleBack = () => {
  router.push('/app/activity-manage');
};

// 查看用户详情
const handleViewUserDetail = (order: Order) => {
  currentUser.value = order;
  userDetailVisible.value = true;
};

// 查看订单详情
const handleViewDetail = async (order: Order) => {
  try {
    const result = await orderManageApi.getOrderDetail({ orderUuid: order.uuid });
    if (result.code === 200) {
      currentOrder.value = result.data;
      orderDetailVisible.value = true;
    } else {
      ElMessage.error(result.message || $t('activity.order.getOrderDetailFailed'));
    }
  } catch (error) {
    console.error($t('activity.order.getOrderDetailFailed'), error);
    ElMessage.error($t('activity.order.getOrderDetailFailed'));
  }
};

// 退款操作
const handleRefund = async (order: Order) => {
  try {
    await ElMessageBox.confirm(
      $t('activity.order.confirmRefund', { nickname: order.nickname }),
      $t('action.confirm'),
      {
        confirmButtonText: $t('action.confirm'),
        cancelButtonText: $t('action.cancel'),
        type: 'warning',
      }
    );

    const result = await orderManageApi.refundOrder({ orderUuid: order.uuid });
    
    if (result.code === 200) {
      ElMessage.success($t('activity.order.refundSuccess'));
      loadOrders();
    } else {
      ElMessage.error(result.message || $t('activity.order.refundFailed'));
    }
  } catch (error) {
    console.error($t('activity.order.refundFailed'), error);
    ElMessage.error($t('activity.order.refundFailed'));
  }
};

// 分页处理
const handleSizeChange = (size: number) => {
  filterParams.pageSize = size;
  loadOrders();
};

const handleCurrentChange = (page: number) => {
  filterParams.page = page;
  loadOrders();
};

onMounted(() => {
  if (activityUuid.value) {
    loadOrders();
  } else {
    ElMessage.error($t('activity.order.activityIdNotFound'));
    router.push('/app/activity-manage');
  }
});
</script>

<style scoped>
.activity-orders-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-left h1 {
  margin: 0;
}

.activity-info {
  font-size: 14px;
  color: #666;
}

.filter-card {
  margin-bottom: 20px;
}

.list-card {
  min-height: 400px;
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