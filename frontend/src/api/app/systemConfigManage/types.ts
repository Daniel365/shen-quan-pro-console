/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 00:00:00
 * @Description: 系统配置管理相关类型定义
 */

/**
 * 系统配置列表查询参数接口
 */
export interface SystemConfigListParams extends PageQuery {
  /** 配置键名，支持模糊查询 */
  key?: string;
  /** 配置类型（1字符串, 2数字, 3布尔值, 4JSON） */
  type?: number;
}

/**
 * 系统配置数据结构接口
 */
export interface SystemConfigListItem {
  /** 配置唯一标识 */
  uuid: string;
  /** 配置键名 */
  key: string;
  /** 配置值 */
  value: string;
  /** 配置描述 */
  description?: string;
  /** 配置类型（1字符串, 2数字, 3布尔值, 4JSON） */
  type: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 系统配置创建参数接口
 */
export interface SystemConfigFormData {
  uuid?: string;
  /** 配置键名 */
  key: string;
  /** 配置值 */
  value: string;
  /** 配置描述 */
  description?: string;
  /** 配置类型（1字符串, 2数字, 3布尔值, 4JSON） */
  type?: number;
}