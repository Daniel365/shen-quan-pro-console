/*
* @Author: 350296245@qq.com
* @Date: 2025-10-09 00:00:00
* @Description: 利润分配配置管理相关类型定义
*/
import { RoleShareItem } from '@/views/app/profitDistributionManage/utils/types';

/**
 * 利润分配配置列表查询参数接口
 */
export interface ProfitDistributionListParams extends PageQuery {
  /** 配置名称，支持模糊查询 */
  configName?: string;
  /** 配置状态（1启用, 2禁用） */
  status?: number;
}

/**
 * 利润分配配置数据结构接口
 */
export interface ProfitDistributionListItem {
  /** 配置唯一标识 */
  uuid: string;
  /** 配置名称 */
  configName: string;
  /** 角色分配比例（JSON字符串） */
  roleShares: string;
  /** 配置状态（1启用, 2禁用） */
  status: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 利润分配配置创建参数接口
 */
export interface ProfitDistributionFormData {
  uuid?: string;
  /** 配置名称 */
  configName: string;
  /** 角色分配比例 */
  roleShares: RoleShareItem[] | Record<string, number>;
  /** 配置状态（1启用, 2禁用） */
  status?: number;
}
