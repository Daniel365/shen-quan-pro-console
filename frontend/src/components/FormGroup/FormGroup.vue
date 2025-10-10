<template>
  <!-- 核心表单组件 -->
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    :label-width="labelWidth"
    :label-position="labelPosition"
    :inline="inline"
    :disabled="disabled"
  >
    <template v-for="item in formFields" :key="item.key">
      <el-form-item
        :label="getFieldLabel(item)"
        :prop="item.key"
        :required="item.required"
        :class="itemClass"
      >
        <!-- 输入框 -->
        <el-input
          v-if="item.type === FormTypeEnum.INPUT"
          v-model="formData[item.key]"
          :placeholder="getFieldPlaceholder(item)"
          :maxlength="item.maxlength"
          :show-word-limit="item.showWordLimit"
          :clearable="clearable"
        />

        <!-- 数字输入框 -->
        <el-input-number
          v-else-if="item.type === FormTypeEnum.INPUT_NUMBER"
          v-model="formData[item.key]"
          :placeholder="getFieldPlaceholder(item)"
          :min="item.min"
          :max="item.max"
          :controls="false"
          :clearable="clearable"
          :style="{ width: '100%' }"
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
          :clearable="clearable"
        />

        <!-- 下拉选择 -->
        <Select
          v-else-if="item.type === FormTypeEnum.SELECT"
          v-model="formData[item.key]"
          :placeholder="getFieldPlaceholder(item)"
          :multiple="item.multiple"
          :filterable="item.filterable"
          :options="item.options || []"
          :clearable="clearable"
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
          :clearable="clearable"
        />

        <!-- 单选组 -->
        <RadioGroup
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

        <!-- 日期选择器 -->
        <el-date-picker
          v-else-if="item.type === FormTypeEnum.DATE_PICKER"
          v-model="formData[item.key]"
          :type="item.dateType || 'date'"
          :placeholder="getFieldPlaceholder(item)"
          :clearable="clearable"
          :style="{ width: '100%' }"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
        />

        <!-- 时间选择器 -->
        <el-date-picker
          v-else-if="item.type === FormTypeEnum.TIME_PICKER"
          v-model="formData[item.key]"
          type="datetime"
          :placeholder="getFieldPlaceholder(item)"
          :clearable="clearable"
          :style="{ width: '100%' }"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
        />

        <!-- 自定义组件 -->
        <component
          :is="item.component"
          v-else-if="item.type === FormTypeEnum.CUSTOM"
          v-model="formData[item.key]"
          v-bind="item.props"
        />

        <!-- 默认显示不支持的类型提示 -->
        <span v-else class="unsupported-type">
          {{ $t('formGroup.unsupportedType', { type: item.type }) }}
        </span>
      </el-form-item>
    </template>

    <!-- 插槽用于自定义内容 -->
    <slot />
  </el-form>
</template>

<script setup lang="ts">
import { FormProps, type FormInstance } from 'element-plus';

import { FormGroupFieldConfig } from './types';

interface Props {
  /** 表单字段配置 */
  formFields: FormGroupFieldConfig[];
  /** 表单验证规则 */
  formRules?: Record<string, any>;
  /** 表单数据 */
  modelValue?: Record<string, any>;
  /** 标签宽度 */
  labelWidth?: FormProps["labelWidth"];
  /** 标签方位 */
  labelPosition?: FormProps["labelPosition"];
  /** 内容宽度 */
  contentWidth?: string;
  /** 是否行内布局 */
  inline?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否可清除 */
  clearable?: boolean;
  /** 表单项类名 */
  itemClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  clearable: true,
  contentWidth: '520px',
  disabled: false,
  formRules: () => ({}),
  inline: false,
  itemClass: '',
  labelPosition: 'left',
  labelWidth: '100px',
  modelValue: () => ({}),
});

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>];
  validate: [valid: boolean];
}>();

const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive<Record<string, any>>({ ...props.modelValue });

// 初始化表单数据
const initFormData = () => {
  props.formFields.forEach((item) => {
    // 如果已经有值，保持原值
    if (props.modelValue[item.key] !== undefined) {
      formData[item.key] = props.modelValue[item.key];
      return;
    }

    // 根据字段类型设置默认值
    switch (item.type) {
      case FormTypeEnum.SWITCH:
        formData[item.key] = item.inactiveValue ?? 0;
        break;
      case FormTypeEnum.SELECT:
      case FormTypeEnum.SELECT_API:
        if (item.multiple) {
          formData[item.key] = [];
        } else {
          formData[item.key] = undefined;
        }
        break;
      case FormTypeEnum.INPUT_NUMBER:
        formData[item.key] = null;
        break;
      default:
        formData[item.key] = '';
        break;
    }
  });
};

// 获取字段标签
const getFieldLabel = (item: FormGroupFieldConfig) => {
  return item.label;
};

// 获取字段占位符
const getFieldPlaceholder = (item: FormGroupFieldConfig) => {
  return item.placeholder || `请${getFieldLabel(item)}`;
};

// 监听父组件传入的modelValue变化
watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(formData, newVal);
  },
  { deep: true }
);

// 监听表单数据变化，同步给父组件
watch(
  formData,
  (newVal) => {
    emit('update:modelValue', { ...newVal });
  },
  { deep: true }
);

// 表单验证方法
const validate = async () => {
  try {
    await formRef.value?.validate();
    emit('validate', true);
    return true;
  } catch (error) {
    emit('validate', false);
    return false;
  }
};

// 重置表单
const resetFields = () => {
  formRef.value?.resetFields();
  initFormData();
};

// 清除验证
const clearValidate = () => {
  formRef.value?.clearValidate();
};

// 暴露方法给父组件
defineExpose({
  clearValidate,
  formRef,
  resetFields,
  validate,
});

// 初始化
initFormData();
</script>

<style scoped>
:deep(.el-form-item) {
  margin-bottom: 20px;
}
:deep(.el-form-item__content) {
  width: v-bind(contentWidth);
}

.unsupported-type {
  color: var(--el-color-danger);
  font-size: 12px;
}
</style>
