/**
 * @Author: 350296245@qq.com
 * @Date: 2025-09-28 17:58:37
 * @Explain: 控制器响应统一返回逻辑
 */
import { defaultLocale } from '@/config/default';
import { Response } from 'express';
import { i18nText } from './i18n';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: number;
  timestamp: string;
}

export class ResponseBuilder {
  private res: Response;
  private locale: string;

  constructor(res: Response, locale: string = defaultLocale) {
    this.res = res;
    this.locale = locale;
  }

  /**
   * 成功响应
   */
  success<T = any>(data?: T, messageKey?: string, params?: { [key: string]: any }): Response {
    const message = messageKey ? i18nText(messageKey, params) : i18nText('common.success');

    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return this.res.status(200).json(response);
  }

  /**
   * 错误响应
   */
  error(
    messageKey: string,
    statusCode: number = 400,
    params?: { [key: string]: any },
    code?: number
  ): Response {
    const message = i18nText(messageKey, params);

    const response: ApiResponse = {
      success: false,
      message,
      code,
      timestamp: new Date().toISOString(),
    };

    return this.res.status(statusCode).json(response);
  }

  /**
   * 创建成功响应
   */
  created<T = any>(data?: T, messageKey?: string, params?: { [key: string]: any }): Response {
    const message = messageKey ? i18nText(messageKey, params) : i18nText('common.success');

    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return this.res.status(201).json(response);
  }

  /**
   * 未找到响应
   */
  notFound(messageKey?: string, params?: { [key: string]: any }): Response {
    const message = messageKey ? i18nText(messageKey, params) : i18nText('common.notFound');

    const response: ApiResponse = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    return this.res.status(404).json(response);
  }

  /**
   * 未授权响应
   */
  unauthorized(messageKey?: string, params?: { [key: string]: any }): Response {
    const message = messageKey ? i18nText(messageKey, params) : i18nText('common.unauthorized');

    const response: ApiResponse = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    return this.res.status(401).json(response);
  }

  /**
   * 权限不足响应
   */
  forbidden(messageKey?: string, params?: { [key: string]: any }): Response {
    const message = messageKey ? i18nText(messageKey, params) : i18nText('common.forbidden');

    const response: ApiResponse = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    return this.res.status(403).json(response);
  }

  /**
   * 验证错误响应
   */
  validationError(errors?: any, messageKey?: string, params?: { [key: string]: any }): Response {
    const message = messageKey ? i18nText(messageKey, params) : i18nText('common.validationError');

    const response: ApiResponse = {
      success: false,
      message,
      data: errors,
      timestamp: new Date().toISOString(),
    };

    return this.res.status(422).json(response);
  }

  /**
   * 自定义响应
   */
  custom<T = any>(options: {
    success: boolean;
    message?: string;
    messageKey?: string;
    data?: T;
    statusCode?: number;
    params?: { [key: string]: any };
    code?: number;
  }): Response {
    const { success, message, messageKey, data, statusCode = 200, params, code } = options;

    const finalMessage =
      message ||
      (messageKey
        ? i18nText(messageKey, params)
        : success
          ? i18nText('common.success')
          : i18nText('common.error'));

    const response: ApiResponse<T> = {
      success,
      message: finalMessage,
      data,
      code,
      timestamp: new Date().toISOString(),
    };

    return this.res.status(statusCode).json(response);
  }
}

/**
 * 便捷函数，直接从响应对象创建ResponseBuilder
 */
export const createResponse = (res: Response, locale: string = defaultLocale) => {
  return new ResponseBuilder(res, locale);
};
