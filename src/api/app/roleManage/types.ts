/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-01 20:22:14
 * @Description: 角色管理相关类型定义
 */

/**
 * 角色列表查询参数接口
 */
export interface RoleListParams extends PageQuery {
  /** 角色名称，支持模糊查询 */
  name?: string;
  /** 角色状态（0-禁用，1-启用） */
  status?: number;
}

/**
 * 角色数据结构接口
 */
export interface RoleListItem {
  /** 角色唯一标识 */
  uuid: string;
  /** 角色代码（唯一） */
  code: string;
  /** 创建时间 */
  createdAt: string;
  /** 角色描述 */
  description: string;
  /** 关联的菜单ID列表 */
  menuIds: string[];
  /** 角色名称 */
  name: string;
  /** 角色状态（0-禁用，1-启用） */
  status: number;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 角色创建参数接口
 */
export interface RoleAddParams {
  /** 角色名称 */
  name: string;
  /** 角色代码（唯一） */
  code: string;
  /** 角色描述 */
  description?: string;
  /** 角色状态（0-禁用，1-启用） */
  status?: number;
  /** 关联的菜单ID列表 */
  menuIds?: string[];
}

/**
 * 角色编辑参数接口
 */
export interface RoleEditParams extends RoleAddParams {
  /** 角色UUID（编辑时必填） */
  uuid: string;
}

/**
 * 角色删除参数接口
 */
export interface RoleDeleteParams {
  /** 角色UUID */
  uuid: string;
}

/**
 * 角色权限配置参数接口
 */
export interface RolePermissionParams {
  /** 角色UUID */
  uuid: string;
  /** 关联的菜单ID列表 */
  menuIds: string[];
}
