/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 22:02:54
 * @Description: 数据库相关声明
 */

import { Optional } from 'sequelize';

/** 自动管理字段类型 */
export type AutoManagedFields =
  | 'uuid'
  | 'created_at'
  | 'updated_at'
  | 'created_by_uuid'
  | 'updated_by_uuid';

/** 自增ID模型自动管理字段类型 */
export type AutoManagedFieldsWithId =
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'created_by_uuid'
  | 'updated_by_uuid';

/** 创建属性类型工具 - 确保字段存在于T中 */
export type CreateAttributes<T> = Optional<T, Extract<AutoManagedFields, keyof T>>;

/** 自增ID模型创建属性类型工具 - 确保字段存在于T中 */
export type CreateAttributesWithId<T> = Optional<T, Extract<AutoManagedFieldsWithId, keyof T>>;

/** 匹配类型枚举 */
export enum MatchTypeEnum {
  LIKE = 'like',
  EXACT = 'exact',
  IN = 'in',
  NE = 'ne',
  RANGE = 'range',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
}

/** 数据类型枚举 */
export enum DataTypeEnum {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  DATE = 'date',
}

/** 查询接口 - 配置 */
export interface WhereQueryConfig {
  field: string;
  matchType?: MatchTypeEnum;
  dataType?: DataTypeEnum;
  /** 通过查询，由接口传值 */
  queryValue?: any;
}

/** 公共状态：1启用，0禁用 */
export enum StatusEnum {
  /** 禁用 */
  DISABLE = 0,
  /** 启用 */
  ENABLE = 1,
}

/** 性别枚举 */
export enum GenderEnum {
  /** 未知 */
  UNKNOWN = 0,
  /** 男 */
  MALE = 1,
  /** 女 */
  FEMALE = 2,
}

/** 支付状态枚举 */
export enum PayStatusEnum {
  /** 待支付 */
  PENDING = 1,
  /** 已支付 */
  PAID = 2,
  /** 已退款 */
  REFUNDED = 3,
}

/** 订单状态枚举 */
export enum OrderStatusEnum {
  /** 待支付 */
  PENDING = 1,
  /** 已支付 */
  PAID = 2,
  /** 已完成 */
  COMPLETED = 3,
  /** 已退款 */
  REFUNDED = 4,
  /** 已取消 */
  CANCELLED = 5,
}

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
