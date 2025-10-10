/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-06 15:11:11
 * @Description: 账号相关
 */

import alovaInstance from '@/utils/instance';

import type { AccountInfo, AccountMenu, EditPasswordProps, EditProfileProps } from './types';

export default {
  // 修改密码
  editPassword(data: EditPasswordProps): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.ACCOUNT_EDIT_PASSWORD, data);
  },
  // 编辑个人资料
  editProfile(data: EditProfileProps): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.ACCOUNT_EDIT_PROFILE, data);
  },
  // 获取当前账号信息
  getAccountInfo(): Promise<InterfaceResult<AccountInfo>> {
    return alovaInstance.Get(RequestPath.ACCOUNT_GET_ACCOUNT_INFO);
  },
  // 获取当前账号信息
  getAccountMenu(): Promise<InterfaceResult<{ list: AccountMenu[] }>> {
    return alovaInstance.Get(RequestPath.ACCOUNT_GET_ACCOUNT_MENU);
  },
  // 更新用户头像
  updateAvatar(avatarUrl: string): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.ACCOUNT_UPDATE_AVATAR, { avatar: avatarUrl });
  },
};
