<template>
  <el-form :model="formData" inline class="search-form">
    <template v-for="field in fields" :key="field.key">
      <el-form-item :label="field.label">
        <el-input
          v-if="field.type === 'input'"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
        />
        <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
          :style="{ width: field.width || '120px' }"
        >
          <el-option
            v-for="item in field.options"
            :key="item.value"
            :value="item.value"
            :label="item.labelKey ? $t(item.labelKey) : item.label"
          />
        </el-select>
      </el-form-item>
    </template>
    <el-form-item>
      <el-button type="primary" :loading="loading" @click="handleSearch">
        {{ $t('action.search') }}
      </el-button>
      <el-button :loading="loading" @click="handleReset">
        {{ $t('action.reset') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { FormTypeEnum } from '@/enums';

/**
 * 搜索表单字段配置接口
 */
export interface SearchField {
  /** 字段key */
  key: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: FormTypeEnum;
  /** 占位符文本 */
  placeholder?: string;
  /** 字段宽度 */
  width?: string;
  /** 选项数据（适用于select等） */
  options?: OptionsItemType[];
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

/**
 * 表单数据
 */
const formData = reactive({ ...props.modelValue });

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
 * 监听表单数据变化，同步给父组件
 */
watch(
  formData,
  (newVal) => {
    emit('update:modelValue', { ...newVal });
  },
  { deep: true }
);

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
  const resetData = props.fields.reduce((acc: any, field: any) => {
    acc[field.key] = field.type === 'select' ? undefined : '';
    return acc;
  }, {} as Record<string, any>);
  Object.assign(formData, resetData);
  emit('reset');
};
</script>

<style scoped>
.search-form {
  padding: 16px 16px 0;
  background: var(--el-bg-color-page);
  border-radius: 6px;
}
</style>
