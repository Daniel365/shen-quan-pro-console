/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-27 18:20:18
 * @Description:  自动创建日志 - 装饰器
 */
import { Request, Response } from "express";
import { OperationLogController } from "../controllers/system";
import {
  generateActionDescription,
  getSafeRequestParams,
  getSafeResponseData,
} from "../utils/operationLog";

// 操作日志装饰器选项
interface AutoLogOptions {
  // 操作描述（可选，不提供则自动生成）
  description?: string;
  // 是否忽略日志记录（某些特殊接口）
  ignore?: boolean;
  // 自定义操作类型（可选）
  operationType?: string;
}

// 方法装饰器类型
type MethodDecorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

// 创建自动日志装饰器
function createAutoLogDecorator(options: AutoLogOptions = {}): MethodDecorator {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0];
      const res: Response = args[1];

      // 如果配置了忽略，设置标记并直接执行原方法
      if (options.ignore) {
        console.log(`🚫 忽略日志记录: ${propertyKey}`);
        // 设置标记，让中间件知道这个请求应该忽略日志
        (req as any).ignoreAutoLog = true;
        return originalMethod.apply(this, args);
      }

      const originalSend = res.json;

      res.json = function (body: any) {
        const { uuid: accountUuid } = req?.accountInfo || {};
        if (accountUuid) {
          // 获取操作信息
          const method = req.method;
          const path = req.path;

          // 优先使用装饰器配置的描述，否则自动生成
          let description = options.description;
          if (!description) {
            // 自动生成描述
            description = generateActionDescription({ method, path });
          }

          // 获取请求参数（排除敏感信息）
          const requestParams = getSafeRequestParams(req);

          // 获取响应数据（排除敏感信息）
          const responseData = getSafeResponseData(body);
          // 操作类型
          const operationType = options.operationType || "AUTO_OPERATION";

          // 记录操作日志
          OperationLogController.createAutoLog(req, {
            accountUuid,
            description,
            operationType,
            requestParams,
            responseData,
          }).catch((error) => {
            console.error(`❌ [AutoLog decorators] 记录日志失败:`, error);
          });
        } else {
          console.error(`⚠️ 用户UUID不存在，跳过日志记录`);
        }
        return originalSend.call(this, body);
      };

      return originalMethod.apply(this, args);
    };
  };
}

// 导出装饰器函数
export function AutoLog(options?: AutoLogOptions): MethodDecorator {
  return createAutoLogDecorator(options);
}

// 忽略日志装饰器
export function IgnoreLog(): MethodDecorator {
  return createAutoLogDecorator({ ignore: true });
}
