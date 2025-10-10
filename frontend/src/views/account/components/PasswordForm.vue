<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-06 15:42:53
 * @Description: 修改密码表单
-->

<template>
  <el-form
    ref="formRef"
    :model="formState"
    :rules="rules"
    label-position="top"
    @submit.prevent="handleSubmit"
  >
    <el-form-item :label="$t('account.currentPassword')" prop="currentPassword">
      <el-input
        v-model="formState.currentPassword"
        type="password"
        :placeholder="getRequiredMessage('currentPassword')"
        show-password
      />
    </el-form-item>

    <el-form-item :label="$t('account.verificationCode')" prop="code">
      <CodeInput
        v-model:model-value="formState.code"
        :placeholder="getRequiredMessage('code')"
        :target="formState.email"
        :send-code-api="
          commonApi.onSendEmailCode({
            email: formState.email,
            type: EmailVerificationType.EDIT_PASSWORD,
          })
        "
      />
    </el-form-item>

    <el-form-item :label="$t('account.newPassword')" prop="password">
      <el-input
        v-model="formState.password"
        type="password"
        :placeholder="getRequiredMessage('newPassword')"
        show-password
      />
    </el-form-item>

    <el-form-item :label="$t('account.confirmPassword')" prop="confirmPassword">
      <el-input
        v-model="formState.confirmPassword"
        type="password"
        :placeholder="getRequiredMessage('confirmPassword')"
        show-password
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" native-type="submit" :loading="loading">
        {{ $t('account.changePassword') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';

import { EmailVerificationType } from '@/api/common/types';

import type { FormInstance } from 'element-plus';
// type

interface Props {
  accountInfo: {
    email?: string;
  };
}

const props = defineProps<Props>();
// 定义emit事件
const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);

const formState = reactive({
  code: '',
  confirmPassword: '',
  currentPassword: '',
  email: '',
  password: '',
});

const getRequiredMessage = (key: string) => i18nText(`account.message.${key}.required`);
const getMinMessage = (key: string) => i18nText(`account.message.${key}.min`);

const rules = {
  code: [{ message: getRequiredMessage('code'), required: true }],
  confirmPassword: [
    { message: getRequiredMessage('confirmPassword'), required: true },
    {
      validator: (_: any, value: string) => {
        if (value && value !== formState.password) {
          return Promise.reject(new Error(i18nText('account.message.passwordMismatch')));
        }
        return Promise.resolve();
      },
    },
  ],
  currentPassword: [{ message: getRequiredMessage('currentPassword'), required: true }],
  password: [
    { message: getRequiredMessage('newPassword'), required: true },
    { message: getMinMessage('password'), min: 6 },
  ],
};

// 监听props变化更新表单
watch(
  () => props.accountInfo,
  (newVal) => {
    if (newVal?.email) {
      formState.email = newVal.email;
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  try {
    loading.value = true;
    await formRef.value?.validate();

    const response = await accountManageApi
      .editPassword(formState)
      .finally(() => (loading.value = false));

    handleReturnResults({
      onSuccess: () => {
        ElMessage.success(i18nText('account.passwordChangeSuccess'));
        formRef.value?.resetFields();
        emit('success');
      },
      params: response,
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    ElMessage.error(i18nText('account.passwordChangeFail'));
  }
};
</script>
