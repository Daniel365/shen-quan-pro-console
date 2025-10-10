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
import { DataTypeEnum, MatchTypeEnum, TagTypeEnum } from '@/enum';

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
}
