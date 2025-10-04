/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 22:21:06
 * @Description:
 */
import { Request, Response } from "express";
import { Op } from "sequelize";
import { Role } from "../models/associations";
import { onSuccessResult } from "../utils/controllersResult";
import { ResParamsTypeEnum } from "../types/interfaceResult";
import {
  buildWhereCondition,
  defaultListQuery,
  getPageInfoConfig,
} from "../utils/database";
import { DataTypeEnum, MatchTypeEnum } from "../types/database";

export class RoleController {
  // 获取角色列表
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, [
        { field: "name" },
        {
          field: "status",
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
      res.status(500).json({ code: 500, message: "服务器错误" });
    }
  }

  // 创建角色
  static async create(req: Request, res: Response) {
    try {
      const { name, code, description } = req.body;

      const role = await Role.create({
        name,
        code,
        description,
      });

      res.json(
        onSuccessResult({
          uuid: role.uuid,
        })
      );
    } catch (error) {
      res.status(500).json({ code: 500, message: "创建失败" });
    }
  }

  // 更新角色
  static async update(req: Request, res: Response) {
    try {
      const { uuid, name, code, description, status } = req.body;

      await Role.update(
        { name, code, description, status },
        { where: { uuid } }
      );

      res.json(onSuccessResult({}));
    } catch (error) {
      res.status(500).json({ code: 500, message: "更新失败" });
    }
  }

  // 分配角色权限
  static async assignPerm(req: Request, res: Response) {
    try {
      const { uuid, menu_ids } = req.body;

      await Role.update({ menu_ids }, { where: { uuid } });

      res.json(onSuccessResult({}));
    } catch (error) {
      res.status(500).json({ code: 500, message: "更新失败" });
    }
  }

  // 删除角色
  static async delete(req: Request, res: Response) {
    try {
      const { uuid } = req.body;
      await Role.destroy({ where: { uuid } });
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
}
