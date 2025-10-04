/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 11:08:45
 * @Description:
 */
import { AccountInfo } from "@/api/accountManage/data.d";
import { store } from "@/store";
// utils
import { Storage } from "@/utils/storage";
// type

export const useAccountStore = defineStore("account", () => {
  const accessToken = ref(Storage.get(StorageKeyEnum.ACCESS_TOKEN));
  const accountInfo = useStorage<AccountInfo>("accountInfo", {} as AccountInfo);

  /** 设置token */
  function setToken(token: string) {
    accessToken.value = token;
    Storage.set(StorageKeyEnum.ACCESS_TOKEN, token);
  }
  /**
   * 设置账号信息
   */
  function setAccountInfo(data: AccountInfo) {
    accountInfo.value = {
      ...accountInfo.value,
      ...data,
    };
  }
  /**
   * 获取登录用户信息
   *
   * @returns {AccountInfo} 用户信息
   */
  async function getAccountInfo() {
    const response = await accountManageApi.getAccountInfo();
    handleReturnResults({
      onSuccess: (res) => {
        const data = res.data as AccountInfo;
        setAccountInfo(data);
      },
      params: response,
    });
  }

  /**
   * 重置用户状态
   * 仅处理用户模块内的状态
   */
  function resetAccountState() {
    // 重置用户信息
    accountInfo.value = {} as AccountInfo;
    // 清除token等认证信息
    Storage.remove(StorageKeyEnum.ACCESS_TOKEN);
  }

  /**
   * 重置所有系统状态
   * 统一处理所有清理工作，包括用户凭证、路由、缓存等
   */
  function resetAllState() {
    // 1. 重置用户状态
    resetAccountState();
    // 2.重置路由
    usePermissionStoreHook().resetRouter();

    return Promise.resolve();
  }
  /**
   * 退出登录
   */
  function onLogout() {
    return new Promise<void>((resolve, reject) => {
      adminManageApi
        .onLogout()
        .then(() => {
          // 重置所有系统状态
          resetAllState();
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  return {
    accessToken,
    accountInfo,
    getAccountInfo,
    onLogout,
    resetAllState,
    setAccountInfo,
    setToken,
  };
});

/**
 * 在组件外部使用AccountStore的钩子函数
 * @see https://pinia.vuejs.org/core-concepts/outside-component-usage.html
 */
export function useAccountStoreHook() {
  return useAccountStore(store);
}
