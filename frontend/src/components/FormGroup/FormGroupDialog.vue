<template>
  <!-- 弹窗表单组件 -->
  <el-dialog
    v-model="visible"
    :title="dialogTitle || getActionTitle(actionType)"
    :width="width"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <FormGroup
      ref="formGroupRef"
      :form-fields="formFields"
      :form-rules="formRules"
      :model-value="formData"
      :label-width="labelWidth"
      :label-position="labelPosition"
      @update:model-value="handleFormUpdate"
      @validate="handleValidate"
    />

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          {{ $t('action.cancel') }}
        </el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ getSubmitButtonText() }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { ElMessage } from 'element-plus';

import FormGroup from './FormGroup.vue';

import type { FormGroupDialogProps } from './types';


const props = withDefaults(defineProps<FormGroupDialogProps>(), {
  detailsData: () => ({}),
  formRules: () => ({}),
  labelWidth: '100px',
  submitButtonTextMap: () => ({
    [ActionTypeEnum.CREATE]: 'action.submit',
    [ActionTypeEnum.EDIT]: 'action.save',
    [ActionTypeEnum.DETAIL]: 'action.confirm',
    [ActionTypeEnum.COPY]: 'action.save',
  }),
  width: '500px',
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'update:detailsData': [data: Record<string, any>];
  success: [];
  cancel: [];
}>();

const formGroupRef = ref<InstanceType<typeof FormGroup>>();
const loading = ref(false);
const formValid = ref(true);

// 表单数据
const formData = reactive<Record<string, any>>({ ...props.detailsData });

// 双向绑定visible
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});


// 获取提交按钮文本
const getSubmitButtonText = () => {
  return i18nText(props.submitButtonTextMap[props.actionType]);
};

// 处理表单数据更新
const handleFormUpdate = (value: Record<string, any>) => {
  Object.assign(formData, value);
};

// 处理表单验证结果
const handleValidate = (valid: boolean) => {
  formValid.value = valid;
};

// 监听弹窗显示状态
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      // 弹窗打开时，重置表单数据
      Object.assign(formData, props.detailsData);
      formValid.value = true;
    } else {
      // 弹窗关闭时，清空表单数据
      Object.keys(formData).forEach((key) => {
        delete formData[key];
      });
    }
  },
  { immediate: true }
);

// 监听详情数据变化
watch(
  () => props.detailsData,
  (newData) => {
    if (props.visible) {
      Object.assign(formData, newData);
    }
  },
  { deep: true }
);

// 关闭弹窗
const handleClose = () => {
  visible.value = false;
  emit('cancel');
};

// 提交表单
const handleSubmit = async () => {
  try {
    if (props.actionType === ActionTypeEnum.DETAIL) {
      handleClose();
      return;
    }

    // 验证表单
    const isValid = await formGroupRef.value?.validate();
    if (!isValid) {
      ElMessage.error(i18nText('formGroup.validateFailed'));
      return;
    }

    loading.value = true;

    const submitData = props.handleSubmitData ? props.handleSubmitData(formData) :  { ...formData };

    let response: any;
    if (props.actionType === ActionTypeEnum.EDIT && props.editApi) {
      response = await props.editApi(submitData);
    } else if (
      (props.actionType === ActionTypeEnum.CREATE || props.actionType === ActionTypeEnum.COPY) &&
      props.addApi
    ) {
      response = await props.addApi(submitData);
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
    console.error('表单提交失败:', error);
    ElMessage.error(i18nText('action.submitFailed'));
  } finally {
    loading.value = false;
  }
};

// 暴露方法给父组件
defineExpose({
  clearValidate: () => formGroupRef.value?.clearValidate(),
  resetFields: () => formGroupRef.value?.resetFields(),
  validate: () => formGroupRef.value?.validate(),
});
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
