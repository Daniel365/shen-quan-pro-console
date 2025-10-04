/**
 * @Author: 350296245@qq.com
 * @Date: 2025-09-29 11:25:00
 * @Description: 基于 i18next 的国际化工具
 */

import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import { defaultLocale, supportedLocales } from '../config/default';

// 初始化 i18next
const initializeI18n = async () => {
  await i18next.use(Backend).init({
    lng: defaultLocale, // 默认语言
    fallbackLng: defaultLocale,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}.json'),
    },
    preload: supportedLocales,
  });
};

// 等待初始化完成
initializeI18n().catch(console.error);

/**
 * 设置当前请求的语言
 * @param locale 语言代码
 */
export function setLocale(locale: string) {
  i18next.changeLanguage(locale);
}

/**
 * 全局翻译函数
 * @param key 翻译键
 * @param options 翻译选项
 */
export function i18nText(key: string, options?: any) {
  return i18next.t(key, options) as string;
}

/**
 * 获取当前语言
 */
export function getCurrentLocale(): string {
  return i18next.language;
}
