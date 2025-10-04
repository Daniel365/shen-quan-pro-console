<template>
  <!-- 菜单管理页面 -->
  <div class="menu-manage-page">
    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchParams"
      :fields="searchFields"
      :loading="loading"
      @search="handleRefresh"
      @reset="handleRefresh"
    />

    <!-- 数据表格 -->
    <DataTable
      ref="tableRef"
      v-model:loading="loading"
      v-model:data-list="tableData"
      row-key="id"
      :columns="columns"
    >
      <!-- 新增按钮 -->
      <template #caption>
        <button-group :options="actionButtonGroup" />
      </template>
      <template #bodyCell="{ column, record }">
        <!-- 菜单类型列渲染 -->
        <template v-if="column.key === 'name'">
          <icon-font v-if="record.icon" class="mr-2 align--5%" :name="record.icon" size="20px" />
          <span>{{ record.name }}</span>
        </template>
        <!-- 菜单类型列渲染 -->
        <template v-if="column.key === 'type'">
          <StatusText :options="menuTypeOptions" :value="record.type" />
        </template>
        <!-- 显示状态列渲染 -->
        <template v-if="column.key === 'visibleStatus'">
          <StatusText :options="menuVisibleStatusOptions" :value="record.visibleStatus" />
        </template>
        <!-- 操作列渲染 -->
        <template v-if="column.key === 'action'">
          <button-group :options="tableButtonGroup" :record="record" link />
        </template>
      </template>
    </DataTable>

    <!-- 菜单表单弹窗 -->
    <MenuForm
      v-model:visible="editVisible"
      :action-type="actionType"
      :edit-data="currentMenu"
      @success="handleRefresh"
      @on-close="onCloseForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';

import type { MenuListItem } from '@/api/system/menuManage/types';
import { isHasArrayData } from '@/utils/dataJudgment';

import { menuTypeOptions, menuVisibleStatusOptions } from './utils/options';
import { MenuTypeEnum } from './utils/types';

// 表格引用
const tableRef = ref();
// 加载状态
const loading = ref(false);
// 编辑抽屉显示状态
const editVisible = ref(false);
// 当前编辑菜单
const actionType = ref<ActionTypeEnum>();
// 当前编辑菜单
const currentMenu = ref<MenuListItem>();
// 列表数据
const tableData = ref<MenuListItem[]>([]);

// 搜索参数
const searchParams = ref({
  name: '',
  type: undefined,
  visibleStatus: undefined,
});

// 搜索字段配置
const searchFields = computed(() => [
  {
    key: 'name',
    label: i18nText('form.menuName'),
    placeholder: i18nText('form.enterMenuName'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'type',
    label: i18nText('form.menuType'),
    options: menuTypeOptions,
    placeholder: i18nText('form.selectType'),
    type: FormTypeEnum.SELECT,
  },
  {
    key: 'visibleStatus',
    label: i18nText('form.visibleStatus'),
    options: menuVisibleStatusOptions,
    placeholder: i18nText('form.selectStatus'),
    type: FormTypeEnum.SELECT,
  },
]);

/** 操作按钮组 */
const actionButtonGroup: ButtonGroupOptions[] = [
  {
    handler: () => {
      handleAdd();
    },
    labelKey: 'action.add',
    permission: [RequestPath.MENU_CREATE],
    type: 'primary',
    value: 'create',
  },
];

/** 表格操作按钮组 */
const tableButtonGroup: ButtonGroupOptions[] = [
  {
    handler: (record: MenuListItem) => {
      handleItemAdd(record);
    },
    isShow: (record: MenuListItem) => {
      return record.type === MenuTypeEnum.CATALOG || record.type === MenuTypeEnum.MENU;
    },
    labelKey: 'action.add',
    permission: [RequestPath.MENU_CREATE],
    type: 'primary',
    value: 'addSub',
  },
  {
    handler: (record: MenuListItem) => {
      handleEdit(record);
    },
    labelKey: 'action.edit',
    permission: [RequestPath.MENU_UPDATE],
    type: 'primary',
    value: 'edit',
  },
  {
    handler: (record: MenuListItem) => {
      handleDelete(record);
    },
    labelKey: 'action.delete',
    permission: [RequestPath.MENU_DELETE],
    type: 'danger',
    value: 'delete',
  },
];

// 表格列配置
const columns = computed(() => [
  {
    dataIndex: 'name',
    fixed: true,
    key: 'name',
    titleKey: 'form.menuName',
  },
  {
    dataIndex: 'type',
    key: 'type',
    titleKey: 'form.menuType',
    width: 100,
  },
  {
    dataIndex: 'routeName',
    key: 'routeName',
    titleKey: 'form.routeName',
  },
  {
    dataIndex: 'routePath',
    key: 'routePath',
    titleKey: 'form.routePath',
  },
  {
    dataIndex: 'component',
    key: 'component',
    titleKey: 'form.component',
  },
  {
    dataIndex: 'sort',
    key: 'sort',
    titleKey: 'form.sort',
    width: 80,
  },
  {
    dataIndex: 'visibleStatus',
    key: 'visibleStatus',
    titleKey: 'form.visibleStatus',
    width: 100,
  },
  {
    fixed: 'right',
    key: 'action',
    titleKey: 'form.action',
    width: 200,
  },
]);

// 获取菜单列表数据
const getDataList = async () => {
  loading.value = true;
  try {
    // 调用接口获取数据
    const response = await menuManageApi.getList(searchParams.value).finally(() => {
      loading.value = false;
    });
    handleReturnResults({
      onSuccess: (res) => {
        const { list } = res.data || { list: [] };
        // 处理children为空数组的情况，设为undefined避免显示展开图标
        const processData = (items: MenuListItem[]): MenuListItem[] => {
          return items.map((item) => ({
            ...item,
            children:
              item.children && isHasArrayData(item.children)
                ? processData(item?.children)
                : undefined,
          }));
        };
        tableData.value = processData(list);
      },
      params: response,
    });
  } catch (error) {
    console.error('获取菜单列表失败:', error);
  }
};

// 处理搜索和重置
const handleRefresh = () => {
  getDataList();
};

// 关闭表单
const onCloseForm = () => {
  actionType.value = undefined;
  currentMenu.value = undefined;
  editVisible.value = false;
};

// 处理新增菜单
const handleAdd = () => {
  actionType.value = ActionTypeEnum.CREATE;
  currentMenu.value = undefined;
  editVisible.value = true;
};

// 处理子集新增
const handleItemAdd = (record: MenuListItem) => {
  actionType.value = ActionTypeEnum.COPY;
  const childrenLen = record.children?.length || 0;

  currentMenu.value = {
    id: 0,
    parentId: record.id || 0,
    sort: childrenLen + 1,
  } as MenuListItem;
  editVisible.value = true;
};

// 处理编辑菜单
const handleEdit = (record: MenuListItem) => {
  actionType.value = ActionTypeEnum.EDIT;
  currentMenu.value = record;
  editVisible.value = true;
};

// 处理删除菜单
const handleDelete = (record: MenuListItem) => {
  ElMessageBox.confirm('确认删除该菜单吗？', '提示', {
    cancelButtonText: '取消',
    confirmButtonText: '确定',
    type: 'warning',
  })
    .then(async () => {
      try {
        const response = await menuManageApi.onDelete({ id: record.id });
        handleReturnResults({
          onSuccess: () => {
            ElMessage.success(i18nText('action.deleteSuccess'));
            handleRefresh();
          },
          params: response,
        });
      } catch (error) {
        console.error('删除失败:', error);
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};

onMounted(() => {
  getDataList();
});
</script>
