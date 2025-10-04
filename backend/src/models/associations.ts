/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 19:34:49
 * @Description:
 */
import User from "./User";
import Role from "./Role";
import Menu from "./Menu";
import OperationLog from "./OperationLog";

// 用户和角色的一对多关系
User.belongsTo(Role, {
  foreignKey: "role_uuid",
  targetKey: "uuid",
  as: "role",
});

Role.hasMany(User, {
  foreignKey: "role_uuid",
  sourceKey: "uuid",
  as: "users",
});

// 菜单自关联（父子关系）
Menu.hasMany(Menu, {
  foreignKey: "parent_id",
  as: "children",
});

Menu.belongsTo(Menu, {
  foreignKey: "parent_id",
  as: "parent",
});

// 用户和操作日志的一对多关系
User.hasMany(OperationLog, {
  foreignKey: "user_uuid",
  sourceKey: "uuid",
  as: "operationLogs",
});

OperationLog.belongsTo(User, {
  foreignKey: "user_uuid",
  targetKey: "uuid",
  as: "user",
});

export { User, Role, Menu, OperationLog };
