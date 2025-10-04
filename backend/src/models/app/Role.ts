/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-04 13:05:24
 * @Description: 角色 - 模型
 */
import { DataTypes, Model, Optional } from "sequelize";
import sequelize, { sequelizeTimeConfig } from "@/database";
import { getAppDbName } from "@/utils/database";
import { publicOptions } from "@/database/common";

interface RoleAttributes {
  uuid: string;
  name: string;
  code: string;
  description?: string;
  menu_ids?: Number[];
  status?: number;
  created_at: Date;
  updated_at: Date;
}

interface RoleCreationAttributes
  extends Optional<RoleAttributes, "uuid" | "created_at" | "updated_at"> {}

class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public uuid!: string;
  public name!: string;
  public code!: string;
  public description?: string;
  public menu_ids?: number[];
  public status!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Role.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      comment: "角色名称",
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      comment: "角色编码",
      type: DataTypes.STRING,
      allowNull: false,
      unique: "unique_code",
    },
    description: {
      comment: "角色描述",
      type: DataTypes.TEXT,
    },
    menu_ids: {
      comment: "菜单ID数组",
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      comment: "状态 1:启用 0:禁用",
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    ...publicOptions,
  },
  {
    sequelize,
    tableName: getAppDbName("role"),
    ...sequelizeTimeConfig,
  }
);

export default Role;
