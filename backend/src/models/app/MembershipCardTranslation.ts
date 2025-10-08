import sequelize from '@/database';
import { getAppDbName, sequelizeCommonFields, sequelizeCommonConfig } from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface CoverImage {
  url: string;
  type: 'main' | 'banner' | 'thumbnail';
  sort: number;
}

interface MembershipCardTranslationAttributes {
  uuid: string;
  membership_card_uuid: string;
  language: string;
  name: string;
  description?: string;
  cover_images?: CoverImage[];
  created_at: Date;
  updated_at: Date;
}

interface MembershipCardTranslationCreationAttributes extends CreateAttributes<MembershipCardTranslationAttributes> {}

class MembershipCardTranslation
  extends Model<MembershipCardTranslationAttributes, MembershipCardTranslationCreationAttributes>
  implements MembershipCardTranslationAttributes
{
  public uuid!: string;
  public membership_card_uuid!: string;
  public language!: string;
  public name!: string;
  public description?: string;
  public cover_images?: CoverImage[];
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

MembershipCardTranslation.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    membership_card_uuid: {
      comment: '关联的会员卡UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    language: {
      comment: '语言代码，如：zh-CN, en-US',
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    name: {
      comment: '会员卡名称（多语言）',
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      comment: '会员卡描述（多语言）',
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
    tableName: getAppDbName('membership_card_translation'),
    ...sequelizeCommonConfig(),
    indexes: [
      {
        unique: true,
        fields: ['membership_card_uuid', 'language'],
      },
      {
        fields: ['language'],
      },
      {
        fields: ['membership_card_uuid'],
      },
    ],
  }
);

export default MembershipCardTranslation;