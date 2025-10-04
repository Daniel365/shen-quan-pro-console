<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-27
 * @Description: 通知预览对话框组件
-->
<template>
  <el-dialog
    v-model="visible"
    :title="$t('action.preview')"
    width="500px"
    :close-on-click-modal="false"
    append-to-body
  >
    <!-- 预览表单 -->
    <el-form :model="formData" label-width="100px" size="large" class="preview-form" disabled>
      <el-form-item :label="$t('form.title')">
        <span>{{ formData.title }}</span>
      </el-form-item>

      <el-form-item :label="$t('form.type')">
        <StatusText :options="notificationTypeOptions" :value="formData.type" />
      </el-form-item>

      <el-form-item :label="$t('notificationManage.receiver')">
        <StatusText
          :options="receiverTypeOptions"
          :value="formData.receiverType"
        />
      </el-form-item>

      <el-form-item :label="$t('form.content')">
        <el-text>
          {{ formData.content }}
        </el-text>
      </el-form-item>

      <el-form-item
        v-if="formData.receiverType === 'specific' && selectedUser"
        :label="$t('form.username')"
      >
        <div class="flex gap-2">
          <el-text>
            {{ selectedUser.username }}
          </el-text>
          <el-text>
            {{ selectedUser.email }}
          </el-text>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-center gap-3">
        <el-button class="px-6" @click="handleCancel">
          {{ $t("action.cancel") }}
        </el-button>
        <el-button type="primary" :loading="loading" class="px-6" @click="handleSend">
          {{ $t("action.send") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { User, Message } from "@element-plus/icons-vue";

// utils
// types
import type { NotificationType } from "@/api/system/notificationManage/data.d";
import type { UserListItem } from "@/api/system/userManage/data.d";

import { notificationTypeOptions, receiverTypeOptions } from "../utils/options"

interface Props {
  modelValue: boolean;
  formData: {
    title: string;
    content: string;
    type: NotificationType;
    receiverType: "all" | "specific";
    receiverUuid?: string;
  };
  userOptions?: UserListItem[];
  loading?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "send"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * 弹窗显示状态
 */
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

/**
 * 选中的用户信息
 */
const selectedUser = computed(() => {
  if (props.formData.receiverType === "specific" && props.formData.receiverUuid) {
    return props.userOptions?.find((user) => user.uuid === props.formData.receiverUuid);
  }
  return null;
});


/**
 * 处理取消操作
 */
const handleCancel = () => {
  visible.value = false;
};

/**
 * 处理发送操作
 */
const handleSend = () => {
  emit("send");
};
</script>
