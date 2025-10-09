import sequelize from '@/database';
import { getAppDbName, sequelizeCommonFields, sequelizeCommonConfig } from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface RoleTranslationAttributes {
  uuid: string;
  role_uuid: string;
  language: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

interface RoleTranslationCreationAttributes extends CreateAttributes<RoleTranslationAttributes> {}

class AppRoleTranslation
  extends Model<RoleTranslationAttributes, RoleTranslationCreationAttributes>
  implements RoleTranslationAttributes
{
  public uuid!: string;
  public role_uuid!: string;
  public language!: string;
  public name!: string;
  public description?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AppRoleTranslation.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role_uuid: {
      comment: '关联的角色UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    language: {
      comment: '语言代码，如：zh-CN, en-US',
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    name: {
      comment: '角色名称（多语言）',
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      comment: '角色描述（多语言）',
      type: DataTypes.TEXT,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('role_translation'),
    ...sequelizeCommonConfig(),
    indexes: [
      {
        unique: true,
        fields: ['role_uuid', 'language'],
      },
      {
        fields: ['language'],
      },
      {
        fields: ['role_uuid'],
      },
    ],
  }
);

export default AppRoleTranslation;
