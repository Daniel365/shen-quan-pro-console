/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 00:00:00
 * @Description: 分润记录表 - 详细的分润分配记录，每条收益记录对应多个分润记录
 */

import sequelize from '@/database';
import { getAppDbName, sequelizeCommonConfig, sequelizeCommonFields } from '@/database/common';
import { ProfitStatusEnum } from '@/enum';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface ProfitDistributionRecordAttributes {
  uuid: string;
  profit_record_uuid: string; // 关联的收益记录UUID
  role_uuid: string; // 角色UUID
  user_uuid: string; // 受益人用户UUID
  base_amount: number; // 基础金额（订单总金额）
  distribution_amount: number; // 分配金额（实际分润金额）
  share_percentage: number; // 分润比例（百分比）
  status: number;
  created_at: Date;
  settled_at?: Date;
}

interface ProfitDistributionRecordCreationAttributes extends CreateAttributes<ProfitDistributionRecordAttributes> {}

class ProfitDistributionRecord
  extends Model<ProfitDistributionRecordAttributes, ProfitDistributionRecordCreationAttributes>
  implements ProfitDistributionRecordAttributes
{
  public uuid!: string;
  public profit_record_uuid!: string;
  public role_uuid!: string;
  public user_uuid!: string;
  public base_amount!: number;
  public distribution_amount!: number;
  public share_percentage!: number;
  public status!: number;
  public readonly created_at!: Date;
  public settled_at?: Date;
}

ProfitDistributionRecord.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    profit_record_uuid: {
      comment: '收益记录UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    role_uuid: {
      comment: '角色UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_uuid: {
      comment: '受益人用户UUID',
      type: DataTypes.UUID,
      allowNull: false,
    },
    base_amount: {
      comment: '基础金额（订单总金额）',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    distribution_amount: {
      comment: '分配金额（实际分润金额）',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    share_percentage: {
      comment: '分润比例（百分比）',
      type: DataTypes.DECIMAL(5, 2),
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
    tableName: getAppDbName('profit_distribution_record'),
    ...sequelizeCommonConfig(),
    indexes: [
      // 核心复合索引 - 按收益记录+用户+状态（最常用查询）
      {
        name: 'idx_profit_distribution_record_profit_user_status',
        fields: ['profit_record_uuid', 'user_uuid', 'status']
      },
      // 用户+状态+时间索引 - 用于用户分润历史查询
      {
        name: 'idx_profit_distribution_record_user_status_created',
        fields: ['user_uuid', 'status', 'created_at']
      },
      // 角色+状态索引 - 用于按角色统计分润
      {
        name: 'idx_profit_distribution_record_role_status',
        fields: ['role_uuid', 'status']
      },
      // 收益记录+状态索引 - 用于单条收益记录的分润明细
      {
        name: 'idx_profit_distribution_record_profit_status',
        fields: ['profit_record_uuid', 'status']
      },
      // 结算时间索引 - 用于结算查询
      {
        name: 'idx_profit_distribution_record_settled_at',
        fields: ['settled_at']
      }
    ]
  }
);

export default ProfitDistributionRecord;