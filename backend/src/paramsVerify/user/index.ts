import { DataTypes } from "sequelize";
import { ReqParamsVerifyRule } from "../../types/interfaceRequest";

/** 注册表单校验 */
export const registerFormRule: ReqParamsVerifyRule[] = [
  {
    filed: "username",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        message: "密码不能为空",
      },
    ],
  },
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
    filed: "phone",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: false,
        message: "手机号不能为空",
      },
    ],
  },
  {
    filed: "password",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        message: "密码不能为空",
      },
    ],
  },
  {
    filed: "confirm_password",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        message: "确认密码不能为空",
      },
    ],
  },
];

/** 登录表单校验 */
export const loginFormRule: ReqParamsVerifyRule[] = [
  {
    filed: "username",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        message: "用户名不能为空",
      },
    ],
  },
  {
    filed: "password",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        message: "密码不能为空",
      },
    ],
  },
];

/** 忘记密码表单校验 */
export const forgotPasswordFormRule: ReqParamsVerifyRule[] = [
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
    filed: "code",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        message: "验证码不能空",
      },
    ],
  },
  {
    filed: "new_password",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        message: "新密码不能为空",
      },
    ],
  },
];
