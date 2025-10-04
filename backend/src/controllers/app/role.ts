/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-04 13:05:24
 * @Description: 角色 - 控制器
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Role } from '@/models/app';

import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from '@/utils/database';
import { DataTypeEnum, MatchTypeEnum } from '@/types/database';
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
      return res.responseBuilder.error('common.serverError', 500);
    }
  }

  // 创建角色
  static async create(req: Request, res: Response) {
    try {
      const { name, code, description } = req.body;

      // 检查角色名称是否已存在
      const existingName = await Role.findOne({ where: { name } });
      if (existingName) {
        return res.responseBuilder.error('role.nameExists');
      }

      // 检查角色编码是否已存在
      const existingCode = await Role.findOne({ where: { code } });
      if (existingCode) {
        return res.responseBuilder.error('role.codeExists');
      }

      const role = await Role.create({
        name,
        code,
        description,
      });

      return res.responseBuilder.created({ uuid: role.uuid }, 'role.createSuccess');
    } catch (error) {
      return res.responseBuilder.error('role.createFailed', 500);
    }
  }

  // 更新角色
  static async update(req: Request, res: Response) {
    try {
      const { uuid, name, code, description, status } = req.body;

      // 检查角色名称是否已存在（排除当前角色）
      if (name) {
        const existingName = await Role.findOne({ where: { name, uuid: { [Op.ne]: uuid } } });
        if (existingName) {
          return res.responseBuilder.error('role.nameExists');
        }
      }

      // 检查角色编码是否已存在（排除当前角色）
      if (code) {
        const existingCode = await Role.findOne({ where: { code, uuid: { [Op.ne]: uuid } } });
        if (existingCode) {
          return res.responseBuilder.error('role.codeExists');
        }
      }

      await Role.update({ name, code, description, status }, { where: { uuid } });

      return res.responseBuilder.success({}, 'role.updateSuccess');
    } catch (error) {
      return res.responseBuilder.error('role.updateFailed', 500);
    }
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

  // 删除角色
  static async delete(req: Request, res: Response) {
    try {
      const { uuid } = req.body;
      await Role.destroy({ where: { uuid } });
      return res.responseBuilder.success({ uuid }, 'role.deleteSuccess');
    } catch (error) {
      return res.responseBuilder.error('role.deleteFailed', 500);
    }
  }
}
