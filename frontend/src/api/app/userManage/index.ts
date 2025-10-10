/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-28 21:05:51
 * @Description: 用户管理API接口
 */
import alovaInstance from '@/utils/instance';

import type { UserDeleteParams, UserEditParams, UserListItem, UserListParams } from './types';

/**
 * 用户管理API接口集合
 */
export default {
  /**
   * 获取下级用户列表
   * @param data 查询参数
   * @returns 下级用户列表数据
   */
  getChildrenList(data: any): Promise<InterfaceResult<PageResult<UserListItem>>> {
    return alovaInstance.Post(RequestPath.APP_USER_CHILDREN_LIST, data);
  },
  /**
   * 获取用户列表
   * @param data 查询参数
   * @returns 用户列表数据
   */
  getList(data: UserListParams): Promise<InterfaceResult<PageResult<UserListItem>>> {
    return alovaInstance.Post(RequestPath.APP_USER_LIST, data);
  },

  /**
   * 删除用户
   * @param data 删除参数
   * @returns 操作结果
   */
  onDelete(data: UserDeleteParams): Promise<InterfaceResult<null>> {
    return alovaInstance.Delete(RequestPath.APP_USER_DELETE, data);
  },

  /**
   * 编辑用户信息
   * @param data 编辑参数
   * @returns 操作结果
   */
  onEdit(data: UserEditParams): Promise<InterfaceResult<UserListItem>> {
    return alovaInstance.Put(RequestPath.APP_USER_UPDATE, data);
  },
};
