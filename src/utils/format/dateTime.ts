/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-20 14:26:49
 * @Description: 时间格式化相关
 */
import {
  useDateFormat,
  useTimeAgo,
  type UseDateFormatOptions,
  type UseTimeAgoOptions,
} from '@vueuse/core';

/**
 * 严格检查ISO 8601日期字符串是否有效
 * 支持格式：YYYY-MM-DDTHH:mm:ss.sssZ（如2025-09-20T03:58:48.000Z）
 * @param isoDate - 待检查的ISO日期字符串
 * @returns 布尔值，表示日期是否有效且格式正确
 */
export const isValidIsoDate = (isoDate: string): boolean => {
  if (!isoDate || typeof isoDate !== 'string') {
    return false;
  }

  // ISO 8601 正则表达式（严格匹配）
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

  // 先进行格式匹配
  if (!isoRegex.test(isoDate)) {
    return false;
  }

  // 再进行日期有效性验证
  const date = new Date(isoDate);
  // 检查是否为有效日期，且转换回字符串后与原字符串一致（避免时区问题）
  return !isNaN(date.getTime()) && date.toISOString() === isoDate;
};

/**
 * 格式化ISO日期为指定格式（不使用响应式）
 * @param isoDate - ISO格式日期字符串
 * @param format - 格式化字符串，默认'YYYY-MM-DD HH:mm:ss'
 * @param options - 格式化选项（如时区等）
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (
  isoDate: string,
  format: string = 'YYYY-MM-DD HH:mm:ss',
  options?: UseDateFormatOptions
): string => {
  if (!isValidIsoDate(isoDate)) {
    console.warn('无效的ISO日期格式:', isoDate);
    return '';
  }
  // 直接获取格式化后的值，不使用响应式包装
  return useDateFormat(isoDate, format, options).value;
};

/**
 * 获取相对时间（如"3小时前"）
 * @param isoDate - ISO格式日期字符串
 * @param options - 相对时间选项（如更新间隔、语言等）
 * @returns 相对时间字符串
 */
export const toRelativeTime = (isoDate: string, options?: UseTimeAgoOptions<any>): string => {
  if (!isValidIsoDate(isoDate)) {
    console.warn('无效的ISO日期格式:', isoDate);
    return '';
  }
  return useTimeAgo(isoDate, options).value;
};

/**
 * 转换ISO日期为时间戳（毫秒）
 * @param isoDate - ISO格式日期字符串
 * @returns 时间戳（毫秒），无效日期返回0
 */
export const toTimestamp = (isoDate: string): number => {
  if (!isValidIsoDate(isoDate)) {
    console.warn('无效的ISO日期格式:', isoDate);
    return 0;
  }
  return new Date(isoDate).getTime();
};

import { format, isValid } from 'date-fns';

/**
 * 格式化时间为ISO8601格式（带时区偏移）
 * @param date - 需要格式化的时间，可以是Date对象、时间戳或字符串
 * @returns ISO8601格式的日期字符串（带时区偏移如+08:00），无效日期返回空字符串
 */
export const formatIso86DateTime = (
  date: Date | number | string
): string => {
  if (!date) {
    console.warn('无效的日期:', date);
    return '';
  }

  try {
    const dateObj = new Date(date);
    
    if (!isValid(dateObj)) {
      console.warn('无效的日期:', date);
      return '';
    }

    // 使用date-fns格式化，生成带时区偏移的ISO8601格式
    return format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
  } catch (error) {
    console.warn('日期格式化失败:', error);
    return '';
  }
};

/**
 * 格式化时间为ISO8601格式（指定时区）
 * @param date - 需要格式化的时间，可以是Date对象、时间戳或字符串
 * @param timezone - 时区名称，如'Asia/Shanghai'、'America/New_York'
 * @returns ISO8601格式的日期字符串（指定时区），无效日期返回空字符串
 */
export const toISO8601WithCustomTimezone = (
  date: Date | number | string,
  options?: UseDateFormatOptions
): string => {
  if (!date) {
    console.warn('无效的日期:', date);
    return '';
  }

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      console.warn('无效的日期:', date);
      return '';
    }

    return useDateFormat(dateObj, 'YYYY-MM-DDTHH:mm:ss.SSSZ', options).value;
  } catch (error) {
    console.warn('日期格式化失败:', error);
    return '';
  }
};
