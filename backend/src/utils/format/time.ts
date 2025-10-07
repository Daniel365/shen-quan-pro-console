import { format } from 'date-fns';

const defaultFormatDateTime = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";
/**
 * 生成带时区的 ISO8601 格式
 * @param date 日期对象
 * @param dateFormat 日期格式
 * @returns 带时区偏移的 ISO8601 字符串
 */
export function formatDateTime(date: Date, dateFormat: string = defaultFormatDateTime): string {
  return format(date, dateFormat);
}
/**
 * ISO8601 字符串转时间戳
 * @param isoString ISO8601 格式字符串
 * @returns 时间戳（毫秒）
 */
export function isoToTimestamp(isoString: string): number {
  return new Date(isoString).getTime();
}

/**
 * 生成带时区的 ISO8601 格式
 * @param dateFormat 日期格式
 * @returns 带时区偏移的 ISO8601 字符串
 */
export function nowDateTime(dateFormat: string = defaultFormatDateTime): string {
  return format(new Date(), dateFormat);
}
/**
 * 获取当前时间戳
 * @returns 当前时间戳（毫秒）
 */
export function nowTimestamp(): number {
  return Date.now();
}

/**
 * 检查是否为有效的 ISO8601 格式字符串
 * @param str 待检查的字符串
 * @returns 是否为有效的 ISO8601 格式
 */
export function isValidISO(str: string): boolean {
  try {
    const date = new Date(str);
    return !isNaN(date.getTime()) && str.includes('T');
  } catch {
    return false;
  }
}
