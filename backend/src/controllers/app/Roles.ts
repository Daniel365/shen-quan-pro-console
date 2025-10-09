/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-04 13:05:24
 * @Description: 角色 - 控制器
 */
import sequelize from '@/database';
import { Role, RoleTranslation } from '@/models/app';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
// services
import { RoleTranslationService } from '@/services/RoleTranslationService';
import { DataTypeEnum, MatchTypeEnum } from '@/enum';
import { buildWhereCondition, defaultExcludeQueryFields, defaultListQuery, getPageInfoConfig } from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';

export class RoleController {
  // 获取角色列表
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, [
        { field: 'name' },
        {
          field: 'status',
          dataType: DataTypeEnum.NUMBER,
          matchType: MatchTypeEnum.EXACT,
        },
      ]);

      const { rows, count } = await Role.findAndCountAll({
        where,
        include: [
          {
            model: RoleTranslation,
            as: 'role_translations',
            required: false,
            attributes: { exclude: [...defaultExcludeQueryFields, 'role_uuid'] },
          },
        ],
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
      console.log("role-list=>", error)
      return res.responseBuilder.error('common.serverError', 500);
    }
  }

  /**
   * 创建或编辑角色
   */
  static async save(req: Request, res: Response) {
    const { uuid, code, profit_ratio, status, menu_ids = [], role_translations = [] } = req.body;
    const isEdit = !!uuid;
    
    try {
      // 验证必填字段
      if (!code) {
        return res.responseBuilder.error('role.codeRequired', 400);
      }

      // 验证翻译数据
      const validationError = RoleTranslationService.validateTranslations(role_translations, isEdit);
      if (validationError) {
        return res.responseBuilder.error(validationError, 400);
      }

      // 检查角色编码是否已存在（排除当前角色）
      const existingCode = await Role.findOne({ 
        where: { 
          code, 
          uuid: isEdit ? { [Op.ne]: uuid } : { [Op.ne]: null } 
        } 
      });
      if (existingCode) {
        return res.responseBuilder.error('role.codeExists');
      }

      if (isEdit) {
        // 编辑模式：验证角色是否存在
        const role = await Role.findOne({ where: { uuid } });
        if (!role) {
          return res.responseBuilder.error('role.notFound', 404);
        }
      }

      const transaction = await sequelize.transaction();

      try {
        let role;
        const formData = {
          code,
          profit_ratio,
          status,
          menu_ids,
        };
        
        if (isEdit) {
          // 编辑模式：更新角色主记录
          await Role.update(formData, {
            where: { uuid },
            transaction,
          });
          
          role = { uuid };
          
          // 统一处理翻译记录
          await RoleTranslationService.saveTranslations(role_translations, transaction, role.uuid, true);
        } else {
          // 创建模式：创建角色主记录
          role = await Role.create(formData, { transaction });
          
          // 统一处理翻译记录
          await RoleTranslationService.saveTranslations(role_translations, transaction, role.uuid, false);
        }

        await transaction.commit();

        const message = isEdit ? 'role.updateSuccess' : 'role.createSuccess';
        return res.responseBuilder.success({ uuid: role.uuid }, message);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.log(`save->`, error);
      const message = isEdit ? 'role.updateFailed' : 'role.createFailed';
      return res.responseBuilder.error(message, 500);
    }
  }

  /**
   * 创建角色
   */
  static async create(req: Request, res: Response) {
    // 删除请求体中的uuid，确保创建模式
    const body = { ...req.body };
    delete body.uuid;
    req.body = body;

    return RoleController.save(req, res);
  }

  /**
   * 编辑角色
   */
  static async update(req: Request, res: Response) {
    return RoleController.save(req, res);
  }

  // 分配角色权限
  static async assignPerm(req: Request, res: Response) {
    try {
      const { uuid, menu_ids } = req.body;

      await Role.update({ menu_ids }, { where: { uuid } });

      return res.responseBuilder.success({}, 'role.assignPermSuccess');
    } catch (error) {
      return res.responseBuilder.error('role.assignPermFailed', 500);
    }
  }

  /**
   * 批量删除角色
   */
  static async delete(req: Request, res: Response) {
    try {
      const { role_uuids } = req.body;

      if (!role_uuids || !Array.isArray(role_uuids) || role_uuids.length === 0) {
        return res.responseBuilder.error('role.uuidsRequired', 400);
      }

      // 验证角色是否存在
      const roles = await Role.findAll({ 
        where: { uuid: { [Op.in]: role_uuids } } 
      });
      
      if (roles.length !== role_uuids.length) {
        return res.responseBuilder.error('role.someNotFound', 404);
      }

      const transaction = await sequelize.transaction();

      try {
        // 批量删除角色翻译记录（使用服务层）
        for (const role_uuid of role_uuids) {
          await RoleTranslationService.deleteTranslationsByRole(role_uuid, transaction);
        }

        // 批量删除角色主记录
        await Role.destroy({
          where: { uuid: { [Op.in]: role_uuids } },
          transaction,
        });

        await transaction.commit();

        return res.responseBuilder.success({ deleted_uuids: role_uuids }, 'role.deleteSuccess');
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.log(`delete->`, error);
      return res.responseBuilder.error('role.deleteFailed', 500);
    }
  }
}
