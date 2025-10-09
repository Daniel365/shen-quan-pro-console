/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 22:02:54
 * @Description: 数据库相关声明
 */

import { DataTypeEnum, MatchTypeEnum } from '@/enum';
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

/** 查询接口 - 配置 */
export interface WhereQueryConfig {
  field: string;
  matchType?: MatchTypeEnum;
  dataType?: DataTypeEnum;
  /** 通过查询，由接口传值 */
  queryValue?: any;
}
