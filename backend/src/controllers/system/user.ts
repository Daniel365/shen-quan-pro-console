/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 22:29:56
 * @Description: 注册、登录、忘记密码，用户管理
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { emailService } from '@/config/email';
// models
import { User, Role } from '@/models/system';
// utils
import { onPattern, RegexPatterns } from '@/utils/regexPatterns';
import { JwtUtils } from '@/utils/jwt';

import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from '@/utils/database';
import { onParamsVerify, verifyRule } from '@/paramsVerify';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';
// type
import { EmailVerificationType } from '@/types/email';
import { MatchTypeEnum } from '@/types/database';

export class UserController {
  // 注册
  static async register(req: Request, res: Response) {
    try {
      const { username, email, phone, password, confirm_password, code } = req.body;
      const { isValid, messageKey } = onParamsVerify(req.body, verifyRule.registerFormRule);
      if (!isValid) {
        return res.responseBuilder.error(messageKey, 400);
      }

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

      const { isValid, messageKey } = onParamsVerify(req.body, verifyRule.loginFormRule);
      if (!isValid) {
        return res.responseBuilder.error(messageKey, 400);
      }

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

  // 设置新密码
  static async setNewPassword(req: Request, res: Response) {
    try {
      const { email, code, new_password } = req.body;

      const { isValid, messageKey } = onParamsVerify(req.body, verifyRule.forgotPasswordFormRule);
      if (!isValid) {
        return res.responseBuilder.error(messageKey, 400);
      }

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
      const { isValid, messageKey } = onParamsVerify(req.body, verifyRule.forgotPasswordFormRule);
      if (!isValid) {
        return res.responseBuilder.error(messageKey, 400);
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.responseBuilder.error('user.emailNotFound');
      }

      UserController.setNewPassword(req, res);
    } catch (error) {
      console.log('err', error);
      return res.responseBuilder.error('common.operationFailed', 500);
    }
  }

  // 获取用户列表
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const { uuid } = req?.accountInfo || {};
      const where: any = buildWhereCondition(reqBody, [
        { field: 'username' },
        { field: 'email' },
        { field: 'username', matchType: MatchTypeEnum.NE, queryValue: 'admin' },
        // 排除当前登录用户
        { field: 'uuid', matchType: MatchTypeEnum.NE, queryValue: uuid },
      ]);

      const { rows, count } = await User.findAndCountAll({
        where,
        attributes: [
          'uuid',
          'username',
          'email',
          'role_uuids',
          'status',
          'created_at',
          'updated_at',
        ],
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
}
