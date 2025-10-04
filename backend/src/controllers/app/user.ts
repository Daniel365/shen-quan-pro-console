/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-04 00:00:00
 * @Description: App用户管理
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
// models
import { Role, User, UserInvite } from '@/models/app';
// utils
import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';
import { GenderEnum, StatusEnum } from '@/types/database';

export class UserController {
  /**
   * 根据角色UUID数组查询角色名称
   * @param roleUuids 角色UUID数组
   * @returns 角色名称字符串
   */
  private static async getRoleNames(roleUuids: string[]): Promise<string> {
    if (!roleUuids || roleUuids.length === 0) {
      return '';
    }

    const roles = await Role.findAll({
      where: { uuid: { [Op.in]: roleUuids } },
      attributes: ['name'],
    });

    return roles.map((role) => role.name).join(', ');
  }

  /**
   * 处理用户数据，添加角色名称等信息
   * @param userData 用户数据
   * @returns 处理后的用户数据
   */
  private static async processUserWithRoles(userData: any) {
    const roleUuids = userData.role_uuids || [];
    const roleNames = await this.getRoleNames(roleUuids);

    return {
      ...userData,
      role_uuids: roleUuids,
      role_name: roleNames,
    };
  }

  // 获取用户列表
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, [
        { field: 'nickname' },
        { field: 'phone' },
        { field: 'status' },
        { field: 'gender' },
        { field: 'invite_code' },
      ]);

      const { rows, count } = await User.findAndCountAll({
        where,
        ...defaultListQuery(reqBody),
      });

      // 处理角色数据，根据role_uuids数组查询对应的角色信息
      const processedRows = await Promise.all(
        rows.map(async (user) => {
          return await UserController.processUserWithRoles(user.toJSON());
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
  // 更新用户
  static async update(req: Request, res: Response) {
    try {
      const { uuid, nickname, role_uuids, status, gender } = req.body;

      // 处理undefined值，使用默认值
      const updateData: any = {
        nickname,
        role_uuids: role_uuids || [],
        status: status !== undefined ? status : StatusEnum.ENABLE, // 默认启用状态
        gender: gender !== undefined ? gender : GenderEnum.UNKNOWN, // 默认性别未知
      };

      await User.update(updateData, { where: { uuid } });

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

  /**
   * 通过用户UUID获取下级用户列表
   * @param req 请求对象
   * @param res 响应对象
   */
  @IgnoreLog()
  static async getChildrenByInviteCode(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const { inviter_uuid, level } = reqBody;

      // 验证必填参数
      if (!inviter_uuid) {
        return res.responseBuilder.error('user.uuidRequired', 400);
      }

      // 查询下级用户邀请记录
      const { inviteRows, count } = await UserController.queryChildrenInviteRecords(
        inviter_uuid,
        level,
        reqBody
      );

      // 如果查询结果为空，直接返回空列表
      if (count === 0) {
        return res.responseBuilder.success({
          list: [],
          pageInfo: getPageInfoConfig({ count: 0, ...reqBody }),
        });
      }

      // 处理用户数据，添加角色名称等信息
      const processedRows = await UserController.processUserData(inviteRows);

      // 过滤掉 null 值
      const filteredRows = processedRows.filter((row) => row !== null);

      const pageInfo = getPageInfoConfig({
        count,
        ...reqBody,
      });

      return res.responseBuilder.success({
        list: filteredRows,
        pageInfo,
      });
    } catch (error) {
      return res.responseBuilder.error('user.childrenListFailed', 500);
    }
  }

  /**
   * 查询下级用户邀请记录
   * @param userUuid 用户UUID
   * @param level 层级筛选
   * @param reqBody 请求参数
   * @returns 查询结果
   */
  private static async queryChildrenInviteRecords(
    inviterUuid: string,
    level: number | undefined,
    reqBody: any
  ) {
    // 构建查询条件：查询该用户作为邀请人的下级用户
    const where: any = { inviter_uuid: inviterUuid };

    // 如果指定了层级，则按层级查询
    if (level) {
      where.level = level;
    }

    // 查询下级邀请记录
    const result = await UserInvite.findAndCountAll({
      where,
      ...defaultListQuery(reqBody),
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'uuid',
            'nickname',
            'phone',
            'gender',
            'status',
            'last_login_at',
            'created_at',
            'updated_at',
            'role_uuids',
          ],
        },
      ],
    });

    return {
      inviteRows: result.rows,
      count: result.count,
    };
  }

  /**
   * 处理用户数据，添加角色名称等信息
   * @param inviteRows 邀请记录数组
   * @returns 处理后的用户数据数组
   */
  private static async processUserData(inviteRows: any[]) {
    return await Promise.all(
      inviteRows.map(async (invite) => {
        const userData = invite.user?.toJSON();
        if (!userData) {
          return null;
        }

        // 使用封装的公共方法处理角色信息
        const processedUser = await UserController.processUserWithRoles(userData);

        return {
          ...processedUser,
          level: invite.level,
        };
      })
    );
  }
}
