<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="120px"
    label-position="top"
  >
    <!-- 标签名称 -->
    <el-form-item :label="$t('tagManage.nameLabel')" prop="name">
      <el-input
        v-model="formData.name"
        :placeholder="$t('tagManage.namePlaceholder')"
        :readonly="actionType === ActionTypeEnum.DETAIL"
        maxlength="50"
        show-word-limit
        clearable
      />
    </el-form-item>

    <!-- 标签描述 -->
    <el-form-item :label="$t('tagManage.descriptionLabel')" prop="description">
      <el-input
        v-model="formData.description"
        type="textarea"
        :rows="3"
        :placeholder="$t('tagManage.descriptionPlaceholder')"
        :readonly="actionType === ActionTypeEnum.DETAIL"
        maxlength="200"
        show-word-limit
        resize="none"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { type FormInstance } from 'element-plus';

import { TagTranslationItem } from '@/api/app/tagManage/types';

interface Props {
  formData: TagTranslationItem;
  actionType: string;
  language: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [data: any];
}>();

const formRef = ref<FormInstance>();

const getRequiredMessage = (key: string) => i18nText(`tagManage.message.${key}.required`);
const getMaxLengthMessage = (key: string) => i18nText(`tagManage.message.${key}.maxLength`);

// 语言特定的表单验证规则
const formRules = {
  description: [{ max: 200, message: getMaxLengthMessage('description'), trigger: 'blur' }],
  name: [
    { message: getRequiredMessage('name'), required: true, trigger: 'blur' },
    { max: 50, message: getMaxLengthMessage('name'), trigger: 'blur' },
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

// 暴露方法给父组件
const validate = () => {
  if (!formRef.value) return Promise.resolve(true);
  return formRef.value.validate();
};

defineExpose({
  validate,
});
</script>
