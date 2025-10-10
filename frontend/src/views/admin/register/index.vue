<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-08-29 14:54:02
 * @Description: 注册
-->
<template>
  <AdminContainer :form-title="$t('admin.userRegister')">
    <el-form ref="formRef" :model="formState" :rules="rules" @submit.prevent="handleSubmit">
      <el-form-item prop="username">
        <el-input
          v-model="formState.username"
          size="large"
          :placeholder="getRequiredMessage('username')"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="formState.password"
          type="password"
          size="large"
          :placeholder="getRequiredMessage('password')"
          show-password
        />
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input
          v-model="formState.confirmPassword"
          type="password"
          size="large"
          :placeholder="getRequiredMessage('confirmPassword')"
          show-password
        />
      </el-form-item>
      <el-form-item prop="email">
        <el-input
          v-model="formState.email"
          size="large"
          type="email"
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
              type: EmailVerificationType.REGISTER,
            })
          "
        />
      </el-form-item>
      <!-- 协议 -->
      <el-form-item>
        <el-checkbox v-model="formState.agree">
          {{ $t('admin.agree') }}
          <a href="#">《{{ $t('admin.userAgreement') }}》</a>
          <span>、</span>
          <a href="#">《{{ $t('admin.privacyPolicy') }}》</a>
        </el-checkbox>
      </el-form-item>

      <!-- 注册按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          size="large"
          :loading="loading"
          class="admin-button"
          style="width: 100%"
        >
          {{ $t(loading ? 'action.submiting' : 'admin.register') }}
        </el-button>
      </el-form-item>

      <!-- 已有账号、去登录 -->
      <div class="admin-actions">
        <span>{{ $t('admin.haveAccount') }}</span>
        <el-link type="primary" underline="never" @click.prevent="goToPage(RouterPath.LOGIN)">
          {{ $t('admin.goLogin') }}
        </el-link>
      </div>
    </el-form>
  </AdminContainer>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';

// type
import { EmailVerificationType } from '@/api/common/types';

const { goToPage } = useRouteUtil();
const formRef = ref();
const loading = ref(false);

const formState = reactive({
  agree: true,
  code: '',
  confirmPassword: '',
  email: '',
  password: '',
  username: '',
});

const getRequiredMessage = (key: string) => i18nText(`admin.message.${key}.required`);
const getMinMessage = (key: string) => i18nText(`admin.message.${key}.min`);

const rules = {
  agree: [{ message: getRequiredMessage('agree'), required: true }],
  code: [
    { message: getRequiredMessage('code'), required: true },
    {
      len: 6,
      message: getMinMessage('code'),
      transform: (v: string) => v?.trim(),
    },
  ],
  confirmPassword: [
    { message: getRequiredMessage('confirmPassword'), required: true },
    {
      validator: (_: any, value: string) => {
        if (value && value !== formState.password)
          return Promise.reject(i18nText(`admin.message.confirmPassword.inconformity`));
        return Promise.resolve();
      },
    },
  ],
  email: [{ message: getRequiredMessage('email'), required: true }],
  password: [
    { message: getRequiredMessage('password'), required: true },
    { message: getMinMessage('password'), min: 6 },
  ],
  username: [
    { message: getRequiredMessage('username'), required: true },
    { message: getMinMessage('username'), min: 3 },
  ],
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    await formRef.value.validate();

    const response = await adminManageApi.onRegister(formState).finally(() => {
      loading.value = false;
    });
    handleReturnResults({
      onSuccess: () => {
        ElMessage.success(i18nText('admin.registerSuccess'));
        goToPage(RouterPath.LOGIN);
      },
      params: response,
    });
  } catch (e) {
    ElMessage.error(i18nText('admin.registerError'));
  }
};
</script>
