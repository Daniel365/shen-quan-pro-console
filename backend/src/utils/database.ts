/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-29 17:39:47
 * @Description: 数据库相关方法封装
 */

import { Op } from "sequelize";
import { isDev } from "./dataJudge";
import {
  WhereQueryConfig,
  MatchTypeEnum,
  DataTypeEnum,
} from "../types/database";

/** 初始sequelize的配置 */
export const sequelizeSyncConfig = () => {
  if (isDev) {
    return { alter: true };
  }
  // 生产环境不使用sync，通过migration管理数据库
  return false;
};

/** 获取表名 */
export const getDbName = (name: string) => {
  return `console_${name}`;
};

/** 默认查询列表配置 */
export const defaultListQuery = (
  data: { page: number; page_size: number } | any
): any => {
  const { page = 1, page_size = 10 } = data;
  return {
    limit: Number(page_size),
    offset: (Number(page) - 1) * Number(page_size),
    order: [["created_at", "DESC"]],
  };
};

/** 获取分页配置 */
export const getPageInfoConfig = (
  data: { count: number; page: number; page_size: number } | any
) => {
  const { count = 0, page = 1, page_size = 10 } = data;
  return {
    total: count,
  };
};

/**
 *
 * @param data 接口参数对象
 * @param configs 查询条件配置
 * @param configs.matchType 默认：like
 * @param configs.dataType 默认：string
 * @tips 当查询条件都是like时，configs可传字符串数组 ['xxx','xxx']
 * @returns 查询条件对象
 */
export const buildWhereCondition = (
  data: any,
  configs: WhereQueryConfig[] | string[]
) => {
  const where: any = {};
  // 做数据兼容
  const list: WhereQueryConfig[] = configs.map((item) => {
    if (typeof item === "string") {
      return {
        field: item,
      };
    } else {
      return item;
    }
  });

  for (const item of list) {
    const {
      field,
      matchType = MatchTypeEnum.LIKE,
      dataType = DataTypeEnum.STRING,
      queryValue,
    } = item;
    const value = queryValue || data[field];

    // 跳过空值
    if (value === undefined || value === null || value === "") continue;

    // 根据数据类型转换值
    let processedValue = value;
    if (dataType === DataTypeEnum.NUMBER) {
      processedValue = Number(value);
      if (isNaN(processedValue)) continue;
    } else if (dataType === DataTypeEnum.BOOLEAN) {
      processedValue = Boolean(value);
    } else if (dataType === DataTypeEnum.ARRAY && !Array.isArray(value)) {
      processedValue = [value];
    }

    // 根据匹配类型构建条件
    switch (matchType) {
      case MatchTypeEnum.LIKE:
        where[field] = { [Op.like]: `%${processedValue}%` };
        break;
      case MatchTypeEnum.EXACT:
        where[field] = processedValue;
        break;
      case MatchTypeEnum.IN:
        where[field] = {
          [Op.in]: Array.isArray(processedValue)
            ? processedValue
            : [processedValue],
        };
        break;
      case MatchTypeEnum.RANGE:
        if (Array.isArray(processedValue) && processedValue.length === 2) {
          where[field] = { [Op.between]: processedValue };
        }
        break;
      case MatchTypeEnum.NE:
        where[field] = { [Op.ne]: processedValue };
        break;
      case MatchTypeEnum.GT:
        where[field] = { [Op.gt]: processedValue };
        break;
      case MatchTypeEnum.LT:
        where[field] = { [Op.lt]: processedValue };
        break;
      case MatchTypeEnum.GTE:
        where[field] = { [Op.gte]: processedValue };
        break;
      case MatchTypeEnum.LTE:
        where[field] = { [Op.lte]: processedValue };
        break;
    }
  }

  return where;
};
