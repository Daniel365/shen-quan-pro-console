<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-24
 * @Description: 发送通知弹窗组件
-->
<template>
  <el-dialog
    v-model="visible"
    :title="$t('notificationManage.sendNotificationDialog')"
    width="600px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      size="large"
      label-position="top"
    >
      <el-form-item :label="$t('notificationManage.notificationTitle')" prop="title">
        <el-input
          v-model="formData.title"
          :placeholder="$t('notificationManage.enterTitle')"
          maxlength="100"
          show-word-limit
          clearable
        />
      </el-form-item>

      <el-form-item :label="$t('notificationManage.notificationType')" prop="type">
        <RadioGroup v-model="formData.type" :options="notificationTypeOptions" />
      </el-form-item>

      <el-form-item :label="$t('notificationManage.receiver')" prop="receiverType">
        <RadioGroup
          v-model="formData.receiverType"
          :options="receiverTypeOptions"
          @change="handleReceiverTypeChange"
        />
      </el-form-item>

      <el-form-item
        v-if="formData.receiverType === 'specific'"
        :label="$t('notificationManage.selectUser')"
        prop="receiverUuid"
      >
        <el-select
          v-model="formData.receiverUuid"
          :placeholder="$t('notificationManage.selectUser')"
          style="width: 100%"
          filterable
          remote
          :remote-method="searchUsers"
          :loading="userSearchLoading"
        >
          <el-option
            v-for="user in userOptions"
            :key="user.uuid"
            :label="`${user.username} (${user.email})`"
            :value="user.uuid"
          >
            <div class="flex justify-between">
              <span>{{ user.username }}</span>
              <span>{{ user.email }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('notificationManage.content')" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :placeholder="$t('notificationManage.enterContent')"
          :rows="3"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          {{ $t('action.cancel') }}
        </el-button>
        <el-button @click="handleReset">
          {{ $t('action.reset') }}
        </el-button>
        <el-button type="info" @click="onlineStatusVisible = true">
          {{ $t('notificationManage.onlineUserDialog') }}
        </el-button>
        <el-button type="primary" @click="handlePreview">
          {{ $t('action.preview') }}
        </el-button>
        <el-button
          type="success"
          :loading="sendLoading"
          :disabled="!formData.title || !formData.content"
          @click="handleSend"
        >
          {{ $t('action.send') }}
        </el-button>
      </div>
    </template>

    <!-- 预览对话框 -->
    <PreviewDialog
      v-model="previewVisible"
      :form-data="formData"
      :user-options="userOptions"
      :loading="sendLoading"
      @send="handleSendFromPreview"
    />
    <!-- 在线状态对话框 -->
    <OnlineStatusDialog
      v-model="onlineStatusVisible"
      @send-message="handleSendMessageFromOnlineStatus"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';

// utils
// types
import type {
  NotificationSendParams,
  NotificationType,
} from '@/api/system/notificationManage/types';
import type { UserListItem } from '@/api/system/userManage/types';

import { notificationTypeOptions, receiverTypeOptions } from './utils/options';

/**
 * 组件属性
 */
interface Props {
  modelValue: boolean;
}

/**
 * 组件事件
 */
interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * 弹窗显示状态
 */
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

/**
 * 表单引用
 */
const formRef = ref<FormInstance>();

/**
 * 加载状态
 */
const sendLoading = ref(false);
const userSearchLoading = ref(false);

/**
 * 预览对话框显示状态
 */
const previewVisible = ref(false);

/**
 * 在线状态对话框显示状态
 */
const onlineStatusVisible = ref(false);

/**
 * 用户选项
 */
const userOptions = ref<UserListItem[]>([]);

/**
 * 表单数据接口
 */
interface FormData {
  title: string;
  content: string;
  type: NotificationType;
  receiverType: 'all' | 'specific';
  receiverUuid?: string;
}

/**
 * 表单数据
 * 包含发送通知所需的所有字段：标题、内容、类型、接收者类型和接收者UUID
 */
const formData = reactive<FormData>({
  content: '',
  receiverType: 'all',
  receiverUuid: undefined,
  title: '',
  type: 'info',
});

/**
 * 表单验证规则
 * 对发送通知表单的各个字段进行数据验证
 */
const formRules: FormRules<FormData> = {
  content: [
    { message: i18nText('notificationManage.contentRequired'), required: true, trigger: 'blur' },
    {
      max: 1000,
      message: i18nText('notificationManage.contentLengthError'),
      min: 1,
      trigger: 'blur',
    },
  ],
  receiverUuid: [
    {
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (formData.receiverType === 'specific' && !value) {
          callback(new Error(i18nText('notificationManage.userRequired')));
        } else {
          callback();
        }
      },
    },
  ],
  title: [
    { message: i18nText('notificationManage.titleRequired'), required: true, trigger: 'blur' },
    {
      max: 100,
      message: i18nText('notificationManage.titleLengthError'),
      min: 1,
      trigger: 'blur',
    },
  ],
  type: [
    { message: i18nText('notificationManage.typeRequired'), required: true, trigger: 'change' },
  ],
};

/**
 * 处理接收者类型变化
 * 当接收者类型从"指定用户"切换到"全体用户"时，清空已选用户
 */
const handleReceiverTypeChange = (value: 'all' | 'specific') => {
  if (value === 'all') {
    formData.receiverUuid = undefined;
  }
};

/**
 * 搜索用户
 * 根据用户名关键词搜索用户，用于选择指定接收者
 */
const searchUsers = async (query: string) => {
  if (!query) {
    userOptions.value = [];
    return;
  }

  userSearchLoading.value = true;
  try {
    const result = await userManageApi.getList({
      page: 1,
      pageSize: 20,
      username: query,
    });
    userOptions.value = result.data.list;
  } catch (error) {
    console.error(i18nText('notificationManage.searchUserFailed'), error);
    userOptions.value = [];
  } finally {
    userSearchLoading.value = false;
  }
};

/**
 * 重置表单
 * 清空所有表单字段，恢复默认状态
 */
const handleReset = () => {
  formRef.value?.resetFields();
  formData.receiverType = 'all';
  formData.receiverUuid = undefined;
};

/**
 * 关闭弹窗
 * 关闭所有对话框并重置表单状态
 */
const handleClose = () => {
  visible.value = false;
  previewVisible.value = false;
  handleReset();
};

/**
 * 预览通知
 * 验证表单数据后显示预览对话框
 */
const handlePreview = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  previewVisible.value = true;
};

/**
 * 发送通知
 * 验证表单后显示确认对话框，确认后执行发送操作
 */
const handleSend = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  try {
    const receiverText =
      formData.receiverType === 'all'
        ? i18nText('notificationManage.allUsersText')
        : i18nText('notificationManage.specificUserText');

    await ElMessageBox.confirm(
      i18nText('notificationManage.confirmSend', { receiver: receiverText }),
      i18nText('action.confirm'),
      {
        cancelButtonText: i18nText('action.cancel'),
        confirmButtonText: i18nText('action.confirm'),
        type: 'warning',
      }
    );

    await sendNotification();
  } catch (error) {
    if (error !== 'cancel') {
      console.error(i18nText('notificationManage.confirmSendFailed'), error);
    }
  }
};

/**
 * 从预览对话框发送
 * 在预览对话框中点击发送按钮时执行发送操作
 */
const handleSendFromPreview = async () => {
  previewVisible.value = false;
  await sendNotification();
};

/**
 * 从在线状态对话框发送消息
 */
const handleSendMessageFromOnlineStatus = (user: UserListItem) => {
  // 设置为指定用户模式
  formData.receiverType = 'specific';
  formData.receiverUuid = user.uuid;

  // 搜索并显示该用户
  searchUsers(user.username);

  // 自动填充用户选项
  userOptions.value = [user];

  // 显示成功消息
  ElMessage.success(`已选择用户: ${user.username}`);
};

/**
 * 执行发送通知
 * 调用API发送通知，处理发送结果
 */
const sendNotification = async () => {
  sendLoading.value = true;
  try {
    const params: NotificationSendParams = {
      content: formData.content,
      title: formData.title,
      type: formData.type,
    };

    if (formData.receiverType === 'specific' && formData.receiverUuid) {
      params.receiverUuid = formData.receiverUuid;
    }

    const response = await notificationManageApi.onSend(params);
    handleReturnResults({
      onSuccess: () => {
        ElMessage.success(
          i18nText('notificationManage.sendSuccess', { count: response.data.sentCount })
        );
        // 重置表单并关闭弹窗
        handleClose();
        emit('success');
      },
      params: response,
    });
  } catch (error) {
    ElMessage.error(i18nText('notificationManage.sendFailed'));
    console.error(i18nText('notificationManage.sendFailed'), error);
  } finally {
    sendLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
