<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-08-27 18:19:12
 * @Description: 登录
-->
<template>
  <AdminContainer :form-title="$t('admin.userLogin')">
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

      <el-form-item>
        <div class="form-options">
          <!-- 记住我 -->
          <span></span>
          <!-- <el-checkbox  v-model="formState.remember">
            {{ $t('admin.rememberMe') }}
          </el-checkbox> -->
          <!-- 忘记密码 -->
          <el-link
            type="primary"
            underline="never"
            @click.prevent="goToPage(RouterPath.FORGOT_PASSWORD)"
          >
            {{ $t('admin.forgetPassword') }}
          </el-link>
        </div>
      </el-form-item>
      <!-- 登录按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          size="large"
          :loading="loading"
          class="admin-button"
          style="width: 100%"
        >
          {{ $t(loading ? 'admin.logging' : 'admin.login') }}
        </el-button>
      </el-form-item>
      <!-- 没有账号、去注册 -->
      <div class="admin-actions">
        <span>{{ $t('admin.noAccount') }}</span>
        <el-link
          class="ml-1"
          type="primary"
          underline="never"
          @click.prevent="goToPage(RouterPath.REGISTER)"
        >
          {{ $t('admin.register') }}
        </el-link>
      </div>
    </el-form>
    <!-- 其他登录方式 -->
    <div class="admin-extra">
      <OtherMethods />
    </div>
  </AdminContainer>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';

import type { FormInstance } from 'element-plus';

const { route, goToPage, goReplace, resolveRedirectTarget } = useRouteUtil();
const accountStore = useAccountStore();
const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);

const formState = reactive({
  password: '',
  remember: false,
  username: '',
});

const getRequiredMessage = (key: string) => i18nText(`admin.message.${key}.required`);

const rules = {
  password: [{ message: getRequiredMessage('password'), required: true }],
  username: [{ message: getRequiredMessage('username'), required: true }],
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    await formRef.value?.validate();
    const response = await adminManageApi.onLogin(formState).finally(() => {
      loading.value = false;
    });

    handleReturnResults({
      onSuccess: async () => {
        ElMessage.success(i18nText('admin.loginSuccess'));
        // 1. 获取用户信息（包含用户角色，用于路由生成）
        await accountStore.getAccountInfo();
        // 2. 登录成功，让路由守卫处理跳转逻辑
        // 解析目标地址，但不直接跳转
        const redirect = resolveRedirectTarget(route.query);
        // 通过替换当前路由触发路由守卫，让守卫处理后续的路由生成和跳转
        await goReplace(redirect);
      },
      params: response,
    });
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};
</script>
