/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-28 21:05:51
 * @Description: 菜单管理
 */

import alovaInstance from '@/utils/instance';

import { MenuFormProps, MenuListItem, MenuListParams, TreeListItem } from './types';

export default {
  // 获取菜单列表
  getList(data: MenuListParams): Promise<InterfaceResult<{ list: MenuListItem[] }>> {
    return alovaInstance.Post(RequestPath.MENU_LIST, data);
  },
  // 获取树形菜单列表
  getTreeList(): Promise<InterfaceResult<{ list: TreeListItem[] }>> {
    return alovaInstance.Get(RequestPath.MENU_TREE_LIST);
  },
  // 新增菜单
  onCreate(data: Partial<MenuFormProps>): Promise<InterfaceResult> {
    return alovaInstance.Post(RequestPath.MENU_CREATE, data);
  },
  // 删除菜单
  onDelete(data: { id: number }): Promise<InterfaceResult> {
    return alovaInstance.Delete(RequestPath.MENU_DELETE, data);
  },
  // 编辑菜单
  onEdit(data: Partial<MenuFormProps>): Promise<InterfaceResult> {
    return alovaInstance.Put(RequestPath.MENU_UPDATE, data);
  },
};
