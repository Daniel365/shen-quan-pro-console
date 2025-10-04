/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-01 13:57:16
 * @Description: jwt方法封装
 */
import jwt, { SignOptions } from "jsonwebtoken";
import { Request } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export class JwtUtils {
  // 生成JWT令牌
  static generateToken(
    uuid: string,
    options: SignOptions = { expiresIn: "24h" }
  ): string {
    return jwt.sign({ uuid }, JWT_SECRET, options);
  }

  // 验证JWT令牌
  static verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET);
  }

  // 从请求头提取token
  static extractToken(req: Request): string | undefined {
    const auth = req.headers?.authorization;
    // 检查是否以"Bearer "开头，如果是则提取token部分
    // slice(7)因为"Bearer "长度为7个字符（B-e-a-r-e-r-空格）
    return auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  }
}
