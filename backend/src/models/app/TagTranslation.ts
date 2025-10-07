import sequelize from '@/database';
import { getAppDbName, sequelizeCommonFields, sequelizeCommonConfig } from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface TagTranslationAttributes {
  uuid: string;
  tag_uuid: string;
  language: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

interface TagTranslationCreationAttributes extends CreateAttributes<TagTranslationAttributes> {}

class TagTranslation
  extends Model<TagTranslationAttributes, TagTranslationCreationAttributes>
  implements TagTranslationAttributes
{
  public uuid!: string;
  public tag_uuid!: string;
  public language!: string;
  public name!: string;
  public description?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

TagTranslation.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tag_uuid: {
      comment: '关联的标签UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    language: {
      comment: '语言代码，如：zh-CN, en-US',
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    name: {
      comment: '标签名称（多语言）',
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      comment: '标签描述（多语言）',
      type: DataTypes.TEXT,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('tag_translation'),
    ...sequelizeCommonConfig(),
    indexes: [
      {
        unique: true,
        fields: ['tag_uuid', 'language'],
      },
      {
        fields: ['language'],
      },
      {
        fields: ['tag_uuid'],
      },
    ],
  }
);

export default TagTranslation;
