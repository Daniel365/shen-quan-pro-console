<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-06 15:42:37
 * @Description: 个人资料表单
-->

<template>
  <el-form
    ref="formRef"
    :model="formState"
    :rules="rules"
    label-position="top"
    @submit.prevent="handleSubmit"
  >
    <el-form-item :label="$t('account.username')" prop="username">
      <el-input v-model="formState.username" :placeholder="getRequiredMessage('username')" />
    </el-form-item>

    <el-form-item :label="$t('account.email')" prop="email">
      <el-input v-model="formState.email" type="email" :placeholder="getRequiredMessage('email')" />
    </el-form-item>

    <el-form-item :label="$t('account.verificationCode')" prop="code">
      <CodeInput
        v-model:model-value="formState.code"
        :placeholder="getRequiredMessage('code')"
        :target="formState.email"
        :send-code-api="
          commonApi.onSendEmailCode({
            email: formState.email,
            type: EmailVerificationType.EDIT_PROFILE,
          })
        "
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" native-type="submit" :loading="loading">
        {{ $t('account.updateProfile') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';

import { EmailVerificationType } from '@/api/common/data.d';

const { accountInfo, setAccountInfo } = useAccountStore();
const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);

const formState: { username: string; email: string; code?: string } = reactive({
  code: '',
  email: '',
  username: '',
});

watch(
  () => accountInfo,
  (newVal: any) => {
    if (newVal) {
      formState.username = newVal?.username;
      formState.email = newVal?.email;
    }
  },
  { immediate: true }
);

const getRequiredMessage = (key: string) => i18nText(`account.message.${key}.required`);

const rules = {
  code: [{ message: getRequiredMessage('code'), required: true }],
  email: [{ message: getRequiredMessage('email'), required: true }],
  username: [{ message: getRequiredMessage('username'), required: true }],
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    await formRef.value?.validate();
    const params = {
      ...formState,
    };
    const response = await accountManageApi
      .editProfile(params)
      .finally(() => (loading.value = false));

    handleReturnResults({
      onSuccess: () => {
        // 更新store中的accountInfo
        setAccountInfo({
          ...params,
          code: undefined,
        } as any);
        ElMessage.success(i18nText('action.updateSuccess'));
      },
      params: response,
    });
  } catch (error) {
    loading.value = false;
    console.error('更新个人资料失败:', error);
    ElMessage.error(i18nText('action.updateFail'));
  }
};
</script>
