import sequelize from '@/database';
import { getAppDbName, sequelizeCommonFields, sequelizeCommonConfig } from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface OrderMembershipCardAttributes {
  uuid: string;
  order_uuid: string;
  role_uuid: string;
  expire_time?: Date;
  created_at: Date;
  updated_at: Date;
}

interface OrderMembershipCardCreationAttributes extends CreateAttributes<OrderMembershipCardAttributes> {}

class OrderMembershipCard extends Model<OrderMembershipCardAttributes, OrderMembershipCardCreationAttributes> implements OrderMembershipCardAttributes {
  public uuid!: string;
  public order_uuid!: string;
  public role_uuid!: string;
  public expire_time?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OrderMembershipCard.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_uuid: {
      comment: '关联订单 ID（外键，关联 order 表）',
      type: DataTypes.UUID,
      allowNull: false,
    },
    role_uuid: {
      comment: '购买的角色 ID（关联 role 表，如年卡角色）',
      type: DataTypes.UUID,
      allowNull: false,
    },
    expire_time: {
      comment: '会员到期时间（如支付时间 + 365 天）',
      type: DataTypes.DATE,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('order_membership_card'),
    ...sequelizeCommonConfig(),
  }
);

export default OrderMembershipCard;