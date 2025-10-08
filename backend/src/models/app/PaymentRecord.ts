import sequelize from '@/database';
import {
  createISO8601Field,
  getAppDbName,
  sequelizeCommonConfig,
  sequelizeCommonFields,
} from '@/database/common';
import { OrderStatusEnum, PaymentMethod } from '@/enum';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface PaymentRecordAttributes {
  uuid: string;
  order_uuid: string;
  payment_method: PaymentMethod;
  payment_amount: number;
  payment_status: OrderStatusEnum;
  transaction_no?: string;
  payment_time?: Date;
  created_at: Date;
  updated_at: Date;
}

interface PaymentRecordCreationAttributes extends CreateAttributes<PaymentRecordAttributes> {}

class PaymentRecord
  extends Model<PaymentRecordAttributes, PaymentRecordCreationAttributes>
  implements PaymentRecordAttributes
{
  public uuid!: string;
  public order_uuid!: string;
  public payment_method!: PaymentMethod;
  public payment_amount!: number;
  public payment_status!: OrderStatusEnum;
  public transaction_no?: string;
  public payment_time?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

PaymentRecord.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_uuid: {
      comment: '关联订单主表的主键',
      type: DataTypes.UUID,
      allowNull: false,
    },
    payment_method: {
      comment: '支付方式（1 - 微信，2 - 支付宝）',
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    payment_amount: {
      comment: '该支付方式支付的金额',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_status: {
      comment: '支付状态（1 - 待支付，2 - 已支付）',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: OrderStatusEnum.PENDING,
    },
    transaction_no: {
      comment: '第三方支付交易号',
      type: DataTypes.STRING,
    },
    payment_time: {
      comment: '支付完成时间',
      ...createISO8601Field('payment_time'),
      defaultValue: '',
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('payment_record'),
    ...sequelizeCommonConfig(),
  }
);

export default PaymentRecord;
