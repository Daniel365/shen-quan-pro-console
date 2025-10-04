/**
 * @Author: 350296245@qq.com
 * @Date: 2025-10-01 12:00:00
 * @Explain: 统一错误处理中间件
 */
import { Request, Response, NextFunction } from 'express';

import { isDev } from '../config/process';

/**
 * 统一错误处理中间件
 */
const errorHandler = (): any => {
  return (err: any, _req: Request, res: Response, _next: NextFunction) => {
    // 使用中间件挂载的 responseBuilder
    if (res.responseBuilder) {
      res.responseBuilder.custom({
        data: isDev ? { error: err.message } : undefined,
        messageKey: 'common.serverError',
        statusCode: 500,
        success: false,
      });
    } else {
      // 如果中间件未挂载，使用默认响应
      res.status(500).json({
        message: '服务器错误',
        success: false,
        timestamp: new Date().toISOString(),
      });
    }
  };
};

export default errorHandler;
