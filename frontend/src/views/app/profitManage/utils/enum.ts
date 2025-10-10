/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-08 00:00:00
 * @Description: 收益记录管理枚举
 */

/** 收益来源枚举 */
export enum ProfitSourceEnum {
  /** 活动收益 */
  ACTIVITY = 1,
  /** 会员卡收益 */
  MEMBERSHIP_CARD = 2,
  /** 其他收益 */
  OTHER = 3,
}

/** 收益类型枚举 */
export enum ProfitTypeEnum {
  /** 收入 */
  INCOME = 1,
  /** 支出 */
  EXPENSE = 2,
}

/** 收益状态枚举 */
export enum ProfitStatusEnum {
  /** 待结算 */
  PENDING = 1,
  /** 已结算 */
  SETTLED = 2,
  /** 已取消 */
  CANCELLED = 3,
}