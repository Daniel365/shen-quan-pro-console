import sequelize from '@/database';
import { getAppDbName, sequelizeCommonConfig, sequelizeCommonFields } from '@/database/common';
import { StatusEnum } from '@/enum';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';
import MembershipCardTranslation from './MembershipCardTranslation';

interface MembershipCardAttributes {
  uuid: string;
  code: string;
  role_uuid: string;
  price: number;
  duration_days: number;
  sort: number;
  status: number;
  location: string;
  created_at: Date;
  updated_at: Date;
}

interface MembershipCardAssociations {
  translations?: MembershipCardTranslation[];
}

interface MembershipCardCreationAttributes extends CreateAttributes<MembershipCardAttributes> {}

class MembershipCard
  extends Model<MembershipCardAttributes, MembershipCardCreationAttributes>
  implements MembershipCardAttributes, MembershipCardAssociations
{
  public uuid!: string;
  public code!: string;
  public role_uuid!: string;
  public price!: number;
  public duration_days!: number;
  public sort!: number;
  public status!: number;
  public location!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public translations?: MembershipCardTranslation[];
}

MembershipCard.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      comment: '会员卡编码（如 "ANNUAL_CARD"、"HALF_YEAR_CARD"，唯一）',
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: 'unique_code',
    },
    role_uuid: {
      comment: '关联角色 ID（外键，对应 role 表中的会员角色）',
      type: DataTypes.UUID,
      allowNull: false,
    },
    price: {
      comment: '售价',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    duration_days: {
      comment: '有效天数（年卡 365 天，半年卡 180 天）',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sort: {
      comment: '排序权重（数字越大越靠前展示）',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      comment: '状态 1:启用 0:禁用',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: StatusEnum.ENABLE,
    },
    location: {
      comment: '地点',
      type: DataTypes.STRING,
      allowNull: false,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('membership_card'),
    ...sequelizeCommonConfig(),
  }
);

export default MembershipCard;
