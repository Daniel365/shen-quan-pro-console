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
 * 角色翻译数据结构接口
 */
export interface RoleTranslationItem {
  /** 翻译唯一标识 */
  uuid?: string;
  /** 角色UUID */
  roleUuid?: string;
  /** 语言代码 */
  language: string;
  /** 角色名称（多语言） */
  name: string;
  /** 角色描述（多语言） */
  description?: string;
}

/**
 * 角色数据结构接口
 */
export interface RoleListItem {
  /** 角色唯一标识 */
  uuid: string;
  /** 角色代码（唯一） */
  code: string;
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  description?: string;
  /** 关联的菜单ID列表 */
  menuIds: string[];
  /** 分润比例 */
  profitRatio?: number;
  /** 角色状态（0-禁用，1-启用） */
  status: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 角色翻译列表 */
  roleTranslations?: RoleTranslationItem[];
}

/**
 * 角色创建参数接口
 */
export interface RoleFormData {
  uuid?: string;
  /** 角色代码（唯一） */
  code: string;
  /** 分润比例 */
  profitRatio?: number;
  /** 角色状态（0-禁用，1-启用） */
  status?: number;
  /** 关联的菜单ID列表 */
  menuIds?: string[];
  /** 角色翻译列表 */
  roleTranslations: RoleTranslationItem[];
}
