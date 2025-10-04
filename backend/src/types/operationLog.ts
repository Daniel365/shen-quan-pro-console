export enum OperationAction {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  // 用户管理
  // USER_CREATE = "USER_CREATE",
  USER_UPDATE = "USER_UPDATE",
  USER_DELETE = "USER_DELETE",
  // 角色管理
  ROLE_CREATE = "ROLE_CREATE",
  ROLE_UPDATE = "ROLE_UPDATE",
  ROLE_DELETE = "ROLE_DELETE",
  ROLE_ASSIGN_PERM = "ROLE_ASSIGN_PERM",
  // 菜单管理
  MENU_CREATE = "MENU_CREATE",
  MENU_UPDATE = "MENU_UPDATE",
  MENU_DELETE = "MENU_DELETE",
  // 账号管理
  ACCOUNT_EDIT_PASSWORD = "ACCOUNT_EDIT_PASSWORD",
  ACCOUNT_EDIT_PROFILE = "ACCOUNT_EDIT_PROFILE",
}

export const OperationDescription = {
  [OperationAction.LOGIN]: "用户登录",
  [OperationAction.LOGOUT]: "用户退出登录",
  // 用户管理
  // [OperationAction.USER_CREATE]: "创建用户",
  [OperationAction.USER_UPDATE]: "更新用户",
  [OperationAction.USER_DELETE]: "删除用户",
  // 角色管理
  [OperationAction.ROLE_CREATE]: "创建角色",
  [OperationAction.ROLE_UPDATE]: "更新角色",
  [OperationAction.ROLE_DELETE]: "删除角色",
  [OperationAction.ROLE_ASSIGN_PERM]: "分配角色权限",
  // 菜单管理
  [OperationAction.MENU_CREATE]: "创建菜单",
  [OperationAction.MENU_UPDATE]: "更新菜单",
  [OperationAction.MENU_DELETE]: "删除菜单",
  // 账号管理
  [OperationAction.ACCOUNT_EDIT_PASSWORD]: "修改密码",
  [OperationAction.ACCOUNT_EDIT_PROFILE]: "修改个人信息",
} as const;
