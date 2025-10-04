import { DataTypes } from "sequelize";
import { ReqParamsVerifyRule } from "../../types/interfaceRequest";
import { RegexPatterns } from "../../utils/regexPatterns";

/** 发送邮箱验证码表单校验 */
export const sendEmailFormRule: ReqParamsVerifyRule[] = [
  {
    filed: "email",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.emailRequired",
      },
      {
        regex: RegexPatterns.email,
        messageKey: "validation.emailInvalid",
      },
    ],
  },
  {
    filed: "type",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.typeRequired",
      },
    ],
  },
];

/** 验证邮箱验证码表单校验 */
export const verifyEmailCodeFormRule: ReqParamsVerifyRule[] = [
  {
    filed: "email",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.emailRequired",
      },
    ],
  },
  {
    filed: "type",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.typeRequired",
      },
    ],
  },
  {
    filed: "code",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.verificationCodeRequired",
      },
    ],
  },
];
