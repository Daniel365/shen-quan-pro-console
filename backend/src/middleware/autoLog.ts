/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-27 18:20:18
 * @Description:  自动创建日志 - 中间件
 */
import { Request, Response, NextFunction } from 'express';
import { OperationLogController } from '../controllers/system';
import {
  generateActionDescription,
  getSafeRequestParams,
  getSafeResponseData,
} from '../utils/operationLog';

// 自动记录操作日志中间件
export const autoLogOperation = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const path = req.path;
    const method = req.method;

    // 只记录写操作
    if (!['POST', 'PUT', 'DELETE'].includes(method)) {
      return next();
    }

    // 设置标记，让装饰器知道中间件已经处理了日志
    (req as any).autoLogHandled = false;

    const originalSend = res.json;

    res.json = function (body: any) {
      // 检查是否应该忽略日志（由装饰器设置）
      if ((req as any).ignoreAutoLog) {
        return originalSend.call(this, body);
      }

      const { uuid: accountUuid } = req?.accountInfo || {};
      if (accountUuid) {
        // 自动生成描述
        const description = generateActionDescription({ method, path });

        // 获取请求参数（排除敏感信息）
        const requestParams = getSafeRequestParams(req);

        // 获取响应数据（排除敏感信息）
        const responseData = getSafeResponseData(body);

        OperationLogController.createAutoLog(req, {
          accountUuid,
          description,
          requestParams,
          responseData,
        }).catch((error) => {
          console.error(`❌ [AutoLog Middleware] 记录日志失败:`, error);
        });
      } else {
        console.error(`⚠️ [AutoLog Middleware] 用户UUID不存在，跳过日志记录`);
      }
      return originalSend.call(this, body);
    };

    next();
  };
};

export default autoLogOperation;
