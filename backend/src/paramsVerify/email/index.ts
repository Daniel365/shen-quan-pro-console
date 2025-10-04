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
        message: "邮箱不能为空",
      },
      {
        regex: RegexPatterns.email,
        message: "邮箱格式不正确",
      },
    ],
  },
  {
    filed: "type",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        message: "验证类型不能空",
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
        message: "邮箱不能为空",
      },
    ],
  },
  {
    filed: "type",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        message: "验证类型不能空",
      },
    ],
  },
  {
    filed: "code",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        message: "验证码不能为空",
      },
    ],
  },
];
