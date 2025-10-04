<template>
  <template v-if="label">
    <el-tag v-if="type === 'tag'" :type="theme">
      {{ label }}
    </el-tag>
    <span v-else>{{ label }}</span>
  </template>
</template>

<script setup lang="ts">
/**
 * 状态文本组件属性接口
 */
interface Props {
  /** 状态选项列表 */
  options: OptionsItemType[];
  /** 当前值 */
  value: any;
  /** 显示类型 */
  type?: 'tag' | 'text';
}

/**
 * 组件属性定义
 */
const props = withDefaults(defineProps<Props>(), {
  type: 'tag',
});

/**
 * 根据当前值找到对应的选项配置
 */
const currentOption = computed(() => props.options.find((option) => option.value === props.value));

const label = computed(() => currentOption.value?.label);
const theme: any = computed(() => currentOption.value?.theme || 'info');
</script>
