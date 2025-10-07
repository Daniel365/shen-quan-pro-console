/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 利润分配配置表 - 单记录存储所有角色分润配置
 */

import sequelize from '@/database';
import { getDbName, sequelizeCommonFields, sequelizeCommonConfig } from '@/database/common';
import { CreateAttributes } from '@/types/database';
import { DataTypes, Model } from 'sequelize';

interface ProfitDistributionAttributes {
  uuid: string;
  config_name: string; // 配置名称
  role_shares: { [role_uuid: string]: number }; // 角色UUID到分润比例的映射
  total_share: number; // 总比例（用于验证）
  status: number; // 状态：1启用，0禁用
  created_at: Date;
  updated_at: Date;
}

// 创建属性，total_share在创建时是可选的（会在hooks中自动计算）
interface ProfitDistributionCreationAttributes
  extends Omit<CreateAttributes<ProfitDistributionAttributes>, 'total_share'> {
  total_share?: number; // 创建时可选的total_share
}

class ProfitDistribution
  extends Model<ProfitDistributionAttributes, ProfitDistributionCreationAttributes>
  implements ProfitDistributionAttributes
{
  public uuid!: string;
  public config_name!: string;
  public role_shares!: { [role_uuid: string]: number };
  public total_share!: number;
  public status!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  /**
   * 根据角色UUID获取分润比例
   */
  public getShareByRole(roleUuid: string): number {
    return this.role_shares[roleUuid] || 0;
  }

  /**
   * 获取所有角色UUID
   */
  public getRoleUuids(): string[] {
    return Object.keys(this.role_shares);
  }

  /**
   * 设置角色分润比例
   */
  public setRoleShare(roleUuid: string, share: number): void {
    this.role_shares = {
      ...this.role_shares,
      [roleUuid]: share,
    };
  }

  /**
   * 移除角色分润配置
   */
  public removeRoleShare(roleUuid: string): void {
    const { [roleUuid]: removed, ...rest } = this.role_shares;
    this.role_shares = rest;
  }

  /**
   * 验证分润配置是否有效（总和不超过100%）
   */
  public isValid(): boolean {
    const totalShare = Object.values(this.role_shares).reduce((sum, share) => sum + share, 0);
    return totalShare <= 100;
  }
}

ProfitDistribution.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    config_name: {
      comment: '配置名称',
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '默认配置',
    },
    role_shares: {
      comment: '角色UUID到分润比例的映射',
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      validate: {
        isValidRoleShares(value: { [role_uuid: string]: number }) {
          // 验证每个角色的分润比例在0-100之间
          for (const [roleUuid, share] of Object.entries(value)) {
            if (share < 0 || share > 100) {
              throw new Error(`角色 ${roleUuid} 的分润比例 ${share}% 必须在0-100之间`);
            }
          }
        },
      },
    },
    total_share: {
      comment: '总比例（自动计算）',
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      comment: '状态：1启用，0禁用',
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    ...sequelizeCommonFields(),
  },
  {
    sequelize,
    tableName: getDbName('app_profit_distribution'),
    ...sequelizeCommonConfig(),
    hooks: {
      beforeSave: async (distribution: ProfitDistribution) => {
        // 保存前自动计算总比例并验证不超过100%
        const totalShare = Object.values(distribution.role_shares || {}).reduce(
          (sum, share) => sum + share,
          0
        );
        distribution.total_share = totalShare;

        if (totalShare > 100) {
          throw new Error(`利润分配比例总和 ${totalShare}% 超过100%，请调整配置`);
        }
      },
    },
  }
);

export default ProfitDistribution;
