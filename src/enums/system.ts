/**
 * 系统相关枚举定义
 * 包括响应码、语言、操作类型等
 */

/** 响应码枚举 */
export const enum ResultCodeEnum {
  /** 成功 */
  SUCCESS = '0',
  /** 错误 */
  ERROR = '1',
}

/** addEventListener */
export const enum ListenerEventEnum {
  NEW_NOTIFICATION = 'NewNotification',
}

/** 语言枚举 */
export enum LanguageEnum {
  ZH = 'zh-CN',
  EN = 'en-US',
}

/** 操作方式枚举 */
export enum ActionTypeEnum {
  CREATE = 'create',
  COPY = 'copy',
  EDIT = 'edit',
  DETAIL = 'detail',
}

/** 菜单类型枚举 */
export enum MenuTypeEnum {
  /** 目录 */
  CATALOG = 1,
  /** 菜单 */
  MENU = 2,
  /** 按钮 */
  BUTTON = 3,
  /** 接口 */
  API = 4,
  /** 外链 */
  EXTERNAL = 5,
}

/** 菜单显示状态枚举 */
export enum MenuVisibleStatusEnum {
  HIDE = 0,
  SHOW = 1,
}

/** 路由路径枚举 */
export enum RouterPath {
  // 登录
  LOGIN = '/login',
  // 注册
  REGISTER = '/register',
  // 忘记密码
  FORGOT_PASSWORD = '/forgotPassword',
  // 首页
  HOME = '/home',
  // 用户列表
  USER_MANAGE_LIST = '/system/userManage/list',
  // 角色
  ROLE_MANAGE_LIST = '/system/roleManage/list',
  // 菜单
  MENU_MANAGE_LIST = '/system/menuManage/list',
  // 消息通知列表
  NOTIFICATION_LIST = '/system/notificationManage/list',
  // 个人中心
  ACCOUNT_PROFILE = '/account/profile',
}

/** 接口 */
export enum RequestPath {
  /** 修改密码 */
  ACCOUNT_EDIT_PASSWORD = '/account/edit-password',
  /** 编辑个人资料 */
  ACCOUNT_EDIT_PROFILE = '/account/edit-profile',
  /** 获取当前账号信息 */
  ACCOUNT_GET_ACCOUNT_INFO = '/account/get-account-info',
  /** 获取当前账号信息 */
  ACCOUNT_GET_ACCOUNT_MENU = '/account/get-account-menu',
  /** 更新用户头像 */
  ACCOUNT_UPDATE_AVATAR = '/account/update-avatar',

  /** 登录 */
  ADMIN_LOGIN = '/admin/login',
  /** 注册 */
  ADMIN_REGISTER = '/admin/register',
  /** 重置密码 */
  ADMIN_RESET_PASSWORD = '/admin/reset-password',
  /** 退出登录 */
  ADMIN_LOGOUT = '/admin/logout',

  /** 发送邮箱验证码 */
  EMAIL_SEND_CODE = '/email/send-code',

  /** 菜单列表 */
  MENU_LIST = '/menu/list',
  /** 菜单树形结构 */
  MENU_TREE_LIST = '/menu/tree-list',
  /** 新增菜单 */
  MENU_CREATE = '/menu/create',
  /** 编辑菜单 */
  MENU_UPDATE = '/menu/update',
  /** 删除菜单 */
  MENU_DELETE = '/menu/delete',

  /** 角色列表 */
  ROLE_LIST = '/role/list',
  /** 新增角色 */
  ROLE_CREATE = '/role/create',
  /** 编辑角色 */
  ROLE_UPDATE = '/role/update',
  /** 删除角色 */
  ROLE_DELETE = '/role/delete',
  /** 分配权限 */
  ROLE_ASSIGN_PERM = '/role/assign-perm',

  /** 用户列表 */
  USER_LIST = '/user/list',
  /** 新增用户 */
  // USER_CREATE = "/user/create",
  /** 编辑用户 */
  USER_UPDATE = '/user/update',
  /** 删除用户 */
  USER_DELETE = '/user/delete',

  /** 操作日志列表 */
  OPERATION_LOG_LIST = '/operation-log/list',

  /** 通知列表 */
  NOTIFICATION_LIST = '/notification/list',
  /** 标记通知已读 */
  NOTIFICATION_MARK_READ = '/notification/mark-read',
  /** 标记全部已读 */
  NOTIFICATION_MARK_ALL_READ = '/notification/mark-all-read',
  /** 获取未读数量 */
  NOTIFICATION_UNREAD_COUNT = '/notification/unread-count',
  /** 发送通知 */
  NOTIFICATION_SEND = '/notification/send',
  /** 删除通知 */
  NOTIFICATION_DELETE = '/notification/delete',
  /** 在线状态 */
  NOTIFICATION_ONLINE_STATUS = '/notification/online-user-list',
  /** SSE连接 */
  NOTIFICATION_CONNECT = '/notification/connect',
}
