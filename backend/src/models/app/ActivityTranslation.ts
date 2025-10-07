import sequelize from '@/database';
import { getAppDbName, sequelizeCommonFields, sequelizeCommonConfig } from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface CoverImage {
  url: string;
  type: 'main' | 'banner' | 'thumbnail';
  sort: number;
}

interface ActivityTranslationAttributes {
  uuid: string;
  activity_uuid: string;
  language: string;
  title: string;
  description?: string;
  cover_images?: CoverImage[];
  created_at: Date;
  updated_at: Date;
}

interface ActivityTranslationCreationAttributes
  extends CreateAttributes<ActivityTranslationAttributes> {}

class ActivityTranslation
  extends Model<ActivityTranslationAttributes, ActivityTranslationCreationAttributes>
  implements ActivityTranslationAttributes
{
  public uuid!: string;
  public activity_uuid!: string;
  public language!: string;
  public title!: string;
  public description?: string;
  public cover_images?: CoverImage[];
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ActivityTranslation.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    activity_uuid: {
      comment: '关联的活动UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    language: {
      comment: '语言代码，如：zh-CN, en-US',
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    title: {
      comment: '活动标题（多语言）',
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      comment: '活动描述（多语言）',
      type: DataTypes.TEXT,
    },
    cover_images: {
      comment: '封面图片数组',
      type: DataTypes.JSON,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('activity_translation'),
    ...sequelizeCommonConfig(),
    indexes: [
      {
        unique: true,
        fields: ['activity_uuid', 'language'],
      },
    ],
  }
);

export default ActivityTranslation;
