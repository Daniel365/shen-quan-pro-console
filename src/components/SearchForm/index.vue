<template>
  <div class="search-form">
    <!-- 使用 FormGroup 组件渲染表单字段 -->
    <FormGroup
      ref="formGroupRef"
      :form-fields="formFields"
      :model-value="formData"
      :inline="true"
      :clearable="true"
      :item-class="'search-form-item'"
      @update:model-value="handleFormUpdate"
    >
      <!-- 搜索和重置按钮 -->
      <template #default>
        <div class="search-footer-action">
          <el-button type="primary" :loading="loading" @click="handleSearch">
            {{ $t('action.search') }}
          </el-button>
          <el-button :loading="loading" @click="handleReset">
            {{ $t('action.reset') }}
          </el-button>
        </div>
      </template>
    </FormGroup>
  </div>
</template>

<script setup lang="ts">
import type { FormGroup, FormGroupFieldConfig } from '@/components/FormGroup';

/**
 * 搜索表单字段配置接口
 */
export interface SearchField extends FormGroupFieldConfig {
  /** 字段宽度 */
  width?: string;
}

/**
 * 搜索表单组件属性接口
 */
interface Props {
  /** 搜索字段配置列表 */
  fields: SearchField[];
  /** 表单数据双向绑定 */
  modelValue: Record<string, any>;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 组件属性定义
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

/**
 * 组件事件定义
 */
const emit = defineEmits<{
  /** 更新表单数据 */
  'update:modelValue': [value: Record<string, any>];
  /** 搜索事件 */
  search: [params: Record<string, any>];
  /** 重置事件 */
  reset: [];
}>();

const formGroupRef = ref<InstanceType<typeof FormGroup>>();

/**
 * 表单数据
 */
const formData = reactive({ ...props.modelValue });

/**
 * 将搜索字段配置转换为 FormGroup 字段配置
 */
const formFields = computed(() => {
  return props.fields.map((field) => ({
    ...field,
    // 将宽度等样式配置转换为 FormGroup 支持的格式
    ...(field.width && { style: { width: field.width } }),
  }));
});

/**
 * 监听父组件传入的modelValue变化
 */
watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(formData, newVal);
  },
  { deep: true }
);

/**
 * 处理表单数据更新
 */
const handleFormUpdate = (value: Record<string, any>) => {
  Object.assign(formData, value);
  emit('update:modelValue', { ...value });
};

/**
 * 处理搜索操作
 */
const handleSearch = () => {
  emit('search', { ...formData });
};

/**
 * 处理重置操作
 */
const handleReset = () => {
  formGroupRef.value?.resetFields();
  emit('reset');
};

/**
 * 暴露方法给父组件
 */
defineExpose({
  clearValidate: () => formGroupRef.value?.clearValidate(),
  resetFields: () => formGroupRef.value?.resetFields(),
  validate: () => formGroupRef.value?.validate(),
});
</script>

<style scoped>
.search-form {
}
.search-footer-action {
  text-align: right;
}
</style>
