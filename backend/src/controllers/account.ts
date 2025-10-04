/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-06 15:03:12
 * @Description: 通过token - 账号相关处理逻辑
 */
import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import jwt from "jsonwebtoken";
import { emailService } from "../config/email";
// models
import User from "../models/User";
import Role from "../models/Role";
import Menu, { MenuAttributes } from "../models/Menu";
// utils
import { onErrorResult, onSuccessResult } from "../utils/controllersResult";
import { onParamsVerify, verifyRule } from "../paramsVerify";
// type
import { StatusEnum } from "../types/database";
import { EmailVerificationType } from "../types/email";
import { ResParamsTypeEnum } from "../types/interfaceResult";

interface MenuListItem extends MenuAttributes {
  children: MenuAttributes[];
}

export class AccountController {
  // 设置新密码
  static async editPassword(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};
      const { email, code, current_password, password, confirm_password } =
        req.body;

      const { isValid, message } = onParamsVerify(
        req.body,
        verifyRule.editPasswordFormRule
      );
      if (!isValid) {
        return res.status(400).json(onErrorResult(message));
      }

      if (password !== confirm_password) {
        return res.status(400).json(onErrorResult("两次输入的密码不一致"));
      }

      const user = await User.findByPk(uuid);
      if (!user) {
        return res.status(400).json(onErrorResult("用户不存在"));
      }

      if (!(await user.validatePassword(current_password))) {
        return res.status(400).json(onErrorResult("当前密码不正确"));
      }

      const verifyResult = emailService.verifyCode(
        email,
        code,
        EmailVerificationType.EDIT_PASSWORD
      );
      if (!verifyResult.verifyFlag) {
        return res.status(400).json(onErrorResult(verifyResult.message));
      }

      user.password = password;
      await user.save();

      res.json(onSuccessResult({}, { message: "密码修改成功" }));
    } catch (error) {
      res.status(500).json({ code: 500, message: "密码修改失败" });
    }
  }

  // 编辑个人资料
  static async editProfile(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};
      const { username, email } = req.body;

      await User.update({ username, email }, { where: { uuid } });

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

  // 获取用户菜单按钮权限
  private static async getAccountRoleInfo(userModel: any) {
    // 获取用户角色的菜单权限
    const roleModel = userModel?.role;
    const menu_ids = roleModel?.menu_ids || [];

    // 查询type等于3的菜单（按钮类型）
    const menu = await Menu.findAll({
      where: {
        id: { [Op.in]: menu_ids },
        type: 3, // 按钮类型
      },
    });
    // 提取权限标识
    const perms = menu
      .map((menu) => menu.permission)
      .filter((permission) => permission); // 过滤掉空值
    return {
      role_name: roleModel?.name,
      role_code: roleModel?.code,
      perms,
      // 因为关联会查询这个字段，所以这里处理不展示这个对象
      role: undefined,
    };
  }
  // 获取登录用户信息
  static async getAccountInfo(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};
      const user = await User.findByPk(uuid, {
        attributes: [
          ["uuid", "user_uuid"],
          "username",
          "email",
          "role_uuid",
          "status",
        ],
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["name", "code", "menu_ids"],
          },
        ],
      });

      if (!user || user.status === StatusEnum.DISABLE) {
        return res.json(onErrorResult("用户不存在或已禁用"));
      }

      // 角色信息
      const roleInfo = await AccountController.getAccountRoleInfo(user);

      const userInfo = {
        ...user.toJSON(),
        ...roleInfo,
      };

      res.json(onSuccessResult(userInfo));
    } catch (error) {
      if (
        error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError
      ) {
        return res.status(401).json({ code: 401, message: "令牌无效或已过期" });
      }
      res.status(500).json({ code: 500, message: "获取用户信息失败" });
    }
  }
  // 构建菜单树
  private static buildTree(menus: any[]) {
    const menuMap = new Map();
    const rootMenus: any[] = [];

    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu.toJSON(), children: [] });
    });

    menus.forEach((menu) => {
      const menuItem: MenuListItem = menuMap.get(menu.id);
      const newItem = {
        name: menuItem.route_name,
        path: menuItem.route_path,
        component: menuItem.component,
        meta: {
          alwaysShow: false,
          hidden: false,
          icon: menuItem.icon,
          params: null,
          title: menuItem.name,
        },
        children: menuItem.children,
      };
      if (menu.parent_id && menuMap.has(menu.parent_id)) {
        menuMap.get(menu.parent_id).children.push(newItem);
      } else {
        rootMenus.push(newItem);
      }
    });

    return rootMenus;
  }

  // 获取用户菜单权限
  static async getAccountMenu(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};

      const user = await User.findByPk(uuid);
      if (!user || !user.role_uuid) {
        return res.status(400).json(onErrorResult("用户或角色不存在"));
      }

      const role = await Role.findByPk(user.role_uuid);

      const menuIds = role?.menu_ids || [];
      const menus = await Menu.findAll({
        where: {
          id: { [Op.in]: menuIds },
          visible_status: 1,
        } as any,
        order: [["sort", "ASC"]],
      });

      res.json(
        onSuccessResult(AccountController.buildTree(menus), {
          resType: ResParamsTypeEnum.LIST,
        })
      );
    } catch (error) {
      res.status(500).json({ code: 500, message: "获取用户菜单权限失败" });
    }
  }
}
