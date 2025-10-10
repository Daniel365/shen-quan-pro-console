<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="120px"
    label-position="top"
    :disabled="disabled"
  >
    <!-- 会员卡名称 -->
    <el-form-item :label="i18nText('membershipCardManage.nameLabel')" prop="name">
      <el-input
        v-model="formData.name"
        :placeholder="i18nText('membershipCardManage.namePlaceholder')"
        maxlength="50"
        show-word-limit
        clearable
      />
    </el-form-item>

    <!-- 封面图上传 -->
    <el-form-item :label="i18nText('membershipCardManage.coverLabel')" prop="coverImages">
      <el-upload
        v-model:file-list="fileList"
        :action="uploadUrl"
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-remove="handleRemove"
        list-type="picture-card"
        accept="image/*"
      >
        <IconFont name="plus" font-size="40px" />
      </el-upload>
    </el-form-item>

    <!-- 会员卡描述 -->
    <el-form-item :label="i18nText('membershipCardManage.descriptionLabel')" prop="description">
      <el-input
        v-model="formData.description"
        type="textarea"
        :rows="3"
        :placeholder="i18nText('membershipCardManage.descriptionPlaceholder')"
        maxlength="200"
        show-word-limit
        resize="none"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';

import { MembershipCardTranslationItem } from '@/api/app/membershipCardManage/types';

interface Props {
  formData: MembershipCardTranslationItem;
  actionType: string;
  language: string;
  disabled?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [data: any];
}>();

const formRef = ref<FormInstance>();

// 文件上传相关
const fileList = ref(props.formData.coverImages || []);
const uploadUrl = '/api/upload/image';

// 文件上传前验证
const beforeUpload = (file: File) => {
  const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPGorPNG) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 上传成功处理
const handleUploadSuccess = (response: any) => {
  if (response.code === 200) {
    const newImage = {
      sort: fileList.value.length,
      type: 'main',
      url: response.data.url,
    };

    const updatedCoverImages = [...(props.formData.coverImages || []), newImage];
    const updatedData = { ...props.formData, coverImages: updatedCoverImages };
    emit('update:formData', updatedData);
    ElMessage.success('上传成功');
  } else {
    ElMessage.error('上传失败');
  }
};

// 删除文件
const handleRemove = (file: any) => {
  const updatedCoverImages = (props.formData.coverImages || []).filter(
    (img: any) => img.url !== file.url
  );
  const updatedData = { ...props.formData, coverImages: updatedCoverImages };
  emit('update:formData', updatedData);
};

const getRequiredMessage = (key: string) =>
  i18nText(`membershipCardManage.message.${key}.required`);
const getMaxLengthMessage = (key: string) =>
  i18nText(`membershipCardManage.message.${key}.maxLength`);

// 语言特定的表单验证规则
const formRules = {
  cover_images: [{ message: getRequiredMessage('cover_images'), required: true, trigger: 'blur' }],
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
