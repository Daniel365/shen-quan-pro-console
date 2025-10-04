/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 22:29:56
 * @Description: 注册、登录、忘记密码，用户管理
 */
import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import { emailService } from "../config/email";
// models
import User from "../models/User";
import Role from "../models/Role";
// utils
import { onPattern, RegexPatterns } from "../utils/regexPatterns";
import { JwtUtils } from "../utils/jwt";
import { onErrorResult, onSuccessResult } from "../utils/controllersResult";
import {
  buildWhereCondition,
  defaultListQuery,
  getPageInfoConfig,
} from "../utils/database";
import { onParamsVerify, verifyRule } from "../paramsVerify";
// type
import { EmailVerificationType } from "../types/email";
import { ResParamsTypeEnum } from "../types/interfaceResult";
import { MatchTypeEnum } from "../types/database";

export class UserController {
  // 注册
  static async register(req: Request, res: Response) {
    try {
      const { username, email, phone, password, confirm_password, code } =
        req.body;
      const { isValid, message } = onParamsVerify(
        req.body,
        verifyRule.registerFormRule
      );
      if (!isValid) {
        return res.status(400).json(onErrorResult(message));
      }

      if (password !== confirm_password) {
        return res.status(400).json(onErrorResult("输入的密码不一致"));
      }

      if (!code) {
        return res.status(400).json(onErrorResult("验证码为必填项"));
      }

      const verifyResult = emailService.verifyCode(
        email,
        code,
        EmailVerificationType.REGISTER
      );
      if (!verifyResult.verifyFlag) {
        return res.status(400).json(onErrorResult(verifyResult.message));
      }

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { username },
            email ? { email } : {},
            phone ? { phone } : {},
          ],
        },
      });
      if (existingUser) {
        return res
          .status(400)
          .json(onErrorResult("用户名、邮箱或手机号已被注册"));
      }

      const user = await User.create({
        username,
        email,
        phone,
        password,
        status: 1,
      });

      res.json(
        onSuccessResult(
          {
            uuid: user.uuid,
          },
          {
            message: "注册成功",
          }
        )
      );
    } catch (error) {
      console.log("err", error);
      res.status(500).json({ code: 500, message: "注册失败" });
    }
  }

  // 登录
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const { isValid, message } = onParamsVerify(
        req.body,
        verifyRule.loginFormRule
      );
      if (!isValid) {
        return res.status(400).json(onErrorResult(message));
      }

      const isEmail = onPattern(username, RegexPatterns.email);
      const user = await User.findOne({
        where: isEmail ? { email: username } : { username },
      });

      if (!user || !(await user.validatePassword(password))) {
        return res.status(400).json(onErrorResult("用户名或密码不正确"));
      }
      // 生成令牌
      const token = JwtUtils.generateToken(user.uuid);
      res.setHeader("Authorization", `Bearer ${token}`);

      res.json(
        onSuccessResult({
          username: user.username,
          token,
        })
      );
    } catch (error) {
      res.status(500).json({ code: 500, message: "登录失败" });
    }
  }

  // 设置新密码
  static async setNewPassword(req: Request, res: Response) {
    try {
      const { email, code, new_password } = req.body;

      const { isValid, message } = onParamsVerify(
        req.body,
        verifyRule.forgotPasswordFormRule
      );
      if (!isValid) {
        return res.status(400).json(onErrorResult(message));
      }

      const verifyResult = emailService.verifyCode(
        email,
        code,
        EmailVerificationType.RESET_PASSWORD
      );
      if (!verifyResult.verifyFlag) {
        return res.status(400).json(onErrorResult(verifyResult.message));
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json(onErrorResult("用户不存在"));
      }

      user.password = new_password;
      await user.save();

      res.json(onSuccessResult({}, { message: "密码重置成功" }));
    } catch (error) {
      res.status(500).json({ code: 500, message: "密码重置失败" });
    }
  }

  // 重置密码
  static async resetPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const { isValid, message } = onParamsVerify(
        req.body,
        verifyRule.forgotPasswordFormRule
      );
      if (!isValid) {
        return res.status(400).json(onErrorResult(message));
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json(onErrorResult("邮箱不存在"));
      }

      UserController.setNewPassword(req, res);
    } catch (error) {
      console.log("err", error);
      res.status(500).json({ code: 500, message: "操作失败" });
    }
  }

  // 获取用户列表
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const { uuid } = req?.accountInfo || {};
      const where: any = buildWhereCondition(reqBody, [
        { field: "username" },
        { field: "email" },
        { field: "username", matchType: MatchTypeEnum.NE, queryValue: "admin" },
        // 排除当前登录用户
        { field: "uuid", matchType: MatchTypeEnum.NE, queryValue: uuid },
      ]);

      const { rows, count } = await User.findAndCountAll({
        where,
        attributes: [
          "uuid",
          "username",
          "email",
          "role_uuid",
          "status",
          "created_at",
          "updated_at",
          [Sequelize.col("role.name"), "role_name"],
        ],
        include: [
          {
            model: Role,
            as: "role",
            attributes: [],
          },
        ],
        ...defaultListQuery(reqBody),
      });
      // 分页信息
      const pageInfo = getPageInfoConfig({
        count,
        ...reqBody,
      });

      res.json(
        onSuccessResult(
          {
            list: rows,
            pageInfo,
          },
          { resType: ResParamsTypeEnum.LIST_PAGE }
        )
      );
    } catch (error) {
      console.log("err", error);
      res.status(500).json({ code: 500, message: "服务器错误" });
    }
  }

  // 更新用户
  static async update(req: Request, res: Response) {
    try {
      const { uuid, username, role_uuid, status } = req.body;

      await User.update({ username, role_uuid, status }, { where: { uuid } });

      res.json(
        onSuccessResult(
          {
            uuid,
          },
          { message: "更新成功" }
        )
      );
    } catch (error) {
      res.status(500).json({ code: 500, message: "更新失败" });
    }
  }

  // 删除用户
  static async delete(req: Request, res: Response) {
    try {
      const { uuid } = req.body;
      await User.destroy({ where: { uuid } });
      res.json(
        onSuccessResult(
          {
            uuid,
          },
          { message: "删除成功" }
        )
      );
    } catch (error) {
      res.status(500).json({ code: 500, message: "删除失败" });
    }
  }

  // 退出登录
  static async logout(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};

      res.json(onSuccessResult({}, { message: "退出登录成功" }));
    } catch (error) {
      res.status(500).json({ code: 500, message: "退出登录失败" });
    }
  }
}
