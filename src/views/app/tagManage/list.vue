<template>
  <!-- 标签管理页面 -->
  <div class="tag-manage-page">
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
      :api="tagManageApi.getList"
      :search-params="searchParams"
      :columns="columns"
      :selectable="true"
    >
      <!-- 新增按钮 -->
      <template #caption>
        <ButtonGroup :options="actionButtonGroup" />
      </template>
      <template #bodyCell="{ column, record }">
        <!-- 类型列渲染 -->
        <template v-if="column.key === 'type'">
          <StatusText :options="tagTypeOptions" :value="record.type" />
        </template>

        <!-- 状态列渲染 -->
        <template v-else-if="column.key === 'status'">
          <StatusText :options="enabledStatusOptions" :value="record.status" />
        </template>

        <!-- 标签名称列渲染（多语言显示） -->
        <template v-else-if="column.key === 'name'">
          <span>{{ getLanguageObj(record.tagTranslations).name }}</span>
        </template>

        <!-- 创建时间列渲染 -->
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDateTime(record.createdAt) }}
        </template>

        <!-- 操作列渲染 -->
        <template v-else-if="column.key === 'action'">
          <ButtonGroup :options="tableButtonGroup" :record="record" link />
        </template>
      </template>
    </DataTable>

    <!-- 标签表单弹窗 -->
    <el-dialog
      v-model="editVisible"
      :title="dialogTitle"
      width="50%"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <TagForm
        ref="tagFormRef"
        :visible="editVisible"
        :action-type="actionType"
        :details-data="currentTag"
        @success="handleFormSuccess"
        @cancel="handleDialogClose"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';

// type
import type { TagListItem, TagListParams } from '@/api/app/tagManage/types';

import TagForm from './form.vue';
import { tagTypeOptions } from './utils/options';

// 表格引用
const tableRef = ref();
// 表单引用
const tagFormRef = ref();
// 加载状态
const loading = ref(false);
// 数据来源
const tableData = ref<TagListItem[]>([]);
// 选中的行数据
const selectedRows = ref<TagListItem[]>([]);
// 编辑弹窗显示状态
const editVisible = ref(false);
// 当前编辑标签
const currentTag = ref<TagListItem>();
// 操作类型
const actionType = computed(() =>
  currentTag.value?.uuid ? ActionTypeEnum.EDIT : ActionTypeEnum.CREATE
);

// 弹窗标题
const dialogTitle = computed(() => {
  return getActionTitle(actionType.value);
});

// 搜索参数
const searchParams = reactive<TagListParams>({
  name: '',
  status: undefined,
  type: undefined,
});

// 搜索字段配置
const searchFields = computed(() => [
  {
    key: 'name',
    label: i18nText('tagManage.nameLabel'),
    placeholder: i18nText('tagManage.namePlaceholder'),
    type: FormTypeEnum.INPUT,
  },
  {
    key: 'type',
    label: i18nText('tagManage.typeLabel'),
    options: tagTypeOptions,
    placeholder: i18nText('tagManage.typePlaceholder'),
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

// 表格列配置
const columns = [
  { key: 'name', minWidth: 200, titleKey: 'tagManage.name' },
  { key: 'type', titleKey: 'form.type', width: 120 },
  { key: 'status', titleKey: 'form.status', width: 100 },
  { key: 'createdAt', titleKey: 'form.createTime', width: 180 },
  { fixed: 'right', key: 'action', titleKey: 'form.action', width: 200 },
];

/** 操作按钮组 */
const actionButtonGroup = computed<ButtonGroupOptions[]>(() => [
  {
    handler: () => {
      handleAdd();
    },
    labelKey: 'action.add',
    permission: [RequestPath.APP_TAG_CREATE],
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
    permission: [RequestPath.APP_TAG_DELETE],
    type: 'danger',
    value: 'delete',
  },
]);

/** 表格操作按钮组 */
const tableButtonGroup: ButtonGroupOptions[] = [
  {
    handler: (record: TagListItem) => {
      handleEdit(record);
    },
    labelKey: 'action.edit',
    permission: [RequestPath.APP_TAG_UPDATE],
    type: 'primary',
    value: 'edit',
  },
  {
    handler: (record: TagListItem) => {
      handleDelete([record.uuid]);
    },
    labelKey: 'action.delete',
    permission: [RequestPath.APP_TAG_DELETE],
    type: 'danger',
    value: 'delete',
  },
];

// 处理搜索和重置
const handleRefresh = () => {
  tableRef.value?.refresh();
};

// 处理新增标签
const handleAdd = () => {
  currentTag.value = undefined;
  editVisible.value = true;
};

// 处理编辑标签
const handleEdit = (record: TagListItem, params?: any) => {
  if (params?.tag_uuids) {
    // 处理批量编辑逻辑，这里可能需要跳转到专门的批量编辑页面
    // 或者根据业务需求处理多个标签的编辑
    console.log('批量编辑标签:', params.tag_uuids);
  } else {
    // 单个编辑逻辑
    currentTag.value = record;
    editVisible.value = true;
  }
};

// 处理删除标签
const handleDelete = (tagUuids: string[]) => {
  ElMessageBox.confirm(
    i18nText(
      tagUuids.length > 1 ? 'tagManage.deleteConfirmMultiple' : 'tagManage.deleteConfirmSingle',
      {
        count: tagUuids.length,
      }
    ),
    i18nText('action.confirmDelete')
  )
    .then(async () => {
      const response = await tagManageApi.onDelete({ tagUuids });
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
  currentTag.value = undefined;
};
</script>
