/** 注册-传参参数 */
export interface RegisterProps {
  username: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  email?: string;
}

/** 登录-传参参数 */
export interface LoginProps {
  username: string;
  password: string;
}

/** 重置密码-传参参数 */
export interface ResetPasswordProps {
  email: string;
  code: string;
  newPassword: string;
}
