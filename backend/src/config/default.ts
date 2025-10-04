/** 接口版本 */
export const API_VERSION = '/api/v1.0';
/** 语言枚举 */
export enum LanguageEnum {
  ZH = 'zh-CN',
  EN = 'en-US',
}

/** 默认语言 */
export const defaultLocale = LanguageEnum.ZH;
/** 支持的语言 */
export const supportedLocales = [LanguageEnum.ZH, LanguageEnum.EN];
