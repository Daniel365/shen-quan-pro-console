/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 角色表 - 重新设计支持分润模式
 */

import sequelize from '@/database';
import { getAppDbName, sequelizeCommonConfig, sequelizeCommonFields } from '@/database/common';
import { StatusEnum } from '@/enum';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';
import RoleTranslation from './AppRoleTranslation';

interface RoleAttributes {
  uuid: string;
  code: string;
  menu_ids?: Number[];
  profit_ratio?: number;
  status?: number;
  created_at: Date;
  updated_at: Date;
}

interface RoleAssociations {
  role_translations?: RoleTranslation[];
}

interface RoleCreationAttributes extends CreateAttributes<RoleAttributes> {}

class AppRole extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes, RoleAssociations {
  public uuid!: string;
  public code!: string;
  public menu_ids?: number[];
  public profit_ratio?: number;
  public status!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public role_translations?: RoleTranslation[];
}

AppRole.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      comment: '角色编码',
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'unique_code',
    },
    menu_ids: {
      comment: '菜单ID数组',
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    profit_ratio: {
      comment: '分润比例（百分比）',
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    status: {
      comment: '状态 1:启用 0:禁用',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: StatusEnum.ENABLE,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('role'),
    ...sequelizeCommonConfig(),
  }
);

export default AppRole;
