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
        messageKey: "validation.currentPasswordRequired",
      },
    ],
  },
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
    filed: "code",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.verificationCodeRequired",
      },
    ],
  },
  {
    filed: "password",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.newPasswordRequired",
      },
    ],
  },
  {
    filed: "confirm_password",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.confirmPasswordRequired",
      },
    ],
  },
];

/** 编辑个人资料表单校验 */
export const editProfileFormRule: ReqParamsVerifyRule[] = [
  {
    filed: "username",
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: "validation.usernameRequired",
      },
    ],
  },
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
