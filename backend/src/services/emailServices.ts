import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { EmailVerificationType } from '../types/email';
import { i18nText } from '../utils/i18n';

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
      subjectKey: 'email.loginSubject',
      color: '#ffc107',
    },
    [EmailVerificationType.REGISTER]: {
      subjectKey: 'email.registerSubject',
      color: '#28a745',
    },
    [EmailVerificationType.RESET_PASSWORD]: {
      subjectKey: 'email.resetPasswordSubject',
      color: '#007bff',
    },
    [EmailVerificationType.EDIT_PASSWORD]: {
      subjectKey: 'email.editPasswordSubject',
      color: '#007bff',
    },
    [EmailVerificationType.EDIT_PROFILE]: {
      subjectKey: 'email.editProfileSubject',
      color: '#17a2b8',
    },
  };
  constructor(config: EmailConfig) {
    const transporter = nodemailer.createTransport(config);
    transporter.verify((error) => {
      if (error) {
        console.log('Email connection error:', error);
      } else {
        console.log('Email server ready to send');
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
    type: EmailVerificationType,
    locale: string
  ): Promise<{ success: boolean; messageKey: string }> {
    try {
      if (!type) {
        return { success: false, messageKey: 'email.typeRequired' };
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

      const subject = this.getEmailSubject(type);
      const html = this.getEmailTemplate(code, type);

      await this.transporter.sendMail({
        from: process.env.EMAIL_SENDER_MAIL,
        to: email,
        subject,
        html,
      });

      return { success: true, messageKey: 'email.sendCodeSuccess' };
    } catch (error) {
      console.error('Send verification code failed:', error);
      return { success: false, messageKey: 'email.emailFailed' };
    }
  }

  // 验证验证码
  verifyCode(
    email: string,
    code: string,
    type: EmailVerificationType
  ): { verifyFlag: boolean; messageKey: string } {
    if (!type) {
      return { verifyFlag: false, messageKey: 'email.typeRequired' };
    }

    const key = `${email}_${type}`;
    const stored = this.verificationCodes.get(key);

    if (!stored) {
      return { verifyFlag: false, messageKey: 'email.codeExpired' };
    }

    if (stored.expiresAt < new Date()) {
      this.verificationCodes.delete(key);
      return { verifyFlag: false, messageKey: 'email.codeExpired' };
    }

    if (stored.code !== code) {
      return { verifyFlag: false, messageKey: 'email.codeInvalid' };
    }

    this.verificationCodes.delete(key);
    return { verifyFlag: true, messageKey: 'email.verifyCodeSuccess' };
  }

  // 获取邮件主题（支持国际化）
  private getEmailSubject(type: EmailVerificationType) {
    const subjectKey = this.templateConfig[type].subjectKey;
    return i18nText(subjectKey);
  }

  private getEmailField<K extends keyof (typeof this.templateConfig)[EmailVerificationType]>(
    type: EmailVerificationType,
    field: K
  ) {
    return this.templateConfig[type][field];
  }

  private getEmailTemplate(code: string, type: EmailVerificationType): string {
    const color = this.getEmailField(type, 'color');
    const subject = this.getEmailSubject(type);

    // 国际化邮件内容
    const title = i18nText('email.verificationTitle', {
      subject: subject.replace(/验证码$/, ''),
    });
    const codeText = i18nText('email.yourVerificationCode');
    const expiresText = i18nText('email.codeExpiresIn');

    return `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2>${title}</h2>
        <p>${codeText} <strong style="font-size: 24px; color: ${color};">${code}</strong></p>
        <p>${expiresText}</p>
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
