/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-04 00:00:00
 * @Description: App用户管理
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
// models
import { User, Role } from '@/models/app';
// utils
import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from '@/utils/database';
import { onParamsVerify, verifyRule } from '@/paramsVerify';

export class UserController {
  // 获取用户列表
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, [
        { field: 'nickname' },
        { field: 'phone' },
        { field: 'status' },
        { field: 'invite_code' },
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
      return res.responseBuilder.error('user.listFailed', 500);
    }
  }

  // 更新用户信息（角色、状态、邀请码）
  static async update(req: Request, res: Response) {
    try {
      const { uuid, role_uuids, status, invite_code } = req.body;

      const { isValid, messageKey } = onParamsVerify(req.body, verifyRule.updateUserRule);
      if (!isValid) {
        return res.responseBuilder.error(messageKey, 400);
      }

      // 验证角色是否存在
      if (role_uuids && role_uuids.length > 0) {
        const roles = await Role.findAll({
          where: { uuid: { [Op.in]: role_uuids } }
        });
        if (roles.length !== role_uuids.length) {
          return res.responseBuilder.error('role.notFound', 400);
        }
      }

      // 验证邀请码是否已存在
      if (invite_code) {
        const existingUser = await User.findOne({ 
          where: { invite_code } 
        });
        if (existingUser && existingUser.uuid !== uuid) {
          return res.responseBuilder.error('user.inviteCodeUsed', 400);
        }
      }

      const updateData: any = {};
      if (role_uuids !== undefined) updateData.role_uuids = role_uuids;
      if (status !== undefined) updateData.status = status;
      if (invite_code !== undefined) updateData.invite_code = invite_code;

      await User.update(updateData, { where: { uuid } });

      return res.responseBuilder.success({
        uuid,
        ...updateData,
      }, 'user.updateSuccess');
    } catch (error) {
      return res.responseBuilder.error('user.updateFailed', 500);
    }
  }

  // 批量更新用户信息
  static async batchUpdate(req: Request, res: Response) {
    try {
      const { user_list } = req.body;

      const { isValid, messageKey } = onParamsVerify(req.body, verifyRule.batchUpdateUserRule);
      if (!isValid) {
        return res.responseBuilder.error(messageKey, 400);
      }

      // 验证所有角色
      const allRoleUuids = user_list
        .map((user: any) => user.role_uuids || [])
        .flat()
        .filter(Boolean);
      
      if (allRoleUuids.length > 0) {
        const roles = await Role.findAll({
          where: { uuid: { [Op.in]: allRoleUuids } }
        });
        const existingRoleUuids = roles.map(role => role.uuid);
        const missingRoleUuids = allRoleUuids.filter((uuid: string) => !existingRoleUuids.includes(uuid));
        
        if (missingRoleUuids.length > 0) {
          return res.responseBuilder.error('role.batchNotFound', 400);
        }
      }

      // 验证所有邀请码
      const inviteCodes = user_list
        .map((user: any) => user.invite_code)
        .filter(Boolean);
      
      if (inviteCodes.length > 0) {
        const existingUsers = await User.findAll({
          where: { invite_code: { [Op.in]: inviteCodes } }
        });
        
        const existingCodes = existingUsers.map(user => user.invite_code);
        const conflictCodes = inviteCodes.filter((code: string) => existingCodes.includes(code));
        
        if (conflictCodes.length > 0) {
          return res.responseBuilder.error('user.batchInviteCodeUsed', 400);
        }
      }

      const updatePromises = user_list.map(async (user: any) => {
        const { uuid, role_uuids, status, invite_code } = user;
        
        const updateData: any = {};
        if (role_uuids !== undefined) updateData.role_uuids = role_uuids;
        if (status !== undefined) updateData.status = status;
        if (invite_code !== undefined) updateData.invite_code = invite_code;

        if (Object.keys(updateData).length > 0) {
          await User.update(updateData, { where: { uuid } });
        }
        
        return { uuid, ...updateData };
      });

      const results = await Promise.all(updatePromises);

      return res.responseBuilder.success({
        updated_users: results,
      }, 'user.batchUpdateSuccess');
    } catch (error) {
      return res.responseBuilder.error('user.batchUpdateFailed', 500);
    }
  }
}
