import { Sequelize } from "sequelize";
import { Request, Response } from "express";
import { OperationLog, User } from "@/models/system";
// utils

import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from "@/utils/database";
// decorators
import { IgnoreLog } from "@/decorators/autoLog";

export class OperationLogController {
  // 自动创建操作日志（支持装饰器方式）
  static async createAutoLog(
    req: Request,
    params: {
      accountUuid: string;
      description: string;
      operationType?: string;
      requestParams?: any;
      responseData?: any;
    }
  ) {
    try {
      const { accountUuid, operationType, description, requestParams, responseData } = params;
      await OperationLog.create({
        user_uuid: accountUuid,
        action: operationType || "AUTO_OPERATION",
        description,
        api_path: req?.originalUrl,
        http_method: req?.method,
        ip_address: req?.ip || req?.connection?.remoteAddress,
        user_agent: req?.get("User-Agent"),
        request_params: requestParams ? JSON.stringify(requestParams) : undefined,
        response_data: responseData ? JSON.stringify(responseData) : undefined,
      });
    } catch (error) {
      console.error("创建自动操作日志失败:", error);
    }
  }

  // 获取操作日志列表
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, ["action", "api_path", "ip_address"]);

      const { rows, count } = await OperationLog.findAndCountAll({
        where,
        attributes: [
          "uuid",
          "action",
          "description",
          "api_path",
          "http_method",
          "ip_address",
          "user_agent",
          "request_params",
          "response_data",
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

      return res.responseBuilder.success({
        list: rows,
        pageInfo,
      });
    } catch (error) {
      console.log("err", error);
      return res.responseBuilder.error("common.serverError", 500);
    }
  }
}
