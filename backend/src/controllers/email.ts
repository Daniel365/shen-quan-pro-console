/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-03 21:27:32
 * @Description: 邮箱相关逻辑
 */
import { Request, Response } from 'express';
import { emailService } from '@/config/email';
import { EmailVerificationType } from '@/types/email';
import { onParamsVerify, verifyRule } from '@/paramsVerify';

// 发送验证码
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email, type } = req.body;

    const { isValid, messageKey } = onParamsVerify(req.body, verifyRule.sendEmailFormRule);
    if (!isValid) {
      return res.responseBuilder.error(messageKey, 400);
    }

    const result = await emailService.sendVerificationCode(
      email,
      type as EmailVerificationType,
      req.locale
    );

    if (result.success) {
      return res.responseBuilder.success({}, result.messageKey);
    } else {
      return res.responseBuilder.error(result.messageKey, 400);
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    return res.responseBuilder.error('email.sendCodeFailed', 500);
  }
};

// 验证验证码
export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code, type = 'forgot-password' } = req.body;

    const { isValid, messageKey } = onParamsVerify(req.body, verifyRule.sendEmailFormRule);
    if (!isValid) {
      return res.responseBuilder.error(messageKey, 400);
    }

    const result = emailService.verifyCode(email, code, type);

    if (result.verifyFlag) {
      return res.responseBuilder.success({}, result.messageKey);
    } else {
      return res.responseBuilder.error(result.messageKey, 400);
    }
  } catch (error) {
    console.error('验证码校验失败:', error);
    return res.responseBuilder.error('email.verifyCodeFailed', 500);
  }
};
