<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-06 22:41:10
 * @Description: 单选
-->

<template>
  <el-radio-group v-model="props.modelValue" @change="handleChange">
    <el-radio v-for="item in props.options" :key="item.value" :value="item.value">
      {{ item.labelKey ? $t(item.labelKey) : item.label }}
    </el-radio>
  </el-radio-group>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: any;
  options: OptionsItemType[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: any];
  change: [value: any];
}>();

const handleChange = (value: any) => {
  emit('update:modelValue', value);
  emit('change', value);
};
</script>
