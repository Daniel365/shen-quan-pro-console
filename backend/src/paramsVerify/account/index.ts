import { DataTypes } from "sequelize";
import { ReqParamsVerifyRule } from "../../types/interfaceRequest";

/** 编辑密码表单校验 */
export const editPasswordFormRule: ReqParamsVerifyRule[] = [
  {
    filed: "current_password",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        message: "旧密码不能为空",
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
    filed: "password",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        message: "新密码不能为空",
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
