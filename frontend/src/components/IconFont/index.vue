<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-20 14:29:10
 * @Description: 图标组件
-->
<template>
  <i :class="`iconfont icon-${name}`" />
</template>
<script lang="ts" setup>
const props = defineProps({
  color: {
    default: "#333",
    type: String,
  },
  fontSize: {
    default: "16px",
    type: String,
  },
  name: {
    default: "",
    type: String,
  },
  size: {
    default: "16px",
    type: String,
  },
  type: {
    default: "iconfont",
    type: String,
  },
});

// 确保在页面head中添加了iconfont的CSS链接
// <link rel="stylesheet" href="//at.alicdn.com/t/c/font_5021379_jz0bxprxcac.css">
// 或者在main.ts中导入CSS文件
</script>

<style lang="scss" scoped>
.icon-svg {
  width: v-bind(size);
  height: v-bind(size);
  fill: v-bind(color);
}
.iconfont {
  font-size: v-bind(fontSize);
}
</style>
