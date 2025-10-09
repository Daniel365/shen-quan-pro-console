/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 00:00:00
 * @Description: 系统配置 - 控制器
 */
import { SystemConfig } from '@/models/app';
import { SystemConfigService } from '@/services/SystemConfigService';
import { Request, Response } from 'express';
import { Op } from 'sequelize';

import { DataTypeEnum, MatchTypeEnum } from '@/enum';
import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';
import { SystemConfigTypeEnum } from '@/enum';

export class SystemConfigController {
  // 获取配置列表
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, [
        { field: 'key' },
        { field: 'description' },
        {
          field: 'type',
          dataType: DataTypeEnum.NUMBER,
          matchType: MatchTypeEnum.EXACT,
        },
      ]);

      const { rows, count } = await SystemConfig.findAndCountAll({
        where,
        ...defaultListQuery(reqBody),
      });
      // 分页信息
      const pageInfo = getPageInfoConfig({
        count,
        ...reqBody,
      });

      return res.responseBuilder.success({
        list: rows,
        pageInfo,
      });
    } catch (error) {
      return res.responseBuilder.error('common.serverError', 500);
    }
  }

  // 创建配置
  static async create(req: Request, res: Response) {
    try {
      const { key } = req.body;

      // 检查配置键名是否已存在
      const existingKey = await SystemConfig.findOne({ where: { key } });
      if (existingKey) {
        return res.responseBuilder.error('systemConfig.keyExists');
      }

      // 使用服务层设置配置（会自动处理类型转换和缓存）
      await SystemConfigService.setConfig(req.body);

      // 获取新创建的配置以返回UUID
      const config = await SystemConfig.findOne({ where: { key } });
      if (!config) {
        return res.responseBuilder.error('systemConfig.createFailed', 500);
      }

      return res.responseBuilder.created({ uuid: config.uuid }, 'systemConfig.createSuccess');
    } catch (error) {
      return res.responseBuilder.error('systemConfig.createFailed', 500);
    }
  }

  // 更新配置
  static async update(req: Request, res: Response) {
    try {
      const { uuid, key, type } = req.body;

      // 先获取原配置以检查key是否变化
      const config = await SystemConfig.findOne({ where: { uuid } });
      if (!config) {
        return res.responseBuilder.error('systemConfig.notFound');
      }

      // 检查配置键名是否已存在（排除当前配置）
      if (key && key !== config.key) {
        const existingKey = await SystemConfig.findOne({ where: { key, uuid: { [Op.ne]: uuid } } });
        if (existingKey) {
          return res.responseBuilder.error('systemConfig.keyExists');
        }
      }

      // 如果key发生变化，先删除原key的缓存，再更新key
      if (key && key !== config.key) {
        // 使用服务层设置新配置
        await SystemConfigService.setConfig({ ...req.body, type: type || config.type });
        
        // 删除原配置
        await SystemConfig.destroy({ where: { uuid } });
      } else {
        // 直接更新现有配置
        await SystemConfigService.setConfig({  ...req.body, key: config.key, type: type || config.type });
      }

      return res.responseBuilder.success({}, 'systemConfig.updateSuccess');
    } catch (error) {
      return res.responseBuilder.error('systemConfig.updateFailed', 500);
    }
  }

  // 删除配置
  static async delete(req: Request, res: Response) {
    try {
      const { uuid } = req.body;
      await SystemConfig.destroy({ where: { uuid } });
      return res.responseBuilder.success({ uuid }, 'systemConfig.deleteSuccess');
    } catch (error) {
      return res.responseBuilder.error('systemConfig.deleteFailed', 500);
    }
  }
}
