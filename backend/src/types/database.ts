/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 22:02:54
 * @Description: 数据库相关声明
 */

/** 匹配类型枚举 */
export enum MatchTypeEnum {
  LIKE = "like",
  EXACT = "exact",
  IN = "in",
  NE = "ne",
  RANGE = "range",
  GT = "gt",
  LT = "lt",
  GTE = "gte",
  LTE = "lte",
}

/** 数据类型枚举 */
export enum DataTypeEnum {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  ARRAY = "array",
  DATE = "date",
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
