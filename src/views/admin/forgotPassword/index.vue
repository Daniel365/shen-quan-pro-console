<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-04 22:42:06
 * @Description: 忘记密码
-->

<template>
  <AdminContainer :form-title="$t('admin.forgetPassword')">
    <el-form ref="formRef" :model="formState" :rules="rules" @submit.prevent="handleSubmit">
      <el-form-item prop="email">
        <el-input
          v-model="formState.email"
          type="email"
          size="large"
          :placeholder="getRequiredMessage('email')"
        />
      </el-form-item>

      <el-form-item prop="code">
        <CodeInput
          v-model:model-value="formState.code"
          :placeholder="getRequiredMessage('code')"
          :target="formState.email"
          :send-code-api="
            commonApi.onSendEmailCode({
              email: formState.email,
              type: EmailVerificationType.RESET_PASSWORD,
            })
          "
        />
      </el-form-item>

      <el-form-item prop="newPassword">
        <el-input
          v-model="formState.newPassword"
          type="password"
          size="large"
          :placeholder="getRequiredMessage('newPassword')"
          show-password
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          size="large"
          :loading="loading"
          class="admin-button"
          style="width: 100%"
        >
          {{ $t('admin.resetPassword') }}
        </el-button>
      </el-form-item>

      <div class="admin-actions">
        <el-link type="primary" underline="never" @click.prevent="goToPage(RouterPath.LOGIN)">
          {{ $t('admin.login') }}
        </el-link>
      </div>
    </el-form>
  </AdminContainer>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';

import { EmailVerificationType } from '@/api/common/types';

import type { FormInstance } from 'element-plus';
// type

const { goToPage } = useRouteUtil();
const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);

const formState = reactive({
  code: '',
  email: '',
  newPassword: '',
});

const getRequiredMessage = (key: string) => i18nText(`admin.message.${key}.required`);
const getMinMessage = (key: string) => i18nText(`admin.message.${key}.min`);

const rules = {
  code: [{ message: getRequiredMessage('code'), required: true }],
  email: [{ message: getRequiredMessage('email'), required: true }],
  newPassword: [
    { message: getRequiredMessage('newPassword'), required: true },
    { message: getMinMessage('password'), min: 6 },
  ],
};

// 提交
const handleSubmit = async () => {
  try {
    loading.value = true;
    await formRef.value?.validate();

    const response = await adminManageApi
      .onResetPassword(formState)
      .finally(() => (loading.value = false));

    handleReturnResults({
      onSuccess: () => {
        ElMessage.success(i18nText('action.resetSuccess'));
        goToPage(RouterPath.LOGIN);
      },
      params: response,
    });
  } catch (error) {
    console.error('重置密码失败:', error);
    ElMessage.error(i18nText('action.resetFail'));
  }
};
</script>
