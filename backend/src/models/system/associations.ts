/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 19:34:49
 * @Description:
 */
import { User, Menu, OperationLog, Notification } from "./index";

// 菜单自关联（父子关系） - 建立菜单树形结构
// 一个菜单可以有多个子菜单
Menu.hasMany(Menu, {
  as: 'children',
  foreignKey: 'parent_id',
})

// 菜单属于一个父菜单
Menu.belongsTo(Menu, {
  as: 'parent',
  foreignKey: 'parent_id',
})

// 用户和操作日志的一对多关系
// 一个用户可以创建多个操作日志记录
User.hasMany(OperationLog, {
  as: 'operationLogs',
  foreignKey: 'user_uuid',
  sourceKey: 'uuid',
})

// 操作日志属于一个用户
OperationLog.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_uuid',
  targetKey: 'uuid',
})

// 用户和通知的双向关系
// 用户作为发送者可以发送多个通知
User.hasMany(Notification, {
  as: 'sentNotifications',
  foreignKey: 'sender_uuid',
  sourceKey: 'uuid',
})

// 用户作为接收者可以接收多个通知
User.hasMany(Notification, {
  as: 'receivedNotifications',
  foreignKey: 'receiver_uuid',
  sourceKey: 'uuid',
})

// 通知属于发送者用户
Notification.belongsTo(User, {
  as: 'sender',
  foreignKey: 'sender_uuid',
  targetKey: 'uuid',
})

// 通知属于接收者用户
Notification.belongsTo(User, {
  as: 'receiver',
  foreignKey: 'receiver_uuid',
  targetKey: 'uuid',
})


