import { DataTypes, Model, Optional } from "sequelize";
import sequelize, { sequelizeTimeConfig } from "../database";
import { getDbName } from "../utils/database";
import { publicOptions } from "../database/common";

export interface MenuAttributes {
  id: number;
  parent_id?: number;
  name: string;
  /** 菜单类型 1:目录 2:菜单 3:按钮 4:接口 5:外链 */
  type: number;
  route_name?: string;
  route_path?: string;
  component?: string;
  /** 显示状态 0: 隐藏 1：显示 */
  visible_status?: string;
  /** 缓存页面 0: 关闭 1：开启 */
  keep_alive?: number;
  sort: number;
  icon?: string;
  /** 权限标识 */
  permission?: string;
  created_at: Date;
  updated_at: Date;
}

interface MenuCreationAttributes
  extends Optional<MenuAttributes, "id" | "created_at" | "updated_at"> {}

class Menu
  extends Model<MenuAttributes, MenuCreationAttributes>
  implements MenuAttributes
{
  public id!: number;
  public parent_id?: number;
  public name!: string;
  public type!: number;
  public route_name?: string;
  public route_path?: string;
  public component?: string;
  public visible_status?: string;
  public keep_alive?: number;
  public sort!: number;
  public icon?: string;
  public permission?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Menu.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    parent_id: {
      comment: "父级菜单ID",
      type: DataTypes.INTEGER,
    },
    name: {
      comment: "菜单名称",
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      comment: "类型 1:目录 2:菜单 3:按钮 4:接口 5:外链",
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    route_name: {
      comment: "路由名称",
      type: DataTypes.STRING,
    },
    route_path: {
      comment: "路由路径",
      type: DataTypes.STRING,
    },
    component: {
      comment: "组件路径",
      type: DataTypes.STRING,
    },
    visible_status: {
      comment: "显示状态 0: 隐藏 1：显示",
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    keep_alive: {
      comment: "缓存页面 0: 关闭 1：开启",
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    sort: {
      comment: "排序",
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    icon: {
      comment: "图标",
      type: DataTypes.STRING,
    },
    permission: {
      comment: "权限标识",
      type: DataTypes.STRING,
    },
    ...publicOptions,
  },
  {
    sequelize,
    tableName: getDbName("menu"),
    ...sequelizeTimeConfig,
  }
);

export default Menu;
