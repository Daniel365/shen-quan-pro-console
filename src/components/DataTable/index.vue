<template>
  <!-- 数据表格组件 -->
  <div class="data-table">
    <!-- 表格 caption -->
    <template v-if="$slots.caption">
      <div class="data-table-caption">
        <slot name="caption" />
      </div>
    </template>
    <!-- 表格主体 -->
    <el-table v-loading="loading" :row-key="rowKey" :data="dataList" :height="height">
      <!-- 展开列 -->
      <template v-if="$slots.expand">
        <el-table-column type="expand" width="50">
          <template #default="props">
            <slot name="expand" :row="props.row" :index="props.$index" />
          </template>
        </el-table-column>
      </template>
      <el-table-column
        v-for="item in processedColumns"
        :key="item.key"
        :prop="item.dataIndex"
        :label="item.title"
        :width="item.width"
        :align="item.align"
        :show-overflow-tooltip="item.showOverflowTooltip"
        :fixed="item.fixed"
      >
        <template #default="{ row, $index }">
          <slot v-if="$slots.bodyCell" name="bodyCell" :column="item" :record="row" :index="$index">
            {{ handleText(row, item) }}
          </slot>
          <template v-else>
            {{ handleText(row, item) }}
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="flex flex-justify-between mt-5">
      <span></span>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePaginationChange"
        @size-change="handlePaginationSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// utils
import { formatIsoDate, isValidIsoDate } from '@/utils/format/dateTime';

/**
 * 表格列配置接口
 */
export interface TableColumn {
  /** 列标题 */
  title?: string;
  /** 列标题国际化key */
  titleKey?: string;
  /** 数据字段名，默认使用key */
  dataIndex?: string;
  /** 列唯一标识 */
  key: string;
  /** 列宽度 */
  width?: number | string;
  /** 列对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 截断展示 */
  showOverflowTooltip?: boolean;
  /** 是否固定列 */
  fixed?: string | boolean;
  /** 点击事件 */
  click?: (row: any, index: number) => void;
}

/**
 * 数据表格组件属性接口
 */
interface Props<T = any> {
  /** API请求函数 */
  api?: (params: any) => Promise<InterfaceResult<PageResult<T>>>;
  /** 加载状态 */
  loading?: boolean;
  /** 表格高度 */
  height?: any;
  /** 行数据的Key，用于行选择 */
  rowKey?: string;
  /** 搜索参数 */
  searchParams?: Record<string, any>;
  /** 表格列配置 */
  columns: TableColumn[];
  /** 表格数据 */
  dataList?: T[];
}

/**
 * 组件属性定义
 */
const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  height: 500,
  loading: false,
  rowKey: 'uuid',
  searchParams: () => ({}),
});

/**
 * 处理列配置，自动添加dataIndex和title
 */
const processedColumns = computed(() =>
  props.columns.map((col: TableColumn) => ({
    ...col,
    dataIndex: col.dataIndex || col.key,
    title: col.title || (col.titleKey ? i18nText(col.titleKey) : ''),
  }))
);

/**
 * 组件事件定义
 */
const emit = defineEmits<{
  /** 更新数据列表 */
  'update:dataList': [value: any[]];
  /** 更新加载状态 */
  'update:loading': [value: boolean];
  /** 获取数据成功回调 */
  onSuccess: [data: any[]];
}>();

/**
 * 分页配置
 */
const pagination = reactive<PageInfo>({
  page: 1,
  pageSize: 10,
  total: 0,
});

/**
 * 处理表格单元格文本显示
 * @param row 行数据
 * @param item 列配置
 * @returns 单元格显示值
 */
const handleText = (row: any, item: TableColumn) => {
  const val = row[item.dataIndex || item.key];
  if (isValidIsoDate(val)) {
    return formatIsoDate(val);
  }
  return val || '-';
};

/**
 * 获取表格数据
 */
const getDataList = async () => {
  emit('update:loading', true);
  try {
    const params = {
      ...props.searchParams,
      ...pagination,
      total: undefined, // 去除 total 参数
    };
    if (props.api) {
      const response = await props.api(params);
      handleReturnResults({
        onSuccess: (res) => {
          const { list, pageInfo } = res.data;
          pagination.total = pageInfo.total || 0;
          emit('update:dataList', list || []);
          emit('onSuccess', list || []);
        },
        params: response,
      });
    }
  } catch (error) {
    console.error('获取数据失败:', error);
  } finally {
    emit('update:loading', false);
  }
};

/**
 * 处理分页页码变化
 * @param page 新的页码
 */
const handlePaginationChange = (page: number) => {
  pagination.page = page;
  getDataList();
};

/**
 * 处理分页大小变化
 * @param pageSize 新的每页条数
 */
const handlePaginationSizeChange = (pageSize: number) => {
  pagination.page = 1;
  pagination.pageSize = pageSize;
  getDataList();
};

/**
 * 刷新数据，重置到第一页
 */
const refresh = () => {
  pagination.page = 1;
  getDataList();
};

/**
 * 监听搜索参数变化，自动刷新数据
 */
watch(
  () => props.searchParams,
  () => {
    refresh();
  },
  { deep: true }
);

/**
 * 暴露方法给父组件使用
 */
defineExpose({
  /** 获取数据列表 */
  getDataList,
  /** 刷新数据 */
  refresh,
});

/**
 * 组件挂载时获取数据
 */
onMounted(() => {
  if (props.api) {
    getDataList();
  }
});
</script>

<style lang="scss" scoped>
.data-table {
  background: var(--el-bg-color-page);
  padding: 16px;
  border-radius: 6px;
  &-caption {
    margin-bottom: 16px;
  }
}
</style>
