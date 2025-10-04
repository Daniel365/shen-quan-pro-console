<template>
  <!-- 公共弹窗表单组件 -->
  <el-dialog v-model="visible" :title="dialogTitle" :width="width" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" :label-width="labelWidth">
      <template v-for="item in formFields" :key="item.key">
        <el-form-item :label="getFieldLabel(item)" :prop="item.key" :required="item.required">
          <!-- 输入框 -->
          <el-input
            v-if="item.type === FormTypeEnum.INPUT"
            v-model="formData[item.key]"
            :placeholder="getFieldPlaceholder(item)"
            :maxlength="item.maxlength"
            :show-word-limit="item.showWordLimit"
          />

          <!-- 数字输入框 -->
          <el-input-number
            v-else-if="item.type === FormTypeEnum.INPUT_NUMBER"
            v-model="formData[item.key]"
            :placeholder="getFieldPlaceholder(item)"
            :min="item.min"
            :max="item.max"
          />

          <!-- 文本域 -->
          <el-input
            v-else-if="item.type === FormTypeEnum.TEXT_AREA"
            v-model="formData[item.key]"
            type="textarea"
            :placeholder="getFieldPlaceholder(item)"
            :maxlength="item.maxlength"
            :show-word-limit="item.showWordLimit"
            :rows="item.rows || 3"
          />

          <!-- 下拉选择 -->
          <Select
            v-else-if="item.type === FormTypeEnum.SELECT"
            v-model="formData[item.key]"
            :placeholder="getFieldPlaceholder(item)"
            :multiple="item.multiple"
            :filterable="item.filterable"
            :options="item.options || []"
          />

          <!-- API选择器 -->
          <ApiSelect
            v-else-if="item.type === FormTypeEnum.SELECT_API && item.api"
            v-model="formData[item.key]"
            :api="item.api"
            :label-field="item.labelField || 'label'"
            :value-field="item.valueField || 'value'"
            :multiple="item.multiple"
            :placeholder="getFieldPlaceholder(item)"
          />

          <!-- 单选组 -->
          <radio-group
            v-else-if="item.type === FormTypeEnum.RADIO_GROUP"
            v-model="formData[item.key]"
            :options="item.options || []"
          />

          <!-- 开关 -->
          <el-switch
            v-else-if="item.type === FormTypeEnum.SWITCH"
            v-model="formData[item.key]"
            :active-value="item.activeValue ?? 1"
            :inactive-value="item.inactiveValue ?? 0"
          />

          <!-- 自定义组件 -->
          <component
            :is="item.component"
            v-else-if="item.type === FormTypeEnum.CUSTOM"
            v-model="formData[item.key]"
            v-bind="item.props"
          />

          <!-- 日期选择器 -->
          <el-date-picker
            v-else-if="item.type === FormTypeEnum.DATE_PICKER"
            v-model="formData[item.key]"
            :type="item.dateType || 'date'"
            :placeholder="getFieldPlaceholder(item)"
          />
        </el-form-item>
      </template>
    </el-form>

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

import { ElMessage, type FormInstance } from 'element-plus';

import { FormGroupFieldConfig, FormGroupProps } from './types';

const props = withDefaults(defineProps<FormGroupProps>(), {
  formRules: () => ({}),
  labelWidth: '100px',
  submitButtonTextMap: () => ({
    [ActionTypeEnum.CREATE]: 'action.submit',
    [ActionTypeEnum.EDIT]: 'action.save',
    [ActionTypeEnum.DETAIL]: 'action.confirm',
    [ActionTypeEnum.COPY]: 'action.save',
  }),
  titleMap: () => ({
    [ActionTypeEnum.CREATE]: 'action.add',
    [ActionTypeEnum.EDIT]: 'action.edit',
    [ActionTypeEnum.DETAIL]: 'action.detail',
    [ActionTypeEnum.COPY]: 'action.copy',
  }),
  width: '500px',
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
  'update:detailsData': [data: Record<string, any>];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

// 双向绑定visible
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

// 表单数据
const formData = reactive<Record<string, any>>({});

// 初始化表单数据
const initFormData = () => {
  props.formFields.forEach((item) => {
    formData[item.key] = '';
    if (item.type === FormTypeEnum.SWITCH) {
      formData[item.key] = item.inactiveValue ?? 0;
    } else if (item.type === FormTypeEnum.SELECT && item.multiple) {
      formData[item.key] = [];
    }
  });
};

// 弹窗标题
const dialogTitle = computed(() => {
  return i18nText(props.titleMap[props.actionType]);
});

// 获取字段标签
const getFieldLabel = (item: FormGroupFieldConfig) => {
  return item.label;
};

// 获取字段占位符
const getFieldPlaceholder = (item: FormGroupFieldConfig) => {
  return item.placeholder || `请${getFieldLabel(item)}`;
};

// 获取提交按钮文本
const getSubmitButtonText = () => {
  return i18nText(props.submitButtonTextMap[props.actionType]);
};

// 监听详情数据变化
watch(
  () => props.visible,
  (newData) => {
    if (newData) {
      Object.assign(formData, props.detailsData);
    } else {
      initFormData();
    }
  },
  { immediate: true }
);

// 监听操作类型变化
watch(
  () => props.actionType,
  (newType) => {
    if (newType === ActionTypeEnum.DETAIL) {
      // 详情模式时禁用表单
      Object.keys(formData).forEach((key) => {
        formData[key] = formData[key]; // 保持只读状态
      });
    }
  },
  { immediate: true }
);

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false);
  formRef.value?.resetFields();
  initFormData();
};

// 提交表单
const handleSubmit = async () => {
  try {
    if (props.actionType === ActionTypeEnum.DETAIL) {
      handleClose();
      return;
    }

    await formRef.value?.validate();
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

// 初始化
initFormData();
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}
</style>
