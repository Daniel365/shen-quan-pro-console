import { Router } from 'express';
import { sendVerificationCode, verifyCode } from '@/controllers/email';
import { validateForm } from '@/middleware/formValidation';
import { verifyRule } from '@/paramsVerify';

const router = Router();

// 发送验证码
router.post('/send-code', validateForm(verifyRule.sendEmailFormRule), sendVerificationCode);

// 验证验证码
router.post('/verify-code', validateForm(verifyRule.sendEmailFormRule), verifyCode);

export default router;