/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 收益记录管理（基于新模型结构）
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
// models
import {
  Activity,
  ActivityTranslation,
  Order,
  ProfitDistribution,
  ProfitRecord,
  User,
} from '@/models/app';
// utils
import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';
import { ProfitStatusEnum } from '@/enum';

export class ProfitRecordController {
  /**
   * 获取收益记录列表
   */
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, [{ field: 'status' }]);
      const activityWhere: any = buildWhereCondition(reqBody, [
        { field: 'title', queryValue: reqBody?.['activity_title'] },
      ]);
      const orderWhere: any = buildWhereCondition(reqBody, [{ field: 'order_type' }]);
      const userWhere: any = buildWhereCondition(reqBody, [{ field: 'nickname' }]);

      const { rows, count } = await ProfitRecord.findAndCountAll({
        where,
        ...defaultListQuery(reqBody),
        include: [
          {
            model: Activity,
            as: 'activity',
            attributes: ['location', 'start_time'],
            include: [
              {
                model: ActivityTranslation,
                as: 'translations',
                attributes: ['title', 'language'],
                where: activityWhere,
                required: false,
              },
            ],
          },
          {
            model: Order,
            as: 'order',
            where: orderWhere,
            attributes: ['actual_price', 'order_type'],
          },
          {
            model: User,
            as: 'user',
            where: userWhere,
            attributes: ['nickname', 'phone'],
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
      console.log('err', error);
      return res.responseBuilder.error('profit.listFailed', 500);
    }
  }

  /**
   * 结算收益（系统自动触发）
   */
  static async settle(req: Request, res: Response) {
    try {
      // 查找所有冻结中的收益记录
      const frozenRecords = await ProfitRecord.findAll({
        where: { status: ProfitStatusEnum.FROZEN },
        include: [
          {
            model: Activity,
            as: 'activity',
            attributes: ['start_time', 'refund_deadline'],
          },
        ],
      });

      const now = new Date();
      const settledRecords: string[] = [];

      for (const record of frozenRecords) {
        const activity = (record as any).activity;

        // 检查活动是否已结束且超过退款期
        if (activity && activity.startTime < now && activity.refundDeadline < now) {
          // 更新收益记录状态为已结算
          await ProfitRecord.update(
            {
              status: ProfitStatusEnum.SETTLED,
              settled_at: new Date(),
            },
            { where: { uuid: record.uuid } }
          );

          settledRecords.push(record.uuid);
        }
      }

      return res.responseBuilder.success(
        {
          settled_count: settledRecords.length,
          settled_records: settledRecords,
        },
        'profit.settleSuccess'
      );
    } catch (error) {
      console.error('Settle profit failed:', error);
      return res.responseBuilder.error('profit.settleFailed', 500);
    }
  }

  /**
   * 获取收益统计
   */
  @IgnoreLog()
  static async statistics(req: Request, res: Response) {
    try {
      const { user_uuid, start_time, end_time } = req.body;

      const where: any = {};
      if (user_uuid) {
        where[Op.or] = [{ user_uuid }, { inviter_uuid: user_uuid }];
      }

      if (start_time && end_time) {
        where.created_at = {
          [Op.between]: [new Date(start_time), new Date(end_time)],
        };
      }

      // 先获取收益记录的基本统计
      const profitRecords = await ProfitRecord.findAll({
        where,
        attributes: [
          'user_uuid',
          'inviter_uuid',
          'status',
          [
            ProfitRecord.sequelize!.fn('SUM', ProfitRecord.sequelize!.col('total_amount')),
            'total_amount',
          ],
          [
            ProfitRecord.sequelize!.fn('COUNT', ProfitRecord.sequelize!.col('uuid')),
            'record_count',
          ],
        ],
        group: ['user_uuid', 'inviter_uuid', 'status'],
      });

      // 获取详细的分配统计
      const distributionStats = await ProfitDistribution.findAll({
        include: [
          {
            model: ProfitRecord,
            as: 'profit_record',
            where: where,
          },
        ],
        attributes: [
          'role_uuid',
          [
            ProfitDistribution.sequelize!.fn(
              'SUM',
              ProfitDistribution.sequelize!.col('share_amount')
            ),
            'total_share',
          ],
          [
            ProfitDistribution.sequelize!.fn('COUNT', ProfitDistribution.sequelize!.col('uuid')),
            'distribution_count',
          ],
        ],
        group: ['role_uuid'],
      });

      return res.responseBuilder.success({
        profit_statistics: profitRecords,
        distribution_statistics: distributionStats,
      });
    } catch (error) {
      console.error('Statistics error:', error);
      return res.responseBuilder.error('profit.statisticsFailed', 500);
    }
  }
}
