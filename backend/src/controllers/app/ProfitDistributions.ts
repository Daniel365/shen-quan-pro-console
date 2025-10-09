/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 00:00:00
 * @Description: 利润分配配置 - 控制器
 */
import { ProfitDistribution, Role } from '@/models/app';
import { Request, Response } from 'express';
import { Op } from 'sequelize';

import { DataTypeEnum, MatchTypeEnum, StatusEnum } from '@/enum';
import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';

export class ProfitDistributionController {
  // 获取配置列表
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, [
        { field: 'config_name' },
        {
          field: 'status',
          dataType: DataTypeEnum.NUMBER,
          matchType: MatchTypeEnum.EXACT,
        },
      ]);

      const { rows, count } = await ProfitDistribution.findAndCountAll({
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
      const { config_name, role_shares } = req.body;

      // 验证配置名称是否已存在
      const existingConfig = await ProfitDistribution.findOne({ where: { config_name } });
      if (existingConfig) {
        return res.responseBuilder.error('profitDistribution.nameExists');
      }

      // 验证所有角色存在
      const roleUuids = Object.keys(role_shares);
      const roles = await Role.findAll({
        where: { uuid: { [Op.in]: roleUuids } },
      });

      if (roles.length !== roleUuids.length) {
        return res.responseBuilder.error('profitDistribution.rolesNotFound');
      }

      const distribution = await ProfitDistribution.create({
        config_name,
        role_shares,
        status: StatusEnum.ENABLE,
      });

      return res.responseBuilder.created({ uuid: distribution.uuid }, 'profitDistribution.createSuccess');
    } catch (error) {
      console.log("create=>", error)
      return res.responseBuilder.error('profitDistribution.createFailed', 500);
    }
  }

  // 更新配置
  static async update(req: Request, res: Response) {
    try {
      const { uuid, config_name, role_shares, status } = req.body;

      const distribution = await ProfitDistribution.findOne({ where: { uuid } });
      if (!distribution) {
        return res.responseBuilder.error('profitDistribution.notFound');
      }

      // 检查配置名称是否已存在（排除当前配置）
      if (config_name) {
        const existingConfig = await ProfitDistribution.findOne({ 
          where: { 
            config_name, 
            uuid: { [Op.ne]: uuid } 
          } 
        });
        if (existingConfig) {
          return res.responseBuilder.error('profitDistribution.nameExists');
        }
      }

      // 验证角色（如果提供了role_shares）
      if (role_shares) {
        const roleUuids = Object.keys(role_shares);
        const roles = await Role.findAll({
          where: { uuid: { [Op.in]: roleUuids } },
        });

        if (roles.length !== roleUuids.length) {
          return res.responseBuilder.error('profitDistribution.rolesNotFound');
        }
      }

      await ProfitDistribution.update(
        { config_name, role_shares, status },
        { where: { uuid } }
      );

      return res.responseBuilder.success({}, 'profitDistribution.updateSuccess');
    } catch (error) {
      return res.responseBuilder.error('profitDistribution.updateFailed', 500);
    }
  }

  // 启用配置
  static async enable(req: Request, res: Response) {
    try {
      const { uuid } = req.body;

      const distribution = await ProfitDistribution.findOne({ where: { uuid } });
      if (!distribution) {
        return res.responseBuilder.error('profitDistribution.notFound');
      }

      // 禁用其他配置（确保只有一个启用配置）
      await ProfitDistribution.update(
        { status: StatusEnum.DISABLE },
        {
          where: {
            uuid: { [Op.ne]: uuid },
            status: StatusEnum.ENABLE,
          },
        }
      );

      // 启用当前配置
      await ProfitDistribution.update(
        { status: StatusEnum.ENABLE },
        { where: { uuid } }
      );

      return res.responseBuilder.success({}, 'profitDistribution.enableSuccess');
    } catch (error) {
      return res.responseBuilder.error('profitDistribution.enableFailed', 500);
    }
  }

  // 删除配置
  static async delete(req: Request, res: Response) {
    try {
      const { uuid } = req.body;

      const distribution = await ProfitDistribution.findOne({ where: { uuid } });
      if (!distribution) {
        return res.responseBuilder.error('profitDistribution.notFound');
      }

      // 检查是否是启用的配置
      if (distribution.status === StatusEnum.ENABLE) {
        return res.responseBuilder.error('profitDistribution.cannotDeleteEnabled');
      }

      await ProfitDistribution.destroy({ where: { uuid } });
      return res.responseBuilder.success({ uuid }, 'profitDistribution.deleteSuccess');
    } catch (error) {
      return res.responseBuilder.error('profitDistribution.deleteFailed', 500);
    }
  }
}
