/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 00:00:00
 * @Description: 分润记录表 - 控制器
 */

import { Request, Response } from 'express';
import { Op } from 'sequelize';
// models
import {
  ProfitDistributionRecord,
  ProfitRecord,
  User,
  Role,
} from '@/models/app';
// utils
import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';

export class ProfitDistributionRecordController {
  /**
   * 获取分润记录列表 - 优化版本
   */
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      
      // 构建基础查询条件
      const where: any = buildWhereCondition(reqBody, [{ field: 'status' }]);
      
      // 构建关联查询条件
      const userWhere: any = buildWhereCondition(reqBody, [{ field: 'nickname' }]);
      const roleWhere: any = buildWhereCondition(reqBody, [{ field: 'name', queryValue: reqBody?.['role_name'] }]);
      
      // 使用优化后的JOIN查询
      const { rows, count } = await ProfitDistributionRecord.findAndCountAll({
        where,
        ...defaultListQuery(reqBody),
        include: [
          // 关联收益记录
          // {
          //   model: ProfitRecord,
          //   as: 'profit_record',
          //   attributes: ['uuid', 'total_amount'],
          //   where: reqBody?.profit_record_uuid ? { uuid: reqBody.profit_record_uuid } : undefined,
          //   required: !!reqBody?.profit_record_uuid,
          // },
          // 关联用户信息
          {
            model: User,
            as: 'user',
            attributes: ['nickname', 'phone'],
            where: userWhere,
            required: !!reqBody?.nickname,
          },
          // 关联角色信息
          {
            model: Role,
            as: 'role',
            attributes: ['name', 'code'],
            where: roleWhere,
            required: !!reqBody?.role_name,
          },
        ],
      });

      const pageInfo = getPageInfoConfig({
        count,
        ...reqBody,
      });

      return res.responseBuilder.success({
        list: rows,
        pageInfo,
      });
    } catch (error) {
      console.log('ProfitDistributionRecord list error:', error);
      return res.responseBuilder.error('profitDistributionRecord.listFailed', 500);
    }
  }
}
