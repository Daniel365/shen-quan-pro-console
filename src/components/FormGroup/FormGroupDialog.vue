<template>
  <!-- 弹窗表单组件 -->
  <el-dialog 
    v-model="visible" 
    :title="dialogTitle" 
    :width="width" 
    @close="handleClose"
    :close-on-click-modal="false"
  >
    <FormGroup
      ref="formGroupRef"
      :form-fields="formFields"
      :form-rules="formRules"
      :model-value="formData"
      :label-width="labelWidth"
      @update:model-value="handleFormUpdate"
      @validate="handleValidate"
    >
      <!-- 插槽用于自定义表单内容 -->
      <slot />
    </FormGroup>

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
import type { FormGroupProps } from './types';

interface Props {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 操作类型 */
  actionType: ActionTypeEnum;
  /** 表单字段配置 */
  formFields: FormGroupProps['formFields'];
  /** 表单验证规则 */
  formRules?: FormGroupProps['formRules'];
  /** 新增API */
  addApi?: FormGroupProps['addApi'];
  /** 编辑API */
  editApi?: FormGroupProps['editApi'];
  /** 详情数据 */
  detailsData?: FormGroupProps['detailsData'];
  /** 弹窗宽度 */
  width?: FormGroupProps['width'];
  /** 标签宽度 */
  labelWidth?: FormGroupProps['labelWidth'];
  /** 弹窗标题映射 */
  titleMap?: FormGroupProps['titleMap'];
  /** 提交按钮文本映射 */
  submitButtonTextMap?: FormGroupProps['submitButtonTextMap'];
}

const props = withDefaults(defineProps<Props>(), {
  formRules: () => ({}),
  detailsData: () => ({}),
  width: '500px',
  labelWidth: '100px',
  titleMap: () => ({
    [ActionTypeEnum.CREATE]: 'action.add',
    [ActionTypeEnum.EDIT]: 'action.edit',
    [ActionTypeEnum.DETAIL]: 'action.detail',
    [ActionTypeEnum.COPY]: 'action.copy',
  }),
  submitButtonTextMap: () => ({
    [ActionTypeEnum.CREATE]: 'action.submit',
    [ActionTypeEnum.EDIT]: 'action.save',
    [ActionTypeEnum.DETAIL]: 'action.confirm',
    [ActionTypeEnum.COPY]: 'action.save',
  }),
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'update:detailsData': [data: Record<string, any>];
  'success': [];
  'cancel': [];
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

// 弹窗标题
const dialogTitle = computed(() => {
  return i18nText(props.titleMap[props.actionType]);
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
      Object.keys(formData).forEach(key => {
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

    const submitData = { ...formData };

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
  validate: () => formGroupRef.value?.validate(),
  resetFields: () => formGroupRef.value?.resetFields(),
  clearValidate: () => formGroupRef.value?.clearValidate(),
});
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>