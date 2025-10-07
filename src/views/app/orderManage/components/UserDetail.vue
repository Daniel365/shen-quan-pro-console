<template>
  <!-- 用户详情组件 -->
  <div class="user-detail">
    <div class="user-info">
      <el-avatar
        :src="user.avatar || '/default-avatar.png'"
        :size="80"
        shape="circle"
      />
      <div class="user-details">
        <h3>{{ user.nickname || $t('user.noNickname') }}</h3>
        <p><strong>{{ $t('user.phone') }}:</strong> {{ user.phone || $t('user.notSet') }}</p>
        <p><strong>{{ $t('user.registerTime') }}:</strong> {{ formatDate(user.createdAt) }}</p>
        <p><strong>{{ $t('user.lastLogin') }}:</strong> {{ formatDate(user.lastLoginAt) }}</p>
      </div>
    </div>

    <el-divider />

    <div class="user-stats">
      <h4>{{ $t('activity.order.userStats') }}</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">{{ $t('activity.order.activityCount') }}</span>
          <span class="stat-value">{{ user.activityCount || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ $t('activity.order.totalSpent') }}</span>
          <span class="stat-value">¥{{ user.totalSpent || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ $t('activity.order.inviteCount') }}</span>
          <span class="stat-value">{{ user.inviteCount || 0 }}</span>
        </div>
      </div>
    </div>

    <div class="dialog-actions">
      <el-button @click="handleClose">{{ $t('action.close') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  uuid: string;
  nickname: string;
  phone: string;
  avatar: string;
  createdAt: string;
  lastLoginAt: string;
  activityCount?: number;
  totalSpent?: number;
  inviteCount?: number;
}

interface Props {
  user: User;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return $t('user.notLoggedIn');
  return new Date(dateString).toLocaleString('zh-CN');
};

// 关闭弹窗
const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.user-detail {
  padding: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.user-details h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.user-details p {
  margin: 5px 0;
  color: #666;
}

.user-stats h4 {
  margin-bottom: 15px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.dialog-actions {
  margin-top: 20px;
  text-align: right;
}
</style>