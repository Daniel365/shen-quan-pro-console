/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 配置服务 - 用于管理系统配置参数
 */

import { SystemConfig } from '@/models/app';
import { SystemConfigTypeEnum } from '@/enum';

export class SystemConfigService {
  private static configCache = new Map<string, any>();
  private static cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  private static lastUpdateTime = 0;

  /**
   * 获取配置值
   * @param params 参数对象
   * @param params.key 配置键名
   * @param params.defaultValue 默认值
   * @returns 配置值
   */
  static async getConfig(params: { key: string; defaultValue?: any }): Promise<any> {
    const { key, defaultValue } = params;
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

      // 使用模型的 getValue 方法获取已解析的值
      const value = config.getValue();

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
   * @param params 参数对象
   * @param params.key 配置键名
   * @param params.value 配置值
   * @param params.description 配置描述
   * @param params.type 配置类型
   */
  static async setConfig(params: { 
    key: string; 
    value: any; 
    description?: string; 
    type?: SystemConfigTypeEnum;
  }): Promise<void> {
    const { key, value, description, type = SystemConfigTypeEnum.STRING } = params;
    try {
      // 查找或创建配置项
      const [config] = await SystemConfig.findOrCreate({
        where: { key },
        defaults: {
          key,
          value: '', // 临时值，后面会通过setValue设置
          description,
          type,
        }
      });

      // 更新配置类型和值
      config.type = type;
      config.setValue(value);
      if (description) {
        config.description = description;
      }

      // 保存配置
      await config.save();

      // 清除缓存
      this.configCache.delete(key);
      console.log(`配置项 ${key} 已更新为: ${value}`);
    } catch (error) {
      console.error(`设置配置 ${key} 失败:`, error);
      throw error;
    }
  }
}
