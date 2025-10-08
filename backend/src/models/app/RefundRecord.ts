import sequelize from '@/database';
import {
  createISO8601Field,
  getAppDbName,
  sequelizeCommonConfig,
  sequelizeCommonFields,
} from '@/database/common';
import { RefundStatus } from '@/enum';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface RefundRecordAttributes {
  uuid: string;
  order_uuid: string;
  refund_amount: number;
  refund_status: RefundStatus;
  refund_reason?: string;
  refund_time?: Date;
  operator_uuid?: string;
  transaction_no?: string;
  created_at: Date;
  updated_at: Date;
}

interface RefundRecordCreationAttributes extends CreateAttributes<RefundRecordAttributes> {}

class RefundRecord
  extends Model<RefundRecordAttributes, RefundRecordCreationAttributes>
  implements RefundRecordAttributes
{
  public uuid!: string;
  public order_uuid!: string;
  public refund_amount!: number;
  public refund_status!: RefundStatus;
  public refund_reason?: string;
  public refund_time?: Date;
  public operator_uuid?: string;
  public transaction_no?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

RefundRecord.init(
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
    refund_amount: {
      comment: '本次退款金额（支持部分退款）',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    refund_status: {
      comment: '退款状态（0 - 申请中，1 - 已成功，2 - 已拒绝）',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: RefundStatus.APPLYING,
    },
    refund_reason: {
      comment: '退款原因（用户填写或系统选择）',
      type: DataTypes.STRING,
    },
    refund_time: {
      comment: '退款完成时间',
      ...createISO8601Field('refund_time'),
      defaultValue: '',
    },
    operator_uuid: {
      comment: '操作人UUID（管理员账号UUID）',
      type: DataTypes.UUID,
    },
    transaction_no: {
      comment: '退款对应的第三方交易号（如微信 / 支付宝退款单号）',
      type: DataTypes.STRING,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('refund_record'),
    ...sequelizeCommonConfig(),
  }
);

export default RefundRecord;
