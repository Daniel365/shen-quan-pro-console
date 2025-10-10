<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-07 21:45:50
 * @Description: 树形菜单选择
-->
<template>
  <el-tree-select
    v-model="selectedValue"
    :data="treeData"
    :placeholder="placeholder"
    :loading="loading"
    :disabled="disabled"
    :props="fieldNames"
    filterable
  />
</template>

<script setup lang="ts">
interface TreeNode {
  label: string;
  value: number;
  children?: TreeNode[];
}

interface Props {
  modelValue?: any;
  placeholder?: string;
  isRefresh?: number;
  disabled?: boolean;
  multiple?: boolean;
  fieldNames?: { label: string; value: string; children: string };
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  fieldNames: () => ({ children: 'children', label: 'label', value: 'value' }),
  isRefresh: 0,
  multiple: false,
  placeholder: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

const loading = ref(false);
const treeData = ref<TreeNode[]>([]);
const selectedValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    selectedValue.value = newValue;
  }
);

watch(selectedValue, (newValue) => {
  emit('update:modelValue', newValue);
});

// 获取列表
const getDataList = async () => {
  loading.value = true;
  try {
    const response = await menuManageApi.getTreeList().finally(() => {
      loading.value = false;
    });

    handleReturnResults({
      onSuccess: (res) => {
        const { list } = res.data || [];
        // 强制更新treeData
        treeData.value = [
          {
            children: [...list],
            label: '顶级菜单',
            value: 0,
          },
        ];
      },
      params: response,
    });
  } catch (error) {
    loading.value = false;
    console.error('加载菜单数据失败:', error);
  }
};

watch(
  () => props.isRefresh,
  (isRefresh) => {
    if (isRefresh) {
      treeData.value = [];
      getDataList();
    }
  }
);

onMounted(() => {
  getDataList();
});
</script>
