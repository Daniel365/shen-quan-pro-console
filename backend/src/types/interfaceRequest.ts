/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-06 09:31:01
 * @Description: 接口请求
 */

export type RuleConfigItem = {
  /** 是否必填 */
  required?: boolean;
  /** 正则 */
  regex?: RegExp;
  /** 提示 */
  message: string;
};
/**
 * 请求参数验证规则格式
 */
export type ReqParamsVerifyRule = {
  /** 字段名 */
  filed: string;
  /** 数据类型 */
  dataType: any;
  /** 校验规则 */
  rule?: RuleConfigItem[];
};
