/**
 * @Author: 350296245@qq.com
 * @Date: 2025-09-29 10:42:17
 * @Explain: 国际化 - 中间件
 */
import { Request, Response, NextFunction } from 'express';
import { defaultLocale, supportedLocales } from '../config/default';
import { setLocale } from '../utils/i18n';

interface LocaleOptions {
  defaultLocale: string;
  supportedLocales: string[];
  cookieName: string;
  queryParam: string;
}

const defaultOptions: LocaleOptions = {
  defaultLocale,
  supportedLocales,
  cookieName: 'locale',
  queryParam: 'locale',
};

const i18nMiddleware = (options?: Partial<LocaleOptions>) => {
  const config = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    let locale = config.defaultLocale;

    // 1. 检查URL参数
    if (req.query[config.queryParam] && typeof req.query[config.queryParam] === 'string') {
      const queryLocale = req.query[config.queryParam] as string;
      if (config.supportedLocales.includes(queryLocale)) {
        locale = queryLocale;
      }
    }

    // 2. 检查Cookie
    if (req.cookies && req.cookies[config.cookieName]) {
      const cookieLocale = req.cookies[config.cookieName];
      if (config.supportedLocales.includes(cookieLocale)) {
        locale = cookieLocale;
      }
    }

    // 3. 检查请求头 Accept-Language
    if (req.headers['accept-language']) {
      const acceptLanguages = req.headers['accept-language'].split(',').map((lang) => {
        const [language, quality = 'q=1'] = lang.split(';');
        return {
          locale: language.trim().split('-')[0],
          quality: parseFloat(quality.split('=')[1]) || 1,
        };
      });

      acceptLanguages.sort((a, b) => b.quality - a.quality);

      for (const acceptLang of acceptLanguages) {
        const matchedLocale = config.supportedLocales.find((supported) =>
          supported.startsWith(acceptLang.locale)
        );
        if (matchedLocale) {
          locale = matchedLocale;
          break;
        }
      }
    }

    // 将语言设置添加到请求对象
    req.locale = locale;

    // 为响应添加语言信息
    res.setHeader('Content-Language', locale);

    // 设置全局 i18next 语言
    setLocale(locale);

    next();
  };
};

declare global {
  namespace Express {
    interface Request {
      locale: string;
    }
  }
}

export default i18nMiddleware;
