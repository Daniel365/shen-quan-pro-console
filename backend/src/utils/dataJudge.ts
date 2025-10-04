/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-29 18:13:29
 * @Description: 判断类型方法
 */

import { DataTypes } from 'sequelize';

/**
 * 校验数据是否符合 Sequelize 数据类型要求
 * @param {*} value - 要校验的值
 * @param {DataTypes} dataType - Sequelize 的数据类型
 * @param {Object} [options] - 额外校验选项
 * @param {boolean} [options.allowNull] - 是否允许为 null/undefined
 * @returns {Object} - 校验结果，包含是否通过和错误信息
 */
export function validateByDataType(value: any, dataType: any, options = { allowNull: false }) {
  // 初始化结果对象
  let result = { isValid: true, messageKey: '' };

  // 如果允许为 null/undefined 且值为 null/undefined，直接通过
  if (options.allowNull && (value === null || value === undefined)) {
    return result;
  }

  // 值为 null/undefined 但不允许时，校验不通过
  if (value === null || value === undefined) {
    return { isValid: false, messageKey: 'validation.valueRequired' };
  }

  // 使用switch语句进行类型校验
  switch (dataType) {
    case DataTypes.STRING:
      if (typeof value !== 'string') {
        result = { isValid: false, messageKey: 'validation.stringType' };
      } else if (value.trim() === '') {
        result = { isValid: false, messageKey: 'validation.stringNotEmpty' };
      }
      break;

    case DataTypes.ARRAY:
      if (!Array.isArray(value)) {
        result = { isValid: false, messageKey: 'validation.arrayType' };
      }
      break;

    case DataTypes.BOOLEAN:
      if (typeof value !== 'boolean') {
        result = { isValid: false, messageKey: 'validation.booleanType' };
      }
      break;

    case DataTypes.INTEGER:
      if (typeof value !== 'number' || isNaN(value) || !Number.isInteger(value)) {
        result = { isValid: false, messageKey: 'validation.integerType' };
      }
      break;

    case DataTypes.FLOAT:
    case DataTypes.DOUBLE:
      if (typeof value !== 'number' || isNaN(value)) {
        result = { isValid: false, messageKey: 'validation.numberType' };
      }
      break;

    case DataTypes.DATE:
      if (!(value instanceof Date) && isNaN(Date.parse(value))) {
        result = { isValid: false, messageKey: 'validation.dateType' };
      }
      break;

    // 未匹配到的类型默认通过验证
    default:
      result = { isValid: true, messageKey: '' };
  }

  return result;
}
