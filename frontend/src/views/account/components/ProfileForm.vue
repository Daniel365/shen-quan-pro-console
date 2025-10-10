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

    <el-form-item v-if="isRoot(accountInfo.roleCode)" :label="$t('form.role')" prop="roleUuids">
      <ApiSelect
        v-model="formState.roleUuids"
        :api="roleManageApi.getList"
        label-field="name"
        value-field="uuid"
        multiple
        :placeholder="$t('form.selectRole')"
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

import { EmailVerificationType } from '@/api/common/types';
import { isRoot } from '@/constants';

const { accountInfo, setAccountInfo } = useAccountStore();
const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);

// 定义emit事件
const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

interface formDataProps {
  username: string;
  email: string;
  roleUuids?: string[];
  code?: string;
}

const formState = reactive<formDataProps>({
  code: '',
  email: '',
  roleUuids: [],
  username: '',
});

watch(
  () => accountInfo,
  (newVal: any) => {
    if (newVal) {
      formState.username = newVal?.username;
      formState.email = newVal?.email;
      formState.roleUuids = newVal?.roleUuids;
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
        emit('success');
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
