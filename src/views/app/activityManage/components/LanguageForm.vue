<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="120px"
    label-position="top"
  >
    <!-- 基础信息 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <!-- 活动标题 -->
        <el-form-item :label="$t('activityManage.titleLabel')" prop="title">
          <el-input
            v-model="formData.title"
            :placeholder="$t('activityManage.titlePlaceholder')"
            :readonly="actionType === ActionTypeEnum.DETAIL"
            maxlength="100"
            show-word-limit
            clearable
          />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 封面图上传 -->
    <el-form-item :label="$t('activityManage.coverLabel')" prop="coverImage">
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

    <!-- 活动描述 -->
    <el-form-item :label="$t('activityManage.descriptionLabel')" prop="description">
      <el-input
        v-model="formData.description"
        type="textarea"
        :rows="4"
        :placeholder="$t('activityManage.descriptionPlaceholder')"
        :readonly="actionType === ActionTypeEnum.DETAIL"
        maxlength="500"
        show-word-limit
        resize="none"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';

import { ActivityTranslationItem } from '@/api/app/activityManage/types';

interface Props {
  formData: ActivityTranslationItem;
  actionType: string;
  language: string;
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
    const updatedData = { ...props.formData, coverImage: response.data.url };
    emit('update:formData', updatedData);
    ElMessage.success('上传成功');
  } else {
    ElMessage.error('上传失败');
  }
};

// 删除文件
const handleRemove = () => {
  const updatedData = { ...props.formData, coverImage: '' };
  emit('update:formData', updatedData);
};

const getRequiredMessage = (key: string) => i18nText(`activityManage.message.${key}.required`);
const getMaxLengthMessage = (key: string) => i18nText(`activityManage.message.${key}.maxLength`);

// 语言特定的表单验证规则
const formRules = {
  coverImage: [{ message: getRequiredMessage('coverImage'), required: true, trigger: 'blur' }],
  description: [{ max: 500, message: getMaxLengthMessage('description'), trigger: 'blur' }],
  title: [
    { message: getRequiredMessage('title'), required: true, trigger: 'blur' },
    { max: 100, message: getMaxLengthMessage('title'), trigger: 'blur' },
  ],
};

// 暴露方法给父组件
const validate = () => {
  if (!formRef.value) return Promise.resolve(true);
  return formRef.value.validate();
};

defineExpose({
  validate,
});
</script>
