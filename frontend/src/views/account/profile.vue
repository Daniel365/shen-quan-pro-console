<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-04 22:42:06
 * @Description: 个人中心
-->
<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col :span="8">
        <el-card class="user-card">
          <div class="user-info">
            <div class="avatar-wrapper">
              <el-avatar :src="avatarUrl" :size="100" />
              <el-button
                type="info"
                class="avatar-edit-btn"
                circle
                :icon="Camera"
                size="small"
                @click="triggerFileUpload"
              />
              <input
                ref="fileInput"
                type="file"
                style="display: none"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                @change="handleFileChange"
              />
            </div>
            <div class="user-name">
              <span class="nickname">{{ accountInfo.username }}</span>
            </div>
            <div class="user-role">{{ accountInfo.roleName }}</div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧信息卡片 -->
      <el-col :span="16">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('account.accountInfo') }}</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('form.username')">
              {{ accountInfo.username }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('form.email')">
              {{ accountInfo.email || $t('action.unbound') }}
              <el-button
                v-if="accountInfo.email"
                type="primary"
                link
                @click="handleOpenProfileForm"
              >
                {{ $t('action.replace') }}
              </el-button>
              <el-button v-else type="primary" link @click="handleOpenProfileForm">{{
                $t('action.bind')
              }}</el-button>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card class="security-card mt-5">
          <template #header>
            <div class="card-header">
              <span>{{ $t('account.securitySettings') }}</span>
            </div>
          </template>
          <ul>
            <li class="flex flex-justify-between">
              <div class="left">
                <label>{{ $t('account.accountPassword') }}</label>
                <p class="color-bluegray font-size-[12px] mt-1">
                  {{ $t('account.accountPasswordTips') }}
                </p>
              </div>
              <div class="right">
                <el-button type="primary" link @click="handleOpenPasswordForm">{{
                  $t('action.modify')
                }}</el-button>
              </div>
            </li>
          </ul>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="passwordVisible"
      :title="$t('account.changePassword')"
      width="500px"
      :before-close="handleClosePasswordForm"
    >
      <PasswordForm :account-info="accountInfo" @success="handleClosePasswordForm" />
    </el-dialog>

    <!-- 个人资料编辑弹窗 -->
    <el-dialog
      v-model="profileVisible"
      :title="$t('action.edit')"
      width="500px"
      :before-close="handleCloseProfileForm"
    >
      <ProfileForm @success="handleCloseProfileForm" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Camera } from '@element-plus/icons-vue';

import { ElMessage, ElLoading } from 'element-plus';

const fileInput = ref();
const accountStore = useAccountStore();
const accountInfo = accountStore.accountInfo;
const passwordVisible = ref(false);
const profileVisible = ref(false);

// 头像URL - 优先使用上传的头像，如果没有则使用默认头像
const avatarUrl = computed(() => {
  // 如果是相对路径，转换为完整URL
  if (accountInfo.avatar) {
    if (accountInfo.avatar.startsWith('http') || accountInfo.avatar.startsWith('//')) {
      return accountInfo.avatar;
    } else if (accountInfo.avatar.startsWith('/uploads')) {
      // 本地存储的文件，添加完整URL
      const baseUrl = 'http://localhost:3000';
      return baseUrl + accountInfo.avatar;
    }
  }
  return '@/assets/images/logo.svg';
});

// 上传状态
const uploading = ref(false);

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;

  if (!file) return;

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('请选择有效的图片文件（JPEG、PNG、GIF、WebP格式）');
    return;
  }

  // 验证文件大小（最大10MB）
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过10MB');
    return;
  }

  // 显示上传进度
  const loading = ElLoading.service({
    background: 'rgba(0, 0, 0, 0.7)',
    lock: true,
    text: '头像上传中...',
  });

  try {
    uploading.value = true;

    // 创建FormData对象并调用上传API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar');
    const response = await uploadManageApi.onUploadSingle(formData);

    if (response.success && response.data) {
      const uploadResult = response.data;
      fileInput.value = null;
      // 调用后端API更新用户头像信息
      try {
        const updateResponse = await accountManageApi.updateAvatar(uploadResult.url);

        if (updateResponse.success) {
          // 更新store中的头像信息
          accountInfo.avatar = uploadResult.url;
          // 也可以重新获取用户信息来确保数据同步
          await accountStore.getAccountInfo();

          ElMessage.success('头像上传成功！');
        } else {
          ElMessage.error(updateResponse.message || '头像信息更新失败');
        }
      } catch (updateError) {
        console.error('更新头像信息失败：', updateError);
        ElMessage.error('头像信息更新失败，请重试');
      }

      // 重置文件输入
      target.value = '';
    } else {
      ElMessage.error(response.message || '头像上传失败');
    }
  } catch (error: any) {
    console.error('头像上传失败：', error);
    ElMessage.error(error.message || '头像上传失败，请重试');
  } finally {
    uploading.value = false;
    loading.close();
  }
};

// 打开修改密码弹窗
const handleOpenPasswordForm = () => {
  passwordVisible.value = true;
};

// 关闭修改密码弹窗
const handleClosePasswordForm = () => {
  passwordVisible.value = false;
};

// 打开个人资料弹窗
const handleOpenProfileForm = () => {
  profileVisible.value = true;
};

// 关闭个人资料弹窗
const handleCloseProfileForm = () => {
  profileVisible.value = false;
};
</script>

<style lang="scss" scoped>
.user-card {
  .user-info {
    padding: 20px 0;
    text-align: center;

    .avatar-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 16px;

      .avatar-edit-btn {
        position: absolute;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        border: none;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(0, 0, 0, 0.7);
        }
      }
    }

    .user-name {
      margin-bottom: 8px;

      .nickname {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .edit-icon {
        margin-left: 8px;
        color: var(--el-text-color-secondary);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    .user-role {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
