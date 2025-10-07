<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-20 15:52:18
 * @Description: 用户代理信息
-->
<template>
  <div class="info-list ml-15">
    <h3 class="mb-3">{{ $t('form.userAgent') }}</h3>
    <el-row v-for="(item, index) in infoList" :key="index" class="mb-2">
      <el-col :span="3">{{ item.label }}:</el-col>
      <el-col :span="5">{{ item.value }}</el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  userAgent: {
    type: String,
  },
});

// 存储列表数据
const infoList = ref<OptionsItemType[]>([]);

// 组件挂载时解析并生成列表
onMounted(() => {
  const result = props.userAgent && getParseUA(props.userAgent);

  if (result) {
    infoList.value = [
      { label: '浏览器', value: result.browser },
      { label: '浏览器版本', value: result.browserVersion },
      { label: '操作系统', value: result.os },
      { label: '架构', value: result.architecture },
    ];
  }
});
</script>
