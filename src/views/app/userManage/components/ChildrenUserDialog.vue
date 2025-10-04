<template>
  <el-dialog v-model="visible" :title="title" width="80%" destroy-on-close>
    <DataTable
      ref="tableRef"
      v-model:loading="loading"
      v-model:data-list="tableData"
      :api="appUserManageApi.getChildrenList"
      :search-params="searchParams"
      :columns="columns"
    >
      <template #bodyCell="{ column, record }">
        <!-- 性别列渲染 -->
        <template v-if="column.key === 'gender'">
          <StatusText :options="genderOptions" :value="record.gender" />
        </template>
        <!-- 状态列渲染 -->
        <template v-if="column.key === 'status'">
          <StatusText :options="enabledStatusOptions" :value="record.status" />
        </template>
      </template>
    </DataTable>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { appUserManageApi } from '@/api/app';
import type { UserListItem } from '@/api/app/userManage/types';
import { enabledStatusOptions, genderOptions } from '@/utils/options';

interface Props {
  visible: boolean;
  currentRowData: UserListItem;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'inviteCodeClick', record: UserListItem): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const tableRef = ref();
const loading = ref(false);
const tableData = ref<UserListItem[]>([]);

const detailsData = computed<UserListItem>(() => props.currentRowData);

// 弹窗标题
const title = computed(() => {
  return i18nText('userManage.childrenUserDialogTitle', { nickname: detailsData.value.nickname });
});

// 表格搜索参数
const searchParams = computed(() => ({
  inviterUuid: detailsData.value.uuid || '',
  level: 0,
}));

// 表格列配置
const columns = [
  { key: 'nickname', titleKey: 'form.nickname' },
  { key: 'phone', titleKey: 'form.phone' },
  { key: 'gender', titleKey: 'form.gender' },
  { key: 'lastLoginAt', titleKey: 'form.lastLoginTime' },
  { key: 'status', titleKey: 'form.status' },
  { key: 'roleName', titleKey: 'form.roleName' },
  { key: 'createdAt', titleKey: 'form.createTime' },
];

// 双向绑定visible
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});
</script>
