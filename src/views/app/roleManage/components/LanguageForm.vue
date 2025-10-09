<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 14:00:00
 * @Description: 角色管理语言表单组件
-->
<template>
  <el-form
    ref="formRef"
    :disabled="disabled"
    :model="formData"
    :rules="languageFormRules"
    label-width="120px"
    label-position="top"
  >
    <!-- 角色名称 -->
    <el-form-item :label="$t('form.roleName')" prop="name">
      <el-input
        v-model="formData.name"
        :placeholder="$t('form.enterRoleName')"
        :maxlength="100"
        :show-word-limit="true"
        width="100%"
      />
    </el-form-item>

    <!-- 角色描述 -->
    <el-form-item :label="$t('form.roleDesc')" prop="description">
      <el-input
        v-model="formData.description"
        :placeholder="$t('form.enterRoleDesc')"
        :maxlength="150"
        :rows="3"
        :show-word-limit="true"
        type="textarea"
        width="100%"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { type FormInstance } from 'element-plus';

import { RoleTranslationItem } from '@/api/app/roleManage/types';


// 定义组件的props
interface Props {
  formData: RoleTranslationItem;
  actionType: ActionTypeEnum;
  language: string;
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
  'update:formData': [data: any];
}>();

// 表单引用
const formRef = ref<FormInstance>();

const getRequiredMessage = (key: string) => i18nText(`roleManage.message.${key}.required`);
const getMaxLengthMessage = (key: string) => i18nText(`roleManage.message.${key}.maxLength`);

// 语言表单验证规则
const languageFormRules = {
  description: [{ max: 150, message: getMaxLengthMessage('roleDesc'), trigger: 'blur' }],
  name: [
    { message: getRequiredMessage('roleName'), required: true, trigger: 'blur' },
    { max: 100, message: getMaxLengthMessage('roleName'), trigger: 'blur' },
  ],
};


// 表单数据变化时通知父组件
watch(
  () => props.formData,
  (newData) => {
    emit('update:formData', newData);
  },
  { deep: true }
);

/** 验证 */
const validate = () => {
  if (!formRef.value) return Promise.resolve(true);
  return formRef.value.validate();
};

/** 重置表单 */
const resetFields = () => {
  if (!formRef.value) return Promise.resolve(true);
  return formRef.value.resetFields();
};

// 定义暴露的方法
defineExpose({
  resetFields,
  validate,
});
</script>
