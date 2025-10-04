/** 修改个人资料-传参参数 */
export interface EditProfileProps {
  username?: string;
  email?: string;
}

/** 修改密码-传参参数 */
export interface EditPasswordProps {
  currentPassword: string;
  email: string;
  code: number | string;
  password: string;
  confirmPassword: string;
}

/** 账号信息 */
export interface AccountInfo {
  /** 用户ID */
  userUuid?: string;
  /** 用户名 */
  username?: string;
  /** 邮箱 */
  email?: string;
  /** 头像 */
  avatar?: string;
  /** 角色 */
  roleUuids: string[];
  roleCode: string[];
  roleName: string;

  /** 权限 */
  perms: string[];
}

/** MenuMeta，路由属性 */
export interface MenuMeta {
  /** 【目录】只有一个子路由是否始终显示 */
  alwaysShow?: boolean;
  /** 是否隐藏(true-是 false-否) */
  hidden?: boolean;
  /** ICON */
  icon?: string;
  /** 【菜单】是否开启页面缓存 */
  keepAlive?: boolean;
  /** 路由title */
  title?: string;
}

/** Route-menu，路由对象 */
export interface AccountMenu {
  /** 子路由列表 */
  children: AccountMenu[];
  /** 组件路径 */
  component?: string;
  /** 路由属性 */
  meta?: MenuMeta;
  /** 路由名称 */
  name?: string;
  /** 路由路径 */
  path?: string;
  /** 跳转链接 */
  redirect?: string;
}
