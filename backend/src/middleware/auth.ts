/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 23:42:28
 * @Description: 判断是否有权限访问接口 - 中间件
 */
import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/jwt';
import jwt from 'jsonwebtoken';
import { onParamsVerify } from '../paramsVerify';
import { ReqParamsVerifyRule } from '../types/interfaceRequest';

declare global {
  namespace Express {
    interface Request {
      accountInfo?: { uuid: string };
    }
  }
}

type RequireAuthParams = {
  verifyRule?: ReqParamsVerifyRule[];
};

// 必须认证的中间件
export const requireAuth = ({ verifyRule }: RequireAuthParams = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = JwtUtils.extractToken(req);
      if (!token) {
        return res.responseBuilder.unauthorized('auth.missingToken');
      }
      const decoded = JwtUtils.verifyToken(token);
      req.accountInfo = { uuid: decoded.uuid };

      // 表单验证
      if (verifyRule && verifyRule.length) {
        const { isValid, messageKey } = onParamsVerify(req.body, verifyRule);
        if (!isValid) {
          return res.responseBuilder.error(messageKey, 400);
        }
      }
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        return res.responseBuilder.unauthorized('auth.tokenInvalidOrExpired');
      }
      return res.responseBuilder.error('auth.authenticationFailed', 500);
    }
  };
};
