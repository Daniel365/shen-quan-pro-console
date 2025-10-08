/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 活动翻译服务
 */
import { ActivityTranslation } from '@/models/app';

/**
 * 活动翻译服务类
 */
export class ActivityTranslationService {
  /**
   * 统一验证翻译数据
   */
  static validateTranslations(translations: any[], isEdit: boolean = false): string | null {
    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return 'activity.translationsRequired';
    }

    for (const trans of translations) {
      if (!trans.title || !trans.title.trim()) {
        return 'activity.titleRequired';
      }

      if (isEdit) {
        // 编辑模式下：
        // - 有uuid的记录需要验证uuid
        // - 没有uuid的记录需要验证language（表示是新添加的记录）
        if (trans.uuid) {
          // 有uuid的现有记录，需要验证uuid格式
          if (typeof trans.uuid !== 'string' || !trans.uuid) {
            return 'activity.uuidRequired';
          }
        } else {
          // 没有uuid的新记录，需要验证language
          if (!trans.language) {
            return 'activity.languageRequired';
          }
        }
      } else {
        // 创建模式需要language
        if (!trans.language) {
          return 'activity.languageRequired';
        }
      }
    }

    return null;
  }

  /**
   * 统一处理翻译记录（创建和更新）
   */
  static async saveTranslations(
    translations: any[],
    transaction: any,
    activity_uuid: string,
    isEdit: boolean = false
  ): Promise<void> {
    if (!translations || translations.length === 0) {
      // 如果传入的翻译数组为空，则不进行任何操作
      return;
    }

    if (!activity_uuid) {
      throw new Error('activity_uuid is required for saving translations');
    }

    if (isEdit) {
      // 编辑模式：需要处理删除、更新和创建
      const existingTranslations = await ActivityTranslation.findAll({
        where: { activity_uuid },
        transaction,
      });

      // 提取传入翻译的UUID集合
      const incomingUuids = new Set(translations.map((trans) => trans.uuid).filter(Boolean));

      // 删除不再存在的翻译记录
      const translationsToDelete = existingTranslations.filter(
        (existing) => !incomingUuids.has(existing.uuid)
      );

      if (translationsToDelete.length > 0) {
        await ActivityTranslation.destroy({
          where: {
            uuid: translationsToDelete.map((trans) => trans.uuid),
          },
          transaction,
        });
      }

      // 批量更新或创建翻译记录
      for (const trans of translations) {
        if (trans.uuid) {
          // 更新现有记录
          await ActivityTranslation.update(
            {
              title: trans.title,
              description: trans.description || '',
              cover_images: trans.cover_images || [],
            },
            {
              where: { uuid: trans.uuid },
              transaction,
            }
          );
        } else {
          // 创建新记录
          await ActivityTranslation.create(
            {
              activity_uuid,
              language: trans.language,
              title: trans.title,
              description: trans.description || '',
              cover_images: trans.cover_images || [],
            },
            { transaction }
          );
        }
      }
    } else {
      // 创建模式：直接批量创建
      const translationData = translations.map((trans: any) => ({
        activity_uuid,
        language: trans.language,
        title: trans.title,
        description: trans.description || '',
        cover_images: trans.cover_images || [],
      }));

      await ActivityTranslation.bulkCreate(translationData, { transaction });
    }
  }

  /**
   * 根据活动UUID和语言获取翻译记录
   */
  static async getTranslationsByActivityAndLanguage(
    activity_uuid: string,
    language: string
  ): Promise<ActivityTranslation | null> {
    return await ActivityTranslation.findOne({
      where: {
        activity_uuid,
        language,
      },
    });
  }

  /**
   * 根据活动UUID获取所有翻译记录
   */
  static async getTranslationsByActivity(activity_uuid: string): Promise<ActivityTranslation[]> {
    return await ActivityTranslation.findAll({
      where: {
        activity_uuid,
      },
    });
  }

  /**
   * 删除指定活动的所有翻译记录
   */
  static async deleteTranslationsByActivity(
    activity_uuid: string,
    transaction: any
  ): Promise<void> {
    await ActivityTranslation.destroy({
      where: { activity_uuid },
      transaction,
    });
  }

  /**
   * 删除指定语言的翻译记录
   */
  static async deleteTranslationByLanguage(
    activity_uuid: string,
    language: string,
    transaction: any
  ): Promise<void> {
    await ActivityTranslation.destroy({
      where: {
        activity_uuid,
        language,
      },
      transaction,
    });
  }
}

export default ActivityTranslationService;
