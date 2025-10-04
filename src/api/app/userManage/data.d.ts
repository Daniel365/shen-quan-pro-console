/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-28 21:05:51
 * @Description: 用户管理相关类型定义
 */

/**
 * 用户列表查询参数接口
 */
export interface UserListParams extends PageQuery {
  /** 用户名，支持模糊查询 */
  nickname?: string;
  /** 邮箱地址，支持模糊查询 */
  phone?: string;
  /** 用户状态（0-禁用，1-启用） */
  status?: number;
}

/**
 * 用户数据结构接口
 */
export interface UserListItem {
  /** 用户唯一标识 */
  uuid: string;
  /** 昵称 */
  nickname: string;
  /** 手机号 */
  phone: string;
  /** 用户状态（0-禁用，1-启用） */
  status: number;
  /** 关联的角色UUID */
  roleUuids: string[];
  /** 角色名称（关联查询得到） */
  roleName?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 用户编辑参数接口
 */
export interface UserEditParams {
  /** 用户UUID（编辑时必填） */
  uuid: string;
  /** 昵称 */
  nickname: string;
  /** 关联的角色UUID */
  roleUuids: string[];
  /** 用户状态（0-禁用，1-启用） */
  status?: number;
}


/**
 * 用户删除参数接口
 */
export interface UserDeleteParams {
  /** 用户UUID */
  uuid: string;
}
