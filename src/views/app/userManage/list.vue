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
      :api="appUserManageApi.getList"
      :search-params="searchParams"
      :columns="columns"
    >
      <template #bodyCell="{ column, record }">
        <!-- 邀请码渲染 -->
        <template v-if="column.key === 'inviteCode'">
          <el-link
            v-if="record.inviteCode"
            type="primary"
            :underline="false"
            @click="handleInviteCodeClick(record)"
          >
            {{ record.inviteCode }}
          </el-link>
          <span v-else>--</span>
        </template>
        <!-- 性别列渲染 -->
        <template v-if="column.key === 'gender'">
          <StatusText :options="genderOptions" :value="record.gender" />
        </template>
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
    <FormGroup
      v-model:visible="editVisible"
      :action-type="actionType"
      :form-fields="userFormFields"
      :form-rules="userFormRules"
      :edit-api="appUserManageApi.onEdit"
      :details-data="currentUser"
      @success="handleRefresh"
    />

    <!-- 下级用户弹窗 -->
    <ChildrenUserDialog
      v-model:visible="childrenDialogVisible"
      :current-row-data="currentRowData"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';

// utils
import type { UserListItem, UserListParams } from '@/api/app/userManage/types';

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
 * 下级用户弹窗显示状态
 */
const childrenDialogVisible = ref(false);

/**
 * 当前选中的邀请码
 */
const currentRowData = ref<any>({
  inviteCode: '',
  nickname: '',
  uuid: '',
});

/**
 * 操作类型
 */
const actionType = computed(() =>
  currentUser.value?.uuid ? ActionTypeEnum.EDIT : ActionTypeEnum.CREATE
);

/**
 * 搜索参数
 */
const searchParams = reactive<UserListParams>({
  gender: undefined,
  inviteCode: '',
  nickname: '',
  phone: '',
  status: undefined,
});

/**
 * 搜索表单字段配置
 */
const searchFields = computed(() => [
  {
    key: 'nickname',
    label: i18nText('form.nickname'),
    placeholder: i18nText('form.enterNickname'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'phone',
    label: i18nText('form.phone'),
    placeholder: i18nText('form.enterPhone'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'inviteCode',
    label: i18nText('form.inviteCode'),
    placeholder: i18nText('form.enterInviteCode'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'gender',
    label: i18nText('form.gender'),
    options: genderOptions,
    placeholder: i18nText('form.selectGender'),
    type: FormTypeEnum.SELECT,
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
    key: 'nickname',
    label: i18nText('form.nickname'),
    placeholder: i18nText('form.enterNickname'),
    required: true,
    type: FormTypeEnum.INPUT,
  },
  {
    api: appRoleManageApi.getList,
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
  nickname: [
    {
      message: i18nText('form.enterNickname'),
      required: true,
      trigger: 'blur',
    },
  ],
  roleUuids: [
    {
      message: i18nText('form.selectRole'),
      required: true,
      trigger: 'submit',
    },
  ],
};

/**
 * 表格列配置
 */
const columns = [
  { key: 'nickname', titleKey: 'form.nickname' },
  { key: 'phone', titleKey: 'form.phone' },
  { key: 'inviteCode', titleKey: 'form.inviteCode' },
  { key: 'gender', titleKey: 'form.gender' },
  { key: 'lastLoginAt', titleKey: 'form.lastLoginTime' },
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
 * 处理邀请码点击操作
 * @param record 用户数据
 */
const handleInviteCodeClick = (record: UserListItem) => {
  if (record.inviteCode) {
    currentRowData.value = record;
    childrenDialogVisible.value = true;
  }
};

/**
 * 处理子用户弹窗中的邀请码点击（递归查询下级）
 * @param record 用户数据
 */
const handleChildrenInviteCodeClick = (record: UserListItem) => {
  if (record.inviteCode) {
    currentInviteCode.value = record.inviteCode;
    currentUserNickname.value = record.nickname;
  }
};

/**
 * 处理删除用户操作
 * @param record 用户数据
 */
const handleDelete = (record: UserListItem) => {
  ElMessageBox.confirm(
    i18nText('userManage.deleteConfirm', {
      nickname: record.nickname,
    }),
    i18nText('action.confirmDelete')
  )
    .then(async () => {
      try {
        await appUserManageApi.onDelete({ uuid: record.uuid });
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
