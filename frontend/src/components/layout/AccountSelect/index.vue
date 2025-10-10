<!--
 * @Author: 350296245@qq.com
 * @Date: 2025-09-20 13:18:15
 * @Description: 账号选项组件
-->
<template>
  <el-dropdown trigger="click">
    <el-link class="account-profile" underline="never">
      <img src="@/assets/images/logo.svg" />
      <span>{{ accountInfo.username }}</span>
    </el-link>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="goToPage(RouterPath.ACCOUNT_PROFILE)">
          {{ $t("common.userCenter") }}
        </el-dropdown-item>
        <el-dropdown-item divided @click="handleLogout">
          {{ $t("common.logout") }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
const accountStore = useAccountStoreHook();

const { route, goToPage } = useRouteUtil();

// 用户信息
const accountInfo = computed(() => accountStore.accountInfo);

const handleLogout = () => {
  accountStore.onLogout().then(() => {
    goToPage(`${RouterPath.LOGIN}?redirect=${route.fullPath}`);
  });
};
</script>

<style lang="scss" scoped>
.account-profile {
  img {
    width: 20px;
    height: 20px;
    vertical-align: middle;
    margin-right: 5px;
  }
}
</style>
