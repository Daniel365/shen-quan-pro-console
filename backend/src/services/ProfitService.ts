/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 利润服务 - 适配新的 ProfitDistribution 模型
 */

import { ProfitDistributionService } from './ProfitDistributionService';

export class ProfitService {
  /**
   * 创建分润记录
   */
  static async createProfitRecord(orderUuid: string, activityUuid: string, userUuid: string, totalAmount: number): Promise<any> {
    try {
      // 获取启用的利润分配配置
      const distribution = await ProfitDistributionService.getEnabledDistribution();
      if (!distribution) {
        throw new Error('未找到启用的利润分配配置');
      }

      // 计算分润结果
      const { distribution: profitDetails, remainingAmount, isValid } = await ProfitDistributionService.calculateProfitShare(
        totalAmount, 
        userUuid
      );

      if (!isValid) {
        console.warn('分润比例配置无效，但继续创建分润记录');
      }

      // 创建分润记录
      const profitRecord = {
        order_uuid: orderUuid,
        activity_uuid: activityUuid,
        user_uuid: userUuid,
        total_amount: totalAmount,
        status: 1, // 冻结中
        created_at: new Date()
      };

      console.log('分润记录创建成功:', {
        orderUuid,
        totalAmount,
        profitDetails,
        remainingAmount
      });

      return profitRecord;
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