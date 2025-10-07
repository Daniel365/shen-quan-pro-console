/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 23:42:28
 * @Description: 判断是否有权限访问接口 - 中间件
 */
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ReqParamsVerifyRule } from '../types/interfaceRequest';
import { JwtUtils } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      accountInfo?: { account_uuid: string };
    }
  }
}

type RequireAuthParams = {
  verifyRule?: ReqParamsVerifyRule[];
};

// 必须认证的中间件
export const requireAuth = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = JwtUtils.extractToken(req);
      if (!token) {
        return res.responseBuilder.unauthorized('auth.missingToken');
      }
      const decoded = JwtUtils.verifyToken(token);
      if (!decoded) {
        return res.responseBuilder.unauthorized('auth.tokenInvalidOrExpired');
      }
      req.accountInfo = { account_uuid: decoded.uuid };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        return res.responseBuilder.unauthorized('auth.tokenInvalidOrExpired');
      }
      return res.responseBuilder.error('auth.authenticationFailed', 500);
    }
  };
};
