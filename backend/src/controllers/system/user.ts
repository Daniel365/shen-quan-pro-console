/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 22:29:56
 * @Description: 用户管理
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
// models
import { Role, User } from '@/models/system';
import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';

export class UserController {
  // 获取用户列表
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const { account_uuid } = req.accountInfo! || {};
      const where: any = buildWhereCondition(reqBody, [
        { field: 'username' },
        { field: 'email' },
        // { field: 'username', matchType: MatchTypeEnum.NE, queryValue: 'admin' },
        // 排除当前登录用户
        // { field: 'uuid', matchType: MatchTypeEnum.NE, queryValue: account_uuid },
      ]);

      const { rows, count } = await User.findAndCountAll({
        where,
        ...defaultListQuery(reqBody),
      });

      // 处理角色数据，根据role_uuids数组查询对应的角色信息
      const processedRows = await Promise.all(
        rows.map(async (user) => {
          const userData = user.toJSON();
          const roleUuids = userData.role_uuids || [];

          let roleNames = '';
          if (roleUuids.length > 0) {
            const roles = await Role.findAll({
              where: { uuid: { [Op.in]: roleUuids } },
              attributes: ['name'],
            });
            roleNames = roles.map((role) => role.name).join(', ');
          }

          return {
            ...userData,
            role_uuids: roleUuids.join(','),
            role_name: roleNames,
          };
        })
      );
      // 分页信息
      const pageInfo = getPageInfoConfig({
        count,
        ...reqBody,
      });

      return res.responseBuilder.success({
        list: processedRows,
        pageInfo,
      });
    } catch (error) {
      console.log('err', error);
      return res.responseBuilder.error('common.serverError', 500);
    }
  }

  // 更新用户
  static async update(req: Request, res: Response) {
    try {
      const { uuid, username, role_uuids, status } = req.body;

      await User.update({ username, role_uuids, status }, { where: { uuid } });

      return res.responseBuilder.success({ uuid }, 'user.updateSuccess');
    } catch (error) {
      return res.responseBuilder.error('user.updateFailed', 500);
    }
  }

  // 删除用户
  static async delete(req: Request, res: Response) {
    try {
      const { uuid } = req.body;
      await User.destroy({ where: { uuid } });
      return res.responseBuilder.success({ uuid }, 'user.deleteSuccess');
    } catch (error) {
      return res.responseBuilder.error('user.deleteFailed', 500);
    }
  }
}
