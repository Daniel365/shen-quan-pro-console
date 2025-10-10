<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-19 06:19:12
 * @Description: 第三方登录
-->
<template>
  <div class="third-party-login">
    <div class="divider-container">
      <div class="divider-line"></div>
      <span class="divider-text">{{ $t("admin.otherLoginMethods") }}</span>
      <div class="divider-line"></div>
    </div>
    <div class="social-login">
      <a href="#" class="social-item">
        <el-icon><Iphone /></el-icon>
      </a>
      <a href="#" class="social-item">
        <el-icon><ChatDotRound /></el-icon>
      </a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Iphone, ChatDotRound } from "@element-plus/icons-vue";
</script>
<style lang="scss" scoped>
.third-party-login {
  .social-login {
    display: flex;
    justify-content: center;
    gap: 24px;

    .social-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: #909399;
      transition: all 0.3s;
      font-size: 20px;

      &:hover {
        color: #1890ff;
        transform: translateY(-2px);
      }
    }
  }

  .divider-container {
    display: flex;
    align-items: center;
    margin: 20px 0;

    .divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--el-border-color-light), transparent);
    }

    .divider-text {
      padding: 0 16px;
      font-size: 12px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }
  }
}
</style>
