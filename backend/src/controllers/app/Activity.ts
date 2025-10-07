/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 活动管理
 */
import sequelize from '@/database';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
// models
import { Activity, ActivityTranslation, Order } from '@/models/app';
// utils
import { defaultExcludeQueryFields, defaultListQuery, getPageInfoConfig } from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';
import { StatusEnum } from '@/types/database';
// services
import { ActivityTranslationService } from '@/services/ActivityTranslationService';

export class ActivityController {
  /**
   * 获取活动列表
   */
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = {
        status: reqBody.status || { [Op.ne]: null },
      };

      const { rows, count } = await Activity.findAndCountAll({
        where,
        include: [
          {
            model: ActivityTranslation,
            as: 'translations',
            required: false,
            attributes: { exclude: [...defaultExcludeQueryFields, 'activity_uuid'] },
          },
        ],
        ...defaultListQuery(reqBody),
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
      return res.responseBuilder.error('activity.listFailed', 500);
    }
  }

  /**
   * 获取活动详情
   */
  @IgnoreLog()
  static async detail(req: Request, res: Response) {
    try {
      const { uuid } = req.body;
      const language = req.locale;

      if (!uuid) {
        return res.responseBuilder.error('activity.uuidRequired', 400);
      }

      const activity = await Activity.findOne({
        where: { uuid },
        include: [
          {
            model: ActivityTranslation,
            as: 'translations',
            where: { language },
            required: false,
          },
        ],
      });

      if (!activity) {
        return res.responseBuilder.error('activity.notFound', 404);
      }

      // 获取报名人数
      const participantCount = await Order.count({
        where: { target_uuid: uuid, order_type: 'activity' },
      });

      return res.responseBuilder.success({
        ...activity.toJSON(),
        participantCount,
      });
    } catch (error) {
      return res.responseBuilder.error('activity.detailFailed', 500);
    }
  }

  /**
   * 创建或编辑活动
   */
  static async save(req: Request, res: Response) {
    const { account_uuid: publisher_uuid } = req.accountInfo! || {};
    const {
      activity_uuid,
      base_price = 0,
      male_price = 0,
      female_price = 0,
      location,
      start_time,
      end_time,
      reg_limit = 0,
      tags = [],
      status = StatusEnum.ENABLE,
      translations = [],
    } = req.body;

    const isEdit = !!activity_uuid;
    try {
      // 验证必填字段
      if (!location || !start_time || !end_time) {
        return res.responseBuilder.error('activity.locationAndStartEndTimeRequired', 400);
      }

      // 验证时间逻辑：结束时间必须在开始时间之后
      if (new Date(end_time) <= new Date(start_time)) {
        return res.responseBuilder.error('activity.endTimeMustAfterStartTime', 400);
      }

      // 验证翻译数据
      const validationError = ActivityTranslationService.validateTranslations(translations, isEdit);

      if (validationError) {
        return res.responseBuilder.error(validationError, 400);
      }

      if (isEdit) {
        // 编辑模式：验证活动是否存在
        const activity = await Activity.findOne({ where: { uuid: activity_uuid } });
        if (!activity) {
          return res.responseBuilder.error('activity.notFound', 404);
        }
      }

      const transaction = await sequelize.transaction();

      try {
        let activity;
        const formData = {
          base_price,
          male_price,
          female_price,
          location,
          start_time,
          end_time,
          reg_limit,
          tags,
          status,
          publisher_uuid,
          publish_source: 1,
        };

        if (isEdit) {
          // 编辑模式：更新活动主记录
          await Activity.update(formData, {
            where: { uuid: activity_uuid },
            transaction,
          });

          // 统一处理翻译记录
          await ActivityTranslationService.saveTranslations(
            translations,
            transaction,
            activity_uuid,
            true
          );
          activity = { uuid: activity_uuid };
        } else {
          // 创建模式：创建活动主记录
          activity = await Activity.create(formData, { transaction });

          // 统一处理翻译记录
          await ActivityTranslationService.saveTranslations(
            translations,
            transaction,
            activity.uuid,
            false
          );
        }

        await transaction.commit();

        const message = isEdit ? 'activity.updateSuccess' : 'activity.createSuccess';
        return res.responseBuilder.success({ uuid: activity.uuid }, message);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.log(`activity-save->`, error);
      const message = isEdit ? 'activity.updateFailed' : 'activity.createFailed';
      return res.responseBuilder.error(message, 500);
    }
  }

  /**
   * 创建活动
   */
  static async create(req: Request, res: Response) {
    // 删除请求体中的activityUuid，确保创建模式
    const body = { ...req.body };
    delete body.activity_uuid;
    req.body = body;

    return ActivityController.save(req, res);
  }

  /**
   * 编辑活动
   */
  static async update(req: Request, res: Response) {
    return ActivityController.save(req, res);
  }

  /**
   * 批量删除活动
   */
  static async delete(req: Request, res: Response) {
    try {
      const { activity_uuids } = req.body;

      if (!activity_uuids || !Array.isArray(activity_uuids) || activity_uuids.length === 0) {
        return res.responseBuilder.error('activity.uuidsRequired', 400);
      }

      // 验证活动是否存在
      const activities = await Activity.findAll({
        where: { uuid: { [Op.in]: activity_uuids } },
      });

      if (activities.length !== activity_uuids.length) {
        return res.responseBuilder.error('activity.someNotFound', 404);
      }

      const transaction = await sequelize.transaction();

      try {
        // 检查是否有订单使用这些活动
        const ordersWithActivities = await Order.findAll({
          where: {
            target_uuid: { [Op.in]: activity_uuids },
            order_type: 'activity',
          },
          transaction,
        });

        // 如果有任何活动被使用，不允许删除
        if (ordersWithActivities.length > 0) {
          await transaction.rollback();
          return res.responseBuilder.error('activity.isInUse', 400);
        }

        // 批量删除活动翻译记录
        await ActivityTranslation.destroy({
          where: { activity_uuid: { [Op.in]: activity_uuids } },
          transaction,
        });

        // 批量删除活动主记录
        await Activity.destroy({
          where: { uuid: { [Op.in]: activity_uuids } },
          transaction,
        });

        await transaction.commit();

        return res.responseBuilder.success(
          { deleted_uuids: activity_uuids },
          'activity.deleteSuccess'
        );
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      return res.responseBuilder.error('activity.deleteFailed', 500);
    }
  }

  /**
   * 根据地点获取活动列表（用于前端定位筛选）
   */
  @IgnoreLog()
  static async listByLocation(req: Request, res: Response) {
    try {
      const { location, page = 1, pageSize = 10 } = req.body;
      const language = req.locale;

      if (!location) {
        return res.responseBuilder.error('activity.locationRequired', 400);
      }

      const where: any = {
        status: StatusEnum.ENABLE,
        start_time: { [Op.gte]: new Date() }, // 只显示未来的活动
        location: { [Op.like]: `%${location}%` },
      };

      const { rows, count } = await Activity.findAndCountAll({
        where,
        include: [
          {
            model: ActivityTranslation,
            as: 'translations',
            where: { language },
            required: false,
          },
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['start_time', 'ASC']],
      });

      const pageInfo = getPageInfoConfig({
        count,
        page,
        pageSize,
      });

      return res.responseBuilder.success({
        list: rows,
        pageInfo,
      });
    } catch (error) {
      return res.responseBuilder.error('activity.listFailed', 500);
    }
  }
}
