/**
 * 通用枚举定义
 */

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

/** 配置类型枚举 */
export enum SystemConfigTypeEnum {
  /** 字符串 */
  STRING = 1,
  /** 数字 */
  NUMBER = 2,
  /** 布尔值 */
  BOOLEAN = 3,
  /** JSON */
  JSON = 4,
  /** 数组 */
  ARRAY = 5,
}
