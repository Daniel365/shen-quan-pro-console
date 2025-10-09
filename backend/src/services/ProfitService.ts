/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 利润服务 - 使用系统配置的分润规则
 */

import { ProfitStatusEnum, SystemConfigKeyEnum } from '@/enum';
import { ProfitDistributionRecord, ProfitRecord, User } from '@/models/app';
import { Op } from 'sequelize';
import { SystemConfigService } from './SystemConfigService';

export class ProfitService {
  /**
   * 创建分润记录
   */
  static async createProfitRecord(
    orderUuid: string,
    activityUuid: string,
    userUuid: string,
    totalAmount: number,
    inviterUuid?: string
  ): Promise<{
    profitRecord: ProfitRecord;
    distributionRecords: ProfitDistributionRecord[];
  }> {
    try {
      // 获取分润规则配置
      const profitDistributionRule = await SystemConfigService.getConfig({
        key: SystemConfigKeyEnum.profit_distribution_rule,
        defaultValue: [],
      });

      if (
        !profitDistributionRule ||
        !Array.isArray(profitDistributionRule) ||
        profitDistributionRule.length === 0
      ) {
        throw new Error('未找到分润规则配置');
      }

      // 计算分润结果
      const profitDetails = await this.calculateProfitShare(
        profitDistributionRule,
        totalAmount,
        userUuid,
        inviterUuid
      );

      // 验证分润比例总和是否为100%
      const totalPercentage = profitDetails.reduce(
        (sum, detail) => sum + detail.share_percentage,
        0
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error(`分润比例总和应为100%，当前为${totalPercentage.toFixed(2)}%`);
      }

      // 创建主收益记录
      const profitRecord = await ProfitRecord.create({
        order_uuid: orderUuid,
        activity_uuid: activityUuid,
        user_uuid: userUuid,
        total_amount: totalAmount,
        status: ProfitStatusEnum.FROZEN,
      });

      // 创建多条分润分配记录
      const distributionRecords: ProfitDistributionRecord[] = [];
      for (const detail of profitDetails) {
        const distributionRecord = await ProfitDistributionRecord.create({
          profit_record_uuid: profitRecord.uuid,
          role_uuid: detail.role_uuid,
          user_uuid: detail.user_uuid,
          base_amount: totalAmount,
          distribution_amount: detail.amount,
          share_percentage: detail.share_percentage,
          status: ProfitStatusEnum.FROZEN,
        });
        distributionRecords.push(distributionRecord);
      }

      console.log('分润记录创建成功:', {
        orderUuid,
        totalAmount,
        profitDetailsCount: profitDetails.length,
        distributionRecordsCount: distributionRecords.length,
        totalPercentage: totalPercentage.toFixed(2) + '%',
      });

      return {
        profitRecord,
        distributionRecords,
      };
    } catch (error) {
      console.error('创建分润记录失败:', error);
      throw error;
    }
  }

  /**
   * 计算分润结果
   */
  private static async calculateProfitShare(
    profitDistributionRule: any[],
    totalAmount: number,
    userUuid: string,
    inviterUuid?: string
  ): Promise<
    {
      role_uuid: string;
      user_uuid: string;
      amount: number;
      share_percentage: number;
    }[]
  > {
    const profitDetails: {
      role_uuid: string;
      user_uuid: string;
      amount: number;
      share_percentage: number;
    }[] = [];

    // 为每个配置的角色找到对应的用户并计算分润
    for (const rule of profitDistributionRule) {
      const { role_uuid, percentage } = rule;

      // 查找拥有该角色的用户
      const users = await User.findAll({
        where: {
          role_uuids: {
            [Op.contains]: [role_uuid],
          },
        },
      });

      if (users.length > 0) {
        // 为每个用户创建分润记录
        for (const user of users) {
          const amount = (totalAmount * percentage) / 100;
          profitDetails.push({
            role_uuid,
            user_uuid: user.uuid,
            amount,
            share_percentage: percentage,
          });
        }
      }
    }

    // 如果存在邀请人，检查邀请人的角色并添加分润
    if (inviterUuid) {
      const inviter = await User.findByPk(inviterUuid);
      if (inviter && inviter.role_uuids && inviter.role_uuids.length > 0) {
        // 检查邀请人的角色是否在分润规则中
        for (const roleUuid of inviter.role_uuids) {
          const rule = profitDistributionRule.find((r) => r.role_uuid === roleUuid);
          if (rule) {
            const amount = (totalAmount * rule.percentage) / 100;
            profitDetails.push({
              role_uuid: roleUuid,
              user_uuid: inviterUuid,
              amount,
              share_percentage: rule.percentage,
            });
            break; // 只取第一个匹配的角色
          }
        }
      }
    }

    return profitDetails;
  }

  /**
   * 验证分润规则配置
   */
  static async validateProfitDistribution(): Promise<boolean> {
    try {
      const profitDistributionRule = await SystemConfigService.getConfig({
        key: SystemConfigKeyEnum.profit_distribution_rule,
        defaultValue: [],
      });

      if (
        !profitDistributionRule ||
        !Array.isArray(profitDistributionRule) ||
        profitDistributionRule.length === 0
      ) {
        console.error('分润规则配置不存在或为空');
        return false;
      }

      // 验证每个规则都有必要的字段
      for (const rule of profitDistributionRule) {
        if (!rule.role_uuid || !rule.percentage) {
          console.error('分润规则缺少必要字段:', rule);
          return false;
        }

        if (typeof rule.percentage !== 'number' || rule.percentage < 0 || rule.percentage > 100) {
          console.error('分润比例无效:', rule.percentage);
          return false;
        }
      }

      // 验证总比例是否为100%
      const totalPercentage = profitDistributionRule.reduce(
        (sum, rule) => sum + rule.percentage,
        0
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        console.error(`分润比例总和应为100%，当前为${totalPercentage.toFixed(2)}%`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('验证分润规则配置失败:', error);
      return false;
    }
  }
}
