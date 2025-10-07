/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 配置服务 - 用于管理系统配置参数
 */

import { SystemConfig } from '@/models/app';

export class ConfigService {
  private static configCache = new Map<string, any>();
  private static cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  private static lastUpdateTime = 0;

  /**
   * 获取配置值
   * @param key 配置键名
   * @param defaultValue 默认值
   * @returns 配置值
   */
  static async getConfig(key: string, defaultValue?: any): Promise<any> {
    try {
      // 检查缓存是否有效
      const now = Date.now();
      if (now - this.lastUpdateTime > this.cacheTimeout) {
        this.configCache.clear();
        this.lastUpdateTime = now;
      }

      // 从缓存中获取
      if (this.configCache.has(key)) {
        return this.configCache.get(key);
      }

      // 从数据库获取
      const config = await SystemConfig.findOne({ where: { key } });
      if (!config) {
        console.warn(`配置项 ${key} 不存在，使用默认值: ${defaultValue}`);
        return defaultValue;
      }

      // 根据类型解析值
      let value: any;
      switch (config.type) {
        case 1: // 字符串
          value = config.value;
          break;
        case 2: // 数字
          value = parseFloat(config.value);
          break;
        case 3: // 布尔值
          value = config.value.toLowerCase() === 'true';
          break;
        case 4: // JSON
          try {
            value = JSON.parse(config.value);
          } catch (error) {
            console.error(`配置项 ${key} JSON解析失败:`, error);
            value = defaultValue;
          }
          break;
        default:
          value = config.value;
      }

      // 存入缓存
      this.configCache.set(key, value);
      return value;
    } catch (error) {
      console.error(`获取配置 ${key} 失败:`, error);
      return defaultValue;
    }
  }

  /**
   * 设置配置值
   * @param key 配置键名
   * @param value 配置值
   * @param description 配置描述
   * @param type 配置类型
   */
  static async setConfig(key: string, value: any, description?: string, type: number = 1): Promise<void> {
    try {
      let stringValue: string;
      
      // 根据类型转换值
      switch (type) {
        case 1: // 字符串
          stringValue = String(value);
          break;
        case 2: // 数字
          stringValue = String(value);
          break;
        case 3: // 布尔值
          stringValue = value ? 'true' : 'false';
          break;
        case 4: // JSON
          stringValue = JSON.stringify(value);
          break;
        default:
          stringValue = String(value);
      }

      // 更新或创建配置
      await SystemConfig.upsert({
        key,
        value: stringValue,
        description,
        type,
      });

      // 清除缓存
      this.configCache.delete(key);
      console.log(`配置项 ${key} 已更新为: ${stringValue}`);
    } catch (error) {
      console.error(`设置配置 ${key} 失败:`, error);
      throw error;
    }
  }

  /**
   * 获取活动退款截止时间配置（小时数）
   */
  static async getRefundDeadlineHours(): Promise<number> {
    return await this.getConfig('activity_refund_deadline_hours', 2); // 默认2小时
  }

  /**
   * 设置活动退款截止时间配置
   */
  static async setRefundDeadlineHours(hours: number): Promise<void> {
    await this.setConfig(
      'activity_refund_deadline_hours', 
      hours, 
      '活动退款截止时间（小时），活动开始前多少小时可以退款',
      2 // 数字类型
    );
  }

  /**
   * 计算退款截止时间
   * @param startTime 活动开始时间
   * @returns 退款截止时间
   */
  static async calculateRefundDeadline(startTime: Date): Promise<Date> {
    const hours = await this.getRefundDeadlineHours();
    const deadline = new Date(startTime.getTime() - hours * 60 * 60 * 1000);
    return deadline;
  }

  /**
   * 初始化默认配置
   */
  static async initDefaultConfigs(): Promise<void> {
    const defaultConfigs = [
      {
        key: 'activity_refund_deadline_hours',
        value: '2',
        description: '活动退款截止时间（小时），活动开始前多少小时可以退款',
        type: 2,
      },
      {
        key: 'activity_auto_settle_hours',
        value: '24',
        description: '活动结束后自动结算收益的时间（小时）',
        type: 2,
      },
    ];

    for (const config of defaultConfigs) {
      await SystemConfig.findOrCreate({
        where: { key: config.key },
        defaults: config,
      });
    }

    console.log('默认配置初始化完成');
  }
}