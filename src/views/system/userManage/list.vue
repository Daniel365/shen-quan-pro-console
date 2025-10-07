<template>
  <!-- 用户管理页面 -->
  <div class="user-manage-page">
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
      :api="userManageApi.getList"
      :search-params="searchParams"
      :columns="columns"
    >
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

    <!-- 用户表单弹窗 -->
    <FormGroupDialog
      v-model:visible="editVisible"
      :action-type="actionType"
      :form-fields="userFormFields"
      :form-rules="userFormRules"
      :edit-api="userManageApi.onEdit"
      :details-data="currentUser"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';

// utils
import type { UserListItem } from '@/api/system/userManage/types';
// type

/**
 * 表格组件引用
 */
const tableRef = ref();

/**
 * 加载状态
 */
const loading = ref(false);

/**
 * 表格数据列表
 */
const tableData = ref<UserListItem[]>([]);

/**
 * 编辑抽屉显示状态
 */
const editVisible = ref(false);

/**
 * 当前编辑的用户数据
 */
const currentUser = ref<UserListItem>();

/**
 * 操作类型
 */
const actionType = computed(() =>
  currentUser.value?.uuid ? ActionTypeEnum.EDIT : ActionTypeEnum.CREATE
);

/**
 * 搜索参数接口
 */
interface SearchParams {
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email: string;
  /** 状态 */
  status: number | undefined;
}

/**
 * 搜索参数
 */
const searchParams = reactive<SearchParams>({
  email: '',
  status: undefined,
  username: '',
});

/**
 * 搜索表单字段配置
 */
const searchFields = computed(() => [
  {
    key: 'username',
    label: i18nText('form.username'),
    placeholder: i18nText('form.enterUsername'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'email',
    label: i18nText('form.email'),
    placeholder: i18nText('form.enterEmail'),
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

/** 表格操作按钮组 */
const tableButtonGroup: ButtonGroupOptions[] = [
  {
    handler: (record: UserListItem) => {
      handleEdit(record);
    },
    labelKey: 'action.edit',
    permission: [RequestPath.USER_UPDATE],
    type: 'primary',
    value: 'edit',
  },
  {
    handler: (record: UserListItem) => {
      handleDelete(record);
    },
    labelKey: 'action.delete',
    permission: [RequestPath.USER_DELETE],
    type: 'danger',
    value: 'delete',
  },
];

/** 用户表单字段配置 */
const userFormFields = [
  {
    key: 'username',
    label: i18nText('form.username'),
    placeholder: i18nText('form.enterUsername'),
    required: true,
    type: FormTypeEnum.INPUT,
  },
  {
    api: roleManageApi.getList,
    key: 'roleUuids',
    label: i18nText('form.role'),
    labelField: 'name',
    multiple: true,
    placeholder: i18nText('form.selectRole'),
    required: true,
    type: FormTypeEnum.SELECT_API,
    valueField: 'uuid',
  },
  {
    key: 'status',
    label: i18nText('form.status'),
    options: enabledStatusOptions,
    type: FormTypeEnum.RADIO_GROUP,
  },
];

/** 用户表单验证规则 */
const userFormRules = {
  roleUuids: [
    {
      message: i18nText('form.selectRole'),
      required: true,
      trigger: 'submit',
    },
  ],
  username: [
    {
      message: i18nText('form.enterUsername'),
      required: true,
      trigger: 'blur',
    },
  ],
};

/**
 * 表格列配置
 */
const columns = [
  { key: 'username', titleKey: 'form.username' },
  { key: 'email', titleKey: 'form.email' },
  { key: 'status', titleKey: 'form.status' },
  { key: 'roleName', titleKey: 'form.roleName' },
  { key: 'createdAt', titleKey: 'form.createTime' },
  { key: 'updatedAt', titleKey: 'form.updateTime' },
  { fixed: 'right', key: 'action', titleKey: 'form.action' },
];

/**
 * 处理搜索和重置操作
 */
const handleRefresh = () => {
  tableRef.value?.refresh();
};

/**
 * 处理编辑用户操作
 * @param record 用户数据
 */
const handleEdit = (record: UserListItem) => {
  currentUser.value = record;
  editVisible.value = true;
};

/**
 * 处理删除用户操作
 * @param record 用户数据
 */
const handleDelete = (record: UserListItem) => {
  ElMessageBox.confirm(
    i18nText('userManage.deleteConfirm', {
      username: record.username,
    }),
    i18nText('action.confirmDelete')
  )
    .then(async () => {
      try {
        await userManageApi.onDelete({ uuid: record.uuid });
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
