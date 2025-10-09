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
      v-model:selected-rows="selectedRows"
      :api="appRoleManageApi.getList"
      :search-params="searchParams"
      :columns="columns"
      :selectable="true"
    >
      <!-- 操作按钮 -->
      <template #caption>
        <ButtonGroup :options="actionButtonGroup" />
      </template>
      <template #bodyCell="{ column, record }">
        <!-- 状态列渲染 -->
        <template v-if="column.key === 'status'">
          <StatusText :options="enabledStatusOptions" :value="record.status" />
        </template>
        <!-- 分润比例列渲染 -->
        <template v-else-if="column.key === 'profitRatio'">
          <span>{{ record.profitRatio }}%</span>
        </template>
        <!-- 操作列渲染 -->
        <template v-else-if="column.key === 'action'">
          <ButtonGroup :options="tableButtonGroup" :record="record" link />
        </template>
      </template>
    </DataTable>

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="editVisible"
      :title="dialogTitle"
      width="50%"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <RoleForm
        ref="roleFormRef"
        :visible="editVisible"
        :action-type="actionType"
        :details-data="currentRole"
        @success="handleFormSuccess"
        @cancel="handleDialogClose"
      />
    </el-dialog>

    <!-- 权限分配抽屉 -->
    <MenuTreeDrawer
      v-model="selectedPermissions"
      v-model:visible="permissionVisible"
      :title="
        $t('roleManage.permissionAssignment', {
          roleName: getLanguageObj(currentRole?.roleTranslations || []).name,
        })
      "
      @confirm="handlePermissionConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';

// utils
import type { RoleListItem, RoleListParams } from '@/api/app/roleManage/types';

import RoleForm from './form.vue';

// 表格引用
const tableRef = ref();
// 表单引用
const roleFormRef = ref();
// 加载状态
const loading = ref(false);
// 数据来源
const tableData = ref<RoleListItem[]>([]);
// 选中的行数据
const selectedRows = ref<RoleListItem[]>([]);
// 编辑弹窗显示状态
const editVisible = ref(false);
// 当前编辑角色
const currentRole = ref<RoleListItem>();
// 操作类型
const actionType = computed(() =>
  currentRole.value?.uuid ? ActionTypeEnum.EDIT : ActionTypeEnum.CREATE
);
// 权限分配抽屉显示状态
const permissionVisible = ref(false);
// 选中的权限
const selectedPermissions = ref<(string | number)[]>([]);

// 弹窗标题
const dialogTitle = computed(() => {
  return getActionTitle(actionType.value);
});

// 搜索参数
const searchParams = reactive<RoleListParams>({
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
  { key: 'name', multilingualKey: 'roleTranslations', titleKey: 'form.roleName' },
  { key: 'code', titleKey: 'form.roleCode' },
  { key: 'profitRatio', titleKey: 'roleManage.profitRatio' },
  { key: 'description', multilingualKey: 'roleTranslations', titleKey: 'form.roleDesc' },
  { key: 'status', titleKey: 'form.status' },
  { fixed: 'right', key: 'action', titleKey: 'form.action', width: 250 },
];

/** 操作按钮组 */
const actionButtonGroup = computed<ButtonGroupOptions[]>(() => [
  {
    handler: () => {
      handleAdd();
    },
    labelKey: 'action.add',
    permission: [RequestPath.APP_ROLE_CREATE],
    type: 'primary',
    value: 'create',
  },
  {
    disabled: selectedRows.value.length === 0,
    handler: () => {
      const data = selectedRows.value;
      if (data.length === 0) {
        ElMessage.error(i18nText('action.pleaseSelect'));
      } else {
        handleDelete(data.map((item) => item.uuid));
      }
    },
    labelKey: 'action.delete',
    permission: [RequestPath.APP_ROLE_DELETE],
    type: 'danger',
    value: 'delete',
  },
]);

/** 表格操作按钮组 */
const tableButtonGroup: ButtonGroupOptions[] = [
  {
    handler: (record: RoleListItem) => {
      handleEdit(record);
    },
    labelKey: 'action.edit',
    permission: [RequestPath.APP_ROLE_UPDATE],
    type: 'primary',
    value: 'edit',
  },
  {
    handler: (record: RoleListItem) => {
      handleAssignPermission(record);
    },
    labelKey: 'roleManage.assignPermission',
    permission: [RequestPath.APP_ROLE_ASSIGN_PERM],
    type: 'primary',
    value: 'assign',
  },
  {
    handler: (record: RoleListItem) => {
      handleDelete([record.uuid]);
    },
    labelKey: 'action.delete',
    permission: [RequestPath.APP_ROLE_DELETE],
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
const handleEdit = (record: RoleListItem, params?: any) => {
  if (params?.role_uuids) {
    // 处理批量编辑逻辑，这里可能需要跳转到专门的批量编辑页面
    // 或者根据业务需求处理多个角色的编辑
    console.log('批量编辑角色:', params.role_uuids);
  } else {
    // 单个编辑逻辑
    currentRole.value = record;
    editVisible.value = true;
  }
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
    const uuid = currentRole.value.uuid;
    if (uuid) {
      const response = await appRoleManageApi.onAssignPerm({
        menuIds,
        uuid,
      });
      handleReturnResults({
        onSuccess: () => {
          ElMessage.success(i18nText('roleManage.assignSuccess'));
          tableRef.value?.refresh();
        },
        params: response,
      });
    }
  } catch (error) {
    ElMessage.error(i18nText('action.failed'));
  }
};

// 处理删除角色
const handleDelete = (roleUuids: string[]) => {
  ElMessageBox.confirm(
    i18nText(
      roleUuids.length > 1 ? 'roleManage.deleteConfirmMultiple' : 'roleManage.deleteConfirmSingle',
      {
        count: roleUuids.length,
      }
    ),
    i18nText('action.confirmDelete')
  )
    .then(async () => {
      const response = await appRoleManageApi.onDelete({ roleUuids });
      handleReturnResults({
        onSuccess: () => {
          ElMessage.success(i18nText('action.deleteSuccess'));
          tableRef.value?.refresh();
          // 清空选中状态
          selectedRows.value = [];
        },
        params: response,
      });
    })
    .catch(() => {
      // 用户取消删除
    });
};

// 处理表单提交成功
const handleFormSuccess = () => {
  editVisible.value = false;
  tableRef.value?.refresh();
};

// 处理弹窗关闭
const handleDialogClose = () => {
  editVisible.value = false;
  currentRole.value = undefined;
};
</script>
