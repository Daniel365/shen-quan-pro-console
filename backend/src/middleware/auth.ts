/*
 * @Author: 350296245@qq.com
 * @Date: 2025-08-31 23:42:28
 * @Description: 判断是否有权限访问接口
 */
import { Request, Response, NextFunction } from "express";
import { JwtUtils } from "../utils/jwt";
import jwt from "jsonwebtoken";
import { onErrorResult } from "../utils/controllersResult";
import { onParamsVerify } from "../paramsVerify";
import { ReqParamsVerifyRule } from "../types/interfaceRequest";

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
        return res.status(401).json(onErrorResult("访问令牌缺失"));
      }
      const decoded = JwtUtils.verifyToken(token);
      req.accountInfo = { uuid: decoded.uuid };

      // 表单验证
      if (verifyRule && verifyRule.length) {
        const { isValid, message } = onParamsVerify(req.body, verifyRule);
        if (!isValid) {
          return res.status(400).json(onErrorResult(message));
        }
      }
      next();
    } catch (error) {
      if (
        error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError
      ) {
        return res.status(401).json(onErrorResult("令牌无效或已过期"));
      }
      return res.status(500).json({ code: 500, message: "认证失败" });
    }
  };
};
