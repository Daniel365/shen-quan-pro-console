/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-30 14:23:49
 * @Description: 字母相关格式化
 */

// 下划线转驼峰
const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

// 驼峰转下划线
const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

/**
 * 转换对象键名格式
 * @param data 数据
 * @param toSnake 是否转为下划线格式，默认true
 * @param excludeKeys 排除的键名
 */
export const transformKeys = (params: {
  data: any;
  toSnake?: boolean;
  excludeKeys?: string[];
}): any => {
  const { data, toSnake = true, excludeKeys = [] } = params;

  if (typeof data !== "object" || data === null) return data;

  if (Array.isArray(data)) {
    return data.map((item) =>
      transformKeys({
        data: item,
        excludeKeys,
        toSnake,
      })
    );
  }

  const result: any = {};
  const transform = toSnake ? toSnakeCase : toCamelCase;

  for (const [key, value] of Object.entries(data)) {
    const newKey = excludeKeys.includes(key) ? key : transform(key);
    result[newKey] = transformKeys({
      data: value,
      excludeKeys,
      toSnake,
    });
  }

  return result;
};

/**
 * 按首字母排序
 */
export const compareByFirstLetter = (a: any, b: any, sortKey: string) => {
  const aVal = a[sortKey];
  const bVal = b[sortKey];
  return aVal && bVal ? aVal.localeCompare(bVal, "zh-CN") : 0;
};
