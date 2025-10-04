<template>
  <!-- 编辑用户抽屉 -->
  <el-dialog v-model="visible" :title="$t('userManage.editUser')" :width="500" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item :label="$t('form.nickname')" prop="nickname">
        <el-input v-model="formData.nickname" :placeholder="$t('form.enterNickname')" />
      </el-form-item>

      <el-form-item :label="$t('form.role')" prop="roleUuids">
        <ApiSelect
          v-model="formData.roleUuids"
          :api="roleManageApi.getList"
          label-field="name"
          value-field="uuid"
          multiple
          :placeholder="$t('form.selectRole')"
        />
      </el-form-item>

      <el-form-item :label="$t('form.status')" prop="status">
        <radio-group v-model="formData.status" :options="enabledStatusOptions" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div style="text-align: right">
        <el-button style="margin-right: 8px" @click="handleClose">
          {{ $t('action.cancel') }}
        </el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ $t('action.save') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';

// utils
import type {
  UserEditParams,
  UserListItem,
} from '@/api/app/userManage/data.d';
import { enabledStatusOptions } from '@/utils/options';
// type

/**
 * 组件属性接口
 */
interface Props {
  /** 抽屉显示状态 */
  visible: boolean;
  /** 编辑的用户数据 */
  userData?: UserListItem;
}

/**
 * 组件属性定义
 */
const props = defineProps<Props>();

/**
 * 组件事件定义
 */
const emit = defineEmits<{
  /** 更新显示状态 */
  'update:visible': [value: boolean];
  /** 操作成功事件 */
  success: [];
}>();

/**
 * 双向绑定显示状态
 */
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

/**
 * 表单引用
 */
const formRef = ref<FormInstance>();

/**
 * 加载状态
 */
const loading = ref(false);

/**
 * 表单数据
 */
const formData = reactive<UserEditParams>({
  nickname: '',
  roleUuids: [],
  status: 0,
  uuid: '',
});

/**
 * 表单验证规则
 */
const rules = {
  roleUuids: [
    {
      message: i18nText('form.selectRole'),
      required: true,
      trigger: 'submit',
    },
  ],
  username: [
    {
      message: i18nText('form.enterUsername'),
      required: true,
      trigger: 'blur',
    },
  ],
};

/**
 * 监听用户数据变化，自动填充表单
 */
watch(
  () => props.userData,
  (newData: any) => {
    if (newData) {
      Object.assign(formData, {
        roleUuids: newData.roleUuids,
        status: newData.status,
        username: newData.username,
        uuid: newData.uuid,
      });
    }
  },
  { immediate: true }
);

/**
 * 关闭抽屉并重置表单
 */
const handleClose = () => {
  emit('update:visible', false);
  formRef.value?.resetFields();
};

/**
 * 提交表单数据
 */
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;

    const response = await appUserManageApi.onEdit(formData).finally(() => {
      loading.value = false;
    });
    handleReturnResults({
      onSuccess: () => {
        ElMessage.success(i18nText('action.submitSuccess'));
        emit('success');
        handleClose();
      },
      params: response,
    });
  } catch (error) {
    ElMessage.error(i18nText('action.submitFailed') + error);
  }
};
</script>
