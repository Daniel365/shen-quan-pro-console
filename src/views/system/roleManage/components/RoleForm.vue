<template>
  <!-- 新增编辑角色弹窗 -->
  <el-dialog
    v-model="visible"
    :title="isEdit ? $t('roleManage.editRole') : $t('roleManage.addRole')"
    width="500px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item :label="$t('form.roleName')" prop="name">
        <el-input
          v-model="formData.name"
          :placeholder="$t('form.enterRoleName')"
          :maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item :label="$t('form.roleCode')" prop="code">
        <el-input
          v-model="formData.code"
          :placeholder="$t('form.enterRoleCode')"
          :maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item :label="$t('form.roleDesc')" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :placeholder="$t('form.enterRoleDesc')"
          :maxlength="150"
          show-word-limit
          :rows="3"
        />
      </el-form-item>

      <el-form-item :label="$t('form.status')" prop="status">
        <radio-group v-model="formData.status" :options="enabledStatusOptions" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
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
import { ElMessage } from 'element-plus';

import type { RoleListItem } from '@/api/system/roleManage/data.d';
import { enabledStatusOptions } from '@/utils/options';

import type { FormInstance } from 'element-plus';
// utils
// type

interface Props {
  visible: boolean;
  roleData?: RoleListItem;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

// 是否展示弹窗
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

// 是否为编辑模式
const isEdit = computed(() => !!props.roleData?.uuid);

// 表单数据
const formData = reactive({
  code: '',
  description: '',
  name: '',
  status: 1,
  uuid: '',
});

// 表单验证规则
const rules = {
  code: [
    { message: '请输入角色编码', required: true, trigger: 'blur' },
    { max: 100, message: '角色编码不能超过100个字符', trigger: 'blur' },
  ],
  description: [{ max: 150, message: '角色描述不能超过150个字符', trigger: 'blur' }],
  name: [
    { message: '请输入角色名称', required: true, trigger: 'blur' },
    { max: 100, message: '角色名称不能超过100个字符', trigger: 'blur' },
  ],
};

// 监听角色数据变化
watch(
  () => props.roleData,
  (newData) => {
    if (newData) {
      Object.assign(formData, {
        code: newData.code || '',
        description: newData.description || '',
        name: newData.name || '',
        status: newData.status,
        uuid: newData.uuid || '',
      });
    } else {
      // 新增时重置表单
      Object.assign(formData, {
        code: '',
        description: '',
        name: '',
        status: 1,
        uuid: '',
      });
    }
  },
  { immediate: true }
);

// 关闭抽屉
const handleClose = () => {
  emit('update:visible', false);
  formRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;

    const params = {
      ...formData,
      status: formData.status,
    };
    let response: any;
    if (isEdit.value) {
      response = await roleManageApi.onEdit(params).finally(() => {
        loading.value = false;
      });
    } else {
      response = await roleManageApi.onCreate(params).finally(() => {
        loading.value = false;
      });
    }
    handleReturnResults({
      onSuccess: () => {
        ElMessage.success(i18nText('action.submitSuccess'));
        emit('success');
        handleClose();
      },
      params: response,
    });
  } catch (error) {
    ElMessage.error(i18nText('action.submitFailed'));
  }
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
