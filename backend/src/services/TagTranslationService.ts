/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 标签翻译服务
 */
import { TagTranslation } from '@/models/app';

/**
 * 标签翻译服务类
 */
export class TagTranslationService {
  /**
   * 统一验证翻译数据
   */
  static validateTranslations(translations: any[], isEdit: boolean = false): string | null {
    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return 'tag.translationsRequired';
    }

    for (const trans of translations) {
      if (!trans.name || !trans.name.trim()) {
        return 'tag.nameRequired';
      }

      if (isEdit) {
        // 编辑模式下：
        // - 有uuid的记录需要验证uuid
        // - 没有uuid的记录需要验证language（表示是新添加的记录）
        if (trans.uuid) {
          // 有uuid的现有记录，需要验证uuid格式
          if (typeof trans.uuid !== 'string' || !trans.uuid) {
            return 'tag.uuidRequired';
          }
        } else {
          // 没有uuid的新记录，需要验证language
          if (!trans.language || !trans.language) {
            return 'tag.languageRequired';
          }
        }
      } else {
        // 创建模式需要language
        if (!trans.language || !trans.language) {
          return 'tag.languageRequired';
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
    tag_uuid: string,
    isEdit: boolean = false
  ): Promise<void> {
    if (!translations || translations.length === 0) {
      // 如果传入的翻译数组为空，则不进行任何操作
      return;
    }

    if (!tag_uuid) {
      throw new Error('tag_uuid is required for saving translations');
    }

    if (isEdit) {
      // 编辑模式：需要处理删除、更新和创建
      const existingTranslations = await TagTranslation.findAll({
        where: { tag_uuid },
        transaction,
      });

      // 提取传入翻译的UUID集合
      const incomingUuids = new Set(translations.map((trans) => trans.uuid).filter(Boolean));

      // 删除不再存在的翻译记录
      const translationsToDelete = existingTranslations.filter(
        (existing) => !incomingUuids.has(existing.uuid)
      );

      if (translationsToDelete.length > 0) {
        await TagTranslation.destroy({
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
          await TagTranslation.update(
            {
              name: trans.name,
              description: trans.description || '',
            },
            {
              where: { uuid: trans.uuid },
              transaction,
            }
          );
        } else {
          // 创建新记录
          await TagTranslation.create(
            {
              tag_uuid,
              language: trans.language,
              name: trans.name,
              description: trans.description || '',
            },
            { transaction }
          );
        }
      }
    } else {
      // 创建模式：直接批量创建
      const translationData = translations.map((trans: any) => ({
        tag_uuid,
        language: trans.language,
        name: trans.name,
        description: trans.description || '',
      }));

      await TagTranslation.bulkCreate(translationData, { transaction });
    }
  }

  /**
   * 批量更新翻译记录（向后兼容）
   */
  static async updateTranslations(
    translations: any[],
    transaction: any,
    tag_uuid: string
  ): Promise<void> {
    return this.saveTranslations(translations, transaction, tag_uuid, true);
  }

  /**
   * 批量创建翻译记录（向后兼容）
   */
  static async createTranslations(
    translations: any[],
    transaction: any,
    tag_uuid: string
  ): Promise<void> {
    return this.saveTranslations(translations, transaction, tag_uuid, false);
  }

  /**
   * 根据标签UUID和语言获取翻译记录
   */
  static async getTranslationsByTagAndLanguage(
    tag_uuid: string,
    language: string
  ): Promise<TagTranslation | null> {
    return await TagTranslation.findOne({
      where: {
        tag_uuid,
        language,
      },
    });
  }

  /**
   * 根据标签UUID获取所有翻译记录
   */
  static async getTranslationsByTag(tag_uuid: string): Promise<TagTranslation[]> {
    return await TagTranslation.findAll({
      where: {
        tag_uuid,
      },
    });
  }

  /**
   * 删除指定标签的所有翻译记录
   */
  static async deleteTranslationsByTag(tag_uuid: string, transaction: any): Promise<void> {
    await TagTranslation.destroy({
      where: { tag_uuid },
      transaction,
    });
  }

  /**
   * 删除指定语言的翻译记录
   */
  static async deleteTranslationByLanguage(
    tag_uuid: string,
    language: string,
    transaction: any
  ): Promise<void> {
    await TagTranslation.destroy({
      where: {
        tag_uuid,
        language,
      },
      transaction,
    });
  }
}

export default TagTranslationService;
