/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-30 14:54:00
 * @Description:
 */
// utils
import { validateByDataType } from '../utils/dataJudge';
import { onPattern } from '../utils/regexPatterns';
// rule
import { sendEmailFormRule } from './email/index';
import { account, user } from './system';
// type
import { ReqParamsVerifyRule } from '../types/interfaceRequest';
import { RegisterReqData } from './system/user/type';

/** 请求参数 - 类型声明 */
export type ReqDataType = {
  RegisterReqData: RegisterReqData;
};

/** 校验规则 */
export const verifyRule = {
  sendEmailFormRule,
  ...user,
  ...account,
};

/** 参数校验 */
export const onParamsVerify = (data: any, ruleData: ReqParamsVerifyRule[]) => {
  const res = {
    isValid: true,
    messageKey: '',
  };
  for (const item of ruleData) {
    const val = data[item.filed];
    const rule = item?.rule || [];
    let flag = true;
    // 规则校验
    for (const ruleItem of rule) {
      const { required, regex } = ruleItem;
      // 必填
      if (required) {
        const { isValid, messageKey } = validateByDataType(val, item.dataType);

        if (!isValid) {
          res.isValid = false;
          res.messageKey = ruleItem.messageKey || messageKey || 'common.validationError';
          flag = false;
        }
      }
      // 正则
      if (regex && !onPattern(val, regex)) {
        res.isValid = false;
        res.messageKey = ruleItem.messageKey || 'validation.regexFailed';
        flag = false;
      }
    }
    if (!flag) {
      continue;
    }
  }
  return res;
};
