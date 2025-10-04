/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-30 14:54:00
 * @Description:
 */
// utils
import { validateByDataType } from "../utils/dataJudge";
import { onPattern } from "../utils/regexPatterns";
// rule
import {
  loginFormRule,
  registerFormRule,
  forgotPasswordFormRule,
} from "./user/index";
import { editPasswordFormRule } from "./account/index";
import { sendEmailFormRule } from "./email/index";
// type
import { RegisterReqData } from "./user/type";
import { ReqParamsVerifyRule } from "../types/interfaceRequest";

/** 请求参数 - 类型声明 */
export type ReqDataType = {
  RegisterReqData: RegisterReqData;
};

/** 校验规则 */
export const verifyRule = {
  registerFormRule,
  loginFormRule,
  forgotPasswordFormRule,
  editPasswordFormRule,
  sendEmailFormRule,
};

/** 参数校验 */
export const onParamsVerify = (data: any, ruleData: ReqParamsVerifyRule[]) => {
  const res = {
    isValid: true,
    message: "",
  };
  for (const item of ruleData) {
    const val = data[item.filed];
    const rule = item?.rule || [];
    let flag = true;
    // 规则叫Y按
    for (const ruleItem of rule) {
      const { required, regex } = ruleItem;
      // 必填
      if (required) {
        const { isValid, message } = validateByDataType(val, item.dataType);

        if (!isValid) {
          res.isValid = false;
          res.message = ruleItem.message || message;
          flag = false;
        }
      }
      // 正则
      if (regex && !onPattern(val, regex)) {
        res.isValid = false;
        res.message = ruleItem.message;
        flag = false;
      }
    }
    if (!flag) {
      continue;
    }
  }
  return res;
};
