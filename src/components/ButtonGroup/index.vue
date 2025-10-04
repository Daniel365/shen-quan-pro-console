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
        v-hasPerm="item.permission"
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

const handleClick = (item: ButtonGroupOptions, record: any) => {
  item.handler?.(record);
};
</script>
