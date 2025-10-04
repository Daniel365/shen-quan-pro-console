/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-03 21:27:23
 * @Description:
 */
import { EmailService } from "../services/EmailService";

const EMAIL_PORT: number = parseInt(process.env.EMAIL_PORT || "465");
// 邮件配置
const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: process.env.EMAIL_SENDER_MAIL || "",
    pass: process.env.EMAIL_PASS || "",
  },
};

// 创建邮件服务实例
export const emailService = new EmailService(emailConfig);

// 定期清理过期验证码（每10分钟）
setInterval(() => {
  emailService.cleanExpiredCodes();
}, 10 * 60 * 1000);
