/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 订单自动完成服务
 */

import { OrderController } from '@/controllers/app/OrderManage';

/**
 * 订单自动完成服务
 */
export class OrderAutoCompleteService {
  private static isRunning = false;
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * 启动订单自动完成服务
   * @param intervalMinutes 检查间隔（分钟），默认30分钟
   */
  static start(intervalMinutes: number = 30) {
    if (this.isRunning) {
      console.log('订单自动完成服务已在运行中');
      return;
    }

    const intervalMs = intervalMinutes * 60 * 1000;

    // 立即执行一次
    this.executeAutoComplete();

    // 设置定时器
    this.intervalId = setInterval(() => {
      this.executeAutoComplete();
    }, intervalMs);

    this.isRunning = true;
    console.log(`订单自动完成服务已启动，检查间隔: ${intervalMinutes}分钟`);
  }

  /**
   * 停止订单自动完成服务
   */
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('订单自动完成服务已停止');
  }

  /**
   * 执行订单自动完成
   */
  private static async executeAutoComplete() {
    try {
      const completedCount = await OrderController.autoCompleteOrders();
      if (completedCount > 0) {
        console.log(`订单自动完成服务执行完成，处理了 ${completedCount} 个订单`);
      }
    } catch (error) {
      console.error('订单自动完成服务执行失败:', error);
    }
  }

  /**
   * 手动触发订单自动完成
   */
  static async manualTrigger() {
    try {
      const completedCount = await OrderController.autoCompleteOrders();
      console.log(`手动触发订单自动完成成功，处理了 ${completedCount} 个订单`);
      return completedCount;
    } catch (error) {
      console.error('手动触发订单自动完成失败:', error);
      throw error;
    }
  }

  /**
   * 获取服务运行状态
   */
  static getStatus() {
    return {
      isRunning: this.isRunning,
      lastExecution: new Date().toISOString(),
    };
  }
}
