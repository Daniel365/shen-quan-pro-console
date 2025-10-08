/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-08 00:00:00
 * @Description: 会员卡管理
 */
import sequelize from '@/database';
import { Request, Response } from 'express';
// models
import { MembershipCard, MembershipCardTranslation } from '@/models/app';
// services
import { MembershipCardTranslationService } from '@/services/MembershipCardTranslationService';
// utils
import {
  buildWhereCondition,
  defaultExcludeQueryFields,
  defaultListQuery,
  getPageInfoConfig,
} from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';
import { DataTypeEnum, MatchTypeEnum, StatusEnum } from '@/enum';

export class MembershipCardController {
  /**
   * 获取会员卡列表
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
      ]);

      const { rows, count } = await MembershipCard.findAndCountAll({
        where,
        include: [
          {
            association: 'role',
            required: false,
          },
          {
            model: MembershipCardTranslation,
            as: 'translations',
            required: false,
            attributes: { exclude: [...defaultExcludeQueryFields, 'membership_card_uuid'] },
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
      return res.responseBuilder.error('membershipCard.listFailed', 500);
    }
  }

  /**
   * 创建或编辑会员卡
   */
  static async save(req: Request, res: Response) {
    const {
      uuid,
      code,
      role_uuid,
      price,
      duration_days,
      sort,
      status,
      location,
      translations = [],
    } = req.body;
    const isEdit = !!uuid;

    try {
      // 验证翻译数据
      const validationError = MembershipCardTranslationService.validateTranslations(
        translations,
        isEdit
      );

      if (validationError) {
        return res.responseBuilder.error(validationError, 400);
      }

      if (isEdit) {
        // 编辑模式：验证会员卡是否存在
        const card = await MembershipCard.findOne({ where: { uuid } });
        if (!card) {
          return res.responseBuilder.error('membershipCard.notFound', 404);
        }
      }

      const transaction = await sequelize.transaction();

      try {
        let card;
        const formData = {
          code,
          role_uuid,
          price,
          duration_days,
          sort,
          status,
          location,
        };

        if (isEdit) {
          // 编辑模式：更新会员卡主记录
          await MembershipCard.update(formData, {
            where: { uuid },
            transaction,
          });

          card = { uuid };
          // 统一处理翻译记录
          await MembershipCardTranslationService.saveTranslations(
            translations,
            transaction,
            card.uuid,
            true
          );
        } else {
          // 创建模式：创建会员卡主记录
          card = await MembershipCard.create(formData, { transaction });

          // 统一处理翻译记录
          await MembershipCardTranslationService.saveTranslations(
            translations,
            transaction,
            card.uuid,
            false
          );
        }

        await transaction.commit();

        const message = isEdit ? 'membershipCard.updateSuccess' : 'membershipCard.createSuccess';
        return res.responseBuilder.success({ uuid: card.uuid }, message);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.log(`save->`, error);
      const message = isEdit ? 'membershipCard.updateFailed' : 'membershipCard.createFailed';
      return res.responseBuilder.error(message, 500);
    }
  }

  /**
   * 创建会员卡
   */
  static async create(req: Request, res: Response) {
    // 删除请求体中的uuid，确保创建模式
    const body = { ...req.body };
    delete body.uuid;
    req.body = body;

    return MembershipCardController.save(req, res);
  }

  /**
   * 编辑会员卡
   */
  static async update(req: Request, res: Response) {
    return MembershipCardController.save(req, res);
  }

  /**
   * 删除会员卡
   */
  static async delete(req: Request, res: Response) {
    try {
      const { uuid } = req.body;

      if (!uuid) {
        return res.responseBuilder.error('membershipCard.uuidRequired', 400);
      }

      // 验证会员卡是否存在
      const card = await MembershipCard.findOne({ where: { uuid } });
      if (!card) {
        return res.responseBuilder.error('membershipCard.notFound', 404);
      }

      const transaction = await sequelize.transaction();

      try {
        // 删除会员卡翻译记录
        await MembershipCardTranslation.destroy({
          where: { membership_card_uuid: uuid },
          transaction,
        });

        // 删除会员卡主记录
        await MembershipCard.destroy({
          where: { uuid },
          transaction,
        });

        await transaction.commit();

        return res.responseBuilder.success({ uuid }, 'membershipCard.deleteSuccess');
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.log(`delete->`, error);
      return res.responseBuilder.error('membershipCard.deleteFailed', 500);
    }
  }

  /**
   * 上架/下架会员卡
   */
  static async toggleStatus(req: Request, res: Response) {
    try {
      const { uuid, status } = req.body;

      if (!uuid) {
        return res.responseBuilder.error('membershipCard.uuidRequired', 400);
      }

      if (status !== StatusEnum.ENABLE && status !== StatusEnum.DISABLE) {
        return res.responseBuilder.error('membershipCard.invalidStatus');
      }

      await MembershipCard.update({ status }, { where: { uuid } });

      return res.responseBuilder.success({}, 'membershipCard.toggleStatusSuccess');
    } catch (error) {
      return res.responseBuilder.error('membershipCard.updateFailed', 500);
    }
  }

  /**
   * 批量更新排序
   */
  static async updateSort(req: Request, res: Response) {
    try {
      const { uuids } = req.body;

      if (!Array.isArray(uuids) || uuids.length === 0) {
        return res.responseBuilder.error('membershipCard.validationError', 400);
      }

      await MembershipCard.sequelize!.transaction(async (transaction) => {
        for (let i = 0; i < uuids.length; i++) {
          await MembershipCard.update(
            { sort: i + 1 },
            {
              where: { uuid: uuids[i] },
              transaction,
            }
          );
        }
      });

      return res.responseBuilder.success({}, 'membershipCard.sortUpdateSuccess');
    } catch (error) {
      return res.responseBuilder.error('membershipCard.updateFailed', 500);
    }
  }

  /**
   * 获取会员卡详情
   */
  @IgnoreLog()
  static async details(req: Request, res: Response) {
    try {
      const { uuid } = req.query as any;

      if (!uuid) {
        return res.responseBuilder.error('membershipCard.uuidRequired', 400);
      }

      const membershipCard = await MembershipCard.findOne({
        where: { uuid },
        include: [
          {
            model: MembershipCardTranslation,
            as: 'translations',
            required: false,
            attributes: { exclude: [...defaultExcludeQueryFields, 'membership_card_uuid'] },
          },
        ],
      });

      if (!membershipCard) {
        return res.responseBuilder.error('membershipCard.notFound', 404);
      }

      return res.responseBuilder.success(membershipCard);
    } catch (error) {
      return res.responseBuilder.error('membershipCard.detailFailed', 500);
    }
  }
}
