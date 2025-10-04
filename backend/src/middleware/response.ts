/**
 * @Author: 350296245@qq.com
 * @Date: 2025-09-29 10:44:12
 * @Explain: 响应返回 - 中间件
 */
import { Request, Response, NextFunction } from 'express';
import { ResponseBuilder } from '../utils/response';

const responseMiddleware = () => {
  return (
    req: Request,
    res: Response & { responseBuilder: ResponseBuilder },
    next: NextFunction
  ) => {
    // 创建 ResponseBuilder 实例并挂载到 res 对象上
    res.responseBuilder = new ResponseBuilder(res, req.locale);

    next();
  };
};

declare global {
  namespace Express {
    interface Response {
      responseBuilder: ResponseBuilder;
    }
  }
}

export default responseMiddleware;
