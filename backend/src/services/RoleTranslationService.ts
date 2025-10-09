/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-09 00:00:00
 * @Description: 角色翻译服务
 */
import { RoleTranslation } from '@/models/app';

/**
 * 角色翻译服务类
 */
export class RoleTranslationService {
  /**
   * 统一验证翻译数据
   */
  static validateTranslations(translations: any[], isEdit: boolean = false): string | null {
    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return 'role.translationsRequired';
    }

    for (const trans of translations) {
      if (!trans.name || !trans.name.trim()) {
        return 'role.nameRequired';
      }

      if (isEdit) {
        // 编辑模式下：
        // - 有uuid的记录需要验证uuid
        // - 没有uuid的记录需要验证language（表示是新添加的记录）
        if (trans.uuid) {
          // 有uuid的现有记录，需要验证uuid格式
          if (typeof trans.uuid !== 'string' || !trans.uuid) {
            return 'role.uuidRequired';
          }
        } else {
          // 没有uuid的新记录，需要验证language
          if (!trans.language) {
            return 'role.languageRequired';
          }
        }
      } else {
        // 创建模式需要language
        if (!trans.language) {
          return 'role.languageRequired';
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
    role_uuid: string,
    isEdit: boolean = false
  ): Promise<void> {
    if (!translations || translations.length === 0) {
      // 如果传入的翻译数组为空，则不进行任何操作
      return;
    }

    if (!role_uuid) {
      throw new Error('role_uuid is required for saving translations');
    }

    if (isEdit) {
      // 编辑模式：需要处理删除、更新和创建
      const existingTranslations = await RoleTranslation.findAll({
        where: { role_uuid },
        transaction,
      });

      // 提取传入翻译的UUID集合
      const incomingUuids = new Set(translations.map((trans) => trans.uuid).filter(Boolean));

      // 删除不再存在的翻译记录
      const translationsToDelete = existingTranslations.filter(
        (existing) => !incomingUuids.has(existing.uuid)
      );

      if (translationsToDelete.length > 0) {
        await RoleTranslation.destroy({
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
          await RoleTranslation.update(
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
          await RoleTranslation.create(
            {
              role_uuid,
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
        role_uuid,
        language: trans.language,
        name: trans.name,
        description: trans.description || '',
      }));

      await RoleTranslation.bulkCreate(translationData, { transaction });
    }
  }

  /**
   * 根据角色UUID和语言获取翻译记录
   */
  static async getTranslationsByRoleAndLanguage(
    role_uuid: string,
    language: string
  ): Promise<RoleTranslation | null> {
    return await RoleTranslation.findOne({
      where: {
        role_uuid,
        language,
      },
    });
  }

  /**
   * 根据角色UUID获取所有翻译记录
   */
  static async getTranslationsByRole(role_uuid: string): Promise<RoleTranslation[]> {
    return await RoleTranslation.findAll({
      where: {
        role_uuid,
      },
    });
  }

  /**
   * 删除指定角色的所有翻译记录
   */
  static async deleteTranslationsByRole(role_uuid: string, transaction: any): Promise<void> {
    await RoleTranslation.destroy({
      where: { role_uuid },
      transaction,
    });
  }

  /**
   * 删除指定语言的翻译记录
   */
  static async deleteTranslationByLanguage(
    role_uuid: string,
    language: string,
    transaction: any
  ): Promise<void> {
    await RoleTranslation.destroy({
      where: {
        role_uuid,
        language,
      },
      transaction,
    });
  }
}

export default RoleTranslationService;
