/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 角色表 - 重新设计支持分润模式
 */

import sequelize from '@/database';
import { getAppDbName, sequelizeCommonFields, sequelizeCommonConfig } from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

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

interface RoleCreationAttributes extends CreateAttributes<RoleAttributes> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
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
      comment: '角色名称',
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      comment: '角色编码',
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'unique_code',
    },
    description: {
      comment: '角色描述',
      type: DataTypes.TEXT,
    },
    menu_ids: {
      comment: '菜单ID数组',
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      comment: '状态 1:启用 0:禁用',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('role'),
    ...sequelizeCommonConfig(),
  }
);

export default Role;
