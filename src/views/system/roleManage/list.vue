<template>
  <!-- 角色管理页面 -->
  <div class="role-manage-page">
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
      :api="roleManageApi.getList"
      :search-params="searchParams"
      :columns="columns"
    >
      <!-- 新增按钮 -->
      <template #caption>
        <button-group :options="actionButtonGroup" />
      </template>
      <template #bodyCell="{ column, record }">
        <!-- 状态列渲染 -->
        <template v-if="column.key === 'status'">
          <StatusText :options="enabledStatusOptions" :value="record.status" />
        </template>
        <!-- 操作列渲染 -->
        <template v-if="column.key === 'action'">
          <button-group :options="tableButtonGroup" :record="record" link />
        </template>
      </template>
    </DataTable>

    <!-- 角色表单弹窗 -->
    <RoleForm v-model:visible="editVisible" :role-data="currentRole" @success="handleRefresh" />

    <!-- 权限分配抽屉 -->
    <MenuTreeDrawer
      v-model="selectedPermissions"
      v-model:visible="permissionVisible"
      :title="$t('roleManage.permissionAssignment', { roleName: currentRole?.name })"
      @confirm="handlePermissionConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus';

// utils
import type { RoleListItem } from '@/api/system/roleManage/data.d';
import { enabledStatusOptions } from '@/utils/options';
// type

// 表格引用
const tableRef = ref();
// 加载状态
const loading = ref(false);
// 数据来源
const tableData = ref<RoleListItem[]>([]);
// 编辑抽屉显示状态
const editVisible = ref(false);
// 当前编辑角色
const currentRole = ref<RoleListItem>();
// 权限分配抽屉显示状态
const permissionVisible = ref(false);
// 选中的权限
const selectedPermissions = ref<(string | number)[]>([]);

// 搜索参数
const searchParams = reactive({
  name: '',
  status: undefined,
});

// 搜索字段配置
const searchFields = computed(() => [
  {
    key: 'name',
    label: i18nText('form.roleName'),
    placeholder: i18nText('form.enterRoleName'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'status',
    label: i18nText('form.status'),
    options: enabledStatusOptions,
    placeholder: i18nText('form.selectStatus'),
    type: FormTypeEnum.SELECT,
  },
]);

// 表格列配置
const columns = [
  { key: 'name', titleKey: 'form.roleName' },
  { key: 'code', titleKey: 'form.roleCode' },
  { key: 'description', titleKey: 'form.roleDesc' },
  { key: 'status', titleKey: 'form.status' },
  { fixed: 'right', key: 'action', titleKey: 'form.action', width: 250 },
];

/** 操作按钮组 */
const actionButtonGroup: ButtonGroupOptions[] = [
  {
    handler: () => {
      handleAdd();
    },
    labelKey: 'action.add',
    permission: [RequestPath.ROLE_CREATE],
    type: 'primary',
    value: 'create',
  },
];

/** 表格操作按钮组 */
const tableButtonGroup: ButtonGroupOptions[] = [
  {
    handler: (record: RoleListItem) => {
      handleEdit(record);
    },
    labelKey: 'action.edit',
    permission: [RequestPath.ROLE_UPDATE],
    type: 'primary',
    value: 'edit',
  },
  {
    handler: (record: RoleListItem) => {
      handleAssignPermission(record);
    },
    labelKey: 'roleManage.assignPermission',
    permission: [RequestPath.ROLE_ASSIGN_PERM],
    type: 'primary',
    value: 'assign',
  },
  {
    handler: (record: RoleListItem) => {
      handleDelete(record);
    },
    labelKey: 'action.delete',
    permission: [RequestPath.ROLE_DELETE],
    type: 'danger',
    value: 'delete',
  },
];

// 处理搜索和重置
const handleRefresh = () => {
  tableRef.value?.refresh();
};

// 处理新增角色
const handleAdd = () => {
  currentRole.value = undefined;
  editVisible.value = true;
};

// 处理编辑角色
const handleEdit = (record: RoleListItem) => {
  currentRole.value = record;
  editVisible.value = true;
};

// 处理分配权限
const handleAssignPermission = (record: RoleListItem) => {
  currentRole.value = record;
  selectedPermissions.value = record.menuIds || [];
  permissionVisible.value = true;
};

// 处理权限分配确认
const handlePermissionConfirm = async (menuIds: (string | number)[]) => {
  if (!currentRole.value) return;

  try {
    await roleManageApi.onAssignPerm({
      menuIds,
      uuid: currentRole.value.uuid,
    });
    ElMessage.success(i18nText('roleManage.assignSuccess'));
    tableRef.value?.refresh();
  } catch (error) {
    ElMessage.error(i18nText('action.failed'));
  }
};

// 处理删除角色
const handleDelete = (record: RoleListItem) => {
  ElMessageBox.confirm(
    i18nText('roleManage.deleteConfirm', {
      roleName: record.name,
    }),
    i18nText('action.confirmDelete')
  )
    .then(async () => {
      try {
        await roleManageApi.onDelete({ uuid: record.uuid });
        ElMessage.success(i18nText('action.deleteSuccess'));
        tableRef.value?.refresh();
      } catch (error) {
        ElMessage.error(i18nText('action.deleteFailed'));
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};
</script>
