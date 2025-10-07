<template>
  <el-select
    v-model="selectedValue"
    :placeholder="placeholder"
    :style="{ width: width }"
    :clearable="clearable"
    :filterable="filterable"
    :disabled="disabled"
    :multiple="multiple"
    :collapse-tags="collapseTags"
    :collapse-tags-tooltip="collapseTagsTooltip"
    @change="handleChange"
    @visible-change="handleVisibleChange"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      :disabled="item.disabled"
    />
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 选项接口
interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// 组件属性接口
interface Props {
  modelValue: string | number | (string | number)[] | null;
  options: Option[];
  placeholder?: string;
  width?: string;
  clearable?: boolean;
  filterable?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  collapseTags?: boolean;
  collapseTagsTooltip?: boolean;
}

// 事件接口
interface Emits {
  (e: 'update:modelValue', value: string | number | (string | number)[] | null): void;
  (e: 'change', value: string | number | (string | number)[] | null): void;
  (e: 'visible-change', visible: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  clearable: true,
  collapseTags: false,
  collapseTagsTooltip: false,
  disabled: false,
  filterable: false,
  multiple: false,
  placeholder: i18nText('form.pleaseSelect'),
  width: '240px',
});

const emit = defineEmits<Emits>();

// 计算属性
const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
  },
});

// 事件处理
const handleChange = (value: string | number | (string | number)[] | null) => {
  emit('change', value);
};

const handleVisibleChange = (visible: boolean) => {
  emit('visible-change', visible);
};

// 暴露方法给父组件
defineExpose({
  focus: () => {
    // 可以通过 ref 调用原生 focus 方法
    const selectEl = document.querySelector('.el-select') as HTMLElement;
    selectEl?.focus();
  },
});
</script>

<style scoped>
:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__inner) {
  border-radius: 4px;
}
</style>
