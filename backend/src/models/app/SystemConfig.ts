/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 系统配置表
 */

import sequelize from '@/database';
import { getAppDbName, sequelizeCommonFields, sequelizeCommonConfig } from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface SystemConfigAttributes {
  uuid: string;
  key: string;
  value: string;
  description?: string;
  type: number; // 1: 字符串, 2: 数字, 3: 布尔值, 4: JSON
  created_at: Date;
  updated_at: Date;
}

interface SystemConfigCreationAttributes extends CreateAttributes<SystemConfigAttributes> {}

class SystemConfig
  extends Model<SystemConfigAttributes, SystemConfigCreationAttributes>
  implements SystemConfigAttributes
{
  public uuid!: string;
  public key!: string;
  public value!: string;
  public description?: string;
  public type!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SystemConfig.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      comment: '配置键名',
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'unique_key',
    },
    value: {
      comment: '配置值',
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      comment: '配置描述',
      type: DataTypes.STRING,
    },
    type: {
      comment: '配置类型：1字符串, 2数字, 3布尔值, 4JSON',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('system_config'),
    ...sequelizeCommonConfig(),
  }
);

export default SystemConfig;
