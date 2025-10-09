/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 收益记录表 - 主收益记录，对应一条订单的总收益
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
    total_amount: {
      comment: '订单总金额',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    inviter_uuid: {
      comment: '上级用户UUID（邀请人）',
      type: DataTypes.UUID,
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
    indexes: [
      // 核心复合索引 - 按用户+状态+时间排序（最常用查询）
      {
        name: 'idx_profit_record_user_status_created',
        fields: ['user_uuid', 'status', 'created_at']
      },
      // 状态+时间索引 - 用于后台管理查询
      {
        name: 'idx_profit_record_status_created',
        fields: ['status', 'created_at']
      },
      // 订单UUID索引 - 用于关联查询
      {
        name: 'idx_profit_record_order_uuid',
        fields: ['order_uuid']
      },
      // 活动UUID索引 - 用于按活动统计
      {
        name: 'idx_profit_record_activity_uuid',
        fields: ['activity_uuid']
      },
      // 邀请人索引 - 用于邀请关系统计
      {
        name: 'idx_profit_record_inviter_uuid',
        fields: ['inviter_uuid']
      }
    ]
  }
);

export default ProfitRecord;
