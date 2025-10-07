/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 标签管理
 */
import sequelize from '@/database';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
// models
import { Activity, Tag, TagTranslation, UserTag } from '@/models/app';
// services
import { TagTranslationService } from '@/services/TagTranslationService';
// utils
import {
  buildWhereCondition,
  defaultExcludeQueryFields,
  defaultListQuery,
  getPageInfoConfig,
} from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';
import { DataTypeEnum, MatchTypeEnum, TagTypeEnum } from '@/types/database';

export class TagController {
  /**
   * 获取标签列表
   */
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, [
        {
          field: 'status',
          dataType: DataTypeEnum.NUMBER,
          matchType: MatchTypeEnum.EXACT,
        },
        {
          field: 'type',
          dataType: DataTypeEnum.NUMBER,
          matchType: MatchTypeEnum.EXACT,
        },
      ]);

      const { rows, count } = await Tag.findAndCountAll({
        where,
        include: [
          {
            model: TagTranslation,
            as: 'tag_translations',
            required: false,
            attributes: { exclude: [...defaultExcludeQueryFields, 'tag_uuid'] },
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
      return res.responseBuilder.error('tag.listFailed', 500);
    }
  }

  /**
   * 创建或编辑标签
   */
  static async save(req: Request, res: Response) {
    const { tag_uuid, type = TagTypeEnum.ACTIVITY, status, tag_translations = [] } = req.body;
    const isEdit = !!tag_uuid;
    try {
      // 验证翻译数据
      const validationError = TagTranslationService.validateTranslations(tag_translations, isEdit);

      if (validationError) {
        return res.responseBuilder.error(validationError, 400);
      }

      if (isEdit) {
        // 编辑模式：验证标签是否存在
        const tag = await Tag.findOne({ where: { uuid: tag_uuid } });
        if (!tag) {
          return res.responseBuilder.error('tag.notFound', 404);
        }
      }

      const transaction = await sequelize.transaction();

      try {
        let tag;
        const formData = {
          type,
          status,
        };
        if (isEdit) {
          // 编辑模式：更新标签主记录
          if (type !== undefined) {
            await Tag.update(formData, {
              where: { uuid: tag_uuid },
              transaction,
            });
          }

          tag = { uuid: tag_uuid };
          // 统一处理翻译记录
          await TagTranslationService.saveTranslations(tag_translations, transaction, tag.uuid, true);
        } else {
          // 创建模式：创建标签主记录
          tag = await Tag.create(formData, { transaction });

          // 统一处理翻译记录
          await TagTranslationService.saveTranslations(tag_translations, transaction, tag.uuid, false);
        }

        await transaction.commit();

        const message = isEdit ? 'tag.updateSuccess' : 'tag.createSuccess';
        return res.responseBuilder.success({ uuid: tag.uuid }, message);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.log(`save->`, error);
      const message = isEdit ? 'tag.updateFailed' : 'tag.createFailed';
      return res.responseBuilder.error(message, 500);
    }
  }

  /**
   * 创建标签
   */
  static async create(req: Request, res: Response) {
    // 删除请求体中的tagUuid，确保创建模式
    const body = { ...req.body };
    delete body.tag_uuid;
    req.body = body;

    return TagController.save(req, res);
  }

  /**
   * 编辑标签
   */
  static async update(req: Request, res: Response) {
    return TagController.save(req, res);
  }

  /**
   * 批量删除标签
   */
  static async delete(req: Request, res: Response) {
    try {
      const { tag_uuids } = req.body;

      if (!tag_uuids || !Array.isArray(tag_uuids) || tag_uuids.length === 0) {
        return res.responseBuilder.error('tag.uuidsRequired', 400);
      }

      // 验证标签是否存在
      const tags = await Tag.findAll({ 
        where: { uuid: { [Op.in]: tag_uuids } } 
      });
      
      if (tags.length !== tag_uuids.length) {
        return res.responseBuilder.error('tag.someNotFound', 404);
      }

      const transaction = await sequelize.transaction();

      try {
        // 检查是否有活动使用这些标签
        const activitiesWithTags = await Activity.findAll({
          where: {
            tags: { [Op.overlap]: tag_uuids },
          },
          transaction,
        });

        // 检查是否有用户使用这些标签
        const userTags = await UserTag.findAll({
          where: { tag_uuid: { [Op.in]: tag_uuids } },
          transaction,
        });

        // 如果有任何标签被使用，不允许删除
        if (activitiesWithTags.length > 0 || userTags.length > 0) {
          await transaction.rollback();
          return res.responseBuilder.error('tag.isInUse', 400);
        }

        // 批量删除标签翻译记录
        await TagTranslation.destroy({
          where: { tag_uuid: { [Op.in]: tag_uuids } },
          transaction,
        });

        // 批量删除标签主记录
        await Tag.destroy({
          where: { uuid: { [Op.in]: tag_uuids } },
          transaction,
        });

        await transaction.commit();

        return res.responseBuilder.success({ deleted_uuids: tag_uuids }, 'tag.deleteSuccess');
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.log(`delete->`, error);
      return res.responseBuilder.error('tag.deleteFailed', 500);
    }
  }

  /**
   * 给活动添加标签
   */
  static async addToActivity(req: Request, res: Response) {
    try {
      const { activity_uuid, tag_ids } = req.body;

      if (!activity_uuid || !tag_ids || !Array.isArray(tag_ids)) {
        return res.responseBuilder.error('tag.requiredFields', 400);
      }

      // 验证活动是否存在
      const activity = await Activity.findOne({ where: { uuid: activity_uuid } });
      if (!activity) {
        return res.responseBuilder.error('activity.notFound', 404);
      }

      // 验证标签是否存在
      const tags = await Tag.findAll({
        where: { uuid: { [Op.in]: tag_ids } },
      });
      if (tags.length !== tag_ids.length) {
        return res.responseBuilder.error('tag.someNotFound', 404);
      }

      // 获取活动当前标签
      const currentTags = activity.tags || [];

      // 添加新标签
      const newTags = [...new Set([...currentTags, ...tag_ids])];

      // 更新活动标签
      await Activity.update({ tags: newTags }, { where: { uuid: activity_uuid } });

      return res.responseBuilder.success(
        {
          activity_uuid,
          added_tags: tag_ids,
        },
        'tag.addToActivitySuccess'
      );
    } catch (error) {
      return res.responseBuilder.error('tag.addToActivityFailed', 500);
    }
  }

  /**
   * 从活动移除标签
   */
  static async removeFromActivity(req: Request, res: Response) {
    try {
      const { activity_uuid, tag_ids } = req.body;

      if (!activity_uuid || !tag_ids || !Array.isArray(tag_ids)) {
        return res.responseBuilder.error('tag.requiredFields', 400);
      }

      // 验证活动是否存在
      const activity = await Activity.findOne({ where: { uuid: activity_uuid } });
      if (!activity) {
        return res.responseBuilder.error('activity.notFound', 404);
      }

      // 获取活动当前标签
      const currentTags = activity.tags || [];

      // 移除指定标签
      const newTags = currentTags.filter((tagId: string) => !tag_ids.includes(tagId));

      // 更新活动标签
      await Activity.update({ tags: newTags }, { where: { uuid: activity_uuid } });

      return res.responseBuilder.success(
        {
          activity_uuid,
          removed_tags: tag_ids,
        },
        'tag.removeFromActivitySuccess'
      );
    } catch (error) {
      return res.responseBuilder.error('tag.removeFromActivityFailed', 500);
    }
  }

  /**
   * 给用户添加标签
   */
  static async addToUser(req: Request, res: Response) {
    try {
      const { user_uuid, tag_ids } = req.body;

      if (!user_uuid || !tag_ids || !Array.isArray(tag_ids)) {
        return res.responseBuilder.error('tag.requiredFields', 400);
      }

      // 验证标签是否存在且类型为用户标签
      const tags = await Tag.findAll({
        where: {
          uuid: { [Op.in]: tag_ids },
          type: TagTypeEnum.USER,
        },
      });
      if (tags.length !== tag_ids.length) {
        return res.responseBuilder.error('tag.someNotFoundOrInvalidType', 404);
      }

      // 批量创建用户标签关联
      const userTags = tag_ids.map((tag_uuid) => ({
        user_uuid,
        tag_uuid,
      }));

      await UserTag.bulkCreate(userTags, {
        ignoreDuplicates: true, // 忽略重复记录
      });

      return res.responseBuilder.success(
        {
          user_uuid,
          added_tags: tag_ids,
        },
        'tag.addToUserSuccess'
      );
    } catch (error) {
      return res.responseBuilder.error('tag.addToUserFailed', 500);
    }
  }

  /**
   * 从用户移除标签
   */
  static async removeFromUser(req: Request, res: Response) {
    try {
      const { user_uuid, tag_ids } = req.body;

      if (!user_uuid || !tag_ids || !Array.isArray(tag_ids)) {
        return res.responseBuilder.error('tag.requiredFields', 400);
      }

      // 删除用户标签关联
      await UserTag.destroy({
        where: {
          user_uuid,
          tag_uuid: { [Op.in]: tag_ids },
        },
      });

      return res.responseBuilder.success(
        {
          user_uuid,
          removed_tags: tag_ids,
        },
        'tag.removeFromUserSuccess'
      );
    } catch (error) {
      return res.responseBuilder.error('tag.removeFromUserFailed', 500);
    }
  }

  /**
   * 获取用户标签
   */
  @IgnoreLog()
  static async getUserTags(req: Request, res: Response) {
    try {
      const { user_uuid } = req.body;

      if (!user_uuid) {
        return res.responseBuilder.error('user.uuidRequired', 400);
      }

      const userTags = await UserTag.findAll({
        where: { user_uuid },
        include: [
          {
            model: Tag,
            as: 'tag',
            attributes: ['uuid', 'type'],
            include: [
              {
                model: TagTranslation,
                as: 'tagTranslations',
                attributes: ['name', 'description'],
              },
            ],
          },
        ],
      });

      const tags = userTags.map((userTag) => (userTag as any).tag);

      return res.responseBuilder.success({
        user_uuid,
        tags,
      });
    } catch (error) {
      return res.responseBuilder.error('tag.getUserTagsFailed', 500);
    }
  }

  /**
   * 获取活动标签
   */
  @IgnoreLog()
  static async getActivityTags(req: Request, res: Response) {
    try {
      const { activity_uuid } = req.body;

      if (!activity_uuid) {
        return res.responseBuilder.error('activity.uuidRequired', 400);
      }

      const activity = await Activity.findOne({
        where: { uuid: activity_uuid },
        attributes: ['tags'],
      });

      if (!activity) {
        return res.responseBuilder.error('activity.notFound', 404);
      }

      const tags = await Tag.findAll({
        where: { uuid: { [Op.in]: (activity as any).tags || [] } },
        include: [
          {
            model: TagTranslation,
            as: 'tagTranslations',
            attributes: ['name', 'description'],
          },
        ],
      });

      return res.responseBuilder.success({
        activity_uuid,
        tags,
      });
    } catch (error) {
      return res.responseBuilder.error('tag.getActivityTagsFailed', 500);
    }
  }
}
