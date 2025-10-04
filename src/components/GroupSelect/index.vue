<template>
  <el-select 
    v-model="selectedValue" 
    :placeholder="placeholder" 
    :style="{ width: width }"
    :clearable="clearable"
    :filterable="filterable"
    :disabled="disabled"
    @change="handleChange"
  >
    <el-option-group
      v-for="group in options"
      :key="group.label"
      :label="group.label"
    >
      <el-option
        v-for="item in group.options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :disabled="item.disabled"
      />
    </el-option-group>
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface OptionItem {
  value: string | number
  label: string
  disabled?: boolean
}

interface OptionGroup {
  label: string
  options: OptionItem[]
}

interface Props {
  modelValue: string | number | null
  options: OptionGroup[]
  placeholder?: string
  width?: string
  clearable?: boolean
  filterable?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | number | null): void
  (e: 'change', value: string | number | null): void
}

const props = withDefaults(defineProps<Props>(), {
  clearable: true,
  disabled: false,
  filterable: false,
  placeholder: i18nText("form.pleaseSelect"),
  width: '240px',
})

const emit = defineEmits<Emits>()

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  }
})
console.log(`options->`, props.options)
const handleChange = (value: string | number | null) => {
  emit('change', value)
}
</script>
