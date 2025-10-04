/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-03 21:27:32
 * @Description: 邮箱相关逻辑
 */
import { Request, Response } from "express";
import { emailService } from "../config/email";
import { onSuccessResult, onErrorResult } from "../utils/controllersResult";
import { EmailVerificationType } from "../types/email";
import { onParamsVerify, verifyRule } from "../paramsVerify";

// 发送验证码
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email, type } = req.body;

    const { isValid, message } = onParamsVerify(
      req.body,
      verifyRule.sendEmailFormRule
    );
    if (!isValid) {
      return res.status(400).json(onErrorResult(message));
    }

    const result = await emailService.sendVerificationCode(
      email,
      type as EmailVerificationType
    );

    res.json(result);
  } catch (error) {
    console.error("发送验证码失败:", error);
    return res.status(500).json(onErrorResult("发送验证码失败"));
  }
};

// 验证验证码
export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code, type = "forgot-password" } = req.body;

    const { isValid, message } = onParamsVerify(
      req.body,
      verifyRule.sendEmailFormRule
    );
    if (!isValid) {
      return res.status(400).json(onErrorResult(message));
    }

    const result = emailService.verifyCode(email, code, type);

    if (result.verifyFlag) {
      return res.json(onSuccessResult({}, result.message as any));
    } else {
      return res.status(400).json(onErrorResult(result.message));
    }
  } catch (error) {
    console.error("验证码校验失败:", error);
    return res.status(500).json(onErrorResult("验证码校验失败"));
  }
};
