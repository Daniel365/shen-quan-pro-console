import sequelize from '@/database';
import {
  createISO8601Field,
  getAppDbName,
  sequelizeCommonConfig,
  sequelizeCommonFields,
} from '@/database/common';
import { OrderStatusEnum } from '@/enum';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface OrderAttributes {
  uuid: string;
  orderer_uuid: string;
  target_uuid: string;
  order_type: string;
  actual_price: number;
  order_status: OrderStatusEnum;
  order_time: Date;
  refund_time?: Date;
  created_at: Date;
  updated_at: Date;
}

interface OrderCreationAttributes extends CreateAttributes<OrderAttributes> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public uuid!: string;
  public orderer_uuid!: string;
  public target_uuid!: string;
  public order_type!: string;
  public actual_price!: number;
  public order_status!: OrderStatusEnum;
  public order_time!: Date;
  public refund_time?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Order.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderer_uuid: {
      comment: '下单人UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    target_uuid: {
      comment: '目标UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_type: {
      comment: '订单类型：activity-活动，member-card-会员卡',
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'activity',
    },
    actual_price: {
      comment: '实际支付价格',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    order_status: {
      comment: '订单状态：1待支付，2已支付，3已完成，4已退款，5已取消',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: OrderStatusEnum.PENDING,
    },
    order_time: {
      comment: '下单时间',
      ...createISO8601Field('order_time'),
      defaultValue: '',
    },
    refund_time: {
      comment: '退款时间',
      ...createISO8601Field('refund_time'),
      defaultValue: '',
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('order'),
    ...sequelizeCommonConfig(),
    indexes: [
      {
        name: 'idx_order_status',
        fields: ['order_status']
      },
      {
        name: 'idx_order_orderer',
        fields: ['orderer_uuid']
      },
      {
        name: 'idx_order_type',
        fields: ['order_type']
      },
      {
        name: 'idx_order_created_at',
        fields: ['created_at']
      },
      {
        name: 'idx_order_order_time',
        fields: ['order_time']
      }
    ]
  }
);

export default Order;
