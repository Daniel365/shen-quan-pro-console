/**
 * 业务相关枚举定义
 */

/** 收益状态枚举 */
export enum ProfitStatusEnum {
  /** 冻结中 */
  FROZEN = 1,
  /** 已结算 */
  SETTLED = 2,
  /** 已取消 */
  CANCELLED = 3,
}

/** 标签类型枚举 */
export enum TagTypeEnum {
  /** 活动标签 */
  ACTIVITY = 1,
  /** 用户标签 */
  USER = 2,
}
