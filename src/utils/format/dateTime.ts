/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-20 14:26:49
 * @Description: 时间格式化相关
 */
import {
  useDateFormat,
  useTimeAgo,
  type UseTimeAgoOptions,
  type UseDateFormatOptions,
} from "@vueuse/core";

/**
 * 严格检查ISO 8601日期字符串是否有效
 * 支持格式：YYYY-MM-DDTHH:mm:ss.sssZ（如2025-09-20T03:58:48.000Z）
 * @param isoDate - 待检查的ISO日期字符串
 * @returns 布尔值，表示日期是否有效且格式正确
 */
export const isValidIsoDate = (isoDate: string): boolean => {
  if (!isoDate || typeof isoDate !== "string") {
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
export const formatIsoDate = (
  isoDate: string,
  format: string = "YYYY-MM-DD HH:mm:ss",
  options?: UseDateFormatOptions
): string => {
  if (!isValidIsoDate(isoDate)) {
    console.warn("无效的ISO日期格式:", isoDate);
    return "";
  }
  // 直接获取格式化后的值，不使用响应式包装
  return useDateFormat(isoDate, format, options).value;
};

/**
 * 转换ISO日期为本地时间格式（YYYY年MM月DD日 HH:mm:ss）
 * @param isoDate - ISO格式日期字符串
 * @param options - 格式化选项
 * @returns 本地格式日期字符串
 */
export const toLocalString = (isoDate: string, options?: UseDateFormatOptions): string => {
  return formatIsoDate(isoDate, "YYYY年MM月DD日 HH:mm:ss", options);
};

/**
 * 获取相对时间（如"3小时前"）
 * @param isoDate - ISO格式日期字符串
 * @param options - 相对时间选项（如更新间隔、语言等）
 * @returns 相对时间字符串
 */
export const toRelativeTime = (isoDate: string, options?: UseTimeAgoOptions<any>): string => {
  if (!isValidIsoDate(isoDate)) {
    console.warn("无效的ISO日期格式:", isoDate);
    return "";
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
    console.warn("无效的ISO日期格式:", isoDate);
    return 0;
  }
  return new Date(isoDate).getTime();
};
