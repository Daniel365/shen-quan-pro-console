import { Request, Response } from "express";
import OperationLog from "../models/OperationLog";
import { onSuccessResult } from "../utils/controllersResult";
import {
  buildWhereCondition,
  defaultListQuery,
  getPageInfoConfig,
} from "../utils/database";
import { ResParamsTypeEnum } from "../types/interfaceResult";
import { OperationAction, OperationDescription } from "../types/operationLog";
import User from "../models/User";
import { Op, Sequelize } from "sequelize";

export class OperationLogController {
  // 创建操作日志
  static async createOperationLog(
    userUuid: string,
    action: OperationAction,
    req?: Request
  ) {
    try {
      await OperationLog.create({
        user_uuid: userUuid,
        action,
        description: OperationDescription[action],
        ip_address: req?.ip || req?.connection?.remoteAddress,
        user_agent: req?.get("User-Agent"),
      });
    } catch (error) {
      console.error("创建操作日志失败:", error);
    }
  }

  // 获取操作日志列表
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, ["action", "ip_address"]);

      const { rows, count } = await OperationLog.findAndCountAll({
        where,
        attributes: [
          "uuid",
          "action",
          "description",
          "ip_address",
          "user_agent",
          "created_at",
          "updated_at",
          [Sequelize.col("user.username"), "username"],
        ],
        include: [
          {
            model: User,
            as: "user",
            where: buildWhereCondition(reqBody, ["username"]),
            attributes: [],
          },
        ],
        ...defaultListQuery(reqBody),
        order: [["created_at", "DESC"]],
      });

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
}
