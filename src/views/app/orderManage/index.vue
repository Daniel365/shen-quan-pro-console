<template>
  <!-- 活动订单管理首页 -->
  <div class="activity-order-manage-page">
    <div class="page-header">
      <h1>{{ $t('activity.order.manage.title') }}</h1>
    </div>

    <!-- 活动选择 -->
    <el-card class="activity-select-card">
      <template #header>
        <div class="card-header">
          <span>{{ $t('activity.order.selectActivity') }}</span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col v-for="activity in activities" :key="activity.uuid" :span="8">
          <el-card shadow="hover" class="activity-card">
            <template #header>
              <div class="activity-header">
                <el-image :src="activity.coverImage" fit="cover" class="activity-cover" />
                <h4 class="activity-title">{{ activity.title }}</h4>
              </div>
            </template>

            <div class="activity-info">
              <p>
                <el-icon><Location /></el-icon> {{ activity.location }}
              </p>
              <p>
                <el-icon><Calendar /></el-icon> {{ formatDate(activity.startTime) }}
              </p>
              <p>
                <el-icon><User /></el-icon> {{ activity.regCount }}/{{ activity.regLimit }}
              </p>
              <p>
                <el-icon><Coin /></el-icon> ¥{{ activity.basePrice }}
              </p>
            </div>

            <template #footer>
              <el-button
                type="primary"
                :disabled="activity.regCount === 0"
                @click="handleViewOrders(activity)"
              >
                {{ $t('activity.order.viewOrders') }}
              </el-button>
            </template>
          </el-card>
        </el-col>
      </el-row>

      <!-- 无活动提示 -->
      <div v-if="activities.length === 0" class="empty-state">
        <el-empty :description="$t('activity.order.noActivityData')">
          <el-button type="primary" @click="handleCreateActivity">
            {{ $t('activity.order.createActivity') }}
          </el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <div v-if="activities.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[6, 12, 18]"
          :total="totalActivities"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Calendar, Coin, Location, User } from '@element-plus/icons-vue';

import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

// API
import { activityManageApi } from '@/api/app/activityManage';

interface Activity {
  uuid: string;
  title: string;
  coverImage: string;
  location: string;
  startTime: string;
  regCount: number;
  regLimit: number;
  basePrice: number;
}

const router = useRouter();
const activities = ref<Activity[]>([]);
const currentPage = ref(1);
const pageSize = ref(6);
const totalActivities = ref(0);
const loading = ref(false);

// 加载活动列表
const loadActivities = async () => {
  try {
    loading.value = true;
    const result = await activityManageApi.getActivityList({
      page: currentPage.value,
      pageSize: pageSize.value,
    });

    if (result.code === 200) {
      activities.value = result.data.list;
      totalActivities.value = result.data.total;
    } else {
      ElMessage.error(result.message || $t('common.loadFailed'));
    }
  } catch (error) {
    console.error($t('activity.order.loadActivityFailed'), error);
    ElMessage.error($t('common.loadFailed'));
  } finally {
    loading.value = false;
  }
};

// 查看活动订单
const handleViewOrders = (activity: Activity) => {
  router.push(`/app/activity-order-manage/orders/${activity.uuid}`);
};

// 创建活动
const handleCreateActivity = () => {
  router.push('/app/activity-manage/create');
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN');
};

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadActivities();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  loadActivities();
};

onMounted(() => {
  loadActivities();
});
</script>

<style scoped>
.activity-order-manage-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.activity-select-card {
  min-height: 400px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.activity-card {
  margin-bottom: 20px;
}

.activity-header {
  position: relative;
}

.activity-cover {
  width: 100%;
  height: 120px;
  border-radius: 4px;
}

.activity-title {
  margin: 10px 0 5px 0;
  font-size: 14px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-info {
  font-size: 12px;
  color: #666;
}

.activity-info p {
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-info .el-icon {
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
