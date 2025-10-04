/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-29 20:16:07
 * @Description: 正则
 */
export const RegexPatterns = {
  /** 邮箱验证正则 */
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  /** 中国大陆手机号验证正则 */
  chinaPhone: /^1[3-9]\d{9}$/,
  /** 域名验证正则 */
  domain: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
  /** URL验证正则 */
  url: /^(https?:\/\/|ftp:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d{1,5})?(\/.*)?$/,
  /** 18位身份证号码验证正则 */
  idCard: /^\d{17}[\dXx]$/,
  /** 强密码验证正则（至少8位，包含大小写字母和数字） */
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  /** 纯数字验证正则 */
  number: /^\d+$/,
  /** 中文验证正则 */
  chinese: /^[\u4e00-\u9fa5]+$/,
  /** 用户名验证正则（字母开头，允许字母、数字、下划线，4-20位） */
  username: /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/,
};

export const onPattern = (value: any, regex: RegExp) => {
  return regex.test(value);
};
