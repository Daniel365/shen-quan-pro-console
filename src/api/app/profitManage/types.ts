/*
 * @Description: 收益记录管理相关类型定义
 */

import {
  ProfitSourceEnum,
  ProfitTypeEnum,
  ProfitStatusEnum,
} from '@/views/app/profitManage/utils/enum';

/**
 * 收益记录列表查询参数接口
 */
export interface ProfitListParams {
  /** 收益编号 */
  profitNo?: string;
  /** 用户名称 */
  userName?: string;
  /** 活动名称 */
  activityName?: string;
  /** 收益来源 */
  source?: ProfitSourceEnum;
  /** 收益类型 */
  type?: ProfitTypeEnum;
  /** 收益状态 */
  status?: ProfitStatusEnum;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
}

/**
 * 收益记录数据结构接口
 */
export interface ProfitListItem {
  /** 收益ID */
  uuid: string;
  /** 收益编号 */
  profitNo: string;
  /** 用户ID */
  userUuid: number;
  /** 用户名称 */
  userName: string;
  /** 活动ID */
  activityUuid?: number;
  /** 活动名称 */
  activityName?: string;
  /** 收益金额 */
  amount: number;
  /** 收益来源 */
  source: ProfitSourceEnum;
  /** 收益类型 */
  type: ProfitTypeEnum;
  /** 收益状态 */
  status: ProfitStatusEnum;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createdAt: string;
  /** 结算时间 */
  settledAt?: string;
}

/**
 * 收益记录导出参数接口
 */
export interface ProfitExportParams extends ProfitListParams {
  /** 导出字段 */
  exportFields?: string[];
}