import sequelize from '@/database';
import { getAppDbName, sequelizeCommonFields, sequelizeCommonConfig } from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';
import TagTranslation from './TagTranslation';

interface TagAttributes {
  uuid: string;
  type: number;
  status?: number;
  created_at: Date;
  updated_at: Date;
}

interface TagAssociations {
  tag_translations?: TagTranslation[];
}

interface TagCreationAttributes extends CreateAttributes<TagAttributes> {}

class Tag
  extends Model<TagAttributes, TagCreationAttributes>
  implements TagAttributes, TagAssociations
{
  public uuid!: string;
  public type!: number;
  public status!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public tag_translations?: TagTranslation[];
}

Tag.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      comment: '标签类型：1活动标签，2用户标签',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
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
    tableName: getAppDbName('tag'),
    ...sequelizeCommonConfig(),
  }
);

export default Tag;
