<template>
  <div class="layout-logo">
    <transition enter-active-class="animate__animated animate__fadeInLeft">
      <el-link :key="+collapse" class="wh-full flex-center" underline="never" to="/">
        <img :src="logo" class="w20px h20px" />
        <span v-if="!collapse" class="title">
          {{ $t('common.appName') }}
        </span>
      </el-link>
    </transition>
  </div>
</template>

<script name="Logo" lang="ts" setup>
import logo from '@/assets//images/logo.svg';

defineProps({
  collapse: {
    required: true,
    type: Boolean,
  },
});
</script>

<style lang="scss" scoped>
.layout-logo {
  width: 100%;
  height: $navbar-height;
  background-color: $sidebar-logo-background;
  display: flex;
  align-items: center;
  justify-content: center;

  .title {
    vertical-align: 15%;
    flex-shrink: 0;
    margin-left: 10px;
    font-size: 16px;
    font-weight: bold;
    color: $sidebar-logo-text-color;
  }
}
</style>
