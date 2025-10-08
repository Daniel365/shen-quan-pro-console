/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 利润分配服务 - 基于单记录配置
 */

import { ProfitDistribution, Role, User } from '@/models/app';
import { StatusEnum } from '@/enum';

export class ProfitDistributionService {
  /**
   * 获取启用的利润分配配置
   */
  static async getEnabledDistribution(): Promise<ProfitDistribution | null> {
    try {
      return await ProfitDistribution.findOne({
        where: { status: StatusEnum.ENABLE },
      });
    } catch (error) {
      console.error('获取利润分配配置失败:', error);
      return null;
    }
  }

  /**
   * 根据角色UUID获取分润比例
   */
  static async getShareByRole(roleUuid: string): Promise<number> {
    try {
      const distribution = await this.getEnabledDistribution();
      if (!distribution) {
        console.warn('未找到启用的利润分配配置');
        return 0;
      }

      return distribution.getShareByRole(roleUuid);
    } catch (error) {
      console.error(`获取角色 ${roleUuid} 分润比例失败:`, error);
      return 0;
    }
  }

  /**
   * 获取所有分润角色
   */
  static async getProfitRoles(): Promise<Role[]> {
    try {
      const distribution = await this.getEnabledDistribution();
      if (!distribution) {
        return [];
      }

      const roleUuids = distribution.getRoleUuids();
      if (roleUuids.length === 0) {
        return [];
      }

      return await Role.findAll({
        where: {
          uuid: { [Symbol.for('in')]: roleUuids },
          status: StatusEnum.ENABLE,
        },
      });
    } catch (error) {
      console.error('获取分润角色失败:', error);
      return [];
    }
  }

  /**
   * 验证分润配置是否有效
   */
  static async validateDistribution(): Promise<boolean> {
    try {
      const distribution = await this.getEnabledDistribution();
      if (!distribution) {
        console.warn('未找到利润分配配置');
        return false;
      }

      return distribution.isValid();
    } catch (error) {
      console.error('验证利润分配配置失败:', error);
      return false;
    }
  }

  /**
   * 创建或更新利润分配配置
   */
  static async upsertDistribution(
    configName: string,
    roleShares: { [role_uuid: string]: number }
  ): Promise<ProfitDistribution> {
    try {
      // 验证所有角色存在
      const roleUuids = Object.keys(roleShares);
      const roles = await Role.findAll({
        where: { uuid: { [Symbol.for('in')]: roleUuids } },
      });

      if (roles.length !== roleUuids.length) {
        throw new Error('部分角色不存在');
      }

      // 获取现有配置或创建新配置
      const [distribution, created] = await ProfitDistribution.upsert({
        config_name: configName,
        role_shares: roleShares,
        status: StatusEnum.ENABLE,
      });

      // 禁用其他配置（确保只有一个启用配置）
      await ProfitDistribution.update(
        { status: StatusEnum.DISABLE },
        {
          where: {
            uuid: { [Symbol.for('not')]: distribution.uuid },
            status: StatusEnum.ENABLE,
          },
        }
      );

      console.log(`${created ? '创建' : '更新'}利润分配配置成功: ${configName}`);
      return distribution;
    } catch (error) {
      console.error('创建/更新利润分配配置失败:', error);
      throw error;
    }
  }

  /**
   * 根据角色获取用户ID
   */
  static async getUserIdByRole(
    roleUuid: string,
    userId: string,
    inviterId?: string
  ): Promise<string | null> {
    try {
      const role = await Role.findOne({ where: { uuid: roleUuid } });
      if (!role) {
        return null;
      }

      // 根据角色编码判断获取哪个用户ID
      switch (role.code) {
        case 'partner':
          // 合伙人角色使用上级用户ID（邀请人）
          return inviterId || null;

        case 'technician':
        case 'founder':
        default:
          // 其他角色获取拥有该角色的第一个启用用户
          const users = await User.findAll({
            where: {
              role_uuids: { [Symbol.for('contains')]: [roleUuid] },
              status: StatusEnum.ENABLE,
            },
            attributes: ['uuid'],
            limit: 1,
          });
          return users.length > 0 ? users[0].uuid : null;
      }
    } catch (error) {
      console.error('获取用户ID失败:', error);
      return null;
    }
  }

  /**
   * 计算利润分成
   */
  static async calculateProfitShare(
    totalAmount: number,
    userId: string,
    inviterId?: string
  ): Promise<{
    distribution: any[]; // [{ role_uuid: string, amount: number, user_uuid: string }]
    remainingAmount: number;
    isValid: boolean;
  }> {
    try {
      const distribution = await this.getEnabledDistribution();
      if (!distribution) {
        return {
          distribution: [],
          remainingAmount: totalAmount,
          isValid: false,
        };
      }

      const profitDistribution: any[] = [];
      let allocatedAmount = 0;

      // 验证配置有效性
      const isValid = distribution.isValid();
      if (!isValid) {
        console.warn('利润分配配置无效，总比例超过100%');
      }

      // 计算每个角色的分成金额
      for (const [roleUuid, share] of Object.entries(distribution.role_shares)) {
        const roleUserId = await this.getUserIdByRole(roleUuid, userId, inviterId);

        if (roleUserId && share > 0) {
          const amount = totalAmount * (share / 100);
          allocatedAmount += amount;

          profitDistribution.push({
            role_uuid: roleUuid,
            amount: parseFloat(amount.toFixed(2)),
            user_uuid: roleUserId,
          });
        } else {
          console.warn(`角色 ${roleUuid} 未找到有效的用户或分润比例为0，跳过分配`);
        }
      }

      const remainingAmount = totalAmount - allocatedAmount;

      return {
        distribution: profitDistribution,
        remainingAmount,
        isValid,
      };
    } catch (error) {
      console.error('计算利润分成失败:', error);
      throw error;
    }
  }

  /**
   * 初始化默认利润分配配置
   */
  static async initDefaultDistribution(): Promise<void> {
    try {
      // 先创建对应的角色
      const defaultRoles = [
        { name: '技术员', code: 'technician' },
        { name: '流量合伙人', code: 'partner' },
        { name: '创始人', code: 'founder' },
      ];

      for (const roleData of defaultRoles) {
        await Role.findOrCreate({
          where: { code: roleData.code },
          defaults: {
            ...roleData,
            status: StatusEnum.ENABLE,
          },
        });
      }

      // 获取角色UUID
      const technician = await Role.findOne({ where: { code: 'technician' } });
      const partner = await Role.findOne({ where: { code: 'partner' } });
      const founder = await Role.findOne({ where: { code: 'founder' } });

      if (!technician || !partner || !founder) {
        throw new Error('创建默认角色失败');
      }

      // 创建利润分配配置
      const defaultConfig = {
        [technician.uuid]: 10,
        [partner.uuid]: 30,
        [founder.uuid]: 60,
      };

      await this.upsertDistribution('默认配置', defaultConfig);

      console.log('默认利润分配配置初始化完成');
    } catch (error) {
      console.error('初始化默认利润分配配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取利润分配详情（包含角色信息）
   */
  static async getDistributionDetail(): Promise<{
    config: ProfitDistribution;
    roles: { [role_uuid: string]: Role };
    totalShare: number;
    isValid: boolean;
  } | null> {
    try {
      const distribution = await this.getEnabledDistribution();
      if (!distribution) {
        return null;
      }

      const roleUuids = distribution.getRoleUuids();
      const roles = await Role.findAll({
        where: { uuid: { [Symbol.for('in')]: roleUuids } },
      });

      const roleMap: { [role_uuid: string]: Role } = {};
      roles.forEach((role) => {
        roleMap[role.uuid] = role;
      });

      return {
        config: distribution,
        roles: roleMap,
        totalShare: distribution.total_share,
        isValid: distribution.isValid(),
      };
    } catch (error) {
      console.error('获取利润分配详情失败:', error);
      return null;
    }
  }
}
