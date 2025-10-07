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

/** 启用状态枚举 */
export enum EnabledStatusEnum {
  /** 禁用 */
  DISABLED = 0,
  /** 启用 */
  ENABLED = 1,
}

/** 菜单显示状态枚举 */
export enum MenuVisibleStatusEnum {
  /** 隐藏 */
  HIDE = 0,
  /** 展示 */
  SHOW = 1,
}

/** 性别枚举 */
export enum GenderEnum {
  /** 未知 */
  UNKNOWN = 0,
  /** 男 */
  MALE = 1,
  /** 女 */
  FEMALE = 2,
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

  // 活动管理 - 表单
  ACTIVITY_FORM = '/app/activityManage/form',
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

  /** App用户列表 */
  APP_USER_LIST = '/app/user/list',
  /** 更新App用户信息 */
  APP_USER_UPDATE = '/app/user/update',
  /** 批量更新App用户 */
  APP_USER_DELETE = '/app/user/delete',
  /** 下级用户列表 */
  APP_USER_CHILDREN_LIST = '/app/user/children-list',

  /** 角色列表 */
  APP_ROLE_LIST = '/app/role/list',
  /** 新增角色 */
  APP_ROLE_CREATE = '/app/role/create',
  /** 编辑角色 */
  APP_ROLE_UPDATE = '/app/role/update',
  /** 删除角色 */
  APP_ROLE_DELETE = '/app/role/delete',
  /** 分配权限 */
  APP_ROLE_ASSIGN_PERM = '/app/role/assign-perm',

  /** 活动列表 */
  APP_ACTIVITY_LIST = '/app/activity/list',
  /** 新增活动 */
  APP_ACTIVITY_CREATE = '/app/activity/create',
  /** 编辑活动 */
  APP_ACTIVITY_UPDATE = '/app/activity/update',
  /** 删除活动 */
  APP_ACTIVITY_DELETE = '/app/activity/delete',
  /** 活动详情 */
  APP_ACTIVITY_DETAILS = '/app/activity/details',

  /** 收益列表 */
  APP_PROFIT_LIST = '/app/profit/list',
  /** 收益详情 */
  APP_PROFIT_DETAIL = '/app/profit/detail',
  /** 结算收益 */
  APP_PROFIT_SETTLE = '/app/profit/settle',
  /** 取消收益 */
  APP_PROFIT_CANCEL = '/app/profit/cancel',
  /** 收益统计 */
  APP_PROFIT_STATS = '/app/profit/stats',
  /** 导出收益数据 */
  APP_PROFIT_EXPORT = '/app/profit/export',

  /** 订单列表 */
  APP_ORDER_LIST = '/app/order/list',
  /** 订单详情 */
  APP_ORDER_DETAIL = '/app/order/detail',
  /** 订单退款 */
  APP_ORDER_REFUND = '/app/order/refund',
  /** 导出订单数据 */
  APP_ORDER_EXPORT = '/app/order/export',
  /** 订单统计 */
  APP_ORDER_STATS = '/app/order/stats',

  /** 标签列表 */
  APP_TAG_LIST = '/app/tag/list',
  /** 新增标签 */
  APP_TAG_CREATE = '/app/tag/create',
  /** 编辑标签 */
  APP_TAG_UPDATE = '/app/tag/update',
  /** 删除标签 */
  APP_TAG_DELETE = '/app/tag/delete',
  /** 标签详情 */
  APP_TAG_DETAILS = '/app/tag/details',
}
