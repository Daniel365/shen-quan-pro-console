<!--
  * @Author: 350296245@qq.com
  * @Date: 2025-09-13 21:37:04
  * @Description: 树形菜单多选
 -->
<template>
  <el-drawer
    v-model="visible"
    :title="title || $t('menuManage.permissionAssignment', { roleName: '-' })"
    direction="rtl"
    :size="400"
    @close="handleClose"
  >
    <div class="menu-tree-drawer">
      <div class="search-box">
        <el-input v-model="searchValue" :placeholder="$t('menuManage.menuPermissionName')">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" link @click="handleCollapse">
          {{ $t('menuManage.collapse') }}
        </el-button>
      </div>

      <div class="control-box">
        <el-checkbox v-model="checkStrictly">{{ $t('menuManage.parentChildLinked') }}</el-checkbox>
        <el-alert>
          {{ $t('menuManage.parentChildLinkedTips') }}
        </el-alert>
      </div>

      <div class="tree-container">
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="{ label: 'label', children: 'children' }"
          show-checkbox
          :check-strictly="!checkStrictly"
          :default-expanded-keys="expandedKeys"
          :default-checked-keys="checkedKeys"
          node-key="value"
          @node-expand="onExpand"
          @check="onCheck"
        />
      </div>

      <div class="footer-actions">
        <el-button @click="handleCancel">{{ $t('action.cancel') }}</el-button>
        <el-button type="primary" @click="handleConfirm">{{ $t('action.confirm') }}</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';

import { isArray, isHasArrayData } from '@/utils/dataJudgment';

interface TreeNode {
  label: string;
  value: number | string;
  children?: TreeNode[];
}

interface Props {
  visible?: boolean;
  title?: string;
  modelValue?: (string | number)[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  title: '',
  visible: false,
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'update:modelValue': [value: (string | number)[]];
  confirm: [value: (string | number)[]];
}>();

const searchValue = ref('');
const treeData = ref<TreeNode[]>([]);
/** 选中 */
const checkedKeys = ref<(string | number)[]>([]);
/** 展开 */
const expandedKeys = ref<(string | number)[]>([]);
/** 父子联动 */
const checkStrictly = ref(false);
const treeRef = ref();

// 是否展示弹窗
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

watch(
  () => props.modelValue,
  (val) => {
    checkedKeys.value = [...val.map((n) => String(n))];
    // 手动设置树的选中状态
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(checkedKeys.value);
    }
  }
);

// 获取列表
const getTreeList = async () => {
  try {
    const response = await menuManageApi.getTreeList();
    handleReturnResults({
      onSuccess: (res) => {
        treeData.value = res.data?.list || [];
        // 默认展开第一层
        expandedKeys.value = treeData.value.map((item) => item.value);
      },
      params: response,
    });
  } catch (error) {
    console.error('获取菜单树失败:', error);
  }
};

const onExpand = (data: any, node: any) => {
  const expandedNodes = treeRef.value?.store?.nodesMap;
  if (expandedNodes) {
    expandedKeys.value = Object.keys(expandedNodes).filter((key) => expandedNodes[key].expanded);
  }
};

const onCheck = (data: any, checkedInfo: any) => {
  checkedKeys.value = checkedInfo.checkedKeys;
};

const handleCollapse = () => {
  expandedKeys.value = [];
  if (treeRef.value) {
    treeRef.value.store._getAllNodes().forEach((node: any) => {
      node.expanded = false;
    });
  }
};

const handleClose = () => {
  visible.value = false;
};

const handleCancel = () => {
  checkedKeys.value = props.modelValue;
  visible.value = false;
};

const getAllParentIds = (nodeId: string | number, data: TreeNode[]): (string | number)[] => {
  const parentIds: (string | number)[] = [];

  const findParent = (nodes: TreeNode[], targetId: string | number): TreeNode | null => {
    for (const node of nodes) {
      if (node.children?.some((child) => child.value === targetId)) {
        return node;
      }
      if (node.children) {
        const found = findParent(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  let currentId = nodeId;
  while (currentId) {
    const parent = findParent(data, currentId);
    if (parent) {
      parentIds.unshift(parent.value);
      currentId = parent.value;
    } else {
      break;
    }
  }

  return parentIds;
};

const handleConfirm = async () => {
  const allIds = new Set(checkedKeys.value);

  // 为每个选中的节点添加其所有父级ID
  checkedKeys.value.forEach((id) => {
    const parentIds = getAllParentIds(id, treeData.value);
    parentIds.forEach((parentId) => allIds.add(parentId));
  });

  const finalKeys = Array.from(allIds);
  emit('update:modelValue', finalKeys);
  emit('confirm', finalKeys);
  visible.value = false;
};

onMounted(() => {
  getTreeList();
});
</script>

<style scoped>
.menu-tree-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-box {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}

.control-box {
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 8px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
