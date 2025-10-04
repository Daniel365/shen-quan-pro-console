import nodemailer from "nodemailer";
import crypto from "crypto";
import { EmailVerificationType } from "../types/email";
import { onErrorResult, onSuccessResult } from "../utils/controllersResult";
import { ResponseResult } from "../types/interfaceResult";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface VerificationCode {
  code: string;
  email: string;
  type: string;
  expiresAt: Date;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private verificationCodes: Map<string, VerificationCode> = new Map();
  private templateConfig = {
    [EmailVerificationType.LOGIN]: {
      subject: "登录验证码",
      color: "#ffc107",
    },
    [EmailVerificationType.REGISTER]: {
      subject: "注册验证码",
      color: "#28a745",
    },
    [EmailVerificationType.RESET_PASSWORD]: {
      subject: "重置密码验证码",
      color: "#007bff",
    },
    [EmailVerificationType.EDIT_PASSWORD]: {
      subject: "修改密码验证码",
      color: "#007bff",
    },
  };
  constructor(config: EmailConfig) {
    const transporter = nodemailer.createTransport(config);
    transporter.verify((error) => {
      if (error) {
        console.log("连接错误:", error);
      } else {
        console.log("服务器就绪，可以发送邮件");
      }
    });
    this.transporter = transporter;
  }

  // 生成验证码
  private generateCode(length: number = 6): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // 发送验证码邮件
  async sendVerificationCode(
    email: string,
    type: EmailVerificationType
  ): Promise<ResponseResult> {
    try {
      if (!type) {
        return onErrorResult("验证码类型不能为空");
      }

      const code = this.generateCode();
      const key = `${email}_${type}`;

      // 存储验证码（5分钟有效期）
      this.verificationCodes.set(key, {
        code,
        email,
        type,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      const subject = this.getEmailField(type, "subject");
      const html = this.getEmailTemplate(code, type);

      await this.transporter.sendMail({
        from: process.env.EMAIL_SENDER_MAIL,
        to: email,
        subject,
        html,
      });

      return onSuccessResult(
        {},
        {
          message: "验证码发送成功",
        }
      );
    } catch (error) {
      console.error("发送邮件失败:", error);
      return onErrorResult("发送邮件失败");
    }
  }

  // 验证验证码
  verifyCode(
    email: string,
    code: string,
    type: EmailVerificationType
  ): { verifyFlag: boolean; message: string } {
    if (!type) {
      return { verifyFlag: false, message: "验证码类型不能为空" };
    }

    const key = `${email}_${type}`;
    const stored = this.verificationCodes.get(key);

    if (!stored) {
      return { verifyFlag: false, message: "验证码不存在或已过期" };
    }

    if (stored.expiresAt < new Date()) {
      this.verificationCodes.delete(key);
      return { verifyFlag: false, message: "验证码已过期" };
    }

    if (stored.code !== code) {
      return { verifyFlag: false, message: "验证码错误" };
    }

    this.verificationCodes.delete(key);
    return { verifyFlag: true, message: "验证成功" };
  }

  private getEmailField<K extends keyof typeof this.templateConfig[EmailVerificationType]>(
    type: EmailVerificationType,
    field: K
  ) {
    return this.templateConfig[type][field];
  }

  private getEmailTemplate(code: string, type: EmailVerificationType): string {
    const color = this.getEmailField(type, "color");
    const subject = this.getEmailField(type, "subject");

    return `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2>${subject.replace("验证码", "")}</h2>
        <p>您的验证码是：<strong style="font-size: 24px; color: ${color};">${code}</strong></p>
        <p>验证码5分钟内有效，请及时使用。</p>
      </div>
    `;
  }

  // 清理过期验证码
  cleanExpiredCodes(): void {
    const now = new Date();
    for (const [key, value] of this.verificationCodes.entries()) {
      if (value.expiresAt < now) {
        this.verificationCodes.delete(key);
      }
    }
  }
}
