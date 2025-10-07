<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-29 10:08:39
 * @Description: 按钮组
-->
<template>
  <div class="button-group">
    <template v-for="item in options" :key="item.value">
      <el-button
        v-if="item.isShow ? item.isShow(record) : true"
        :type="item.type"
        :link="link"
        :size="size"
        :disabled="item.disabled"
        @click="handleClick(item, record)"
      >
        <icon-font v-if="item.icon" :name="item.icon" />
        {{ item.labelKey ? $t(item.labelKey) : item.label }}
      </el-button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ButtonProps } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();

interface Props {
  options: ButtonGroupOptions[];
  record?: any;
  size?: ButtonProps['size'];
  link?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  link: false,
  options: () => [],
  record: undefined,
  size: undefined,
});

// 处理路由跳转点击
const handleClick = (item: ButtonGroupOptions, record: any) => {
  // 先执行自定义的handler（如果有）
  item.handler?.(record);

  if (item.to) {
    // 构建路由参数
    const route = {
      path: item.to,
      query: {},
    };

    // 处理query参数
    if (item.query) {
      if (typeof item.query === 'function') {
        route.query = item.query(record) || {};
      } else {
        route.query = { ...item.query };
      }
    }

    // 使用路由跳转
    router.push(route);
  }
};
</script>
