/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 利润服务 - 适配新的 ProfitDistribution 模型
 */

import { ProfitDistributionService } from './ProfitDistributionService';
import { ProfitRecord, ProfitDistributionRecord } from '@/models/app';
import { ProfitStatusEnum } from '@/enum';

export class ProfitService {
  /**
   * 创建分润记录
   */
  static async createProfitRecord(orderUuid: string, activityUuid: string, userUuid: string, totalAmount: number, inviterUuid?: string): Promise<{
    profitRecord: ProfitRecord;
    distributionRecords: ProfitDistributionRecord[];
  }> {
    try {
      // 获取启用的利润分配配置
      const distribution = await ProfitDistributionService.getEnabledDistribution();
      if (!distribution) {
        throw new Error('未找到启用的利润分配配置');
      }

      // 计算分润结果
      const { distribution: profitDetails, remainingAmount, isValid } = await ProfitDistributionService.calculateProfitShare(
        totalAmount, 
        userUuid,
        inviterUuid
      );

      if (!isValid) {
        console.warn('分润比例配置无效，但继续创建分润记录');
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
          share_percentage: detail.amount / totalAmount * 100,
          status: ProfitStatusEnum.FROZEN,
        });
        distributionRecords.push(distributionRecord);
      }

      console.log('分润记录创建成功:', {
        orderUuid,
        totalAmount,
        profitDetailsCount: profitDetails.length,
        distributionRecordsCount: distributionRecords.length,
        remainingAmount
      });

      return {
        profitRecord,
        distributionRecords
      };
    } catch (error) {
      console.error('创建分润记录失败:', error);
      throw error;
    }
  }

  /**
   * 初始化利润分配配置
   */
  static async initProfitDistribution(): Promise<void> {
    try {
      await ProfitDistributionService.initDefaultDistribution();
      console.log('利润分配配置初始化完成');
    } catch (error) {
      console.error('初始化利润分配配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取利润分配详情
   */
  static async getProfitDistributionDetail() {
    try {
      return await ProfitDistributionService.getDistributionDetail();
    } catch (error) {
      console.error('获取利润分配详情失败:', error);
      return null;
    }
  }

  /**
   * 验证利润分配配置
   */
  static async validateProfitDistribution(): Promise<boolean> {
    try {
      return await ProfitDistributionService.validateDistribution();
    } catch (error) {
      console.error('验证利润分配配置失败:', error);
      return false;
    }
  }
}