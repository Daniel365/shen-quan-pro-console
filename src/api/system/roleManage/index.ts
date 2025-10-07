/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-01 20:22:21
 * @Description: 角色管理
 */

import alovaInstance from '@/utils/instance';

import { RoleFormData, RoleListParams } from './types';

export default {
  // 获取角色列表
  getList(data: RoleListParams): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.ROLE_LIST, data);
  },
  // 分配权限
  onAssignPerm(data: { uuid: string; menuIds: any[] }): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.ROLE_ASSIGN_PERM, data);
  },
  // 新增角色
  onCreate(data: RoleFormData): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.ROLE_CREATE, data);
  },
  // 删除角色
  onDelete(data: { uuid: string }): Promise<InterfaceResult> {
    return alovaInstance.Delete(RequestPath.ROLE_DELETE, data);
  },
  // 编辑角色
  onEdit(data: RoleFormData): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.ROLE_UPDATE, data);
  },
};
