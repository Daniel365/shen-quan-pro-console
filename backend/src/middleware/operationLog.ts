import { Request, Response, NextFunction } from "express";
import { OperationAction } from "../types/operationLog";
import { OperationLogController } from "../controllers/operationLog";

// 记录操作日志
export const logOperation = (action: OperationAction) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.json;

    res.json = function (body: any) {
      // 只在成功响应时记录日志
      if (
        body?.code === 200 ||
        (!body?.code && !body?.message?.includes("失败"))
      ) {
        const { uuid } = req?.accountInfo || {};
        if (uuid) {
          OperationLogController.createOperationLog(uuid, action, req).catch(
            console.error
          );
        }
      }
      return originalSend.call(this, body);
    };

    next();
  };
};
