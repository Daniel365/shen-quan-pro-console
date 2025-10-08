/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 收益记录表 - 简化为只记录role_uuid
 */

import sequelize from '@/database';
import { getAppDbName, sequelizeCommonConfig, sequelizeCommonFields } from '@/database/common';
import { ProfitStatusEnum } from '@/enum';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface ProfitRecordAttributes {
  uuid: string;
  order_uuid: string;
  activity_uuid?: string; // 活动UUID（可为空，用于会员卡收益）
  membership_card_uuid?: string; // 会员卡UUID（可为空，用于活动收益）
  user_uuid: string; // 参与用户UUID
  inviter_uuid?: string; // 上级用户UUID（邀请人）
  total_amount: number;
  order_type: string; // 订单类型：'activity' | 'membership_card'
  status: number;
  created_at: Date;
  settled_at?: Date;
}

interface ProfitRecordCreationAttributes extends CreateAttributes<ProfitRecordAttributes> {}

class ProfitRecord
  extends Model<ProfitRecordAttributes, ProfitRecordCreationAttributes>
  implements ProfitRecordAttributes
{
  public uuid!: string;
  public order_uuid!: string;
  public activity_uuid!: string;
  public user_uuid!: string;
  public inviter_uuid?: string;
  public total_amount!: number;
  public status!: number;
  public readonly created_at!: Date;
  public settled_at?: Date;
}

ProfitRecord.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_uuid: {
      comment: '订单UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    activity_uuid: {
      comment: '活动UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_uuid: {
      comment: '参与用户UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    inviter_uuid: {
      comment: '上级用户UUID（邀请人）',
      type: DataTypes.UUID,
    },
    total_amount: {
      comment: '订单总金额',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    status: {
      comment: '收益状态：1冻结中，2已结算，3已取消',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: ProfitStatusEnum.FROZEN,
    },
    settled_at: {
      comment: '结算时间',
      type: DataTypes.DATE,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getAppDbName('profit_record'),
    ...sequelizeCommonConfig(),
  }
);

export default ProfitRecord;
