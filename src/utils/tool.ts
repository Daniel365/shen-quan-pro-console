import { apiVersionUrl } from '@/api/requestUtils';
import i18n from '@/locale';

/** 获取api连接 */
export const getApiUrl = (path: string) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '';
  const url = baseURL + apiVersionUrl + path;
  return url;
};

/** 国际化 */
export const setLocales = (value: LanguageEnum) => {
  i18n.global.locale.value = value;
};

/** 国际化 */
export const i18nText = (key: string, params?: any) => {
  return i18n.global.t(key, params);
};
