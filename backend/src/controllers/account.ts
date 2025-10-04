/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-06 15:03:12
 * @Description: 注册、登录、忘记密码， 账号相关处理逻辑
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import { emailService } from '@/config/email';
import { User, Role, Menu } from '@/models/system';
// utils
import { buildRouterTree } from '@/utils/menu';
import { onParamsVerify, verifyRule } from '@/paramsVerify';
import { onPattern, RegexPatterns } from '@/utils/regexPatterns';
import { JwtUtils } from '@/utils/jwt';
// type
import { StatusEnum } from '@/types/database';
import { EmailVerificationType } from '@/types/email';

export class AccountController {
  // 注册
  static async register(req: Request, res: Response) {
    try {
      const { username, email, phone, password, confirm_password, code } = req.body;

      if (password !== confirm_password) {
        return res.responseBuilder.error('user.passwordNotMatch');
      }

      if (!code) {
        return res.responseBuilder.error('email.verificationCodeRequired');
      }

      const verifyResult = emailService.verifyCode(email, code, EmailVerificationType.REGISTER);
      if (!verifyResult.verifyFlag) {
        return res.responseBuilder.error(verifyResult.messageKey, 400);
      }

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, email ? { email } : {}, phone ? { phone } : {}],
        },
      });
      if (existingUser) {
        return res.responseBuilder.error('user.alreadyExists');
      }

      const user = await User.create({
        username,
        email,
        phone,
        password,
        status: 1,
      });

      return res.responseBuilder.created({ uuid: user.uuid }, 'user.userCreated');
    } catch (error) {
      console.log('err', error);
      return res.responseBuilder.error('user.registrationFailed', 500);
    }
  }

  // 登录
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const isEmail = onPattern(username, RegexPatterns.email);
      const user = await User.findOne({
        where: isEmail ? { email: username } : { username },
      });

      if (!user || !(await user.validatePassword(password))) {
        return res.responseBuilder.error('auth.invalidCredentials');
      }
      // 生成令牌
      const token = JwtUtils.generateToken(user.uuid);
      res.setHeader('Authorization', `Bearer ${token}`);

      return res.responseBuilder.success(
        {
          username: user.username,
          token,
        },
        'auth.loginSuccess'
      );
    } catch (error) {
      return res.responseBuilder.error('auth.loginFailed', 500);
    }
  }
  
  // 退出登录
  static async logout(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};

      // 清除请求头中的token
      res.setHeader('Authorization', '');

      return res.responseBuilder.success({}, 'auth.logoutSuccess');
    } catch (error) {
      return res.responseBuilder.error('auth.logoutFailed', 500);
    }
  }

  // 设置新密码
  static async setNewPassword(req: Request, res: Response) {
    try {
      const { email, code, new_password } = req.body;

      const verifyResult = emailService.verifyCode(
        email,
        code,
        EmailVerificationType.RESET_PASSWORD
      );
      if (!verifyResult.verifyFlag) {
        return res.responseBuilder.error(verifyResult.messageKey, 400);
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.responseBuilder.error('user.notFound');
      }

      user.password = new_password;
      await user.save();

      return res.responseBuilder.success({}, 'user.passwordResetSuccess');
    } catch (error) {
      return res.responseBuilder.error('user.passwordResetFailed', 500);
    }
  }

  // 重置密码
  static async resetPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.responseBuilder.error('user.emailNotFound');
      }

      AccountController.setNewPassword(req, res);
    } catch (error) {
      console.log('err', error);
      return res.responseBuilder.error('common.operationFailed', 500);
    }
  }
  // 设置新密码
  static async editPassword(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};
      const { email, code, current_password, password, confirm_password } = req.body;

      if (password !== confirm_password) {
        return res.responseBuilder.error('user.passwordNotMatch');
      }

      const user = await User.findByPk(uuid);
      if (!user) {
        return res.responseBuilder.error('user.notFound');
      }

      if (!(await user.validatePassword(current_password))) {
        return res.responseBuilder.error('auth.invalidCurrentPassword');
      }

      const verifyResult = emailService.verifyCode(
        email,
        code,
        EmailVerificationType.EDIT_PASSWORD
      );
      if (!verifyResult.verifyFlag) {
        return res.responseBuilder.error(verifyResult.messageKey, 400);
      }

      user.password = password;
      await user.save();

      return res.responseBuilder.success({}, 'user.passwordChangeSuccess');
    } catch (error) {
      return res.responseBuilder.error('user.passwordChangeFailed', 500);
    }
  }

  // 编辑个人资料
  static async editProfile(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};
      const { username, email, code } = req.body;

      // 验证邮箱验证码
      const verifyResult = emailService.verifyCode(email, code, EmailVerificationType.EDIT_PROFILE);
      if (!verifyResult.verifyFlag) {
        return res.responseBuilder.error(verifyResult.messageKey, 400);
      }

      await User.update({ username, email }, { where: { uuid } });

      return res.responseBuilder.success({ uuid }, 'user.profileUpdateSuccess');
    } catch (error) {
      return res.responseBuilder.error('user.profileUpdateFailed', 500);
    }
  }

  // 获取用户菜单按钮权限
  private static async getAccountRoleInfo(userModel: any) {
    // 获取用户的角色UUID数组
    const roleUuids = userModel?.role_uuids || [];

    // 查询角色信息
    const roles = await Role.findAll({
      where: { uuid: { [Op.in]: roleUuids } },
    });

    // 合并所有角色的菜单权限
    let allMenuIds: number[] = [];
    const roleNames: string[] = [];
    const roleCodes: string[] = [];

    for (const role of roles) {
      const menuIds = role?.menu_ids || [];
      allMenuIds = [...allMenuIds, ...menuIds];
      roleNames.push(role?.name || '');
      roleCodes.push(role?.code || '');
    }

    // 去重
    allMenuIds = [...new Set(allMenuIds)];

    // 查询type等于3的菜单（按钮类型）
    const menu = await Menu.findAll({
      where: {
        id: { [Op.in]: allMenuIds },
        type: 3, // 按钮类型
      },
    });
    // 提取权限标识
    const perms = menu.map((menu) => menu.permission).filter((permission) => permission); // 过滤掉空值

    return {
      role_name: roleNames.join(','),
      role_code: roleCodes,
      perms,
    };
  }
  // 获取登录用户信息
  static async getAccountInfo(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};
      const user = await User.findByPk(uuid, {
        attributes: [['uuid', 'user_uuid'], 'username', 'email', 'role_uuids', 'status'],
      });

      if (!user || user.status === StatusEnum.DISABLE) {
        return res.responseBuilder.error('user.notFoundOrDisabled');
      }

      // 角色信息
      const roleInfo = await AccountController.getAccountRoleInfo(user);

      const userInfo = {
        ...user.toJSON(),
        ...roleInfo,
      };

      return res.responseBuilder.success(userInfo);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        return res.responseBuilder.error('auth.tokenInvalidOrExpired', 401);
      }
      return res.responseBuilder.error('user.getInfoFailed', 500);
    }
  }

  // 获取用户菜单权限
  static async getAccountMenu(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};

      const user = await User.findByPk(uuid);
      if (!user) {
        return res.responseBuilder.error('user.notFound');
      }

      // 获取用户的角色UUID数组
      const roleUuids = user.role_uuids || [];

      // 查询角色信息
      const roles = await Role.findAll({
        where: { uuid: { [Op.in]: roleUuids } },
      });

      // 合并所有角色的菜单权限
      let allMenuIds: number[] = [];
      for (const role of roles) {
        const menuIds = role?.menu_ids || [];
        allMenuIds = [...allMenuIds, ...menuIds];
      }

      // 去重
      allMenuIds = [...new Set(allMenuIds)];
      const menus = await Menu.findAll({
        where: {
          id: { [Op.in]: allMenuIds },
          visible_status: 1,
          type: {
            [Op.notIn]: [3, 4],
          },
        } as any,
        order: [['sort', 'ASC']],
      });

      return res.responseBuilder.success({
        list: buildRouterTree(menus),
      });
    } catch (error) {
      return res.responseBuilder.error('common.serverError', 500);
    }
  }
}
