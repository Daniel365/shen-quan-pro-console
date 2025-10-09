/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 系统配置表
 */

import sequelize from '@/database';
import { getAppDbName, sequelizeCommonFields, sequelizeCommonConfig } from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';
import { SystemConfigTypeEnum } from '@/enum';

interface SystemConfigAttributes {
  uuid: string;
  key: string;
  value: string;
  description?: string;
  type: SystemConfigTypeEnum;
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

  /**
   * 获取配置值（根据类型自动转换）
   */
  public getValue(): any {
    const rawValue = this.value;
    
    switch (this.type) {
      case SystemConfigTypeEnum.NUMBER:
        return parseFloat(rawValue) || 0;
      case SystemConfigTypeEnum.BOOLEAN:
        return rawValue === 'true' || rawValue === '1';
      case SystemConfigTypeEnum.JSON:
        try {
          return JSON.parse(rawValue);
        } catch {
          return {};
        }
      case SystemConfigTypeEnum.ARRAY:
        try {
          return JSON.parse(rawValue);
        } catch {
          return [];
        }
      default:
        return rawValue;
    }
  }

  /**
   * 设置配置值（根据类型自动序列化）
   */
  public setValue(value: any): void {
    switch (this.type) {
      case SystemConfigTypeEnum.NUMBER:
        this.value = String(value);
        break;
      case SystemConfigTypeEnum.BOOLEAN:
        this.value = value ? 'true' : 'false';
        break;
      case SystemConfigTypeEnum.JSON:
      case SystemConfigTypeEnum.ARRAY:
        this.value = JSON.stringify(value);
        break;
      default:
        this.value = String(value);
    }
  }
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
      comment: '配置值（根据类型存储：字符串直接存储，数字/布尔值转字符串，JSON/数组转JSON字符串）',
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      comment: '配置描述',
      type: DataTypes.STRING,
    },
    type: {
      comment: '配置类型：1字符串, 2数字, 3布尔值, 4JSON, 5数组',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: SystemConfigTypeEnum.STRING,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('system_config'),
    ...sequelizeCommonConfig(),
    indexes: [
      {
        name: 'idx_system_config_key',
        fields: ['key']
      },
      {
        name: 'idx_system_config_type',
        fields: ['type']
      }
    ]
  }
);

export default SystemConfig;
