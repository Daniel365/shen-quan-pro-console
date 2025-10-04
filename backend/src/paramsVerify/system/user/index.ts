import { DataTypes } from 'sequelize';
import { ReqParamsVerifyRule } from '../../../types/interfaceRequest';

/** 注册表单校验 */
export const registerFormRule: ReqParamsVerifyRule[] = [
  {
    filed: 'username',
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: 'validation.usernameRequired',
      },
    ],
  },
  {
    filed: 'email',
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: 'validation.emailRequired',
      },
    ],
  },
  {
    filed: 'phone',
    dataType: DataTypes.STRING,
    rule: [
      {
        required: false,
        messageKey: 'validation.phoneRequired',
      },
    ],
  },
  {
    filed: 'password',
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: 'validation.passwordRequired',
      },
    ],
  },
  {
    filed: 'confirm_password',
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: 'validation.confirmPasswordRequired',
      },
    ],
  },
];

/** 登录表单校验 */
export const loginFormRule: ReqParamsVerifyRule[] = [
  {
    filed: 'username',
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: 'validation.usernameRequired',
      },
    ],
  },
  {
    filed: 'password',
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: 'validation.passwordRequired',
      },
    ],
  },
];

/** 忘记密码表单校验 */
export const forgotPasswordFormRule: ReqParamsVerifyRule[] = [
  {
    filed: 'email',
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: 'validation.emailRequired',
      },
    ],
  },
  {
    filed: 'code',
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: 'validation.verificationCodeRequired',
      },
    ],
  },
  {
    filed: 'new_password',
    dataType: DataTypes.STRING,
    rule: [
      {
        required: true,
        messageKey: 'validation.newPasswordRequired',
      },
    ],
  },
];
